import { query } from './db.js'
import { levelForXp, rankForLevel, nextStreak, pointsForOutcome, xpForOutcome } from './scoring.js'

export async function getOrCreateProfile(callerId) {
  const existing = await query('select * from player_profile where caller_id = $1', [callerId])
  if (existing.rows[0]) return existing.rows[0]
  const created = await query(
    'insert into player_profile (caller_id) values ($1) returning *',
    [callerId],
  )
  return created.rows[0]
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

  await query('begin')
  try {
    // Leads are a shared pool — update by id only; `callerId` below stamps the personal event/profile.
    await query(
      `update leads
          set status = $2, notes = coalesce($3, notes), won = $4, won_tier = $5, updated_at = now()
        where id = $1`,
      [leadId, outcome, note ?? null, won, won ? tier ?? null : null],
    )
    await query(
      `insert into call_events (lead_id, caller_id, event_type, outcome, tier, points, xp)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [leadId, callerId, won ? 'won' : 'outcome_set', outcome, won ? tier ?? null : null, points, xp],
    )

    const profile = await getOrCreateProfile(callerId)
    const newXp = Number(profile.lifetime_xp) + xp
    const newLevel = levelForXp(newXp)
    const leveledUp = newLevel > profile.level
    const streak = nextStreak(profile.current_streak, profile.last_active_day
      ? new Date(profile.last_active_day).toISOString().slice(0, 10) : null, today)
    const longest = Math.max(profile.longest_streak, streak)

    const updated = await query(
      `update player_profile
          set lifetime_xp = $2, level = $3, rank = $4,
              current_streak = $5, longest_streak = $6, last_active_day = $7, updated_at = now()
        where caller_id = $1
       returning *`,
      [callerId, newXp, newLevel, rankForLevel(newLevel), streak, longest, today],
    )
    await query('commit')
    return { points, xp, leveledUp, profile: updated.rows[0] }
  } catch (e) {
    await query('rollback')
    throw e
  }
}
