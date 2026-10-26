import { query, transaction } from './db.js'
import { getOrCreateProfile } from './playerStore.js'
import { levelForXp, rankForLevel } from './scoring.js'
import { PERFECT_WEEK_BONUS, routineMultiplier, routineStreak } from './taskRoutines.js'
import { businessDate, businessWeek, completionError, isBusinessDay, nextBusinessStreak, shiftDate, weekForDate } from './taskSchedule.js'

export function publicProfile(p) {
  return { avatarId: p.avatar_id, lifetimeXp: Number(p.lifetime_xp), level: p.level, rank: p.rank,
    currentStreak: p.current_streak, longestStreak: p.longest_streak }
}

// Generates the week's routine tasks from task_routines, shared like their definition.
// Completed or closed tasks keep their history; open ones pick up definition changes.
async function ensureRoutineTasks(client, days) {
  const dates = days.map((day) => day.date)
  await client.query(`insert into admin_tasks
      (task_key, assignee_id, title, instructions, due_date, points, xp, source, resource_url, routine)
    select r.task_key, r.assignee_id, r.title, r.instructions, d.day, r.points, r.xp, r.source, r.resource_url, true
    from task_routines r cross join unnest($1::date[]) as d(day) where r.active
    on conflict (assignee_id, task_key, due_date) do update set
      title = excluded.title, instructions = excluded.instructions, points = excluded.points, xp = excluded.xp,
      source = excluded.source, resource_url = excluded.resource_url, routine = true, restarted_from = null, updated_at = now()
    where admin_tasks.completed_at is null and admin_tasks.missed_at is null
      and (admin_tasks.routine, admin_tasks.title, admin_tasks.instructions, admin_tasks.points, admin_tasks.xp,
        admin_tasks.source, admin_tasks.resource_url, admin_tasks.restarted_from)
      is distinct from (true, excluded.title, excluded.instructions, excluded.points, excluded.xp,
        excluded.source, excluded.resource_url, null::uuid)`, [dates])
  await client.query(`insert into admin_task_assignees (task_id, user_id, display_name)
    select t.id, s.person->>'userId', s.person->>'displayName'
    from task_routines r
    join admin_tasks t on t.assignee_id = r.assignee_id and t.task_key = r.task_key and t.due_date = any($1::date[])
    cross join jsonb_array_elements(r.shared_with) as s(person)
    where r.active
    on conflict (task_id, user_id) do nothing`, [dates])
}

// Keeps the board current; safe to run repeatedly.
// - Daily routines are generated for this week and expire at the end of their own day.
// - Other unchecked tasks close as "not done" when their week ends and restart on the same
//   weekday of the current week, shared with the same people.
export async function rollOverMissedTasks(today = businessDate()) {
  const days = businessWeek(weekForDate(today))
  const monday = days[0].date
  return transaction(async (client) => {
    // One rollover at a time; concurrent board loads wait here and then find nothing left to close.
    await client.query("select pg_advisory_xact_lock(hashtext('admin_tasks_rollover'))")
    await ensureRoutineTasks(client, days)
    const expired = await client.query(`update admin_tasks set missed_at = now(), updated_at = now()
      where routine and completed_at is null and missed_at is null and due_date < $1::date returning id`, [today])
    const missed = await client.query(`update admin_tasks set missed_at = now(), updated_at = now()
      where not routine and completed_at is null and missed_at is null and due_date < $1::date returning id`, [monday])
    if (!missed.rows.length) return { missed: 0, restarted: 0, expired: expired.rows.length }
    const ids = missed.rows.map((row) => row.id)
    // A slot already holding the same task this week (e.g. a weekly search) is kept, not duplicated.
    const restarted = await client.query(`insert into admin_tasks
        (task_key, assignee_id, title, instructions, due_date, points, xp, source, resource_url, restarted_from)
      select task_key, assignee_id, title, instructions, $1::date + (extract(isodow from due_date)::int - 1),
        points, xp, source, resource_url, id
      from admin_tasks where id = any($2::uuid[])
      on conflict (assignee_id, task_key, due_date) do nothing returning id`, [monday, ids])
    await client.query(`insert into admin_task_assignees (task_id, user_id, display_name)
      select fresh.id, access.user_id, access.display_name
      from admin_tasks old
      join admin_tasks fresh on fresh.assignee_id = old.assignee_id and fresh.task_key = old.task_key
        and fresh.due_date = $1::date + (extract(isodow from old.due_date)::int - 1)
      join admin_task_assignees access on access.task_id = old.id
      where old.id = any($2::uuid[])
      on conflict (task_id, user_id) do nothing`, [monday, ids])
    return { missed: ids.length, restarted: restarted.rows.length, expired: expired.rows.length }
  })
}

