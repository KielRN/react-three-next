import { describe, expect, it, vi } from 'vitest'
import { studioAccessEnabled, studioReadiness, studioProviderTransportEnabled } from '../lib/workshopStudioFeatures.js'
import { verifyStudioRegistration } from '../lib/workshopStudioEligibility.js'
import { issueStudioQuote, reserveQuotedGeneration, claimQuotedGeneration } from '../lib/workshopStudioQuotes.js'
import { dispatchStudioJob, pollStudioJob } from '../lib/workshopStudioWorker.js'
import { importStudioOutput,getStudioOutput,listStudioOutputJobs,readStudioOutputChunk } from '../lib/workshopStudioOutputs.js'
import { studioOutputOrigins } from '../lib/workshopStudioOutputOrigins.js'

describe('actual studio release gates', () => {
  it('cannot be activated by an environment variable or manually supplied paid flag', async () => {
    vi.stubEnv('WORKSHOP_STUDIO_ENABLED', 'true')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    try {
      expect(studioAccessEnabled()).toBe(false)
      expect(studioProviderTransportEnabled()).toBe(false)
      expect(studioReadiness()).toEqual({ accessEnabled: false, provisioningEnabled: false, providerSubmissionEnabled: false, nativePaymentBindingAccepted: false })
      await expect(verifyStudioRegistration({ paid: true, paymentStatus: 'succeeded', enabled: true })).rejects.toMatchObject({ code: 'ELIGIBILITY_NOT_ACCEPTED' })
      for (const operation of [issueStudioQuote, reserveQuotedGeneration, claimQuotedGeneration]) {
        await expect(operation({ paid: true, enabled: true })).rejects.toMatchObject({ code: 'STUDIO_UNAVAILABLE' })
      }
      for (const operation of [dispatchStudioJob,pollStudioJob]) {
        await expect(operation({ paid:true,enabled:true })).rejects.toMatchObject({ code:'PROVIDER_DISABLED' })
      }
      for (const operation of [importStudioOutput,getStudioOutput,listStudioOutputJobs,readStudioOutputChunk]) {
        await expect(operation({ paid:true,enabled:true })).rejects.toMatchObject({ code:'STUDIO_UNAVAILABLE' })
      }
      expect(studioOutputOrigins()).toEqual(['https://d3u0tzju9qaucj.cloudfront.net'])
      expect(Object.isFrozen(studioOutputOrigins())).toBe(true)
      expect(fetch).not.toHaveBeenCalled()
    } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs() }
  })
})
