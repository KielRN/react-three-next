import { beforeEach, describe, expect, it, vi } from 'vitest'
const gate = vi.hoisted(() => ({ transport: false, submission: false }))
vi.mock('../lib/workshopStudioFeatures.js', () => ({ studioProviderTransportEnabled: () => gate.transport, studioReadiness: () => ({ providerSubmissionEnabled: gate.submission }) }))
import { createStudioTransport } from '../lib/workshopStudioTransport.js'
import { studioRequestHash } from '../lib/workshopStudioProvider.js'

const id = '11111111-1111-4111-8111-111111111111'
const endpoint = `https://api.higgsfield.ai/requests/${id}/status`
const request = { model: 'bytedance/seedance-2.5/reference-to-video', prompt: 'One eight-second corridor shot.', duration: 8,
  resolution: '720p', aspectRatio: '16:9', outputFormat: 'mp4', generateAudio: false,
  reference: { assetId: 'reference-one', sha256: 'a'.repeat(64) } }
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'X-Correlation-ID': 'provider-receipt-one' } })
let fetchImpl, credentials, resolveReference, client
beforeEach(() => {
  gate.transport = false; gate.submission = false
  fetchImpl = vi.fn()
  credentials = vi.fn(() => 'fixture-id:fixture-secret')
  resolveReference = vi.fn(async () => ({ url: 'https://class-assets.example/reference.mp4', sha256: 'a'.repeat(64) }))
  client = createStudioTransport({ fetchImpl, getCredentials: credentials, resolveReference, allowedReferenceOrigins: ['https://class-assets.example'] })
})

