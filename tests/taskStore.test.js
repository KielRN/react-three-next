import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

const state = vi.hoisted(() => ({ db: null }))
vi.mock('../lib/db.js', () => ({
  query: (...args) => state.db.query(...args),
  transaction: (work) => state.db.transaction(work),
}))
import { importTasks } from '../lib/taskImport.js'
import { completeTask, getTaskWeek } from '../lib/taskStore.js'
import { getOrCreateProfile, recordOutcome } from '../lib/playerStore.js'

const assignment = {
  key: 'conversations', title: 'Check conversations', instructions: 'Review unread conversations.',
  dueDate: '2026-10-15', points: 75, xp: 15, source: 'CEO.md', link: '',
}
async function assignedTask(changes = {}, caller = 'manny') {
  await importTasks([{ ...assignment, ...changes }], caller)
  return (await state.db.query('select *, due_date::text as due_date from admin_tasks where assignee_id = $1 order by created_at desc limit 1', [caller])).rows[0]
}
async function scalar(sql, params = []) { return Object.values((await state.db.query(sql, params)).rows[0])[0] }

beforeAll(async () => {
  state.db = new PGlite()
  // gen_random_uuid is built into modern Postgres; the legacy extension is not needed in WASM.
  const base = readFileSync(new URL('../db/migrations/001_init.sql', import.meta.url), 'utf8').replace(/create extension[^;]+;/, '')
  await state.db.exec(base)
  const tasks = readFileSync(new URL('../db/migrations/002_tasks.sql', import.meta.url), 'utf8')
  await state.db.exec(tasks)
  await state.db.exec(tasks) // migration is safe to retry
  const shared = readFileSync(new URL('../db/migrations/003_shared_tasks.sql', import.meta.url), 'utf8')
  await state.db.exec(shared)
  await state.db.exec(shared)
}, 30000)
beforeEach(async () => { await state.db.exec('truncate task_events, admin_tasks, call_events, leads, player_profile cascade') })
afterAll(async () => { await state.db?.close() })

