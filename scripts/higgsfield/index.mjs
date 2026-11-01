// Run from the app root: node scripts/higgsfield/index.mjs smoke|reference|status [smoke|reference]
// Runtime loads the ignored environment files; never print credentials or raw SDK errors.
import { config as loadEnv } from 'dotenv'
import { config, higgsfield } from '@higgsfield/client/v2'
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { randomUUID, createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { unlinkSync } from 'node:fs'
import { estimateCents, pilotEstimate, safeFailure, terminalResult, trustedStatusUrl } from './pilot.mjs'

const report = text => process.stdout.write(text + '\n')
const reportError = text => process.stderr.write(text + '\n')
loadEnv({ path: ['.env.local', '.env'], quiet: true })
// Existing project alias is accepted without copying or displaying its value.
const credentials = process.env.HF_CREDENTIALS || process.env.HF_KEY || process.env.HIGGSFIELD_API_KEY
if (!credentials || !/^[^:\s]+:[^:\s]+$/.test(credentials)) {
  reportError(JSON.stringify({ error: 'Set HF_CREDENTIALS locally in .env or .env.local in key-id:key-secret format. No key value was displayed.' }))
  process.exit(1)
}
const directory = resolve('.tmp/workshop-studio/funded-pilot')
await mkdir(directory, { recursive: true })
const [action = 'status', selected = 'smoke'] = process.argv.slice(2)
const kind = action === 'status' ? selected : action
if (!['smoke', 'reference'].includes(kind) || !['smoke', 'reference', 'status'].includes(action)) {
  reportError('Usage: node scripts/higgsfield/index.mjs smoke|reference|status [smoke|reference]')
  process.exit(1)
}
const filename = resolve(directory, `${kind}.json`)
const lockfile = `${filename}.lock`
try { await writeFile(lockfile, String(process.pid), { flag: 'wx', mode: 0o600 }) } catch {
  reportError(JSON.stringify({ error: 'Pilot is locked by another run or an interrupted run. Inspect saved receipt/process before removing the lock; do not resubmit.' }))
  process.exit(1)
}
process.once('exit', () => { try { unlinkSync(lockfile) } catch { /* Retain receipts; never remove jobs on exit. */ } })
let record
try { record = JSON.parse(await readFile(filename, 'utf8')) } catch (e) { if (e.code !== 'ENOENT') throw new Error('INVALID_PILOT_RECORD') }
async function save() {
  await writeFile(`${filename}.tmp`, JSON.stringify(record, null, 2) + '\n', { mode: 0o600 })
  await rename(`${filename}.tmp`, filename)
}
async function api(path, body) {
  const response = await fetch(`https://api.higgsfield.ai${path}`, {
    method: body === undefined ? 'GET' : 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
    headers: { Authorization: `Key ${credentials}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  if (!response.ok) throw Object.assign(new Error('API_HTTP_ERROR'), { httpStatus: response.status })
  const text = await response.text()
  if (text.length > 100000) throw new Error('RESPONSE_TOO_LARGE')
  return JSON.parse(text)
}
async function uploadReference() {
  const path = 'G:/My Drive/Texas AI Consulting/Workshops/ai-video-editing/lab/blender-previz/reference/previz-10s.mp4'
  const bytes = await readFile(path)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  if (bytes.length !== 1138392 || sha256 !== '6387cdb6587b198ec40308d703ab220b19a79066c7e14c86265ba20e7028cb52') throw new Error('REFERENCE_CHANGED')
  if (record.referenceUrl) return record.referenceUrl
  const receipt = await api('/files/generate-upload-url', { content_type: 'video/mp4' })
  for (const value of [receipt.upload_url, receipt.public_url]) {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('INVALID_UPLOAD_URL')
  }
  const headers = receipt.upload_headers
  if (!headers || Object.keys(headers).some(key => /authorization|cookie|host/i.test(key))) throw new Error('UNSAFE_STORAGE_HEADERS')
  // Storage PUT receives only the presigned upload headers, never API authorization.
  const uploaded = await fetch(receipt.upload_url, { method: 'PUT', redirect: 'error', headers, body: bytes, signal: AbortSignal.timeout(60000) })
  if (!uploaded.ok) throw Object.assign(new Error('UPLOAD_FAILED'), { httpStatus: uploaded.status })
  record.referenceUrl = receipt.public_url
  record.referenceSha256 = sha256
  await save()
  return record.referenceUrl
}
try {
  if (!record) {
    if (action === 'status') throw new Error('NO_SAVED_REQUEST')
    record = { kind, idempotencyKey: randomUUID(), createdAt: new Date().toISOString(), state: 'preflight', instructorTestOnly: true }
    // Exclusive initial creation prevents two CLI invocations from submitting the same pilot.
    await writeFile(filename, JSON.stringify(record, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
  }
  if (record.state === 'preflight' && action !== 'status') {
    let input, model, maximum
    if (kind === 'smoke') {
      model = 'bytedance/seedance-2.5/text-to-video'
      input = { prompt: 'A cinematic scene at sunset', duration: 5, resolution: '720p', aspect_ratio: '16:9', output_format: 'mp4', generate_audio: false }
      maximum = 300 // Self-imposed initial instructor smoke limit; not a learner allowance change.
    } else {
      model = 'bytedance/seedance-2.5/reference-to-video'
      const videoUrl = await uploadReference()
      const promptFile = await readFile('G:/My Drive/Texas AI Consulting/Workshops/ai-video-editing/resources/seedance-reference-prompt.md', 'utf8')
      const prompt = promptFile.split('\n').find(line => line.startsWith('> '))?.slice(2).trim()
      if (!prompt) throw new Error('MISSING_CLASS_PROMPT')
      input = { prompt, duration: 10, resolution: '720p', aspect_ratio: '16:9', output_format: 'mp4', generate_audio: false, video_urls: [videoUrl] }
      maximum = 600 // Instructor pilot only. Learner cap remains 500; this is NOT student access.
    }
    const estimate = await api(`/estimate/${model}`, input)
    const priced = pilotEstimate(estimate, kind)
    record.estimates = [{ duration: input.duration, ...priced, at: new Date().toISOString() }]
    await save()
    // Do not silently shorten the adopted ten-second class shot to fit its learner cap.
    record.estimatedCents = estimateCents(priced.usd, maximum)
    record.exceedsLearnerCap = record.estimatedCents > 500
    record.model = model
    record.input = input
    record.state = 'submitting_unknown'
    await save() // Persist exact payload/key BEFORE the single paid POST. No automatic resubmission.
    config({ credentials, maxRetries: 0, timeout: 60000, headers: { 'Idempotency-Key': record.idempotencyKey } })
    const accepted = await higgsfield.subscribe(model, { input, withPolling: false })
    record.requestId = accepted.request_id
    record.statusUrl = trustedStatusUrl(accepted.request_id, accepted.status_url)
    record.state = 'accepted'
    await save()
    report(JSON.stringify({ kind, state: record.state, requestId: record.requestId, estimatedCents: record.estimatedCents }))
  }
  if (record.state === 'submitting_unknown') throw new Error('UNCERTAIN_SUBMISSION_DO_NOT_RETRY')
  if (!record.requestId) throw new Error('NO_ACCEPTED_REQUEST')
  const endpoint = trustedStatusUrl(record.requestId, record.statusUrl)
  const deadline = Date.now() + 20 * 60 * 1000
  let previous
  while (Date.now() < deadline) {
    const result = await api(new URL(endpoint).pathname)
    if (result.request_id !== record.requestId) throw new Error('STATUS_REQUEST_MISMATCH')
    const terminal = terminalResult(result)
    if (terminal) {
      record.state = terminal.status
      record.finishedAt = new Date().toISOString()
      if (terminal.videoUrl) record.videoUrl = terminal.videoUrl
      record.billingVerified = false // Completion is not an account billing receipt.
      await save()
      report(JSON.stringify({ kind, requestId: record.requestId, ...terminal, billingVerified: false }))
      if (terminal.status !== 'completed') process.exitCode = 1
      break
    }
    if (previous !== result.status) report(JSON.stringify({ kind, state: result.status, requestId: record.requestId }))
    previous = result.status
    await new Promise(done => setTimeout(done, 5000))
  }
  if (!record.finishedAt) report(JSON.stringify({ kind, state: 'pending', instruction: `Resume GET polling with: node scripts/higgsfield/index.mjs status ${kind}. Never create a second paid request.` }))
} catch (error) {
  const known = new Set(['INVALID_ESTIMATE', 'ESTIMATE_EXCEEDS_PILOT_LIMIT', 'UNCERTAIN_SUBMISSION_DO_NOT_RETRY', 'NO_ACCEPTED_REQUEST', 'NO_SAVED_REQUEST', 'REFERENCE_CHANGED'])
  reportError(JSON.stringify({ ...safeFailure(error), ...(known.has(error.message) ? { reason: error.message } : {}), ...(record ? { savedState: record.state } : {}) }))
  process.exitCode = 1
}
