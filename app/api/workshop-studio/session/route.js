import { authenticateStudioSession, exchangeStudioCode, revokeStudioSession } from '../../../../lib/workshopStudioAccess.js'
import { studioAccessEnabled } from '../../../../lib/workshopStudioFeatures.js'
import { getStudioUsage } from '../../../../lib/workshopStudioStore.js'
import { fail } from '../../../../lib/workshopStudioPolicy.js'
import { checkStudioMutation, checkStudioRead, clearStudioCookie, readStudioCode, setStudioCookie, studioFailure, studioJson, studioToken } from '../../../../lib/workshopStudioHttp.js'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    checkStudioMutation(req)
    if (!studioAccessEnabled()) fail('STUDIO_UNAVAILABLE', 'Studio access disabled.')
    const code = await readStudioCode(req)
    const session = await exchangeStudioCode({ code })
    return setStudioCookie(studioJson({ authenticated: true, expiresAt: session.expiresAt }), session)
  } catch (error) { return studioFailure(error) }
}

export async function GET(req) {
  try {
    checkStudioRead(req)
    const access = await authenticateStudioSession({ token: studioToken(req) })
    const usage = await getStudioUsage({ seatId: access.seatId, accessVersion: access.accessVersion })
    const { accessVersion, ...balance } = usage.seat
    return studioJson({ ...usage, seat: balance })
  } catch (error) { return studioFailure(error) }
}

export async function DELETE(req) {
  let validated = false
  try {
    checkStudioMutation(req)
    validated = true
    if (studioAccessEnabled()) await revokeStudioSession({ token: studioToken(req) })
    return clearStudioCookie(studioJson({ authenticated: false }))
  } catch (error) {
    const response = studioFailure(error)
    return validated ? clearStudioCookie(response) : response
  }
}
