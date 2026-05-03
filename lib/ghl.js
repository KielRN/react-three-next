/**
 * GHL API Integration Module (Node.js)
 * Mirrors the Python skills: ghl_ops_sync.py, ghl_sales.py
 * 
 * Uses the same GHL API v2 endpoints and auth flow.
 * BASE_URL: https://services.leadconnectorhq.com
 * Auth: Bearer token (GHL_API_KEY)
 * Version header: 2021-07-28
 */

const BASE_URL = 'https://services.leadconnectorhq.com'

function getHeaders() {
  const apiKey = process.env.GHL_API_KEY
  if (!apiKey) {
    throw new Error('GHL_API_KEY not found in environment variables')
  }
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

function getLocationId() {
  const locationId = process.env.GHL_LOCATION_ID
  if (!locationId) {
    throw new Error('GHL_LOCATION_ID not found in environment variables')
  }
  return locationId
}

/**
 * Upsert (create or update) a contact in GHL.
 * Deduplicates by email — same as ghl_ops_sync.py upsert_contact()
 */
export async function upsertContact({ email, firstName, lastName, phone, companyName, tags = [] }) {
  if (!email) throw new Error('Email is required for upsertContact')

  const body = {
    locationId: getLocationId(),
    email,
  }
  if (firstName) body.firstName = firstName
  if (lastName) body.lastName = lastName
  if (phone) body.phone = phone
  if (companyName) body.companyName = companyName
  if (tags.length > 0) body.tags = tags

  const response = await fetch(`${BASE_URL}/contacts/upsert`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GHL upsert_contact failed (${response.status}): ${errorText.slice(0, 500)}`)
  }

  const data = await response.json()
  const contact = data.contact || data
  const isNew = data.new || data.isNew || false

  return {
    contactId: contact.id,
    isNew,
    name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || email,
  }
}

/**
 * Get all pipelines and their stages.
 * Same as ghl_crm_query.py get_pipelines()
 */
export async function getPipelines() {
  const response = await fetch(`${BASE_URL}/opportunities/pipelines?locationId=${getLocationId()}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GHL get_pipelines failed (${response.status}): ${errorText.slice(0, 500)}`)
  }

  const data = await response.json()
  return data.pipelines || []
}

/**
 * Resolve a pipeline name to its ID and optionally a stage name to its ID.
 * Same logic as ghl_ops_sync.py create_opportunity()
 */
export async function resolvePipelineAndStage(pipelineName, stageName = '') {
  const pipelines = await getPipelines()

  for (const p of pipelines) {
    if (pipelineName.toLowerCase().includes(p.name?.toLowerCase()) ||
        p.name?.toLowerCase().includes(pipelineName.toLowerCase())) {
      let stageId = ''
      
      if (stageName) {
        for (const s of (p.stages || [])) {
          if (stageName.toLowerCase().includes(s.name?.toLowerCase()) ||
              s.name?.toLowerCase().includes(stageName.toLowerCase())) {
            stageId = s.id
            break
          }
        }
      }
      
      // Default to first stage if none matched
      if (!stageId && p.stages?.length > 0) {
        stageId = p.stages[0].id
      }

      return {
        pipelineId: p.id,
        pipelineName: p.name,
        stageId,
      }
    }
  }

  throw new Error(`Pipeline "${pipelineName}" not found. Available: ${pipelines.map(p => p.name).join(', ')}`)
}

/**
 * Create a new opportunity in GHL.
 * Same as ghl_ops_sync.py create_opportunity()
 */
export async function createOpportunity({ pipelineName, oppName, contactId, stageName = '', value = 0 }) {
  if (!pipelineName || !oppName || !contactId) {
    throw new Error('pipelineName, oppName, and contactId are required')
  }

  const { pipelineId, stageId, pipelineName: resolvedName } = await resolvePipelineAndStage(pipelineName, stageName)

  const body = {
    pipelineId,
    locationId: getLocationId(),
    name: oppName,
    status: 'open',
    contactId,
  }
  if (stageId) body.pipelineStageId = stageId
  if (value > 0) body.monetaryValue = value

  const response = await fetch(`${BASE_URL}/opportunities/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GHL create_opportunity failed (${response.status}): ${errorText.slice(0, 500)}`)
  }

  const data = await response.json()
  const opp = data.opportunity || data

  return {
    opportunityId: opp.id,
    pipelineName: resolvedName,
    name: oppName,
    value,
  }
}

/**
 * Move an opportunity to a named stage in a named pipeline.
 * Resolves stageName → stageId via the pipeline lookup, then PUTs the update.
 */
export async function moveOpportunityToStage({ oppId, pipelineName, stageName, monetaryValue = null, name = '' }) {
  if (!oppId) throw new Error('oppId is required')
  if (!pipelineName) throw new Error('pipelineName is required')
  if (!stageName) throw new Error('stageName is required')

  const { stageId, pipelineName: resolvedPipeline } = await resolvePipelineAndStage(pipelineName, stageName)
  if (!stageId) {
    throw new Error(`Stage "${stageName}" not found in pipeline "${resolvedPipeline}"`)
  }

  return updateOpportunity({ oppId, stageId, monetaryValue, name })
}

/**
 * Update an existing opportunity — move stage, change status, update value.
 * Same as ghl_sales.py update_opportunity()
 */
export async function updateOpportunity({ oppId, stageId = '', status = '', monetaryValue = null, name = '' }) {
  if (!oppId) throw new Error('oppId is required')

  const body = {}
  if (stageId) body.pipelineStageId = stageId
  if (status) body.status = status // open, won, lost, abandoned
  if (monetaryValue !== null) body.monetaryValue = monetaryValue
  if (name) body.name = name

  if (Object.keys(body).length === 0) {
    throw new Error('No update fields provided')
  }

  const response = await fetch(`${BASE_URL}/opportunities/${oppId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GHL update_opportunity failed (${response.status}): ${errorText.slice(0, 500)}`)
  }

  const data = await response.json()
  const updated = data.opportunity || data

  return {
    opportunityId: updated.id || oppId,
    status: updated.status,
    monetaryValue: updated.monetaryValue,
  }
}