// The owner's routine streak: fully cleared business days in a row before today.
async function routineStatus(db, assigneeId, today) {
  const { rows } = await db.query(`select due_date::text as day, bool_and(completed_at is not null) as cleared
    from admin_tasks where assignee_id = $1 and routine and due_date >= $2::date and due_date < $3::date
    group by due_date`, [assigneeId, shiftDate(today, -400), today])
  const streak = routineStreak(new Map(rows.map((row) => [row.day, row.cleared])), today)
  return { streak, multiplier: routineMultiplier(streak) }
}

export async function getTaskWeek(callerId, weekId, today = businessDate()) {
  await rollOverMissedTasks(today)
  const days = businessWeek(weekId)
  const currentWeek = weekForDate(today)
  const [tasks, totals, bonuses, profile] = await Promise.all([
    query(`select t.*, t.due_date::text as due_date, e.caller_id as completed_by, e.points as earned_points,
        case when e.caller_id = $1 then 'You' else coalesce(a.display_name, 'Teammate') end as completed_by_name,
        exists (select 1 from admin_task_assignees shared where shared.task_id = t.id and shared.user_id <> t.assignee_id) as is_shared
      from admin_tasks t
      left join task_events e on e.task_id = t.id
      left join admin_task_assignees a on a.task_id = t.id and a.user_id = e.caller_id
      where (t.assignee_id = $1 or exists (
        select 1 from admin_task_assignees access where access.task_id = t.id and access.user_id = $1
      )) and t.due_date between $2::date and $3::date
      order by t.due_date, t.created_at, t.id`, [callerId, days[0].date, days[4].date]),
    query(`select coalesce(sum(points), 0)::int as points, coalesce(sum(xp), 0)::int as xp,
      count(*)::int as completed from task_events where caller_id = $1`, [callerId]),
    query('select week_id, kind, points, xp from task_bonuses where caller_id = $1', [callerId]),
    getOrCreateProfile(callerId),
  ])
  const scheduled = tasks.rows
  const mine = scheduled.filter((task) => task.completed_by === callerId)
  const weekBonuses = bonuses.rows.filter((bonus) => bonus.week_id === weekId)
  const owner = scheduled.find((task) => task.routine)?.assignee_id
  let routine = null
  if (owner) {
    const earned = await query('select 1 from task_bonuses where caller_id = $1 and week_id = $2 and kind = $3',
      [owner, weekId, PERFECT_WEEK_BONUS.kind])
    routine = { ...await routineStatus({ query }, owner, today), perfectWeek: earned.rows.length > 0,
      bonus: { points: PERFECT_WEEK_BONUS.points, xp: PERFECT_WEEK_BONUS.xp } }
  }
  const lifetime = totals.rows[0]
  return {
    weekId, currentWeek, today, isBusinessDay: isBusinessDay(today), days,
    tasks: scheduled, profile: publicProfile(profile), routine,
    lifetime: {
      ...lifetime,
      points: lifetime.points + bonuses.rows.reduce((sum, bonus) => sum + bonus.points, 0),
      xp: lifetime.xp + bonuses.rows.reduce((sum, bonus) => sum + bonus.xp, 0),
    },
    weekly: {
      total: scheduled.length, completed: scheduled.filter((task) => task.completed_at).length,
      points: mine.reduce((sum, task) => sum + task.earned_points, 0) + weekBonuses.reduce((sum, bonus) => sum + bonus.points, 0),
      xp: mine.reduce((sum, task) => sum + task.xp, 0) + weekBonuses.reduce((sum, bonus) => sum + bonus.xp, 0),
    },
  }
}

