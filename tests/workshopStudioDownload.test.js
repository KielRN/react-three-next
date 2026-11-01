import { beforeEach,describe,expect,it,vi } from 'vitest'
vi.mock('../lib/workshopStudioAccess.js',()=>({ authenticateStudioSession:vi.fn() }))
vi.mock('../lib/workshopStudioOutputs.js',()=>({ getStudioOutput:vi.fn(),readStudioOutputChunk:vi.fn(),listStudioOutputJobs:vi.fn(),MAX_STUDIO_OUTPUT_BYTES:16777216 }))
import { authenticateStudioSession } from '../lib/workshopStudioAccess.js'
import { getStudioOutput,readStudioOutputChunk,listStudioOutputJobs } from '../lib/workshopStudioOutputs.js'
import { GET,HEAD } from '../app/api/workshop-studio/jobs/[jobId]/download/route.js'
import { GET as list } from '../app/api/workshop-studio/jobs/route.js'

const jobId='11111111-1111-4111-8111-111111111111'
const seatId='22222222-2222-4222-8222-222222222222'
const token='a'.repeat(43)
const ctx={ params:{ jobId } }
const request=(suffix='',options={})=>new Request('https://texasaiconsulting.com/api/workshop-studio/jobs/'+jobId+'/download'+suffix,{ headers:{ cookie:'__Host-txai_studio='+token },...options })
function privateHeaders(response){
  expect(response.headers.get('cache-control')).toContain('no-store')
  expect(response.headers.get('referrer-policy')).toBe('no-referrer')
  expect(response.headers.get('x-content-type-options')).toBe('nosniff')
}
beforeEach(()=>{
  vi.resetAllMocks()
  authenticateStudioSession.mockResolvedValue({ seatId,accessVersion:1,expiresAt:new Date('2030-01-01T00:00:00Z') })
  getStudioOutput.mockResolvedValue({ jobId,byteCount:6,contentType:'video/mp4',sha256:'a'.repeat(64),expiresAt:new Date('2030-01-01T00:00:00Z') })
  readStudioOutputChunk.mockResolvedValueOnce(new Uint8Array([1,2,3])).mockResolvedValueOnce(new Uint8Array([4,5,6]))
  listStudioOutputJobs.mockResolvedValue([])
})
describe('private full-download and result-list HTTP contracts with synthetic sessions',()=>{
  it('streams only same-owner stored bytes with private attachment headers and server-derived identity',async()=>{
    const response=await GET(request(),ctx)
    expect(response.status).toBe(200);privateHeaders(response)
    expect(response.headers.get('content-type')).toBe('video/mp4')
    expect(response.headers.get('content-length')).toBe('6')
    expect(response.headers.get('content-disposition')).toBe(`attachment; filename="txai-workshop-${jobId}.mp4"`)
    expect(response.headers.get('cross-origin-resource-policy')).toBe('same-origin')
    expect(response.headers.get('content-security-policy')).toContain('sandbox')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1,2,3,4,5,6]))
    expect(readStudioOutputChunk.mock.calls.map(([args])=>args.offset)).toEqual([0,3])
    expect(getStudioOutput).toHaveBeenCalledWith({ jobId,seatId,accessVersion:1,token })
  })
  it.each([['?token=secret',{},400],['',{ 'sec-fetch-site':'cross-site' },403],['',{ Range:'bytes=0-10' },400],['',{ 'If-Range':'old' },400]])('rejects URL credentials, cross-site or range controls before access: %s',async(suffix,headers,status)=>{
    const response=await GET(request(suffix,{ headers }),ctx)
    expect(response.status).toBe(status);privateHeaders(response)
    expect(authenticateStudioSession).not.toHaveBeenCalled();expect(getStudioOutput).not.toHaveBeenCalled()
    expect(await response.text()).not.toContain('secret')
  })
  it('authenticates before output lookup and sanitizes database failure',async()=>{
    authenticateStudioSession.mockRejectedValueOnce(Object.assign(new Error('private detail'),{ code:'INVALID_ACCESS' }))
    const denied=await GET(request(),ctx);expect(denied.status).toBe(401);privateHeaders(denied);expect(getStudioOutput).not.toHaveBeenCalled()
    getStudioOutput.mockRejectedValueOnce(new Error('private provider URL and SQL'))
    const failed=await GET(request(),ctx);expect(failed.status).toBe(503);expect(await failed.text()).not.toContain('provider URL')
  })
  it('returns a private404 when no eligible stored output exists',async()=>{
    getStudioOutput.mockResolvedValueOnce(null)
    const response=await GET(request(),ctx);expect(response.status).toBe(404);privateHeaders(response);expect(readStudioOutputChunk).not.toHaveBeenCalled()
  })
  it('stops the next chunk after session revocation rather than returning a partial success body',async()=>{
    readStudioOutputChunk.mockReset().mockResolvedValueOnce(new Uint8Array([1,2,3])).mockRejectedValueOnce(new Error('private ownership detail'))
    const response=await GET(request(),ctx);const reader=response.body.getReader()
    expect((await reader.read()).value).toEqual(new Uint8Array([1,2,3]))
    await expect(reader.read()).rejects.toThrow('Studio download interrupted.')
  })
  it('does not fetch another chunk after the client aborts',async()=>{
    const abort=new AbortController();const response=await GET(request('',{ signal:abort.signal }),ctx);const reader=response.body.getReader()
    await reader.read();abort.abort();await expect(reader.read()).rejects.toThrow('Studio download interrupted.')
    expect(readStudioOutputChunk).toHaveBeenCalledTimes(1)
  })
  it('treats missing/truncated stored chunks as an interrupted download',async()=>{
    readStudioOutputChunk.mockReset().mockResolvedValue(new Uint8Array())
    const response=await GET(request(),ctx);await expect(response.arrayBuffer()).rejects.toThrow('Studio download interrupted.')
  })
  it('does not accept unbounded metadata or issue metadata-only unauthenticated downloads',async()=>{
    getStudioOutput.mockResolvedValueOnce({ byteCount:16777217,contentType:'video/mp4' })
    expect((await GET(request(),ctx)).status).toBe(503)
    const head=await HEAD();expect(head.status).toBe(405);privateHeaders(head);expect(head.headers.get('allow')).toBe('GET')
  })
  it('lists jobs through the existing native session guard with no query selectors',async()=>{
    const response=await list(new Request('https://texasaiconsulting.com/api/workshop-studio/jobs',{ headers:{ cookie:'__Host-txai_studio='+token } }))
    expect(response.status).toBe(200);expect(await response.json()).toEqual({ jobs:[] });privateHeaders(response)
    expect(listStudioOutputJobs).toHaveBeenCalledWith({ seatId,accessVersion:1,token })
    expect((await list(new Request('https://texasaiconsulting.com/api/workshop-studio/jobs?seatId=other'))).status).toBe(400)
  })
})
