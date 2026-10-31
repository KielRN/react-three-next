// These are ceilings, not a funded balance or a quote for any provider operation.
export const STUDIO_LEARNER_CAP_CENTS = 500
export const STUDIO_COHORT_CAP_CENTS = 6000
export const STUDIO_CURRENCY = 'USD'

export class StudioError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'StudioError'
    this.code = code
  }
}

export function fail(code, message) { throw new StudioError(code, message) }

export function requireUuid(value) {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) {
    fail('INVALID_ID', 'A valid studio record ID is required.')
  }
}

export function requireReference(value, code = 'INVALID_REFERENCE', maximum = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum || /[\x00-\x1f\x7f]/.test(value)) {
    fail(code, 'A bounded record reference is required.')
  }
}

export function requireTime(value = new Date()) {
  const time = new Date(value)
  if (value === null || !Number.isFinite(time.getTime())) fail('INVALID_TIME', 'A valid server timestamp is required.')
  return time
}

export function validateReservation({ seatId, requestKey, requestHash, maximumCostCents, currency }) {
  requireUuid(seatId)
  requireReference(requestKey, 'INVALID_REQUEST', 128)
  if (requestKey.length < 8 || typeof requestHash !== 'string' || !/^[a-f0-9]{64}$/.test(requestHash)) {
    fail('INVALID_REQUEST', 'A request key and SHA-256 content hash are required.')
  }
  if (currency !== STUDIO_CURRENCY || !Number.isSafeInteger(maximumCostCents) || maximumCostCents <= 0 || maximumCostCents > STUDIO_COHORT_CAP_CENTS) {
    fail('INVALID_QUOTE', 'A bounded positive maximum in integer USD cents is required.')
  }
}

export function checkStudioAccess(cohort, seat, now) {
  if (seat.revoked_at) fail('ACCESS_REVOKED', 'Studio access has been revoked.')
  if (seat.registration_state !== 'eligible') fail('REGISTRATION_INELIGIBLE', 'An eligible registration is required.')
  if (cohort.paused || seat.paused) fail('ACCESS_PAUSED', 'New studio requests are paused.')
  if (now < new Date(cohort.access_opens_at) || now >= new Date(cohort.access_expires_at)) {
    fail('ACCESS_CLOSED', 'Studio access is outside its permitted window.')
  }
}
