// Pure helpers for importing markdown lead tables. No DB, no fs — unit-testable.

export function normalizePhone(raw) {
  if (!raw) return null
  const trimmed = String(raw).trim()
  if (!trimmed) return null
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null
  if (hasPlus) return '+' + digits
  if (digits.length === 10) return '+1' + digits
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits
  return '+' + digits // best-effort for other lengths
}

export function isoWeekId(date) {
  // ISO 8601 week number. Copy date to avoid mutation.
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7 // Sunday → 7
  d.setUTCDate(d.getUTCDate() + 4 - day) // shift to Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

// --- markdown cell helpers (real lists use **bold**, [text](url) links, ⭐, and — for empty) ---
const EMPTY = new Set(['', '—', '–', '-', 'n/a', 'na'])

export function stripCell(cell) {
  if (cell == null) return ''
  let s = String(cell).trim()
  const link = s.match(/^\[([^\]]*)\]\(([^)]*)\)$/) // [text](url) → text
  if (link) s = link[1].trim()
  s = s.replace(/\*\*/g, '').replace(/__/g, '').trim() // drop bold/italic markers
  if (EMPTY.has(s.toLowerCase())) return ''
  return s
}

export function extractPhone(cell) {
  if (cell == null) return null
  const s = String(cell).trim()
  const tel = s.match(/tel:(\+?\d+)/i) // markdown links carry the clean E.164 in the href — prefer it
  if (tel) return normalizePhone(tel[1])
  return normalizePhone(stripCell(s))
}

function numFromCell(cell) {
  const s = stripCell(cell)
  const m = s.match(/-?\d+(\.\d+)?/) // pull the number out of '⭐ 3.9' etc.
  return m ? Number(m[0]) : null
}
function intFromCell(cell) {
  const n = numFromCell(cell)
  return n == null ? null : Math.trunc(n)
}

const COLUMN_ALIASES = {
  business: ['business', 'name', 'company'],
  owner: ['owner', 'principal', 'owner / principal', 'contact'],
  phone: ['phone', 'phone number', 'number'],
  address: ['address', 'location'],
  rating: ['rating', 'stars'],
  reviews_count: ['reviews', 'review count', 'reviews count', '# reviews'],
  last_review: ['last review', 'last review date'],
  competitor: ['top competitor', 'competitor'],
}

function resolveHeaders(headerCells) {
  const lc = headerCells.map((h) => h.trim().toLowerCase())
  const map = {} // canonicalKey -> column index
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = lc.findIndex((h) => aliases.includes(h))
    if (idx !== -1) map[key] = idx
  }
  return { map, lc }
}

function splitRow(line) {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim())
}

export function parseLeadTable(markdown) {
  const lines = markdown
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'))
  if (lines.length < 2) return { rows: [], skipped: [], headers: [] }

  const header = splitRow(lines[0])
  const { map, lc } = resolveHeaders(header)
  const dataLines = lines.slice(1).filter((l) => !/^\|?\s*-{2,}/.test(l)) // drop separator row

  const IGNORE_HEADERS = new Set(['#', '']) // leading row-number column etc.
  const rows = []
  const skipped = []
  for (const line of dataLines) {
    const cells = splitRow(line)
    const get = (key) => (map[key] != null ? cells[map[key]] : undefined)

    // Preserve any unmapped, non-ignored columns under `context` (cleaned).
    const context = {}
    header.forEach((h, i) => {
      const canonical = Object.keys(map).find((k) => map[k] === i)
      const cleaned = stripCell(cells[i])
      if (!canonical && !IGNORE_HEADERS.has(lc[i]) && cleaned) context[lc[i]] = cleaned
    })

    const business = stripCell(get('business'))
    const phone = extractPhone(get('phone'))
    const record = {
      business,
      owner: stripCell(get('owner')) || null,
      phone,
      address: stripCell(get('address')) || null,
      rating: numFromCell(get('rating')),
      reviews_count: intFromCell(get('reviews_count')),
      last_review: stripCell(get('last_review')) || null,
      competitor: stripCell(get('competitor')) || null,
      context: Object.keys(context).length ? context : null,
    }
    if (!business) continue
    if (!phone) {
      skipped.push({ business, reason: 'no_phone' })
      continue
    }
    rows.push(record)
  }
  return { rows, skipped, headers: header }
}
