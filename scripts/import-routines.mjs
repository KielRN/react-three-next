import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { routineDefinitions } from '../lib/taskRoutines.js'

const usage = `Usage: node --env-file=.env scripts/import-routines.mjs --file task-plans/routines.json --email <existing-login> [--share-with <email,email>] [--apply]
Default: validate and preview only, without connecting to Firebase or Postgres.
Use --apply to save. The file is the full list for that person: routines missing from it are paused.
Routine tasks then appear automatically every business day when the task board loads.`

async function main() {
  const { values } = parseArgs({ options: {
    file: { type: 'string' }, email: { type: 'string' }, 'share-with': { type: 'string' },
    apply: { type: 'boolean', default: false }, help: { type: 'boolean' },
  } })
  if (values.help) { console.log(usage); return }
  if (!values.file || !values.email) throw new Error(usage)
  const routines = routineDefinitions(JSON.parse(readFileSync(values.file, 'utf8').replace(/^﻿/, '')))
  const sharedEmails = [...new Set((values['share-with'] || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean))]
  console.log(`${values.apply ? 'Import' : 'Preview'}: ${routines.length} daily routines for ${values.email}`)
  if (sharedEmails.length) console.log(`Shared with: ${sharedEmails.join(', ')}`)
  for (const task of routines) console.log(`\n${task.key} | every business day | ${task.points} pts / ${task.xp} XP\n${task.title}\n${task.instructions}`)
  if (!values.apply) { console.log('\nPreview only. Add --apply to save these routines.'); return }

  const { adminAuth } = await import('../lib/firebaseAdmin.js')
  const auth = adminAuth()
  const allowed = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map((email) => email.trim().toLowerCase())
  const people = [await auth.getUserByEmail(values.email.trim().toLowerCase()),
    ...await Promise.all(sharedEmails.map((email) => auth.getUserByEmail(email)))]
  for (const person of people) {
    if (person.disabled || !person.email || !allowed.includes(person.email.toLowerCase())) throw new Error('Every person must be an enabled, allowlisted Firebase user. Nothing was written.')
  }
  const [owner] = people
  const sharedWith = sharedEmails.length
    ? people.filter((person, index) => people.findIndex((other) => other.uid === person.uid) === index)
      .map((person) => ({ userId: person.uid, displayName: person.displayName || person.email }))
    : []

  const { transaction, getPool } = await import('../lib/db.js')
  try {
    await transaction(async (client) => {
      for (const task of routines) {
        await client.query(`insert into task_routines
            (assignee_id, task_key, title, instructions, points, xp, source, resource_url, shared_with, active)
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,true)
          on conflict (assignee_id, task_key) do update set title = excluded.title, instructions = excluded.instructions,
            points = excluded.points, xp = excluded.xp, source = excluded.source, resource_url = excluded.resource_url,
            shared_with = excluded.shared_with, active = true, updated_at = now()`,
        [owner.uid, task.key, task.title, task.instructions, task.points, task.xp, task.source, task.link, JSON.stringify(sharedWith)])
      }
      await client.query('update task_routines set active = false, updated_at = now() where assignee_id = $1 and not (task_key = any($2::text[]))',
        [owner.uid, routines.map((task) => task.key)])
    })
    const { rows } = await getPool().query('select task_key, active, points, xp, jsonb_array_length(shared_with) as shared from task_routines where assignee_id = $1 order by task_key', [owner.uid])
    console.log(`\nSaved for ${owner.email}:`)
    console.table(rows)
  } finally { await getPool().end() }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })
