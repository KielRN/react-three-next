import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash,randomBytes,randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'

const state=vi.hoisted(()=>({ db:null,enabled:true,origins:['https://fixture-output.example'] }))
vi.mock('../lib/db.js',()=>({ query:(...args)=>state.db.query(...args),transaction:work=>state.db.transaction(client=>work(client)) }))
vi.mock('../lib/workshopStudioFeatures.js',()=>({ studioAccessEnabled:()=>state.enabled,studioProviderTransportEnabled:()=>state.enabled }))
vi.mock('../lib/workshopStudioOutputOrigins.js',()=>({ studioOutputOrigins:()=>state.origins }))
vi.mock('../lib/workshopStudioEligibility.js',()=>({ verifyStudioRegistration:async({ seatId,now })=>{
  const seat=(await state.db.query('select * from workshop_studio_seats where id=$1',[seatId])).rows[0]
  return { seatId,cohortId:seat.cohort_id,accessVersion:seat.access_version,calendarId:seat.ghl_calendar_id,registrationId:seat.ghl_registration_id,contactId:seat.ghl_contact_id,checkedAt:now }
} }))
import { importStudioOutput,getStudioOutput,listStudioOutputJobs,readStudioOutputChunk,purgeExpiredStudioOutputs,MAX_STUDIO_OUTPUT_BYTES } from '../lib/workshopStudioOutputs.js'
import { transferStudioSeat,getStudioUsage } from '../lib/workshopStudioStore.js'

const NOW=new Date('2026-11-06T17:00:00Z')
const END=new Date('2026-11-13T19:00:00Z')
const providerId='01a19750-b3c2-76ab-a4d2-441566e5f4e2'
const sourceUrl=`https://fixture-output.example/account/${providerId}/output.mp4?signature=private`
const bytes=Buffer.concat([Buffer.from([0,0,0,24]),Buffer.from('ftypisom'),Buffer.alloc(244,7)])
let cohortId,seatId,jobId,token,fetchMock
const hash=value=>createHash('sha256').update(value).digest('hex')
const store=(changes={})=>importStudioOutput({ jobId,now:NOW,...changes })
const read=(changes={})=>getStudioOutput({ jobId,seatId,accessVersion:1,token,now:NOW,...changes })
const chunk=(offset=0,changes={})=>readStudioOutputChunk({ jobId,seatId,accessVersion:1,token,offset,now:NOW,...changes })
const response=(body=bytes,headers={})=>new Response(body,{ headers:{ 'Content-Type':'video/mp4','Content-Length':String(body.length),...headers } })
beforeAll(async()=>{
  state.db=new PGlite()
  for(const file of ['006_workshop_studio.sql','007_workshop_studio_access.sql','008_workshop_studio_submission.sql','009_workshop_studio_quotes.sql','010_workshop_studio_provider.sql','011_workshop_studio_outputs.sql']){
    const sql=readFileSync(new URL('../db/migrations/'+file,import.meta.url),'utf8');await state.db.exec(sql);await state.db.exec(sql)
  }
},30000)
beforeEach(async()=>{
  state.enabled=true;state.origins=['https://fixture-output.example'];vi.unstubAllGlobals()
  await state.db.exec('truncate workshop_studio_cohorts cascade')
  cohortId=randomUUID();seatId=randomUUID();jobId=randomUUID();token=randomBytes(32).toString('base64url')
  await state.db.query(`insert into workshop_studio_cohorts(id,workshop_slug,session_starts_at,session_ends_at,access_opens_at,access_expires_at,paused)
    values($1,'ai-video-editing','2026-11-06T17:00:00Z','2026-11-06T19:00:00Z','2026-11-05T17:00:00Z','2026-11-13T19:00:00Z',false)`,[cohortId])
  await state.db.query(`insert into workshop_studio_seats(id,cohort_id,ghl_calendar_id,ghl_registration_id,ghl_contact_id,registration_state)
    values($1,$2,'synthetic-calendar','synthetic-registration','synthetic-contact','eligible')`,[seatId,cohortId])
  await state.db.query(`insert into workshop_studio_sessions(token_hash,seat_id,access_version,created_at,expires_at) values($1,$2,1,$3,$4)`,[hash(token),seatId,NOW,END])
  await state.db.query(`insert into workshop_studio_jobs(id,cohort_id,seat_id,request_key,request_hash,reserved_cents,state,owner_access_version,submission_claimed_at,provider_job_id,provider_status_url,provider_state,provider_observed_at,provider_video_url,provider_expires_at)
    values($1,$2,$3,'synthetic-output-request',$4,472,'submitted',1,$5,$6,$7,'completed',$5,$8,'2026-11-08T17:00:00Z')`,[jobId,cohortId,seatId,'a'.repeat(64),NOW,providerId,`https://api.higgsfield.ai/requests/${providerId}/status`,sourceUrl])
  fetchMock=vi.fn(async()=>response());vi.stubGlobal('fetch',fetchMock)
})
afterAll(async()=>{vi.unstubAllGlobals();await state.db?.close()})

