import { requireAdmin } from '../../../../lib/adminAuth.js'
import { studioReadiness } from '../../../../lib/workshopStudioFeatures.js'
import { checkStudioMutation, privateStudioResponse, studioFailure, studioJson } from '../../../../lib/workshopStudioHttp.js'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return privateStudioResponse(auth.error)
  return studioJson(studioReadiness())
}

export async function POST(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return privateStudioResponse(auth.error)
  try {
    checkStudioMutation(req)
    // No code issuer/learner provisioning is connected to this owner endpoint.
    return studioJson({ error: 'Learner provisioning has not been activated.' }, 503)
  } catch (error) { return studioFailure(error) }
}
