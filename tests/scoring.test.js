import { describe, it, expect } from 'vitest'
import {
  POINTS, XP_AWARD, TIER_BONUS,
  pointsForOutcome, xpForOutcome, levelForXp, rankForLevel, nextStreak,
} from '../lib/scoring.js'

describe('points', () => {
  it('awards 100 for any completed call outcome', () => {
    expect(pointsForOutcome('no_answer')).toBe(100)
    expect(pointsForOutcome('follow_up')).toBe(100)
    expect(pointsForOutcome('not_interested')).toBe(100)
  })
  it('awards base 1000 for a booked win at the lowest tier', () => {
    expect(pointsForOutcome('booked', 'starter')).toBe(1000 + TIER_BONUS.starter)
    expect(TIER_BONUS.starter).toBe(0)
  })
  it('adds the tier bonus for higher tiers', () => {
    expect(pointsForOutcome('booked', 'growth')).toBe(1000 + TIER_BONUS.growth)
    expect(pointsForOutcome('booked', 'pro')).toBe(1000 + TIER_BONUS.pro)
  })
})

describe('xp', () => {
  it('awards call XP for non-win outcomes and win XP for booked', () => {
    expect(xpForOutcome('no_answer')).toBe(XP_AWARD.call)
    expect(xpForOutcome('booked', 'starter')).toBe(XP_AWARD.call + XP_AWARD.win)
  })
})

describe('levels & ranks', () => {
  it('level 1 at 0 xp, climbs with the curve', () => {
    expect(levelForXp(0)).toBe(1)
    expect(levelForXp(POINTS.placeholderUnused ?? 99)).toBe(1)
    expect(levelForXp(100)).toBeGreaterThanOrEqual(2)
  })
  it('maps level to a themed rank', () => {
    expect(rankForLevel(1)).toBe('Cadet')
    expect(rankForLevel(99)).toBe('Fleet')
  })
})

describe('streaks', () => {
  it('increments on the next consecutive day', () => {
    expect(nextStreak(3, '2026-06-27', '2026-06-28')).toBe(4)
  })
  it('stays the same on the same day', () => {
    expect(nextStreak(3, '2026-06-28', '2026-06-28')).toBe(3)
  })
  it('resets to 1 after a gap', () => {
    expect(nextStreak(3, '2026-06-25', '2026-06-28')).toBe(1)
  })
})
