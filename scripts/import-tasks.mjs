import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { businessDate, expandTaskPlan, weekForDate } from '../lib/taskSchedule.js'

const usage = `Usage: node --env-file=.env scripts/import-tasks.mjs --file <plan.json> --week <YYYY-Www> --email <existing-login> [--apply]
Default: validate and preview only, without connecting to Firebase or Postgres.
Use --apply to save the previewed assignments. The full plan is imported atomically.
Alternatively use --caller <Firebase-UID> in place of --email.`

async function main() {
  const { values } = parseArgs({ options: {
    file: { type: 'string' }, week: { type: 'string' }, email: { type: 'string' },
    caller: { type: 'string' }, apply: { type: 'boolean', default: false }, help: { type: 'boolean' },
  } })
  if (values.help) { console.log(usage); return }
  if (!values.file || !values.week || Boolean(values.email) === Boolean(values.caller)) throw new Error(usage)
  const plan = JSON.parse(readFileSync(values.file, 'utf8').replace(/^\uFEFF/, ''))
  const assignments = expandTaskPlan(plan, values.week)
  console.log(`${values.apply ? 'Import' : 'Preview'}: ${values.week} · ${values.email || values.caller} · ${assignments.length} assignments`)
  console.log(`Current Central-time week: ${weekForDate(businessDate())}`)
  for (const task of assignments) {
    console.log(`\n${task.dueDate} | ${task.key} | ${task.points} pts / ${task.xp} XP\n${task.title}\n${task.instructions}`)
    if (task.source) console.log(`Brief: ${task.source}`)
    if (task.link) console.log(`Resource: ${task.link}`)
  }
  if (!values.apply) { console.log('\nPreview only. Add --apply to save this plan.'); return }
  const { adminAuth } = await import('../lib/firebaseAdmin.js')
  const auth = adminAuth()
  const user = values.email ? await auth.getUserByEmail(values.email.trim().toLowerCase()) : await auth.getUser(values.caller)
  const allowed = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map((email) => email.trim().toLowerCase())
  if (user.disabled || !user.email || !allowed.includes(user.email.toLowerCase())) throw new Error('Assignee must be an enabled, allowlisted Firebase user. No assignments were written.')
  const { importTasks } = await import('../lib/taskImport.js')
  const { getPool } = await import('../lib/db.js')
  try {
    const counts = await importTasks(assignments, user.uid)
    console.log(`\nSaved for ${user.email}: ${counts.imported} new, ${counts.updated} updated, ${counts.completedUnchanged} completed and unchanged.`)
    const result = await getPool().query(`select due_date::text as day, count(*)::int as tasks,
      count(*) filter (where completed_at is not null)::int as completed from admin_tasks
      where assignee_id = $1 and due_date between $2::date and $3::date group by due_date order by due_date`,
    [user.uid, assignments.map((task) => task.dueDate).sort()[0], assignments.map((task) => task.dueDate).sort().at(-1)])
    console.table(result.rows)
  } finally { await getPool().end() }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })
