'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'How long is the free trial?',
    a: '10 days. You enter payment info at signup but are not charged until day 11. Cancel anytime before then for $0.',
  },
  {
    q: 'What if I have more than 300 review requests per month?',
    a: 'Talk to us — we can build a custom plan above the Pro tier. Book a demo and we will scope it together.',
  },
  {
    q: 'Do I need to use a specific CRM?',
    a: 'No. We integrate with most major CRMs. We also accept customer data via Zapier, CSV upload, or a custom integration.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most customers are live within 48 hours. Setup includes a 1-1 onboarding call where we configure your review automation, integrate your CRM, and prepare your reactivation campaign.',
  },
  {
    q: 'Will customers know the reviews are automated?',
    a: 'Requests are sent on your behalf and look like they came from you. Customers reply to the review request like they would any other message.',
  },
  {
    q: 'What review platforms do you support?',
    a: 'Google is the primary target since it has the largest impact on local search. We can also route requests to Facebook, Yelp, and industry-specific platforms.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. There is no long-term contract. Monthly plans cancel at the end of the current billing cycle. Annual plans cancel at the end of the year.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No. The price you see is the price you pay. No hidden setup or onboarding fees.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '36px', color: '#0e2042', textAlign: 'center', marginBottom: '48px' }}>
        Frequently Asked Questions
      </h2>
      <div>
        {FAQS.map((item, i) => (
          <div
            key={item.q}
            style={{
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <button
              type='button'
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                padding: '8px 0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#0e2042',
              }}
            >
              <span>{item.q}</span>
              <span style={{ fontSize: '20px', color: '#ebcb4c' }}>{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && <p style={{ marginTop: '12px', color: '#555', lineHeight: 1.6 }}>{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
