// Server-only preparation: bounded private copies, no public URLs or storage
// credentials. Uses the existing transaction helper/PostgreSQL, not a new service.
import { createHash } from 'node:crypto'
import { query,transaction } from './db.js'
import { lockStudioSeat } from './workshopStudioStore.js'
import { verifyStudioRegistration } from './workshopStudioEligibility.js'
import { studioAccessEnabled,studioProviderTransportEnabled } from './workshopStudioFeatures.js'
import { studioOutputOrigins } from './workshopStudioOutputOrigins.js'
import { checkStudioAccess,checkStudioRegistrationProof,fail,requireTime,requireUuid } from './workshopStudioPolicy.js'

export const MAX_STUDIO_OUTPUT_BYTES=16*1024*1024
export const STUDIO_OUTPUT_CHUNK_BYTES=256*1024
function enabled(){ if(!studioAccessEnabled() || !studioProviderTransportEnabled())fail('STUDIO_UNAVAILABLE','Private studio output is not available yet.') }
const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
const metadata=row=>row?{ jobId:row.job_id,contentType:row.content_type,byteCount:row.byte_count,sha256:row.sha256,expiresAt:row.expires_at }:null
async function lockJob(client,jobId){
  const ref=(await client.query('select seat_id from workshop_studio_jobs where id=$1',[jobId])).rows[0]
  if(!ref)fail('NOT_FOUND','Studio output not found.')
  const records=await lockStudioSeat(client,ref.seat_id)
  const job=(await client.query('select * from workshop_studio_jobs where id=$1 for update',[jobId])).rows[0]
  return { ...records,job }
}
function owner(records,proof,time){
  const { cohort,seat,job }=records
  if(job.owner_access_version!==seat.access_version)fail('INVALID_ACCESS','Studio access has changed.')
  checkStudioAccess(cohort,seat,time);checkStudioRegistrationProof(proof,seat,time)
}
function source(job,time){
  try{
    requireUuid(job.provider_job_id)
    const url=new URL(job.provider_video_url)
    if(job.provider_state!=='completed' || !job.provider_expires_at || new Date(job.provider_expires_at)<=time ||
      url.protocol!=='https:' || url.username || url.password || url.hash || (url.port && url.port!=='443') ||
      !studioOutputOrigins().includes(url.origin) || !url.pathname.split('/').includes(job.provider_job_id))throw new Error('Unaccepted source')
    return url.href
  }catch{fail('OUTPUT_UNAVAILABLE','An accepted unexpired provider output is required.')}
}
async function event(client,job,kind,time,byteCount){
  await client.query(`insert into workshop_studio_events(cohort_id,seat_id,job_id,kind,evidence_reference,details,created_at)
    values($1,$2,$3,$4,$5,$6,$7) on conflict do nothing`,[job.cohort_id,job.seat_id,job.id,kind,`${kind}:${job.id}`,JSON.stringify({ byteCount }),time])
}
async function readProviderBytes(url){
  let reader
  try{
    const response=await fetch(url,{ redirect:'error',cache:'no-store',headers:{ Accept:'video/mp4' },signal:AbortSignal.timeout(30000) })
    const type=response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
    const declared=response.headers.get('content-length')
    if(response.status!==200 || response.headers.has('content-range') || !['video/mp4','application/octet-stream'].includes(type) || (declared!==null && (!/^\d+$/.test(declared) || Number(declared)<12 || Number(declared)>MAX_STUDIO_OUTPUT_BYTES))){
      await response.body?.cancel();throw new Error('Invalid media response')
    }
    reader=response.body?.getReader()
    if(!reader)throw new Error('Missing media body')
    const chunks=[];let size=0
    while(true){
      const { value,done }=await reader.read();if(done)break
      size+=value.byteLength
      if(size>MAX_STUDIO_OUTPUT_BYTES){await reader.cancel();throw new Error('Oversized output')}
      chunks.push(Buffer.from(value))
    }
    if(size<12 || (declared!==null && Number(declared)!==size))throw new Error('Truncated output')
    const bytes=Buffer.concat(chunks,size)
    // Container admission only; full codec/playback remains real-media acceptance.
    if(bytes.toString('ascii',4,8)!=='ftyp' || bytes.readUInt32BE(0)<8)throw new Error('Not an MP4 container')
    return bytes
  }catch{fail('OUTPUT_UNAVAILABLE','Provider output could not be copied safely.')}
  finally{reader?.releaseLock()}
}

