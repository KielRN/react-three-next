import { NextResponse } from 'next/server'
import { upsertContact, createOpportunity, updateOpportunity } from '../../../../lib/ghl'

const PIPELINE_NAME = 'Growth Platform'
const STAGE_NEW_LEAD = 'New Lead'

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      firstName = '',
      lastName = '',
      email,
      phone = '',
      businessName = '',
      plan = 'monthly',
      opportunityId: existingOppId = '',
    } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const contactResult = await upsertContact({
      email,
      firstName,
      lastName,
      phone,
      companyName: businessName,
      tags: ['agreement-signed', `plan-${plan}`],
    })

    const oppName = `${businessName || `${firstName} ${lastName}`.trim() || email} - Growth License`
    const projectedValue = plan === 'annual' ? 1164 : 1188

    let opportunityId = existingOppId

    if (existingOppId) {
      // Resubmission: update name/value but leave stage alone (still "New Lead")
      try {
        await updateOpportunity({
          oppId: existingOppId,
          name: oppName,
          monetaryValue: projectedValue,
        })
      } catch (updateErr) {
        // Opportunity may have been deleted — fall through to create
        console.warn('Could not update existing opportunity, creating new one:', updateErr.message)
        opportunityId = ''
      }
    }

    if (!opportunityId) {
      const oppResult = await createOpportunity({
        pipelineName: PIPELINE_NAME,
        oppName,
        contactId: contactResult.contactId,
        stageName: STAGE_NEW_LEAD,
        value: projectedValue,
      })
      opportunityId = oppResult.opportunityId
    }

    return NextResponse.json({
      contactId: contactResult.contactId,
      opportunityId,
    })
  } catch (err) {
    console.error('GHL agreement-lead error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
