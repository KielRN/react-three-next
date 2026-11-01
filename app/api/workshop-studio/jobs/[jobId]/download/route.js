import { authenticateStudioSession } from '../../../../../../lib/workshopStudioAccess.js'
import { getStudioOutput,readStudioOutputChunk,MAX_STUDIO_OUTPUT_BYTES } from '../../../../../../lib/workshopStudioOutputs.js'
import { fail,requireUuid } from '../../../../../../lib/workshopStudioPolicy.js'
import { checkStudioRead,privateStudioResponse,studioFailure,studioToken } from '../../../../../../lib/workshopStudioHttp.js'

export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function GET(req,{ params }){
  try{
    checkStudioRead(req)
    if(req.headers.has('range') || req.headers.has('if-range'))fail('INVALID_REQUEST','Only a fresh full download is accepted.')
    const token=studioToken(req)
    const access=await authenticateStudioSession({ token })
    requireUuid(params.jobId)
    const identity={ jobId:params.jobId,seatId:access.seatId,accessVersion:access.accessVersion,token }
    const file=await getStudioOutput(identity)
    if(!file)fail('NOT_FOUND','Studio output not found.')
    if(!Number.isSafeInteger(file.byteCount) || file.byteCount<1 || file.byteCount>MAX_STUDIO_OUTPUT_BYTES || file.contentType!=='video/mp4' ||
      !Number.isFinite(new Date(file.expiresAt).getTime()) || new Date(file.expiresAt)<=new Date())fail('OUTPUT_UNAVAILABLE','Stored output metadata is invalid.')
    let offset=0,stopped=false,controllerRef,lastNativeCheck=Date.now()
    const interrupted=()=>new Error('Studio download interrupted.')
    const stop=()=>{stopped=true;req.signal.removeEventListener('abort',abort)}
    const abort=()=>{if(!stopped){stop();controllerRef?.error(interrupted())}}
    const body=new ReadableStream({
      start(controller){controllerRef=controller;req.signal.addEventListener('abort',abort,{ once:true });if(req.signal.aborted)abort()},
      async pull(controller){
        if(stopped)return
        try{
          if(Date.now()-lastNativeCheck>=30000){
            const refreshed=await authenticateStudioSession({ token })
            if(refreshed.seatId!==access.seatId || refreshed.accessVersion!==access.accessVersion)throw interrupted()
            lastNativeCheck=Date.now()
          }
          if(stopped)return
          // Each demand read rechecks token revocation, epoch, registration,
          // pauses and both access deadlines in the same database statement.
          const part=await readStudioOutputChunk({ ...identity,offset })
          if(stopped)return
          if(!(part instanceof Uint8Array) || !part.length || offset+part.length>file.byteCount)throw interrupted()
          offset+=part.length;controller.enqueue(part)
          if(offset===file.byteCount){stop();controller.close()}
        }catch{if(!stopped){stop();controller.error(interrupted())}}
      },
      cancel(){stop()},
    },{ highWaterMark:0 }) // No prefetch of another private chunk after logout/cancel.
    return privateStudioResponse(new Response(body,{ headers:{
      'Content-Type':'video/mp4','Content-Length':String(file.byteCount),'Accept-Ranges':'none',
      'Content-Disposition':`attachment; filename="txai-workshop-${params.jobId}.mp4"`,
      'Content-Security-Policy':"default-src 'none'; sandbox",'Cross-Origin-Resource-Policy':'same-origin',
      'X-Robots-Tag':'noindex,nofollow,noarchive',
    } }))
  }catch(error){return studioFailure(error)}
}
export async function HEAD(){return privateStudioResponse(new Response(null,{ status:405,headers:{ Allow:'GET' } }))}