export async function importStudioOutput({ jobId,now }={}){
  enabled();requireUuid(jobId)
  const clock=()=>requireTime(now)
  const candidate=(await query('select seat_id from workshop_studio_jobs where id=$1',[jobId])).rows[0]
  if(!candidate)fail('NOT_FOUND','Studio output not found.')
  const proof=await verifyStudioRegistration({ seatId:candidate.seat_id,now:clock() })
  const prepared=await transaction(async client=>{
    const records=await lockJob(client,jobId);const time=clock();owner(records,proof,time)
    const existing=(await client.query('select job_id,content_type,byte_count,sha256,expires_at,owner_access_version from workshop_studio_outputs where job_id=$1',[jobId])).rows[0]
    if(existing){
      if(existing.owner_access_version!==records.seat.access_version || new Date(existing.expires_at)<=time)fail('OUTPUT_UNAVAILABLE','Stored output is not available.')
      return { existing:metadata(existing) }
    }
    return { sourceUrl:source(records.job,time),accessVersion:records.seat.access_version }
  })
  if(prepared.existing)return prepared.existing
  enabled()
  const bytes=await readProviderBytes(prepared.sourceUrl)
  const sha256=digest(bytes)
  // Never hold a database connection during HTTP or native eligibility checks.
  const refreshed=await verifyStudioRegistration({ seatId:candidate.seat_id,now:clock() })
  return transaction(async client=>{
    enabled()
    const records=await lockJob(client,jobId);const time=clock();owner(records,refreshed,time)
    if(records.seat.access_version!==prepared.accessVersion || source(records.job,time)!==prepared.sourceUrl)fail('INVALID_ACCESS','Studio output ownership changed.')
    const inserted=(await client.query(`insert into workshop_studio_outputs(job_id,owner_access_version,byte_count,sha256,contents,created_at,expires_at)
      values($1,$2,$3,$4,$5,$6,$7) on conflict(job_id) do nothing returning job_id,content_type,byte_count,sha256,expires_at`,
    [jobId,prepared.accessVersion,bytes.length,sha256,bytes,time,records.cohort.access_expires_at])).rows[0]
    if(inserted){await event(client,records.job,'output_stored',time,bytes.length);return metadata(inserted)}
    const existing=(await client.query('select job_id,content_type,byte_count,sha256,expires_at,owner_access_version from workshop_studio_outputs where job_id=$1',[jobId])).rows[0]
    if(!existing || existing.sha256!==sha256 || existing.owner_access_version!==prepared.accessVersion || new Date(existing.expires_at)<=time)fail('OUTPUT_CONFLICT','Stored output differs; preserve the existing copy.')
    return metadata(existing)
  })
}

