import { describe, expect, it, vi } from 'vitest'
import { studioAccessEnabled, studioReadiness } from '../lib/workshopStudioFeatures.js'
import { verifyStudioRegistration } from '../lib/workshopStudioEligibility.js'

describe('actual studio release gates', () => {
  it('cannot be activated by an environment variable or manually supplied paid flag', async () => {
    vi.stubEnv('WORKSHOP_STUDIO_ENABLED', 'true')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    try {
      expect(studioAccessEnabled()).toBe(false)
      expect(studioReadiness()).toEqual({ accessEnabled: false, provisioningEnabled: false, providerSubmissionEnabled: false, nativePaymentBindingAccepted: false })
      await expect(verifyStudioRegistration({ paid: true, paymentStatus: 'succeeded', enabled: true })).rejects.toMatchObject({ code: 'ELIGIBILITY_NOT_ACCEPTED' })
      expect(fetch).not.toHaveBeenCalled()
    } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs() }
  })
})
