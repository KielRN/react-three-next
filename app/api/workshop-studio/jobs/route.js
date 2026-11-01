import { authenticateStudioSession } from '../../../../lib/workshopStudioAccess.js'
import { listStudioOutputJobs } from '../../../../lib/workshopStudioOutputs.js'
import { checkStudioRead,studioFailure,studioJson,studioToken } from '../../../../lib/workshopStudioHttp.js'

export const dynamic='force-dynamic'
export async function GET(req){
  try{
    checkStudioRead(req)
    const token=studioToken(req)
    const access=await authenticateStudioSession({ token })
    const jobs=await listStudioOutputJobs({ seatId:access.seatId,accessVersion:access.accessVersion,token })
    return studioJson({ jobs })
  }catch(error){return studioFailure(error)}
}