describe('private bounded output storage and session-bound reads with synthetic media only',()=>{
  it('denies all storage/read operations before database/network when gates are off',async()=>{
    state.enabled=false
    for(const operation of [store,read,()=>chunk()])await expect(operation()).rejects.toMatchObject({ code:'STUDIO_UNAVAILABLE' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('stores one permitted MP4 in existing PostgreSQL with own deadline and hash',async()=>{
    const saved=await store()
    expect(saved).toMatchObject({ jobId,byteCount:bytes.length,sha256:hash(bytes),contentType:'video/mp4' })
    expect(new Date(saved.expiresAt).toISOString()).toBe(END.toISOString())
    const [url,options]=fetchMock.mock.calls[0]
    expect(url).toBe(sourceUrl);expect(options).toMatchObject({ redirect:'error',cache:'no-store',headers:{ Accept:'video/mp4' } })
    expect(options.headers).not.toHaveProperty('Authorization')
    expect(JSON.stringify(saved)).not.toContain('signature')
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
  })
  it('reuses its stored bytes without repeating a provider GET',async()=>{
    const first=await store();const second=await store()
    expect(second).toEqual(first);expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it.each(['https://unaccepted.example/a.mp4','http://127.0.0.1/private','https://user:password@fixture-output.example/a.mp4',`https://fixture-output.example/account/${randomUUID()}/output.mp4`])('rejects an unsafe/unbound source before network: %s',async value=>{
    await state.db.query('update workshop_studio_jobs set provider_video_url=$2 where id=$1',[jobId,value])
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' });expect(fetchMock).not.toHaveBeenCalled()
  })
  it('requires an accepted origin registry independently of the enabled flag',async()=>{
    state.origins=[];await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' });expect(fetchMock).not.toHaveBeenCalled()
  })
  it.each([{ type:'text/html',body:bytes },{ type:'video/mp4',body:Buffer.from('not a movie') }])('rejects content type/container mismatch: $type',async({ type,body })=>{
    fetchMock.mockImplementationOnce(async()=>response(body,{ 'Content-Type':type }))
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' })
    expect((await state.db.query('select count(*)::int as n from workshop_studio_outputs')).rows[0].n).toBe(0)
  })
  it('rejects oversized declared media before reading and bounds an undeclared stream',async()=>{
    fetchMock.mockImplementationOnce(async()=>response(bytes,{ 'Content-Length':String(MAX_STUDIO_OUTPUT_BYTES+1) }))
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' })
    let canceled=false
    fetchMock.mockImplementationOnce(async()=>new Response(new ReadableStream({ pull(controller){controller.enqueue(new Uint8Array(1024*1024))},cancel(){canceled=true} }),{ headers:{ 'Content-Type':'video/mp4' } }))
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' });expect(canceled).toBe(true)
  })
  it('rejects truncated advertised bodies and sanitizes network/stream failures',async()=>{
    fetchMock.mockImplementationOnce(async()=>response(bytes,{ 'Content-Length':String(bytes.length+10) }))
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' })
    fetchMock.mockRejectedValueOnce(new Error('secret source URL and credentials'))
    await expect(store()).rejects.not.toThrow('secret')
    fetchMock.mockImplementationOnce(async()=>new Response(new ReadableStream({ start(controller){controller.error(new Error('private-stream-detail'))} }),{ headers:{ 'Content-Type':'video/mp4' } }))
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' })
  })
  it('never treats a partial provider response as a complete reusable copy',async()=>{
    fetchMock.mockImplementationOnce(async()=>new Response(bytes,{ status:206,headers:{ 'Content-Type':'video/mp4','Content-Length':String(bytes.length),'Content-Range':`bytes 0-${bytes.length-1}/4096` } }))
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' })
    expect((await state.db.query('select count(*)::int as n from workshop_studio_outputs')).rows[0].n).toBe(0)
  })
  it('does not import after source expiry or an incomplete provider state',async()=>{
    await expect(store({ now:new Date('2026-11-08T17:00:00Z') })).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' });expect(fetchMock).not.toHaveBeenCalled()
    await state.db.query("update workshop_studio_jobs set provider_state='in_progress',provider_video_url=null where id=$1",[jobId])
    await expect(store()).rejects.toMatchObject({ code:'OUTPUT_UNAVAILABLE' })
  })
  it('discards downloaded bytes if transfer/cancellation occurs during the source GET',async()=>{
    fetchMock.mockImplementationOnce(async()=>{
      await transferStudioSeat({ seatId,ghlContactId:'replacement',ghlRegistrationId:'replacement-registration',evidenceReference:'synthetic-transfer',now:NOW })
      return response()
    })
    await expect(store()).rejects.toMatchObject({ code:'INVALID_ACCESS' })
    expect((await state.db.query('select count(*)::int as n from workshop_studio_outputs')).rows[0].n).toBe(0)
  })
  it('does not persist if the access deadline passes while streaming the provider response',async()=>{
    vi.useFakeTimers({ toFake:['Date'] });vi.setSystemTime(NOW)
    fetchMock.mockImplementationOnce(async()=>{vi.setSystemTime(END);return response()})
    try {await expect(store({ now:undefined })).rejects.toMatchObject({ code:'ACCESS_CLOSED' })}finally{vi.useRealTimers()}
  })
  it('reads only its authorized session/current ownership epoch and exposes no provider URL',async()=>{
    await store()
    expect(await read()).toMatchObject({ jobId,sha256:hash(bytes) })
    expect(Buffer.from(await chunk())).toEqual(bytes)
    expect(JSON.stringify(await read())).not.toContain('fixture-output')
    expect(await read({ token:randomBytes(32).toString('base64url') })).toBeNull()
    expect(await read({ accessVersion:2 })).toBeNull()
    expect(await read({ seatId:randomUUID() })).toBeNull()
  })
  it('serves its own stored copy after provider retention expires but before class access ends',async()=>{
    await store()
    expect(await read({ now:new Date('2026-11-10T17:00:00Z') })).toMatchObject({ byteCount:bytes.length })
    expect(await read({ now:END })).toBeNull()
  })
  it('lists only current-epoch jobs with safe stored-copy readiness, never source data',async()=>{
    const args={ seatId,accessVersion:1,token,now:NOW }
    expect(await listStudioOutputJobs(args)).toEqual([{ id:jobId,state:'submitted',providerState:'completed',maximumCostCents:472,actualCostCents:null,downloadReady:false,output:null }])
    await store()
    const jobs=await listStudioOutputJobs(args)
    expect(jobs[0]).toMatchObject({ id:jobId,downloadReady:true,output:{ byteCount:bytes.length } })
    expect(JSON.stringify(jobs)).not.toMatch(/signature|fixture-output|synthetic-contact/)
    expect(await listStudioOutputJobs({ ...args,accessVersion:2 })).toEqual([])
    expect(await listStudioOutputJobs({ ...args,token:randomBytes(32).toString('base64url') })).toEqual([])
  })
  it('denies subsequent chunks immediately after logout or transfer',async()=>{
    await store();expect(await chunk()).toBeTruthy()
    await state.db.query('update workshop_studio_sessions set revoked_at=$2 where token_hash=$1',[hash(token),NOW])
    await expect(chunk()).rejects.toMatchObject({ code:'NOT_FOUND' })
    await state.db.query('update workshop_studio_sessions set revoked_at=null where token_hash=$1',[hash(token)])
    await transferStudioSeat({ seatId,ghlContactId:'replacement',ghlRegistrationId:'replacement-registration',evidenceReference:'synthetic-transfer',now:NOW })
    await expect(chunk()).rejects.toMatchObject({ code:'NOT_FOUND' })
  })
  it.each(['cancelled','refunded'])('denies metadata and bytes for %s registrations',async registration=>{
    await store();await state.db.query('update workshop_studio_seats set registration_state=$2 where id=$1',[seatId,registration])
    expect(await read()).toBeNull();await expect(chunk()).rejects.toMatchObject({ code:'NOT_FOUND' })
  })
  it('purges only expired studio copies and keeps ledger usage unchanged',async()=>{
    await store()
    expect(await purgeExpiredStudioOutputs({ now:NOW })).toBe(0)
    expect(await purgeExpiredStudioOutputs({ now:END })).toBe(1)
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
  })
  it('rejects partial/range-like byte requests and preserves populated output on migration reapply',async()=>{
    await store()
    await expect(chunk(-1)).rejects.toMatchObject({ code:'INVALID_REQUEST' })
    await expect(chunk(0.5)).rejects.toMatchObject({ code:'INVALID_REQUEST' })
    await state.db.exec(readFileSync(new URL('../db/migrations/011_workshop_studio_outputs.sql',import.meta.url),'utf8'))
    expect(Buffer.from(await chunk())).toEqual(bytes)
  })
})
