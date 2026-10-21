'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'We already pay for ChatGPT. Why would we need help?',
    a: 'Licenses are the easy part. Most rollouts stall because nobody decided which work ChatGPT should take on, so each person invents their own use cases and most stop after a few tries. We start from your recurring work, pick the workflows worth changing, and set up the instructions, templates, and training your team needs to use it the same way every time.',
  },
  {
    q: "We haven't bought ChatGPT yet. Is it too early to call?",
    a: "No, that's the best time. Mapping your workflows first tells you whether ChatGPT fits, which work to start with, and which plan makes sense, before you pay for seats.",
  },
  {
    q: 'What size business do you work with?',
    a: 'Small and mid-sized Texas businesses, from owner-led teams to companies with several departments. Teams of 25 or more may also be able to add a live, trainer-led OpenAI certification session (details below).',
  },
  {
    q: 'What happens on the first call?',
    a: "We talk through where your team's time goes, what you've tried with AI so far, and what a better week would look like. You'll leave with a short list of workflows worth looking at, whether or not we work together.",
  },
  {
    q: 'How do you handle our company data?',
    a: "We review what information each workflow touches before anything is rolled out, and we walk you through the data controls in ChatGPT's business plans and OpenAI's published business data policies. Sensitive work stays out of scope until you're comfortable with how it's handled.",
  },
  {
    q: 'Are you affiliated with OpenAI?',
    a: 'Texas AI Consulting is an independent consulting firm and a member of the OpenAI Partner Network. Our founder holds OpenAI and ChatGPT certifications, listed on this page. OpenAI does not endorse or guarantee our services.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className='cgd-faq'>
      {FAQS.map((item, i) => (
        <div key={item.q} className='cgd-faq-item'>
          <button
            type='button'
            className='cgd-faq-q'
            aria-expanded={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span>{item.q}</span>
            <span aria-hidden='true'>{openIndex === i ? '−' : '+'}</span>
          </button>
          {openIndex === i && <p className='cgd-faq-a'>{item.a}</p>}
        </div>
      ))}
    </div>
  )
}
