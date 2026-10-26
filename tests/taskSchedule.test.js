import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  businessDate, businessWeek, completionError, expandTaskPlan, isBusinessDay,
  nextBusinessStreak, validDate, weekForDate,
} from '../lib/taskSchedule.js'

const plan = { tasks: [{ key: 'check-inbox', title: 'Check inbox', instructions: 'Review unread conversations.', days: ['Monday', 'Friday'] }] }

describe('business calendar', () => {
  it('uses Central time around midnight and both daylight-saving offsets', () => {
    expect(businessDate(new Date('2026-10-17T04:59:59Z'))).toBe('2026-10-16')
    expect(businessDate(new Date('2026-10-17T05:00:00Z'))).toBe('2026-10-17')
    expect(businessDate(new Date('2026-12-01T05:59:59Z'))).toBe('2026-11-30')
    expect(businessDate(new Date('2026-12-01T06:00:00Z'))).toBe('2026-12-01')
  })
  it('returns five business days including ISO year boundaries', () => {
    expect(businessWeek('2026-W43').map((day) => day.date)).toEqual(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'])
    expect(businessWeek('2026-W01')[0].date).toBe('2025-12-29')
    expect(weekForDate('2027-01-01')).toBe('2026-W53')
    expect(businessWeek('2026-W53')[4].date).toBe('2027-01-01')
  })
  it.each(['2025-W53', '2026-W00', '2026-W54', 'bad', '2026-W1'])('rejects invalid week %s', (week) => {
    expect(() => businessWeek(week)).toThrow()
  })
  it('validates actual dates and weekdays', () => {
    expect(validDate('2026-02-30')).toBe(false)
    expect(isBusinessDay('2026-10-16')).toBe(true)
    expect(isBusinessDay('2026-10-17')).toBe(false)
    expect(isBusinessDay('2026-10-18')).toBe(false)
  })
  it('allows overdue work on weekdays, but rejects early and weekend check-offs', () => {
    expect(completionError({ due_date: '2026-10-12' }, '2026-10-15')).toBeNull()
    expect(completionError({ due_date: '2026-10-15' }, '2026-10-15')).toBeNull()
    expect(completionError({ due_date: '2026-10-16' }, '2026-10-15')).toMatch(/future/)
    expect(completionError({ due_date: '2026-10-16' }, '2026-10-17')).toMatch(/Monday through Friday/)
  })
  it('rejects work from a week that has ended, or that already closed as not done', () => {
    expect(completionError({ due_date: '2026-10-16' }, '2026-10-19')).toMatch(/not done/)
    expect(completionError({ due_date: '2026-10-15', missed_at: new Date() }, '2026-10-15')).toMatch(/not done/)
  })
})

describe('shared activity streak', () => {
  it('preserves Friday-to-Monday and the same-day streak', () => {
    expect(nextBusinessStreak(4, '2026-10-16', '2026-10-19')).toBe(5)
    expect(nextBusinessStreak(4, '2026-10-16', '2026-10-16')).toBe(4)
    expect(nextBusinessStreak(4, '2026-10-15', '2026-10-19')).toBe(1)
    expect(nextBusinessStreak(0, null, '2026-10-19')).toBe(1)
  })
})

describe('assignment plan', () => {
  it('expands stable keys into dated assignments with defaults', () => {
    const assignments = expandTaskPlan(plan, '2026-W43')
    expect(assignments).toHaveLength(2)
    expect(assignments[0]).toMatchObject({ key: 'check-inbox', dueDate: '2026-10-19', points: 100, xp: 25 })
    expect(assignments[1].dueDate).toBe('2026-10-23')
  })
  it('validates the whole plan before producing assignments', () => {
    expect(() => expandTaskPlan({ tasks: [...plan.tasks, ...plan.tasks] }, '2026-W43')).toThrow(/unique stable key/)
    expect(() => expandTaskPlan({ tasks: [] }, '2026-W43')).toThrow()
    for (const changes of [
      { days: ['Saturday'] }, { days: ['Monday', 'Monday'] }, { xp: 201 }, { points: -1 },
      { xp: '25' }, { title: '' }, { instructions: '' }, { link: 'javascript:alert(1)' },
      { link: 'https://user:password@example.com' },
    ]) expect(() => expandTaskPlan({ tasks: [{ ...plan.tasks[0], ...changes }] }, '2026-W43')).toThrow()
  })
  it('ships a valid starter schedule with nine separate assignments', () => {
    const starter = JSON.parse(readFileSync(new URL('../task-plans/manny-weekdays.json', import.meta.url), 'utf8'))
    const assignments = expandTaskPlan(starter, '2026-W43')
    expect(assignments).toHaveLength(9)
    expect(assignments.filter((t) => t.key === 'vethub-opportunities')).toHaveLength(1)
    expect(assignments.filter((t) => t.key === 'ghl-conversations')).toHaveLength(5)
    expect(assignments.every((t) => isBusinessDay(t.dueDate))).toBe(true)
  })
})
