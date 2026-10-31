import { authenticateStudioSession, getStudioLearnerJob } from '../../../../../lib/workshopStudioAccess.js'
import { requireUuid } from '../../../../../lib/workshopStudioPolicy.js'
import { checkStudioRead, studioFailure, studioJson, studioToken } from '../../../../../lib/workshopStudioHttp.js'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  try {
    checkStudioRead(req)
    const access = await authenticateStudioSession({ token: studioToken(req) })
    requireUuid(params.jobId)
    const job = await getStudioLearnerJob({ seatId: access.seatId, accessVersion: access.accessVersion, jobId: params.jobId })
    return job ? studioJson(job) : studioJson({ error: 'Studio record not found.' }, 404)
  } catch (error) { return studioFailure(error) }
}
