import { query, transaction } from './db.js'
import { levelForXp, rankForLevel, pointsForOutcome, xpForOutcome } from './scoring.js'
import { nextBusinessStreak } from './taskSchedule.js'

export async function getOrCreateProfile(callerId) {
  const existing = await query('select * from player_profile where caller_id = $1', [callerId])
  if (existing.rows[0]) return existing.rows[0]
  await query('insert into player_profile (caller_id) values ($1) on conflict do nothing', [callerId])
  return (await query('select * from player_profile where caller_id = $1', [callerId])).rows[0]
}

export async function setAvatar(callerId, avatarId) {
  await getOrCreateProfile(callerId)
  const res = await query(
    'update player_profile set avatar_id = $2, updated_at = now() where caller_id = $1 returning *',
    [callerId, avatarId],
  )
  return res.rows[0]
}

// Active-week weekly score = sum(points) over call_events for leads in that week.
export async function weeklyScore(callerId, weekId) {
  const res = await query(
    `select coalesce(sum(ce.points), 0)::int as score
       from call_events ce
       join leads l on l.id = ce.lead_id
      where ce.caller_id = $1 and l.week_id = $2`,
    [callerId, weekId],
  )
  return res.rows[0].score
}

// Records an outcome: updates the lead, appends a call_event, advances the profile.
// `today` is a 'YYYY-MM-DD' string supplied by the caller (route) for testability.
export async function recordOutcome({ callerId, leadId, outcome, tier, note, today }) {
  const won = outcome === 'booked'
  const points = pointsForOutcome(outcome, tier)
  const xp = xpForOutcome(outcome, tier)

  return transaction(async (client) => {
    // Leads are a shared pool — update by id only; `callerId` below stamps the personal event/profile.
    await client.query(
      `update leads
          set status = $2, notes = coalesce($3, notes), won = $4, won_tier = $5, updated_at = now()
        where id = $1`,
      [leadId, outcome, note ?? null, won, won ? tier ?? null : null],
    )
    await client.query(
      `insert into call_events (lead_id, caller_id, event_type, outcome, tier, points, xp)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [leadId, callerId, won ? 'won' : 'outcome_set', outcome, won ? tier ?? null : null, points, xp],
    )

    await client.query('insert into player_profile (caller_id) values ($1) on conflict do nothing', [callerId])
    const profile = (await client.query(
      'select *, last_active_day::text as last_active_day from player_profile where caller_id = $1 for update', [callerId],
    )).rows[0]
    const newXp = Number(profile.lifetime_xp) + xp
    const newLevel = levelForXp(newXp)
    const leveledUp = newLevel > profile.level
    const streak = nextBusinessStreak(profile.current_streak, profile.last_active_day, today)
    const longest = Math.max(profile.longest_streak, streak)

    const updated = await client.query(
      `update player_profile
          set lifetime_xp = $2, level = $3, rank = $4,
              current_streak = $5, longest_streak = $6, last_active_day = greatest(last_active_day, $7::date), updated_at = now()
        where caller_id = $1
       returning *`,
      [callerId, newXp, newLevel, rankForLevel(newLevel), streak, longest, today],
    )
    return { points, xp, leveledUp, profile: updated.rows[0] }
  })
}
