import { isoWeekId } from './leadImport.js'

export const TASK_TIME_ZONE = 'America/Chicago'
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function businessDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TASK_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now)
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function isBusinessDay(day) {
  if (!validDate(day)) return false
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay()
  return weekday >= 1 && weekday <= 5
}

export function shiftDate(day, days) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function weekForDate(day) {
  return isoWeekId(new Date(`${day}T12:00:00Z`))
}

export function businessWeek(weekId) {
  if (typeof weekId !== 'string' || !/^20\d{2}-W\d{2}$/.test(weekId)) throw new Error('Use an ISO week such as 2026-W43.')
  const [year, week] = weekId.split('-W').map(Number)
  const jan4 = `${year}-01-04`
  const weekday = new Date(`${jan4}T12:00:00Z`).getUTCDay() || 7
  const monday = shiftDate(jan4, 1 - weekday + (week - 1) * 7)
  if (weekForDate(monday) !== weekId) throw new Error('That ISO week does not exist.')
  return WEEKDAYS.map((label, index) => ({ label, date: shiftDate(monday, index) }))
}

// A Friday-to-Monday gap does not break an activity streak.
export function nextBusinessStreak(current, lastDay, today) {
  if (!lastDay) return 1
  if (lastDay >= today) return Math.max(1, current)
  let previous = shiftDate(today, -1)
  while (!isBusinessDay(previous)) previous = shiftDate(previous, -1)
  return lastDay >= previous ? current + 1 : 1
}

export function completionError(task, today) {
  if (task.routine && (task.missed_at || task.due_date < today)) {
    return "This daily routine expired at the end of its day. Today's routine is ready instead."
  }
  if (task.missed_at || weekForDate(task.due_date) < weekForDate(today)) {
    return "This task closed as not done when its week ended. Complete this week's restarted copy instead."
  }
  if (!isBusinessDay(today)) return 'Tasks can be checked off Monday through Friday (Central time).'
  if (task.due_date > today) return 'This task is scheduled for a future business day.'
  return null
}

// Expands an explicitly selected week. The same key/day/assignee can be reimported safely.
export function expandTaskPlan(plan, weekId) {
  const days = businessWeek(weekId)
  if (!plan || !Array.isArray(plan.tasks) || !plan.tasks.length || plan.tasks.length > 100) {
    throw new Error('A plan needs between 1 and 100 tasks.')
  }
  const keys = new Set()
  return plan.tasks.flatMap((task) => {
    if (!task || typeof task.key !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(task.key) || keys.has(task.key)) {
      throw new Error('Every task needs a unique stable key (lowercase letters, numbers, hyphens; max 80).')
    }
    keys.add(task.key)
    for (const [field, max] of [['title', 160], ['instructions', 10000]]) {
      if (typeof task[field] !== 'string' || !task[field].trim() || task[field].length > max) {
        throw new Error(`${task.key}: ${field} is required (max ${max} characters).`)
      }
    }
    if (!Array.isArray(task.days) || !task.days.length || task.days.some((day) => !WEEKDAYS.includes(day)) || new Set(task.days).size !== task.days.length) {
      throw new Error(`${task.key}: days must contain unique full weekday names, Monday through Friday.`)
    }
    const points = task.points ?? 100
    const xp = task.xp ?? 25
    if (!Number.isInteger(points) || points < 0 || points > 1000 || !Number.isInteger(xp) || xp < 0 || xp > 200) {
      throw new Error(`${task.key}: points must be 0–1000 and XP 0–200, as integers.`)
    }
    const source = task.source ?? plan.source ?? ''
    if (typeof source !== 'string' || source.length > 500) throw new Error(`${task.key}: source must be text (max 500).`)
    const link = task.link || ''
    if (link) {
      let parsed
      try { parsed = new URL(link) } catch { throw new Error(`${task.key}: invalid link.`) }
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password || link.length > 2000) throw new Error(`${task.key}: use a public HTTPS link without credentials.`)
    }
    return days.filter((day) => task.days.includes(day.label)).map((day) => ({
      key: task.key, title: task.title.trim(), instructions: task.instructions.trim(),
      dueDate: day.date, points, xp, source, link,
    }))
  })
}
