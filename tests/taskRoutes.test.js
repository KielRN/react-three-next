import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/adminAuth.js', () => ({ requireAdmin: vi.fn() }))
vi.mock('../lib/taskStore.js', () => ({ getTaskWeek: vi.fn(), completeTask: vi.fn() }))
import { requireAdmin } from '../lib/adminAuth.js'
import { getTaskWeek, completeTask } from '../lib/taskStore.js'
import { GET } from '../app/api/admin/tasks/route.js'
import { POST } from '../app/api/admin/tasks/[id]/complete/route.js'

const id = '11111111-1111-4111-8111-111111111111'
const req = (body) => new Request('https://example.com/api/admin/tasks', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  vi.resetAllMocks()
  requireAdmin.mockResolvedValue({ uid: 'manny-uid', email: 'manny@example.com' })
})

describe('task routes', () => {
  it.each([401, 403])('rejects %s before accessing task data', async (status) => {
    requireAdmin.mockResolvedValue({ error: new Response('{}', { status }) })
    expect((await GET(new Request('https://example.com/api/admin/tasks'))).status).toBe(status)
    expect((await POST(req({}), { params: { id } })).status).toBe(status)
    expect(getTaskWeek).not.toHaveBeenCalled()
    expect(completeTask).not.toHaveBeenCalled()
  })
  it('rejects an invalid week and does not query storage', async () => {
    expect((await GET(new Request('https://example.com/api/admin/tasks?week=2025-W53'))).status).toBe(400)
    expect(getTaskWeek).not.toHaveBeenCalled()
  })
  it('always scopes reads to the authenticated account and disables caching', async () => {
    getTaskWeek.mockResolvedValue({ tasks: [] })
    const response = await GET(new Request('https://example.com/api/admin/tasks?week=2026-W43&callerId=another-person'))
    expect(getTaskWeek).toHaveBeenCalledWith('manny-uid', '2026-W43')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
  it('ignores forged assignees, reward amounts, and client-supplied dates', async () => {
    completeTask.mockResolvedValue({ points: 75, xp: 15 })
    const response = await POST(req({ note: '  Checked inbox  ', callerId: 'another-person', points: 99999, xp: 99999, today: '2026-01-01' }), { params: { id } })
    expect(response.status).toBe(200)
    expect(completeTask).toHaveBeenCalledWith({ callerId: 'manny-uid', taskId: id, note: 'Checked inbox' })
  })
  it.each([null, [], { note: 123 }, { note: 'x'.repeat(2001) }])('rejects malformed body %s', async (body) => {
    expect((await POST(req(body), { params: { id } })).status).toBe(400)
    expect(completeTask).not.toHaveBeenCalled()
  })
  it('returns safe not-found and conflict errors', async () => {
    completeTask.mockRejectedValue(Object.assign(new Error('Task not found.'), { status: 404 }))
    expect((await POST(req({}), { params: { id } })).status).toBe(404)
    completeTask.mockRejectedValue(Object.assign(new Error('Future task.'), { status: 409 }))
    expect((await POST(req({}), { params: { id } })).status).toBe(409)
  })
  it('rejects invalid IDs and malformed JSON', async () => {
    expect((await POST(req({}), { params: { id: 'not-a-uuid' } })).status).toBe(400)
    expect((await POST(new Request('https://example.com', { method: 'POST', body: '{' }), { params: { id } })).status).toBe(400)
  })
})
