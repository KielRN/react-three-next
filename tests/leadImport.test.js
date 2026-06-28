import { describe, it, expect } from 'vitest'
import { normalizePhone, isoWeekId, parseLeadTable, extractPhone } from '../lib/leadImport.js'

describe('normalizePhone', () => {
  it('strips formatting and prefixes +1 for 10-digit US numbers', () => {
    expect(normalizePhone('(512) 555-0142')).toBe('+15125550142')
  })
  it('keeps a leading 1 as +1', () => {
    expect(normalizePhone('1-512-555-0142')).toBe('+15125550142')
  })
  it('preserves an explicit + country code', () => {
    expect(normalizePhone('+44 20 7946 0958')).toBe('+442079460958')
  })
  it('returns null for empty / missing', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone(undefined)).toBeNull()
  })
})

describe('isoWeekId', () => {
  it('formats an ISO week id', () => {
    // 2026-06-28 is ISO week 26 of 2026.
    expect(isoWeekId(new Date('2026-06-28T12:00:00Z'))).toBe('2026-W26')
  })
})

describe('parseLeadTable (real gmaps-prospect format)', () => {
  // Mirrors tire-shop-san-antonio-tx-target-hit-list.md: # column, **bold** business,
  // markdown-link Address + Phone (with tel: href), ⭐ rating, — for empty cells.
  const md = [
    '| # | Business | Owner / Principal | Address | Phone | Rating | Reviews | Last Review | Top Competitor |',
    '|---|----------|-------------------|---------|-------|--------|---------|-------------|----------------|',
    '| 1 | **Acme Auto** | — | [123 Main St, San Antonio, TX 78218, USA](https://maps.google.com/?cid=1) | [(512) 555-0142](tel:+15125550142) | ⭐ 4.2 | 77 | 2 months ago | Casias ⭐ 4.0 / 2111 |',
    '| 2 | **No Phone Co** | Bob (per Yelp) | [456 Oak Ave](https://maps.google.com/?cid=2) | — | ⭐ 3.1 | 5 | — | Casias ⭐ 4.0 / 2111 |',
  ].join('\n')

  it('strips bold, reads the tel: href, parses ⭐ rating, and maps columns', () => {
    const { rows, skipped } = parseLeadTable(md)
    expect(rows).toHaveLength(1)
    expect(rows[0].business).toBe('Acme Auto')
    expect(rows[0].owner).toBeNull() // '—' → null
    expect(rows[0].phone).toBe('+15125550142')
    expect(rows[0].address).toBe('123 Main St, San Antonio, TX 78218, USA')
    expect(rows[0].rating).toBe(4.2)
    expect(rows[0].reviews_count).toBe(77)
    expect(rows[0].last_review).toBe('2 months ago')
    expect(rows[0].competitor).toBe('Casias ⭐ 4.0 / 2111')
  })

  it('skips rows whose phone cell is the em-dash', () => {
    const { skipped } = parseLeadTable(md)
    expect(skipped).toHaveLength(1)
    expect(skipped[0].business).toBe('No Phone Co')
    expect(skipped[0].reason).toBe('no_phone')
  })
})

describe('extractPhone', () => {
  it('prefers the tel: href over the display text', () => {
    expect(extractPhone('[(210) 314-6343](tel:+12103146343)')).toBe('+12103146343')
  })
  it('falls back to normalizing plain display text', () => {
    expect(extractPhone('(210) 314-6343')).toBe('+12103146343')
  })
  it('returns null for an em-dash cell', () => {
    expect(extractPhone('—')).toBeNull()
  })
})
