import { readFileSync } from 'node:fs'
import { parseLeadTable, isoWeekId } from '../lib/leadImport.js'
import { query } from '../lib/db.js'

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

async function main() {
  const file = arg('file')
  const week = arg('week') || isoWeekId(new Date())
  const callerId = arg('caller') || 'shared' // per-caller model: leads are a shared pool owned by 'shared'
  if (!file) {
    console.error('Usage: node scripts/import-leads.mjs --file <path.md> [--week 2026-W27] [--caller <id>]')
    process.exit(1)
  }

  const md = readFileSync(file, 'utf8')
  const { rows, skipped } = parseLeadTable(md)

  let imported = 0
  let updated = 0
  for (const r of rows) {
    const res = await query(
      `insert into leads
         (week_id, business, owner, phone, address, rating, reviews_count, last_review, competitor, context, caller_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       on conflict (week_id, business, phone) do update set
         owner = excluded.owner,
         address = excluded.address,
         rating = excluded.rating,
         reviews_count = excluded.reviews_count,
         last_review = excluded.last_review,
         competitor = excluded.competitor,
         context = excluded.context,
         updated_at = now()
       returning (xmax = 0) as inserted`,
      [
        week, r.business, r.owner, r.phone, r.address, r.rating,
        r.reviews_count, r.last_review, r.competitor, r.context, callerId,
      ],
    )
    if (res.rows[0].inserted) imported++
    else updated++
  }

  console.log(`week ${week}: imported ${imported}, updated ${updated}, skipped-no-phone ${skipped.length}`)
  for (const s of skipped) console.log(`  skipped: ${s.business} (${s.reason})`)
  process.exit(0)
}
main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