describe('real protocol implementation with fake HTTP only', () => {
  it('denies every operation before keys, media resolution or network while the real gate is off', async () => {
    for (const operation of [() => client.estimate({ request }), () => client.submit({ request, idempotencyKey: id }), () => client.status({ requestId: id, statusUrl: endpoint })]) {
      await expect(operation()).rejects.toMatchObject({ code: 'PROVIDER_DISABLED' })
    }
    expect(fetchImpl).not.toHaveBeenCalled(); expect(credentials).not.toHaveBeenCalled(); expect(resolveReference).not.toHaveBeenCalled()
  })
  it('builds the exact estimate request and rounds the provider USD estimate up', async () => {
    gate.transport = true
    fetchImpl.mockResolvedValue(response({ usd: '4.992192' }))
    const result = await client.estimate({ request })
    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.higgsfield.ai/estimate/bytedance/seedance-2.5/reference-to-video')
    expect(options).toMatchObject({ method: 'POST', redirect: 'error', cache: 'no-store', headers: { Authorization: 'Key fixture-id:fixture-secret' } })
    expect(JSON.parse(options.body)).toEqual({ prompt: request.prompt, duration: 8, resolution: '720p', aspect_ratio: '16:9', output_format: 'mp4', generate_audio: false, video_urls: ['https://class-assets.example/reference.mp4'] })
    expect(result).toMatchObject({ maximumCostCents: 500, currency: 'USD', correlationId: 'provider-receipt-one' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
  it('does not silently clamp an estimate over the learner limit', async () => {
    gate.transport = true; fetchImpl.mockResolvedValue(response({ usd: '5.54688' }))
    expect((await client.estimate({ request })).maximumCostCents).toBe(555)
  })
  it('fails closed on the actual descriptive Seedance estimate instead of issuing a learner dollar quote', async () => {
    gate.transport = true
    fetchImpl.mockResolvedValue(response({ type: 'description', pricing_description: '$0.01284 per 1,000 tokens at 480p or 720p' }))
    await expect(client.estimate({ request })).rejects.toMatchObject({ code: 'PROVIDER_BAD_RESPONSE' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
  it.each(['-1', 'NaN', '1e2', '', null, undefined, '1.123456789'])('rejects invalid provider prices: %s', async (usd) => {
    gate.transport = true; fetchImpl.mockResolvedValue(response({ usd }))
    await expect(client.estimate({ request })).rejects.toMatchObject({ code: 'PROVIDER_BAD_RESPONSE' })
  })
  it('checks supplied asset content and HTTPS before revealing credentials', async () => {
    gate.transport = true
    resolveReference.mockResolvedValueOnce({ url: 'https://class-assets.example/reference.mp4', sha256: 'b'.repeat(64) })
    await expect(client.estimate({ request })).rejects.toMatchObject({ code: 'REFERENCE_MISMATCH' })
    resolveReference.mockResolvedValueOnce({ url: 'http://localhost/reference.mp4', sha256: 'a'.repeat(64) })
    await expect(client.estimate({ request })).rejects.toMatchObject({ code: 'INVALID_REFERENCE' })
    expect(credentials).not.toHaveBeenCalled(); expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('does not enable generation when only non-generating transport is enabled', async () => {
    gate.transport = true
    await expect(client.submit({ request, idempotencyKey: id })).rejects.toMatchObject({ code: 'PROVIDER_DISABLED' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('submits once with a persisted job UUID and accepts only a matching provider status URL', async () => {
    gate.transport = true; gate.submission = true
    fetchImpl.mockResolvedValue(response({ request_id: id, status: 'queued', status_url: endpoint }))
    expect(await client.submit({ request, idempotencyKey: id })).toMatchObject({ requestId: id, statusUrl: endpoint, providerState: 'queued' })
    expect(fetchImpl.mock.calls[0][1].headers['Idempotency-Key']).toBe(id)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
  it('does not retry an ambiguous generation response or expose provider error content', async () => {
    gate.transport = true; gate.submission = true
    fetchImpl.mockResolvedValue(response({ detail: 'private prompt and key' }, 503))
    await expect(client.submit({ request, idempotencyKey: id })).rejects.toMatchObject({ code: 'PROVIDER_UNCERTAIN' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    fetchImpl.mockRejectedValueOnce(new Error('secret leaked by upstream'))
    await expect(client.submit({ request, idempotencyKey: id })).rejects.not.toThrow('secret')
  })
  it.each(['https://evil.example/status', 'https://api.higgsfield.ai/requests/other/status', endpoint+'?token=x', 'http://api.higgsfield.ai/requests/'+id+'/status'])('rejects untrusted correlation URLs before HTTP: %s', async (statusUrl) => {
    gate.transport = true
    await expect(client.status({ requestId: id, statusUrl })).rejects.toMatchObject({ code: 'INVALID_PROVIDER_URL' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it.each(['queued', 'in_progress', 'completed', 'failed', 'nsfw', 'canceled'])('reads %s without inventing billing evidence', async (status) => {
    gate.transport = true
    fetchImpl.mockResolvedValue(response({ request_id: id, status, ...(status === 'completed' ? { video: { url: 'https://media.example/output.mp4' } } : {}) }))
    expect(await client.status({ requestId: id, statusUrl: endpoint })).toMatchObject({ providerState: status, billingVerified: false })
    expect(fetchImpl.mock.calls[0][1].method).toBe('GET')
  })
  it('rejects correlation mismatch, unknown statuses and missing completed files', async () => {
    gate.transport = true
    for (const body of [{ request_id: 'different', status: 'queued' }, { request_id: id, status: 'success' }, { request_id: id, status: 'completed' }]) {
      fetchImpl.mockResolvedValueOnce(response(body))
      await expect(client.status({ requestId: id, statusUrl: endpoint })).rejects.toMatchObject({ code: 'PROVIDER_BAD_RESPONSE' })
    }
  })
  it('sanitizes response-stream failures and retains submission uncertainty', async () => {
    gate.transport = true; gate.submission = true
    const broken = () => new Response(new ReadableStream({ start(controller) { controller.error(new Error('private-key-and-url')) } }), { headers: { 'Content-Type': 'application/json' } })
    fetchImpl.mockResolvedValueOnce(broken())
    await expect(client.submit({ request, idempotencyKey: id })).rejects.toMatchObject({ code: 'PROVIDER_UNCERTAIN' })
    fetchImpl.mockResolvedValueOnce(broken())
    await expect(client.status({ requestId: id, statusUrl: endpoint })).rejects.toMatchObject({ code: 'PROVIDER_BAD_RESPONSE' })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
  it('binds the quote and priced body to one immutable request across asynchronous work', async () => {
    gate.transport = true
    const mutable = structuredClone(request)
    const expectedHash = studioRequestHash(mutable)
    resolveReference.mockImplementationOnce(async () => {
      mutable.prompt = 'Changed while resolving the media'
      return { url: 'https://class-assets.example/reference.mp4', sha256: 'a'.repeat(64) }
    })
    fetchImpl.mockImplementationOnce(async () => {
      mutable.duration = 9
      mutable.reference.assetId = 'changed-after-pricing'
      return response({ usd: '4.992192' })
    })
    const result = await client.estimate({ request: mutable })
    expect(result.requestHash).toBe(expectedHash)
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).prompt).toBe(request.prompt)
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).duration).toBe(8)
  })
  it('submits the persisted quoted payload without resolving a different signed URL', async () => {
    gate.transport = true; gate.submission = true
    const providerPayload = { prompt: request.prompt, duration: 8, resolution: '720p', aspect_ratio: '16:9', output_format: 'mp4', generate_audio: false,
      video_urls: ['https://class-assets.example/reference.mp4?frozen=one'] }
    fetchImpl.mockResolvedValue(response({ request_id: id, status: 'queued', status_url: endpoint }))
    await client.submit({ request, providerPayload, idempotencyKey: id })
    expect(resolveReference).not.toHaveBeenCalled()
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual(providerPayload)
  })
})
