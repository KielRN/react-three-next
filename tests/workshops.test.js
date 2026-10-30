import { describe, expect, it } from 'vitest'
import { workshops, workshopSessions, getWorkshop, filterWorkshops } from '../lib/workshops'

describe('workshop catalog', () => {
  it('publishes exactly the nine selected permanent topics', () => {
    expect(workshops).toHaveLength(9)
    expect(new Set(workshops.map((item) => item.slug)).size).toBe(9)
    expect(getWorkshop('ai-for-doctors-dentists')).toBeUndefined()
    expect(getWorkshop('unknown')).toBeUndefined()
    expect(getWorkshop('ai-video-editing').title).toBe('AI Video Editing')
  })
  it('keeps unapproved sessions and prices out of the public offer', () => {
    expect(workshopSessions).toEqual([])
    for (const item of workshops) {
      expect(item.price).toBeUndefined()
      expect(item.bookingUrl).toBeUndefined()
    }
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
