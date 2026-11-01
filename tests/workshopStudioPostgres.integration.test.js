import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync,readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import pg from 'pg'

// Only the dedicated launcher supplies this disposable cluster, never .env or DATABASE_URL.
const url = process.env.TXAI_STUDIO_TEST_PG_URL
const state = vi.hoisted(() => ({ pool:null, posts:0, afterClaim:null }))
vi.mock('../lib/db.js', () => ({ query:(...args) => state.pool.query(...args),transaction:async work => {
  const client = await state.pool.connect()
  try {
    await client.query('begin')
    const result = await work(client)
    await client.query('commit')
    return result
  } catch (error) { await client.query('rollback'); throw error } finally { client.release() }
} }))
vi.mock('../lib/workshopStudioFeatures.js', () => ({ studioAccessEnabled:()=>true,studioProviderTransportEnabled:()=>true,studioReadiness:()=>({ providerSubmissionEnabled:true }) }))
vi.mock('../lib/workshopStudioOutputOrigins.js',()=>({ studioOutputOrigins:()=>['https://synthetic-output.example'] }))
vi.mock('../lib/workshopStudioEligibility.js', () => ({ verifyStudioRegistration:async ({ seatId,now }) => {
  const seat=(await state.pool.query('select * from workshop_studio_seats where id=$1',[seatId])).rows[0]
  return { seatId,cohortId:seat.cohort_id,accessVersion:seat.access_version,calendarId:seat.ghl_calendar_id,registrationId:seat.ghl_registration_id,contactId:seat.ghl_contact_id,checkedAt:now }
} }))
vi.mock('../lib/workshopStudioTransport.js', () => ({ createStudioTransport:()=>({
  estimate:async ({ request }) => ({ maximumCostCents:472,currency:'USD',requestHash:studioRequestHash(request),correlationId:'synthetic-price',providerPayload:{ prompt:request.prompt,duration:request.duration,resolution:request.resolution,aspect_ratio:request.aspectRatio,output_format:request.outputFormat,generate_audio:request.generateAudio,video_urls:['https://synthetic-reference.example/ref.mp4'] } }),
  submit:async () => { state.posts++;const id=randomUUID();return { requestId:id,statusUrl:`https://api.higgsfield.ai/requests/${id}/status`,providerState:'queued' } },
}) }))
import { reserveGeneration,getStudioUsage,reconcileGeneration,markGenerationSubmitted } from '../lib/workshopStudioStore.js'
import { exchangeStudioCode } from '../lib/workshopStudioAccess.js'
import { issueStudioQuote,reserveQuotedGeneration } from '../lib/workshopStudioQuotes.js'
import { dispatchStudioJob } from '../lib/workshopStudioWorker.js'
import { studioRequestHash } from '../lib/workshopStudioProvider.js'
import { importStudioOutput,getStudioOutput,readStudioOutputChunk } from '../lib/workshopStudioOutputs.js'
import { GET as downloadStoredOutput } from '../app/api/workshop-studio/jobs/[jobId]/download/route.js'

const NOW=new Date('2026-11-06T17:00:00Z')
let cohortId, seats
const request={ model:'bytedance/seedance-2.5/reference-to-video',prompt:'Synthetic class test',duration:10,resolution:'720p',aspectRatio:'16:9',outputFormat:'mp4',generateAudio:false,reference:{ assetId:'synthetic',sha256:'a'.repeat(64) } }
const reserve=(seatId,changes={}) => reserveGeneration({ seatId,accessVersion:1,requestKey:randomUUID(),requestHash:'b'.repeat(64),maximumCostCents:500,currency:'USD',now:NOW,...changes })
async function count(sql,params=[]) { return Number(Object.values((await state.pool.query(sql,params)).rows[0])[0]) }
async function untilBlocked() {
  const deadline=Date.now()+5000
  while (Date.now()<deadline) {
    if (await count("select count(*) from pg_stat_activity where application_name='txai-studio-acceptance' and wait_event_type='Lock'")) return
    await new Promise(done=>setTimeout(done,20))
  }
  throw new Error('Expected an independently blocked PostgreSQL connection')
}

