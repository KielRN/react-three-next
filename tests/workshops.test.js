import { describe, expect, it } from 'vitest'
import {
  workshops,
  workshopSessions,
  getWorkshop,
  filterWorkshops,
  getWorkshopSession,
  formatWorkshopFee,
  formatWorkshopDate,
} from '../lib/workshops'

describe('workshop catalog', () => {
  it('publishes exactly the nine selected permanent topics', () => {
    expect(workshops).toHaveLength(9)
    expect(new Set(workshops.map((item) => item.slug)).size).toBe(9)
    expect(getWorkshop('ai-for-doctors-dentists')).toBeUndefined()
    expect(getWorkshop('unknown')).toBeUndefined()
    expect(getWorkshop('ai-video-editing').title).toBe('AI Video Editing')
  })
  it('uses the adopted introductory fees and capacities without opening registration', () => {
    expect(formatWorkshopFee(getWorkshop('ai-video-editing'))).toBe('$49')
    expect(formatWorkshopFee(getWorkshop('from-resume-to-revenue'))).toBe('$49 public / $29 veterans')
    expect(getWorkshop('agentic-engineering').priceUSD).toBe(99)
    for (const item of workshops) {
      expect(item.capacity).toBe(item.category === 'technical' ? 10 : 12)
      expect(item.bookingUrl).toBeUndefined()
    }
  })
  it('uses corrected Friday dates, a biweekly 2027 cadence and Central daylight time', () => {
    expect(workshopSessions.map((session) => session.start.slice(0, 10))).toEqual([
      '2026-11-06',
      '2026-12-04',
      '2026-12-11',
      '2027-01-08',
      '2027-01-22',
      '2027-02-05',
      '2027-02-19',
      '2027-03-05',
      '2027-03-19',
    ])
    for (const session of workshopSessions) {
      expect(new Date(session.end) - new Date(session.start)).toBe(120 * 60000)
      expect(session.status).toBe('planned')
      expect(session.bookingUrl).toBeUndefined()
      expect(
        new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hour12: false }).format(
          new Date(session.start),
        ),
      ).toBe('11')
    }
    expect(getWorkshopSession('ai-marketing', new Date('2026-10-30'))?.start).toContain('2026-12-04')
    expect(getWorkshopSession('ai-video-editing', new Date('2026-11-07'))).toBeUndefined()
    expect(formatWorkshopDate(workshopSessions[8])).toBe('Mar 19, 2027')
  })
  it.each([
    'ai-video-editing',
    'ai-marketing',
    'from-resume-to-revenue',
    'github-copilot-foundations',
    'ai-for-software-engineering',
    'ai-for-oracle-plsql',
    'ai-for-data-engineering',
    'ai-for-bi-microsoft-365',
    'agentic-engineering',
  ])('%s has a focused 120-minute exercise', (slug) => {
    const item = getWorkshop(slug)
    expect(item.agenda.reduce((total, block) => total + block.minutes, 0)).toBe(120)
    expect(item.outcomes.length).toBeGreaterThanOrEqual(3)
    expect(item.artifact.length).toBeGreaterThan(30)
    expect(item.prerequisites.length).toBeGreaterThan(0)
    expect(item.faq.length).toBeGreaterThan(0)
  })
  it('searches titles, audience and outcomes, with category intersection', () => {
    expect(filterWorkshops('  pl/sql  ', 'all').map((item) => item.slug)).toContain('ai-for-oracle-plsql')
    expect(filterWorkshops('veteran', 'careers')).toHaveLength(1)
    expect(filterWorkshops('veteran', 'technical')).toEqual([])
    expect(filterWorkshops('zzzz-no-match', 'all')).toEqual([])
    expect(filterWorkshops('', 'all')).toHaveLength(9)
  })
})
