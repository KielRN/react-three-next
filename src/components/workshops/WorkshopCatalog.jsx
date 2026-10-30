'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  filterWorkshops,
  workshopCategories,
  getWorkshopSession,
  formatWorkshopDate,
  formatWorkshopFee,
} from '../../../lib/workshops'
import styles from '../../../app/workshops/workshops.module.css'

const introductions = {
  business:
    'For business owners, marketers and creators. Make a useful first project and take away a process you can repeat.',
  careers: 'For veterans and career changers. Connect the experience you already have to a clear next opportunity.',
  technical: 'For developers, data teams and analysts. Work through a focused lab, then test and review the result.',
}

function SessionDate({ slug, asOf }) {
  const session = getWorkshopSession(slug, asOf)
  return session ? (
    <>
      <time dateTime={session.start}>{formatWorkshopDate(session)}</time>
      <br />
      <small>11 a.m.–1 p.m. CT</small>
    </>
  ) : (
    'Dates coming soon'
  )
}

export default function WorkshopCatalog({ asOf }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const visible = filterWorkshops(query, category)
  return (
    <section aria-labelledby='catalog-heading' className={styles.catalog}>
      <div className={styles.sectionHeader}>
        <h2 id='catalog-heading'>Find your workshop</h2>
        <p className={styles.count} role='status' aria-live='polite'>
          {visible.length} of 9 workshops
        </p>
      </div>
      <div className={styles.filters}>
        <label>
          Search workshops
          <input
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Try marketing, SQL or testing'
          />
        </label>
        <label>
          Choose an audience
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {workshopCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {visible.length ? (
        workshopCategories
          .filter((group) => group.id !== 'all' && visible.some((item) => item.category === group.id))
          .map((group) => (
            <section key={group.id} className={styles.track} aria-labelledby={`track-${group.id}`}>
              <h2 id={`track-${group.id}`}>
                <span className={styles.trackBadge}>
                  {group.id === 'business' ? 'Business' : group.id === 'careers' ? 'Careers' : 'Technical'}
                </span>
                {group.label}
              </h2>
              <p className={styles.trackDescription}>{introductions[group.id]}</p>
              <div className={styles.columnHeadings} aria-hidden='true'>
                <span>Workshop</span>
                <span>Planned session</span>
                <span>Duration</span>
                <span>Fee (USD)</span>
                <span>Details</span>
              </div>
              <ul className={styles.grid}>
                {visible
                  .filter((item) => item.category === group.id)
                  .map((workshop) => (
                    <li key={workshop.slug} className={styles.card}>
                      <div className={styles.cardInfo}>
                        <h3>
                          <Link href={`/workshops/${workshop.slug}`}>{workshop.title}</Link>
                        </h3>
                        <p>{workshop.summary}</p>
                      </div>
                      <dl className={styles.cardFacts}>
                        <div>
                          <dt>Planned session</dt>
                          <dd>
                            <SessionDate slug={workshop.slug} asOf={asOf} />
                          </dd>
                        </div>
                        <div>
                          <dt>Duration</dt>
                          <dd>About 2 hours</dd>
                        </div>
                        <div>
                          <dt>Fee (USD)</dt>
                          <dd>{formatWorkshopFee(workshop)}</dd>
                        </div>
                      </dl>
                      <Link
                        className={styles.cardLink}
                        href={`/workshops/${workshop.slug}`}
                        aria-label={`View workshop: ${workshop.title}`}
                      >
                        View Workshop
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))
      ) : (
        <div className={styles.empty}>
          <h3>No workshops match that search</h3>
          <p>Try a broader topic or browse all nine workshops.</p>
          <button
            type='button'
            className={styles.button}
            onClick={() => {
              setQuery('')
              setCategory('all')
            }}
          >
            Show all workshops
          </button>
        </div>
      )}
    </section>
  )
}