describe.skipIf(!url)('real PostgreSQL connection contention in an owned disposable cluster', () => {
  beforeAll(async () => {
    const parsed=new URL(url)
    expect(parsed.hostname).toBe('127.0.0.1');expect(parsed.username).toBe('studio_test');expect(parsed.pathname).toBe('/postgres')
    const directory=resolve(process.env.TXAI_STUDIO_TEST_PG_DIR)
    const parent=resolve('.tmp/workshop-studio/postgres-concurrency')
    expect(directory.startsWith(parent+'\\') || directory.startsWith(parent+'/')).toBe(true)
    const marker=JSON.parse(readFileSync(process.env.TXAI_STUDIO_TEST_PG_MARKER,'utf8'))
    expect(marker.purpose).toBe('txai-studio-isolated-concurrency-acceptance');expect(resolve(marker.dataDirectory)).toBe(directory)
    state.pool=new pg.Pool({ connectionString:url,max:16,application_name:'txai-studio-acceptance',connectionTimeoutMillis:5000 })
    const identity=(await state.pool.query("select current_user,current_database(),current_setting('data_directory') as directory")).rows[0]
    expect(identity.current_user).toBe('studio_test');expect(identity.current_database).toBe('postgres');expect(resolve(identity.directory)).toBe(directory)
    for (const file of ['006_workshop_studio.sql','007_workshop_studio_access.sql','008_workshop_studio_submission.sql','009_workshop_studio_quotes.sql','010_workshop_studio_provider.sql','011_workshop_studio_outputs.sql']) {
      const sql=readFileSync(new URL('../db/migrations/'+file,import.meta.url),'utf8')
      await state.pool.query(sql);await state.pool.query(sql)
    }
  },30000)
  beforeEach(async () => {
    vi.unstubAllGlobals()
    state.posts=0
    await state.pool.query('truncate workshop_studio_cohorts cascade')
    cohortId=randomUUID();seats=Array.from({ length:13 },()=>randomUUID())
    await state.pool.query(`insert into workshop_studio_cohorts(id,workshop_slug,session_starts_at,session_ends_at,access_opens_at,access_expires_at,paused)
      values($1,'synthetic-concurrency','2026-11-06T17:00:00Z','2026-11-06T19:00:00Z','2026-11-05T17:00:00Z','2026-11-13T19:00:00Z',false)`,[cohortId])
    for (let i=0;i<seats.length;i++) await state.pool.query(`insert into workshop_studio_seats(id,cohort_id,ghl_calendar_id,ghl_registration_id,ghl_contact_id,registration_state)
      values($1,$2,'synthetic-only',$3,$4,'eligible')`,[seats[i],cohortId,'synthetic-registration-'+i,'synthetic-contact-'+i])
  })
  afterAll(async () => { vi.unstubAllGlobals();await state.pool?.end() })

  it('uses physically independent backend connections', async () => {
    const first=await state.pool.connect(),second=await state.pool.connect()
    try { expect((await first.query('select pg_backend_pid() as id')).rows[0].id).not.toBe((await second.query('select pg_backend_pid() as id')).rows[0].id) }
    finally { first.release();second.release() }
  })
  it('serializes aggregate class cap across13 concurrent seat reservations', async () => {
    const attempts=await Promise.allSettled(seats.map(seat=>reserve(seat)))
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(12)
    expect(attempts.find(r=>r.status==='rejected').reason.code).toBe('COHORT_LIMIT')
    expect((await getStudioUsage({ seatId:seats[0] })).cohort).toMatchObject({ heldCents:6000,spentCents:0,availableCents:0 })
  },15000)
  it('gives identical concurrent intents one job and one hold', async () => {
    const requestKey=randomUUID()
    const jobs=await Promise.all([reserve(seats[0],{ requestKey }),reserve(seats[0],{ requestKey })])
    expect(jobs[0].id).toBe(jobs[1].id)
    expect(await count('select count(*) from workshop_studio_jobs')).toBe(1)
    expect((await getStudioUsage({ seatId:seats[0] })).seat.heldCents).toBe(500)
  })
  it('blocks a second same-seat intent even when its allowance could otherwise fit', async () => {
    const attempts=await Promise.allSettled([reserve(seats[0],{ maximumCostCents:200 }),reserve(seats[0],{ maximumCostCents:200 })])
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(1)
    expect(attempts.find(r=>r.status==='rejected').reason.code).toBe('JOB_PENDING')
    expect((await getStudioUsage({ seatId:seats[0] })).seat.heldCents).toBe(200)
  })
  it('rejects the old access version after it actually waits for another connection lock', async () => {
    const blocker=await state.pool.connect()
    let attempt
    try {
      await blocker.query('begin');await blocker.query('select id from workshop_studio_cohorts where id=$1 for update',[cohortId])
      attempt=reserve(seats[0]).then(value=>({ value }),error=>({ error }))
      await untilBlocked()
      await blocker.query('update workshop_studio_seats set access_version=2 where id=$1',[seats[0]])
      await blocker.query('commit')
      expect((await attempt).error.code).toBe('INVALID_ACCESS')
      expect(await count('select count(*) from workshop_studio_jobs')).toBe(0)
    } finally { await blocker.query('rollback');blocker.release();if(attempt) await attempt }
  },10000)
  it('consumes a private quote once under real concurrent connection locks', async () => {
    const quote=await issueStudioQuote({ seatId:seats[0],accessVersion:1,request,now:NOW })
    const attempts=await Promise.allSettled([0,1].map(()=>reserveQuotedGeneration({ seatId:seats[0],accessVersion:1,quoteId:quote.id,requestKey:randomUUID(),now:NOW })))
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(1)
    expect((await getStudioUsage({ seatId:seats[0] })).seat.heldCents).toBe(472)
  })
  it('dispatches once across concurrent workers and keeps all money held', async () => {
    const quote=await issueStudioQuote({ seatId:seats[0],accessVersion:1,request,now:NOW })
    const job=await reserveQuotedGeneration({ seatId:seats[0],accessVersion:1,quoteId:quote.id,requestKey:randomUUID(),now:NOW })
    const attempts=await Promise.all([0,1].map(()=>dispatchStudioJob({ jobId:job.id,seatId:seats[0],accessVersion:1,now:NOW })))
    expect(attempts.filter(r=>r.dispatched)).toHaveLength(1);expect(state.posts).toBe(1)
    expect((await getStudioUsage({ seatId:seats[0] })).seat.heldCents).toBe(472)
  })
  it('exchanges a one-time code only once across independent connections', async () => {
    const code=randomBytes(32).toString('base64url')
    await state.pool.query("insert into workshop_studio_codes(seat_id,access_version,code_hash,expires_at) values($1,1,$2,'2026-11-06T18:00:00Z')",[seats[0],createHash('sha256').update(code).digest('hex')])
    const attempts=await Promise.allSettled([exchangeStudioCode({ code,now:NOW }),exchangeStudioCode({ code,now:NOW })])
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(1)
    expect(await count('select count(*) from workshop_studio_sessions')).toBe(1)
  })
  it('serializes settlement and subsequent reservations without exceeding a seat cap', async () => {
    const job=await reserve(seats[0],{ maximumCostCents:200 })
    await markGenerationSubmitted({ jobId:job.id,providerJobId:'synthetic-provider',now:NOW })
    const attempts=await Promise.allSettled([
      reconcileGeneration({ jobId:job.id,outcome:'charged',actualCostCents:200,evidenceReference:'synthetic-local-only-billing',now:NOW }),
      reserve(seats[0],{ maximumCostCents:300 }),
    ])
    expect(attempts[0].status).toBe('fulfilled')
    if (attempts[1].status==='rejected') await reserve(seats[0],{ maximumCostCents:300 })
    expect((await getStudioUsage({ seatId:seats[0] })).seat).toMatchObject({ heldCents:300,spentCents:200,availableCents:0 })
  })
  async function outputFixture(){
    const quote=await issueStudioQuote({ seatId:seats[0],accessVersion:1,request,now:NOW })
    const job=await reserveQuotedGeneration({ seatId:seats[0],accessVersion:1,quoteId:quote.id,requestKey:randomUUID(),now:NOW })
    await dispatchStudioJob({ jobId:job.id,seatId:seats[0],accessVersion:1,now:NOW })
    const providerId=(await state.pool.query('select provider_job_id from workshop_studio_jobs where id=$1',[job.id])).rows[0].provider_job_id
    await state.pool.query("update workshop_studio_jobs set provider_state='completed',provider_video_url=$2,provider_expires_at='2026-11-08T17:00:00Z' where id=$1",[job.id,`https://synthetic-output.example/${providerId}/out.mp4`])
    const bytes=Buffer.concat([Buffer.from([0,0,0,24]),Buffer.from('ftypisom'),Buffer.alloc(244,7)])
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(bytes,{ headers:{ 'Content-Type':'video/mp4','Content-Length':String(bytes.length) } })))
    const token=randomBytes(32).toString('base64url')
    await state.pool.query("insert into workshop_studio_sessions(token_hash,seat_id,access_version,created_at,expires_at) values($1,$2,1,$3,'2026-11-13T19:00:00Z')",[createHash('sha256').update(token).digest('hex'),seats[0],NOW])
    return { job,bytes,token }
  }
  it('persists one identical output copy across concurrent import connections',async()=>{
    const { job,bytes,token }=await outputFixture()
    const results=await Promise.all([importStudioOutput({ jobId:job.id,now:NOW }),importStudioOutput({ jobId:job.id,now:NOW })])
    expect(results[0]).toEqual(results[1]);expect(await count('select count(*) from workshop_studio_outputs')).toBe(1)
    const file=await getStudioOutput({ jobId:job.id,seatId:seats[0],accessVersion:1,token,now:NOW })
    expect(file.byteCount).toBe(bytes.length)
    expect((await getStudioUsage({ seatId:seats[0] })).seat.heldCents).toBe(472)
  })
  it('serves bytea through a fresh session check and stops after another connection revokes it',async()=>{
    const { job,bytes,token }=await outputFixture();await importStudioOutput({ jobId:job.id,now:NOW })
    const args={ jobId:job.id,seatId:seats[0],accessVersion:1,token,offset:0,now:NOW }
    expect(Buffer.from(await readStudioOutputChunk(args))).toEqual(bytes)
    const other=await state.pool.connect()
    try{await other.query('update workshop_studio_sessions set revoked_at=$2 where token_hash=$1',[createHash('sha256').update(token).digest('hex'),NOW])}finally{other.release()}
    await expect(readStudioOutputChunk(args)).rejects.toMatchObject({ code:'NOT_FOUND' })
  })
  it.skipIf(!existsSync('.tmp/workshop-studio/funded-pilot/reference.mp4'))('preserves saved actual pilot bytes through private SQL storage and full protected download without new provider calls',async()=>{
    const { job,token }=await outputFixture()
    const bytes=readFileSync('.tmp/workshop-studio/funded-pilot/reference.mp4')
    const expected='7b4f8efdf46ab65c89015315d81a1e11afd1e1f5020e4aec8aa4b4d4af89ee30'
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected)
    vi.stubGlobal('fetch',vi.fn(async()=>new Response(bytes,{ headers:{ 'Content-Type':'video/mp4','Content-Length':String(bytes.length) } })))
    const stored=await importStudioOutput({ jobId:job.id,now:NOW })
    expect(stored.sha256).toBe(expected)
    vi.useFakeTimers({ toFake:['Date'] });vi.setSystemTime(NOW)
    try{
      const req=new Request(`https://texasaiconsulting.com/api/workshop-studio/jobs/${job.id}/download`,{ headers:{ Cookie:'__Host-txai_studio='+token } })
      const response=await downloadStoredOutput(req,{ params:{ jobId:job.id } })
      expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toContain('no-store')
      const copied=Buffer.from(await response.arrayBuffer())
      expect(copied.length).toBe(bytes.length);expect(createHash('sha256').update(copied).digest('hex')).toBe(expected)
    }finally{vi.useRealTimers()}
  })
})