describe('task assignment and rewards in Postgres', () => {
  const collaborators = [{ userId: 'manny', displayName: 'Manny' }, { userId: 'elliott', displayName: 'Elliott' }]
  it('shares the existing task IDs and links without duplicate rows, including after reimport', async () => {
    const task = await assignedTask({ link: 'https://example.com/resource' })
    await importTasks([{ ...assignment, link: 'https://example.com/resource' }], 'manny', collaborators)
    await importTasks([{ ...assignment, link: 'https://example.com/resource' }], 'manny', collaborators)
    for (const caller of ['manny', 'elliott']) {
      const data = await getTaskWeek(caller, '2026-W42', '2026-10-15')
      expect(data.tasks).toHaveLength(1)
      expect(data.tasks[0]).toMatchObject({ id: task.id, is_shared: true, resource_url: 'https://example.com/resource' })
    }
    expect(await scalar('select count(*)::int from admin_tasks')).toBe(1)
    expect(await scalar('select count(*)::int from admin_task_assignees')).toBe(2)
    expect((await getTaskWeek('unrelated', '2026-W42', '2026-10-15')).tasks).toHaveLength(0)
    await expect(completeTask({ callerId: 'unrelated', taskId: task.id, today: '2026-10-15' })).rejects.toMatchObject({ status: 404 })
  })
  it.each(['manny', 'elliott'])('completion by %s completes both views and only rewards the completer', async (callerId) => {
    await importTasks([assignment], 'manny', collaborators)
    const task = (await getTaskWeek(callerId, '2026-W42', '2026-10-15')).tasks[0]
    await completeTask({ callerId, taskId: task.id, note: 'Shared result', today: '2026-10-15' })
    const other = callerId === 'manny' ? 'elliott' : 'manny'
    expect(await completeTask({ callerId: other, taskId: task.id, today: '2026-10-15' })).toMatchObject({ alreadyCompleted: true, points: 0, xp: 0 })
    for (const viewer of [callerId, other]) {
      const data = await getTaskWeek(viewer, '2026-W42', '2026-10-15')
      expect(data.weekly).toEqual({ total: 1, completed: 1, points: viewer === callerId ? 75 : 0, xp: viewer === callerId ? 15 : 0 })
      expect(data.tasks[0]).toMatchObject({ completed_by: callerId, completion_note: 'Shared result', completed_by_name: viewer === callerId ? 'You' : collaborators.find((p) => p.userId === callerId).displayName })
      expect(data.profile.lifetimeXp).toBe(viewer === callerId ? 15 : 0)
      expect(data.lifetime.completed).toBe(viewer === callerId ? 1 : 0)
    }
    expect(await scalar('select count(*)::int from task_events')).toBe(1)
  })
  it('serializes simultaneous check-offs from different shared assignees', async () => {
    await importTasks([assignment], 'manny', collaborators)
    const task = (await getTaskWeek('manny', '2026-W42', '2026-10-15')).tasks[0]
    const results = await Promise.all(['elliott', 'manny', 'elliott', 'manny'].map((callerId) =>
      completeTask({ callerId, taskId: task.id, today: '2026-10-15' }),
    ))
    expect(results.filter((result) => !result.alreadyCompleted)).toHaveLength(1)
    expect(await scalar('select count(*)::int from task_events')).toBe(1)
    expect(Number(await scalar('select sum(lifetime_xp) from player_profile'))).toBe(15)
  })
  it('can share a completed task without resetting its completion, note, or reward', async () => {
    const task = await assignedTask()
    await completeTask({ callerId: 'manny', taskId: task.id, note: 'Original result', today: '2026-10-15' })
    expect(await importTasks([{ ...assignment, xp: 199 }], 'manny', collaborators)).toMatchObject({ completedUnchanged: 1 })
    const data = await getTaskWeek('elliott', '2026-W42', '2026-10-15')
    expect(data.tasks[0]).toMatchObject({ id: task.id, xp: 15, completed_by_name: 'Manny', completion_note: 'Original result' })
    expect(data.weekly.completed).toBe(1)
    expect(data.weekly.xp).toBe(0)
  })
  it('retains date restrictions and overdue visibility for shared assignees', async () => {
    await importTasks([assignment], 'manny', collaborators)
    const task = (await getTaskWeek('elliott', '2026-W42', '2026-10-15')).tasks[0]
    await expect(completeTask({ callerId: 'elliott', taskId: task.id, today: '2026-10-14' })).rejects.toMatchObject({ status: 409 })
    await expect(completeTask({ callerId: 'elliott', taskId: task.id, today: '2026-10-17' })).rejects.toMatchObject({ status: 409 })
    expect((await getTaskWeek('elliott', '2026-W43', '2026-10-19')).tasks).toHaveLength(1)
    await completeTask({ callerId: 'elliott', taskId: task.id, today: '2026-10-19' })
    expect((await getTaskWeek('manny', '2026-W43', '2026-10-19')).tasks).toHaveLength(0)
    expect((await getTaskWeek('manny', '2026-W42', '2026-10-19')).weekly.completed).toBe(1)
  })
  it('imports idempotently and keeps separate days and assignees', async () => {
    expect(await importTasks([assignment], 'manny')).toEqual({ imported: 1, updated: 0, completedUnchanged: 0 })
    expect(await importTasks([{ ...assignment, title: 'Updated instructions' }], 'manny')).toEqual({ imported: 0, updated: 1, completedUnchanged: 0 })
    await importTasks([{ ...assignment, dueDate: '2026-10-16' }], 'manny')
    await importTasks([assignment], 'another-person')
    expect(await scalar('select count(*)::int from admin_tasks')).toBe(3)
    expect((await getTaskWeek('manny', '2026-W42', '2026-10-15')).tasks).toHaveLength(2)
  })
  it('awards once, shares mission XP, advances the level, and preserves the note', async () => {
    await getOrCreateProfile('manny')
    await state.db.query("update player_profile set lifetime_xp = 90, current_streak = 3, longest_streak = 3, last_active_day = '2026-10-14' where caller_id = 'manny'")
    const task = await assignedTask()
    const first = await completeTask({ callerId: 'manny', taskId: task.id, note: 'No new conversations.', today: '2026-10-15' })
    expect(first).toEqual({ alreadyCompleted: false, points: 75, xp: 15, leveledUp: true })
    const second = await completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-15' })
    expect(second).toMatchObject({ alreadyCompleted: true, points: 0, xp: 0 })
    expect(await scalar('select count(*)::int from task_events')).toBe(1)
    const data = await getTaskWeek('manny', '2026-W42', '2026-10-15')
    expect(data.profile).toMatchObject({ lifetimeXp: 105, level: 2, currentStreak: 4 })
    expect(data.lifetime).toEqual({ points: 75, xp: 15, completed: 1 })
    expect(data.weekly).toEqual({ total: 1, completed: 1, points: 75, xp: 15 })
    expect(data.tasks[0].completion_note).toBe('No new conversations.')
  })
  it('preserves completed work and rewards on reimport', async () => {
    const task = await assignedTask()
    await completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-15' })
    expect(await importTasks([{ ...assignment, title: 'Changed title', points: 999, xp: 199 }], 'manny'))
      .toEqual({ imported: 0, updated: 0, completedUnchanged: 1 })
    const data = await getTaskWeek('manny', '2026-W42', '2026-10-15')
    expect(data.tasks[0].title).toBe(assignment.title)
    expect(data.weekly.points).toBe(75)
  })
  it('handles overlapping completion attempts without paying twice', async () => {
    const task = await assignedTask()
    const results = await Promise.all(Array.from({ length: 5 }, () =>
      completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-15' }),
    ))
    expect(results.filter((result) => !result.alreadyCompleted)).toHaveLength(1)
    expect(await scalar('select count(*)::int from task_events')).toBe(1)
    expect(Number(await scalar("select lifetime_xp from player_profile where caller_id = 'manny'"))).toBe(15)
  })
  it('rejects another user, early completion, and weekends without awarding XP', async () => {
    const task = await assignedTask()
    await expect(completeTask({ callerId: 'another-person', taskId: task.id, today: '2026-10-15' })).rejects.toMatchObject({ status: 404 })
    await expect(completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-14' })).rejects.toMatchObject({ status: 409 })
    await expect(completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-17' })).rejects.toMatchObject({ status: 409 })
    expect(await scalar('select count(*)::int from task_events')).toBe(0)
    expect(await scalar('select completed_at from admin_tasks')).toBeNull()
  })
  it('keeps overdue assignments visible until completed, without counting them in this week', async () => {
    const old = await assignedTask({ dueDate: '2026-10-09' })
    await assignedTask()
    let data = await getTaskWeek('manny', '2026-W42', '2026-10-15')
    expect(data.tasks).toHaveLength(2)
    expect(data.weekly.total).toBe(1)
    await completeTask({ callerId: 'manny', taskId: old.id, today: '2026-10-15' })
    data = await getTaskWeek('manny', '2026-W42', '2026-10-15')
    expect(data.tasks).toHaveLength(1)
    expect(data.lifetime.points).toBe(75)
    expect((await getTaskWeek('manny', '2026-W41', '2026-10-15')).tasks[0].completed_at).toBeTruthy()
  })
  it('rolls back the whole import if any assignment violates the schema', async () => {
    await expect(importTasks([assignment, { ...assignment, key: 'invalid', dueDate: '2026-10-17' }], 'manny')).rejects.toThrow()
    expect(await scalar('select count(*)::int from admin_tasks')).toBe(0)
  })
  it('rolls back both the completion and reward if the profile update fails', async () => {
    const task = await assignedTask()
    await state.db.exec('alter table player_profile add constraint test_xp_limit check (lifetime_xp = 0)')
    try {
      await expect(completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-15' })).rejects.toThrow()
      expect(await scalar('select count(*)::int from task_events')).toBe(0)
      expect(await scalar('select completed_at from admin_tasks')).toBeNull()
    } finally { await state.db.exec('alter table player_profile drop constraint test_xp_limit') }
    expect((await completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-15' })).xp).toBe(15)
  })
  it('combines a mission outcome and task completion in the existing profile', async () => {
    const task = await assignedTask()
    const lead = (await state.db.query("insert into leads (week_id,business,phone,caller_id) values ('2026-W42','Test business','5550100','shared') returning id")).rows[0]
    await recordOutcome({ callerId: 'manny', leadId: lead.id, outcome: 'called', today: '2026-10-15' })
    await completeTask({ callerId: 'manny', taskId: task.id, today: '2026-10-15' })
    expect(Number(await scalar("select lifetime_xp from player_profile where caller_id = 'manny'"))).toBe(25)
    expect(await scalar('select count(*)::int from call_events')).toBe(1)
    expect(await scalar('select count(*)::int from task_events')).toBe(1)
  })
})
