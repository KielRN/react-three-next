import { WEEKDAYS, expandTaskPlan, isBusinessDay, shiftDate } from './taskSchedule.js'

// Routine check-offs earn base points times a streak multiplier: +10% for each fully cleared
// business day in a row before today, capped at double. A missed day resets the streak.
export const ROUTINE_STREAK_STEP = 0.1
export const ROUTINE_MAX_MULTIPLIER = 2
export const PERFECT_WEEK_BONUS = { kind: 'perfect-routine-week', points: 300, xp: 75 }

export function routineMultiplier(streak) {
  return Math.min(ROUTINE_MAX_MULTIPLIER, Math.round((1 + ROUTINE_STREAK_STEP * streak) * 10) / 10)
}

export function previousBusinessDay(day) {
  let previous = shiftDate(day, -1)
  while (!isBusinessDay(previous)) previous = shiftDate(previous, -1)
  return previous
}

// clearedByDay: Map of 'YYYY-MM-DD' -> true when every routine due that day was completed.
// A business day with no routines (never generated) also ends the streak.
export function routineStreak(clearedByDay, today) {
  let streak = 0
  for (let day = previousBusinessDay(today); clearedByDay.get(day) === true; day = previousBusinessDay(day)) streak++
  return streak
}

// Validates a routines file with the same rules as weekly plans; routines run every business day.
export function routineDefinitions(plan) {
  if (!plan || !Array.isArray(plan.tasks)) throw new Error('A routines file needs a tasks list.')
  const expanded = expandTaskPlan({ ...plan, tasks: plan.tasks.map((task) => ({ ...task, days: WEEKDAYS })) }, '2026-W01')
  return expanded.filter((task, index) => expanded.findIndex((other) => other.key === task.key) === index)
    .map(({ dueDate, ...task }) => task) // eslint-disable-line no-unused-vars
}
