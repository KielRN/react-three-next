import { fail } from './workshopStudioPolicy.js'

// Deliberate release boundary. Registration now uses the website's Stripe
// account, not GHL calendar payments. workshopStudioStripeEvidence prepares a
// read-only payment observation; it is NOT a native access grant. Before wiring
// it here, accept persisted account/order/cohort/original-buyer bindings and
// current seat ownership/transfer/refund handling. Never grant from a GHL tag,
// email match, mutable caller binding or historical payment snapshot alone.
export async function verifyStudioRegistration() {
  fail('ELIGIBILITY_NOT_ACCEPTED', 'Native registration/payment binding has not passed acceptance.')
}