function identity({ jobId,seatId,accessVersion,token },jobRequired=true){
  enabled();if(jobRequired)requireUuid(jobId);requireUuid(seatId)
  if(!Number.isSafeInteger(accessVersion) || accessVersion<1 || typeof token!=='string' || !/^[A-Za-z0-9_-]{43}$/.test(token))fail('INVALID_ACCESS','Valid scoped studio access is required.')
}
export async function listStudioOutputJobs(args){
  identity(args,false)
  const time=requireTime(args.now)
  const rows=(await query(`select j.id,j.state,j.provider_state,j.reserved_cents,j.actual_cost_cents,
    o.job_id as output_job_id,o.byte_count,o.expires_at as output_expires_at
    from workshop_studio_jobs j join workshop_studio_seats s on s.id=j.seat_id
    join workshop_studio_cohorts c on c.id=s.cohort_id join workshop_studio_sessions session on session.seat_id=s.id
    left join workshop_studio_outputs o on o.job_id=j.id and o.owner_access_version=$2
    where s.id=$1 and s.access_version=$2 and j.owner_access_version=$2
      and session.token_hash=$3 and session.access_version=$2 and session.revoked_at is null and session.expires_at>$4
      and s.revoked_at is null and s.registration_state='eligible' and not s.paused and not c.paused
      and $4>=c.access_opens_at and $4<c.access_expires_at order by j.created_at desc,j.id limit 50`,
  [args.seatId,args.accessVersion,digest(args.token),time])).rows
  return rows.map(row=>{
    const ready=row.provider_state==='completed' && Boolean(row.output_job_id) && new Date(row.output_expires_at)>time
    return { id:row.id,state:row.state,providerState:row.provider_state,maximumCostCents:row.reserved_cents,
      actualCostCents:row.actual_cost_cents,downloadReady:ready,output:ready?{ byteCount:row.byte_count,expiresAt:row.output_expires_at }:null }
  })
}
const readJoins=`from workshop_studio_outputs o join workshop_studio_jobs j on j.id=o.job_id
  join workshop_studio_seats s on s.id=j.seat_id join workshop_studio_cohorts c on c.id=s.cohort_id
  join workshop_studio_sessions session on session.seat_id=s.id
  where j.id=$1 and s.id=$2 and o.owner_access_version=$3 and j.owner_access_version=$3 and s.access_version=$3
    and session.token_hash=$4 and session.access_version=$3 and session.revoked_at is null and session.expires_at>$5
    and s.revoked_at is null and s.registration_state='eligible' and not s.paused and not c.paused
    and $5>=c.access_opens_at and $5<c.access_expires_at and $5<o.expires_at`
export async function getStudioOutput(args){
  identity(args)
  const row=(await query(`select o.job_id,o.content_type,o.byte_count,o.sha256,o.expires_at ${readJoins}`,
    [args.jobId,args.seatId,args.accessVersion,digest(args.token),requireTime(args.now)])).rows[0]
  return metadata(row)
}
export async function readStudioOutputChunk(args){
  identity(args)
  if(!Number.isSafeInteger(args.offset) || args.offset<0 || args.offset>MAX_STUDIO_OUTPUT_BYTES)fail('INVALID_REQUEST','A valid internal byte offset is required.')
  const row=(await query(`select substring(o.contents from $6 for $7) as bytes ${readJoins}`,
    [args.jobId,args.seatId,args.accessVersion,digest(args.token),requireTime(args.now),args.offset+1,STUDIO_OUTPUT_CHUNK_BYTES])).rows[0]
  if(!row)fail('NOT_FOUND','Studio output not found.')
  return new Uint8Array(row.bytes)
}

// Internal retention maintenance only, never an HTTP action. It remains usable
// when access gates close; only expired copies in this workshop table are erased.
export async function purgeExpiredStudioOutputs({ now }={}){
  const time=requireTime(now)
  const candidates=(await query(`select o.job_id from workshop_studio_outputs o join workshop_studio_jobs j on j.id=o.job_id
    join workshop_studio_cohorts c on c.id=j.cohort_id where o.expires_at<=$1 or c.access_expires_at<=$1 order by o.expires_at limit 100`,[time])).rows
  let count=0
  for(const candidate of candidates)count+=await transaction(async client=>{
    const { job,cohort }=await lockJob(client,candidate.job_id)
    const removed=(await client.query('delete from workshop_studio_outputs where job_id=$1 and (expires_at<=$2 or $3::timestamptz<=$2) returning byte_count',[job.id,time,cohort.access_expires_at])).rows[0]
    if(!removed)return 0
    await event(client,job,'output_purged',time,removed.byte_count);return 1
  })
  return count
}
