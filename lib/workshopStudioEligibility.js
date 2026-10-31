import { fail } from './workshopStudioPolicy.js'

// Deliberate release boundary, not a client-supplied "paid" flag. GHL's current
// public transaction docs identify an order/entity but do not establish the
// native calendar order -> individual appointment link. Before access release,
// verify that mapping/refunds with independent native readback, then implement
// the canonical server reader here. A succeeded payment for a contact/calendar
// alone cannot grant access to another unpaid or transferred appointment.
export async function verifyStudioRegistration() {
  fail('ELIGIBILITY_NOT_ACCEPTED', 'Native registration/payment binding has not passed acceptance.')
}
