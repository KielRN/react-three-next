import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { query, transaction } from '../lib/db.js'

const here = dirname(fileURLToPath(import.meta.url))
const dir = join(here, '..', 'db', 'migrations')

async function main() {
  await query(
    'create table if not exists _migrations (name text primary key, applied_at timestamptz default now())',
  )
  const { rows } = await query('select name from _migrations')
  const applied = new Set(rows.map((r) => r.name))
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip   ${file}`)
      continue
    }
    const sql = readFileSync(join(dir, file), 'utf8')
    console.log(`apply  ${file}`)
    try {
      await transaction(async (client) => {
        await client.query(sql)
        await client.query('insert into _migrations (name) values ($1)', [file])
      })
    } catch (e) {
      console.error(`FAILED ${file}: ${e.message}`)
      process.exit(1)
    }
  }
  console.log('migrations done')
  process.exit(0)
}
main()
