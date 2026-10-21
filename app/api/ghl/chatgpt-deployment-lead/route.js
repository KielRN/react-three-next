import { NextResponse } from 'next/server'
import { upsertContact, addContactNote, createOpportunity } from '../../../../lib/ghl'

const PIPELINE_NAME = 'TxAI Marketing Pipeline v1'
const STAGE_NEW_LEAD = 'New Lead'

// Lead form for /funnels/chatgpt-deployment. Saves the contact in GHL with funnel
// tags, opens a deal in the marketing pipeline, and puts the form details in a
// contact note. GHL workflows can trigger on the "chatgpt-deployment-funnel" tag.
export async function POST(req) {
  try {
    const body = await req.json()
    const {
      firstName = '',
      lastName = '',
      email = '',
      company = '',
      phone = '',
      teamSize = '',
      workflow = '',
      website = '',
      utm = {},
      eventId = '',
      pageUrl = '',
    } = body

    // Honeypot filled in: answer like a success so bots don't retry, but save nothing.
    if (website) return NextResponse.json({ ok: true })

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const tags = ['chatgpt-deployment-funnel']
    if (utm.utm_source) tags.push(`source-${String(utm.utm_source).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)

    const contactResult = await upsertContact({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      companyName: company.trim(),
      tags,
    })

    const noteLines = [
      'ChatGPT Deployment funnel lead',
      `Team size: ${teamSize || 'not given'}`,
      `Most time-consuming work: ${workflow.trim() || 'not given'}`,
      `Page: ${pageUrl}`,
      ...Object.entries(utm).map(([k, v]) => `${k}: ${v}`),
      `OpenAI Ads event ID: ${eventId}`,
    ]

    // The contact is already saved; a failed deal or note shouldn't fail the submission.
    // A repeat submission may be refused as a duplicate deal, which is fine.
    try {
      const contactName = `${firstName} ${lastName}`.trim()
      await createOpportunity({
        pipelineName: PIPELINE_NAME,
        oppName: `${company.trim() || contactName || email} - ChatGPT Deployment`,
        contactId: contactResult.contactId,
        stageName: STAGE_NEW_LEAD,
      })
    } catch (oppErr) {
      console.warn('ChatGPT deployment lead: deal not created:', oppErr.message)
    }

    try {
      await addContactNote({ contactId: contactResult.contactId, body: noteLines.join('\n') })
    } catch (noteErr) {
      console.warn('ChatGPT deployment lead: note not saved:', noteErr.message)
    }

    return NextResponse.json({ ok: true, contactId: contactResult.contactId })
  } catch (err) {
    console.error('ChatGPT deployment lead error:', err)
    return NextResponse.json({ error: 'We could not save your request. Please try again or book a call below.' }, { status: 500 })
  }
}
