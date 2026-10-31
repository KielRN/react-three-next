import { requireAdmin } from '../../../../../lib/adminAuth.js'
import { getStudioUsage } from '../../../../../lib/workshopStudioStore.js'
import { requireUuid } from '../../../../../lib/workshopStudioPolicy.js'
import { checkStudioRead, privateStudioResponse, studioFailure, studioJson } from '../../../../../lib/workshopStudioHttp.js'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  const auth = await requireAdmin(req)
  if (auth.error) return privateStudioResponse(auth.error)
  try {
    checkStudioRead(req)
    requireUuid(params.seatId)
    return studioJson(await getStudioUsage({ seatId: params.seatId }))
  } catch (error) { return studioFailure(error) }
}
