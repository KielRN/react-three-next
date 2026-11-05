import { beforeEach, describe, expect, it, vi } from 'vitest'
import { summarizePay, formatUsd, parseUsd } from '../lib/callerPay.js'

vi.mock('../lib/adminAuth.js', () => ({ requireAdmin: vi.fn() }))
vi.mock('../lib/payStore.js', () => ({ getPayStatus: vi.fn() }))
import { requireAdmin } from '../lib/adminAuth.js'
import { getPayStatus } from '../lib/payStore.js'
import { GET } from '../app/api/admin/pay/route.js'

describe('summarizePay', () => {
  it('starts Sam at $890 = 178 calls at $5', () => {
    const s = summarizePay({ rateCents: 500, creditedCents: 89000, paidCalls: 0 })
    expect(s.balanceCents).toBe(89000)
    expect(s.callsRemaining).toBe(178)
    expect(s.owedCents).toBe(0)
  })
  it('works the balance down $5 per paid call', () => {
    const s = summarizePay({ rateCents: 500, creditedCents: 89000, paidCalls: 40, paidCallsToday: 12 })
    expect(s.earnedCents).toBe(20000)
    expect(s.balanceCents).toBe(69000)
    expect(s.callsRemaining).toBe(138)
    expect(s.paidCallsToday).toBe(12)
  })
  it('reports calls past the prepay as owed instead of a negative balance', () => {
    const s = summarizePay({ rateCents: 500, creditedCents: 89000, paidCalls: 180 })
    expect(s.balanceCents).toBe(-1000)
    expect(s.callsRemaining).toBe(0)
    expect(s.owedCents).toBe(1000)
  })
})

describe('money helpers', () => {
  it('formats cents as dollars', () => {
    expect(formatUsd(89000)).toBe('$890.00')
    expect(formatUsd(500)).toBe('$5.00')
    expect(formatUsd(123456)).toBe('$1,234.56')
    expect(formatUsd(-1005)).toBe('-$10.05')
  })
  it('parses dollar input to cents and rejects junk', () => {
    expect(parseUsd('890')).toBe(89000)
    expect(parseUsd('$5.5')).toBe(550)
    expect(parseUsd('12.34')).toBe(1234)
    expect(() => parseUsd('5.555')).toThrow()
    expect(() => parseUsd('abc')).toThrow()
    expect(() => parseUsd('')).toThrow()
  })
})

describe('GET /api/admin/pay', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    requireAdmin.mockResolvedValue({ uid: 'sam-uid', email: 'sam@example.com' })
  })
  it.each([401, 403])('rejects %s before reading pay data', async (status) => {
    requireAdmin.mockResolvedValue({ error: new Response('{}', { status }) })
    expect((await GET(new Request('https://example.com/api/admin/pay'))).status).toBe(status)
    expect(getPayStatus).not.toHaveBeenCalled()
  })
  it('only ever reads the signed-in caller and is not cached', async () => {
    getPayStatus.mockResolvedValue({ balanceCents: 89000 })
    const res = await GET(new Request('https://example.com/api/admin/pay?callerId=someone-else'))
    expect(getPayStatus).toHaveBeenCalledWith('sam-uid')
    expect(res.headers.get('cache-control')).toBe('private, no-store')
    expect(await res.json()).toEqual({ pay: { balanceCents: 89000 } })
  })
  it('returns pay: null for callers without a pay account', async () => {
    getPayStatus.mockResolvedValue(null)
    expect(await (await GET(new Request('https://example.com/api/admin/pay'))).json()).toEqual({ pay: null })
  })
})
