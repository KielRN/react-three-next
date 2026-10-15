import { query, transaction } from './db.js'
import { getOrCreateProfile } from './playerStore.js'
import { levelForXp, rankForLevel } from './scoring.js'
import { businessDate, businessWeek, completionError, isBusinessDay, nextBusinessStreak, weekForDate } from './taskSchedule.js'

export function publicProfile(p) {
  return { avatarId: p.avatar_id, lifetimeXp: Number(p.lifetime_xp), level: p.level, rank: p.rank,
    currentStreak: p.current_streak, longestStreak: p.longest_streak }
}

export async function getTaskWeek(callerId, weekId, today = businessDate()) {
  const days = businessWeek(weekId)
  const currentWeek = weekForDate(today)
  const [tasks, totals, profile] = await Promise.all([
    query(`select *, due_date::text as due_date from admin_tasks
      where assignee_id = $1 and ((due_date between $2::date and $3::date)
        or ($4::boolean and due_date < $2::date and completed_at is null))
      order by admin_tasks.due_date, created_at, id`, [callerId, days[0].date, days[4].date, weekId === currentWeek]),
    query(`select coalesce(sum(points), 0)::int as points, coalesce(sum(xp), 0)::int as xp,
      count(*)::int as completed from task_events where caller_id = $1`, [callerId]),
    getOrCreateProfile(callerId),
  ])
  const scheduled = tasks.rows.filter((task) => task.due_date >= days[0].date)
  return {
    weekId, currentWeek, today, isBusinessDay: isBusinessDay(today), days,
    tasks: tasks.rows, profile: publicProfile(profile), lifetime: totals.rows[0],
    weekly: {
      total: scheduled.length, completed: scheduled.filter((task) => task.completed_at).length,
      points: scheduled.filter((task) => task.completed_at).reduce((sum, task) => sum + task.points, 0),
      xp: scheduled.filter((task) => task.completed_at).reduce((sum, task) => sum + task.xp, 0),
    },
  }
}

function taskError(message, status) {
  return Object.assign(new Error(message), { status })
}

export async function completeTask({ callerId, taskId, note = '', today = businessDate() }) {
  return transaction(async (client) => {
    // Serializes competing requests for this assignment before inspecting completion.
    const { rows } = await client.query(
      'select *, due_date::text as due_date from admin_tasks where id = $1 and assignee_id = $2 for update',
      [taskId, callerId],
    )
    const task = rows[0]
    if (!task) throw taskError('Task not found.', 404)
    if (task.completed_at) return { alreadyCompleted: true, points: 0, xp: 0, leveledUp: false }
    const reason = completionError(task, today)
    if (reason) throw taskError(reason, 409)

    await client.query('insert into player_profile (caller_id) values ($1) on conflict do nothing', [callerId])
    const profile = (await client.query(
      'select *, last_active_day::text as last_active_day from player_profile where caller_id = $1 for update', [callerId],
    )).rows[0]
    const newXp = Number(profile.lifetime_xp) + task.xp
    const level = levelForXp(newXp)
    const streak = nextBusinessStreak(profile.current_streak, profile.last_active_day, today)
    await client.query('insert into task_events (task_id, caller_id, points, xp) values ($1,$2,$3,$4)',
      [taskId, callerId, task.points, task.xp])
    await client.query('update admin_tasks set completed_at = now(), completion_note = $2, updated_at = now() where id = $1', [taskId, note])
    await client.query(`update player_profile set lifetime_xp = $2, level = $3, rank = $4,
      current_streak = $5, longest_streak = greatest(longest_streak, $5),
      last_active_day = greatest(last_active_day, $6::date), updated_at = now() where caller_id = $1`,
    [callerId, newXp, level, rankForLevel(level), streak, today])
    return { alreadyCompleted: false, points: task.points, xp: task.xp, leveledUp: level > profile.level }
  })
}