function taskError(message, status) {
  return Object.assign(new Error(message), { status })
}

// Pays the routine owner once when every routine on all five days of the week is complete.
async function awardPerfectWeek(client, ownerId, today) {
  const days = businessWeek(weekForDate(today))
  const { rows } = await client.query(`select count(*)::int as total, count(completed_at)::int as done,
      count(distinct due_date)::int as days
    from admin_tasks where assignee_id = $1 and routine and due_date between $2::date and $3::date`,
  [ownerId, days[0].date, days[4].date])
  const { total, done, days: covered } = rows[0]
  if (!total || done !== total || covered !== days.length) return null
  const bonus = await client.query(`insert into task_bonuses (caller_id, week_id, kind, points, xp)
    values ($1,$2,$3,$4,$5) on conflict do nothing returning id`,
  [ownerId, weekForDate(today), PERFECT_WEEK_BONUS.kind, PERFECT_WEEK_BONUS.points, PERFECT_WEEK_BONUS.xp])
  if (!bonus.rows.length) return null
  await client.query('insert into player_profile (caller_id) values ($1) on conflict do nothing', [ownerId])
  const owner = (await client.query('select lifetime_xp from player_profile where caller_id = $1 for update', [ownerId])).rows[0]
  const xp = Number(owner.lifetime_xp) + PERFECT_WEEK_BONUS.xp
  const level = levelForXp(xp)
  await client.query('update player_profile set lifetime_xp = $2, level = $3, rank = $4, updated_at = now() where caller_id = $1',
    [ownerId, xp, level, rankForLevel(level)])
  return { points: PERFECT_WEEK_BONUS.points, xp: PERFECT_WEEK_BONUS.xp }
}

export async function completeTask({ callerId, taskId, note = '', today = businessDate() }) {
  return transaction(async (client) => {
    // Serializes competing requests for this assignment before inspecting completion.
    const { rows } = await client.query(
      `select t.*, t.due_date::text as due_date from admin_tasks t where t.id = $1
        and (t.assignee_id = $2 or exists (
          select 1 from admin_task_assignees a where a.task_id = t.id and a.user_id = $2
        )) for update of t`,
      [taskId, callerId],
    )
    const task = rows[0]
    if (!task) throw taskError('Task not found.', 404)
    if (task.completed_at) return { alreadyCompleted: true, points: 0, xp: 0, leveledUp: false }
    const reason = completionError(task, today)
    if (reason) throw taskError(reason, 409)

    let routine = null
    if (task.routine) {
      // Serializes the owner's routine check-offs so the streak and perfect-week check see each other.
      await client.query("select pg_advisory_xact_lock(hashtext('task_routine:' || $1::text))", [task.assignee_id])
      routine = await routineStatus(client, task.assignee_id, today)
    }
    const points = Math.round(task.points * (routine?.multiplier ?? 1))

    await client.query('insert into player_profile (caller_id) values ($1) on conflict do nothing', [callerId])
    const profile = (await client.query(
      'select *, last_active_day::text as last_active_day from player_profile where caller_id = $1 for update', [callerId],
    )).rows[0]
    const newXp = Number(profile.lifetime_xp) + task.xp
    const level = levelForXp(newXp)
    const streak = nextBusinessStreak(profile.current_streak, profile.last_active_day, today)
    await client.query('insert into task_events (task_id, caller_id, points, xp) values ($1,$2,$3,$4)',
      [taskId, callerId, points, task.xp])
    await client.query('update admin_tasks set completed_at = now(), completion_note = $2, updated_at = now() where id = $1', [taskId, note])
    await client.query(`update player_profile set lifetime_xp = $2, level = $3, rank = $4,
      current_streak = $5, longest_streak = greatest(longest_streak, $5),
      last_active_day = greatest(last_active_day, $6::date), updated_at = now() where caller_id = $1`,
    [callerId, newXp, level, rankForLevel(level), streak, today])
    const result = { alreadyCompleted: false, points, xp: task.xp, leveledUp: level > profile.level }
    if (!routine) return result
    return { ...result, multiplier: routine.multiplier, routineStreak: routine.streak,
      perfectWeek: await awardPerfectWeek(client, task.assignee_id, today) }
  })
}
