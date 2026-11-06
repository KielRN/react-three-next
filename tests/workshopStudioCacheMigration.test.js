import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../public/workshop-studio/cache-guard.js', import.meta.url), 'utf8')
const origin = 'https://texasaiconsulting.com'

function worker(paths, failDelete = false) {
  const entries = new Map(paths.map((path) => [new URL(path, origin).href, true]))
  const listeners = {}
  const cache = {
    keys: async () => [...entries.keys()].map((url) => ({ url })),
    delete: async (request) => failDelete ? false : entries.delete(request.url),
    match: async (request) => entries.get(request.url),
  }
  runInNewContext(source, {
    URL,
    self: { location: { origin }, addEventListener: (name, listener) => { listeners[name] = listener } },
    caches: { keys: async () => ['existing-runtime'], open: async () => cache },
  })
  async function invoke(name, fields = {}) {
    const pending = []
    listeners[name]({ ...fields, waitUntil: (promise) => pending.push(promise) })
    await Promise.all(pending)
  }
  return { entries, invoke }
}

describe('installed worker private-cache migration', () => {
  it('removes same-origin private aliases in existing caches and preserves public/foreign entries', async () => {
    const w = worker(['/api/workshop-studio/session', '/workshops/studio?fixture=1', '/api/workshop%2Dstudio/jobs',
      '/api/workshop-studio%2Fjobs/id/download', '/api/workshop-studio%2F..%2Fsession', '/workshops//studio', '/public', '/workshops',
      'https://other.example/api/workshop-studio/session'])
    await w.invoke('activate')
    expect([...w.entries.keys()]).toEqual([`${origin}/public`, `${origin}/workshops`, 'https://other.example/api/workshop-studio/session'])
  })
  it('acknowledges only after deletion and fails closed if a private entry remains', async () => {
    for (const failDelete of [false, true]) {
      const w = worker(['/api/workshop-studio/session'], failDelete)
      const replies = []
      let closed = false
      await w.invoke('message', { data: { type: 'TXAI_STUDIO_CACHE_GUARD', version: 1 }, ports: [{
        postMessage: (reply) => replies.push(reply), close: () => { closed = true },
      }] })
      expect(replies).toEqual([{ type: 'TXAI_STUDIO_CACHE_READY', version: 1, safe: !failDelete }])
      expect(closed).toBe(true)
      expect(w.entries.size).toBe(failDelete ? 1 : 0)
    }
  })
  it('does not accept an unknown protocol/version or mutate caches for unrelated messages', async () => {
    const w = worker(['/api/workshop-studio/session'])
    const port = { postMessage: () => { throw new Error('Unexpected reply') } }
    await w.invoke('message', { data: { type: 'OTHER', version: 1 }, ports: [port] })
    await w.invoke('message', { data: { type: 'TXAI_STUDIO_CACHE_GUARD', version: 2 }, ports: [port] })
    await w.invoke('message', { data: { type: 'TXAI_STUDIO_CACHE_GUARD', version: 1 }, ports: [] })
    expect(w.entries.size).toBe(1)
  })
})
