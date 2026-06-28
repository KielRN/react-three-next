// Pure scoring/progression logic. No DB. Values mirror PRD §10 (placeholders flagged there).

export const POINTS = { call: 100, winBase: 1000 }

// Tier bonus over the 1000 base. Tiers map to the reviews service: starter/growth/pro.
export const TIER_BONUS = { starter: 0, growth: 500, pro: 1500 }

export const XP_AWARD = { call: 10, win: 150 }

const WIN_OUTCOMES = new Set(['booked'])
const CALL_OUTCOMES = new Set(['no_answer', 'follow_up', 'not_interested', 'disqualified', 'called'])

export function pointsForOutcome(outcome, tier) {
  if (WIN_OUTCOMES.has(outcome)) {
    const bonus = tier && tier in TIER_BONUS ? TIER_BONUS[tier] : 0
    return POINTS.winBase + bonus
  }
  if (CALL_OUTCOMES.has(outcome)) return POINTS.call
  return 0
}

export function xpForOutcome(outcome, tier) {
  if (WIN_OUTCOMES.has(outcome)) return XP_AWARD.call + XP_AWARD.win
  if (CALL_OUTCOMES.has(outcome)) return XP_AWARD.call
  return 0
}

// Level curve: level n requires 100 * (n-1)^1.5 cumulative XP (PRD §10.2 placeholder).
export function xpForLevel(level) {
  if (level <= 1) return 0
  return Math.floor(100 * Math.pow(level - 1, 1.5))
}

export function levelForXp(xp) {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

const RANKS = [
  { min: 1, name: 'Cadet' },
  { min: 5, name: 'Ensign' },
  { min: 10, name: 'Lieutenant' },
  { min: 20, name: 'Commander' },
  { min: 35, name: 'Captain' },
  { min: 50, name: 'Fleet' },
]

export function rankForLevel(level) {
  let rank = RANKS[0].name
  for (const r of RANKS) if (level >= r.min) rank = r.name
  return rank
}

// Day strings are 'YYYY-MM-DD'. Returns the new current_streak.
export function nextStreak(current, lastDay, today) {
  if (!lastDay) return 1
  if (lastDay === today) return current
  const diff = (Date.parse(today) - Date.parse(lastDay)) / 86400000
  if (diff === 1) return current + 1
  return 1
}
