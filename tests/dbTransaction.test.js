import { afterEach, beforeEach, expect, it, vi } from 'vitest'

let client
let pool
let transaction
beforeEach(async () => {
  vi.resetModules()
  client = { query: vi.fn().mockResolvedValue({ rows: [] }), release: vi.fn() }
  pool = { connect: vi.fn().mockResolvedValue(client), query: vi.fn() }
  globalThis.__adminPgPool = pool
  transaction = (await import('../lib/db.js')).transaction
})
afterEach(() => { delete globalThis.__adminPgPool })

it('runs all work and commit on the checked-out connection', async () => {
  expect(await transaction(async (db) => { await db.query('select 1'); return 'saved' })).toBe('saved')
  expect(client.query.mock.calls.map(([sql]) => sql)).toEqual(['begin', 'select 1', 'commit'])
  expect(pool.query).not.toHaveBeenCalled()
  expect(client.release).toHaveBeenCalledOnce()
})

it('rolls back and releases the same connection on failure', async () => {
  await expect(transaction(async (db) => { await db.query('select 1'); throw new Error('failure') })).rejects.toThrow('failure')
  expect(client.query.mock.calls.map(([sql]) => sql)).toEqual(['begin', 'select 1', 'rollback'])
  expect(client.release).toHaveBeenCalledOnce()
})
