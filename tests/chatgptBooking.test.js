import { describe, expect, it } from 'vitest'
import { isConfirmedBooking, BOOKING_URL } from '../app/funnels/chatgpt-deployment/components/booking.js'

describe('GHL booking confirmation', () => {
  const frame = {}
  const confirmation = { origin: new URL(BOOKING_URL).origin, source: frame, data: ['msgsndr-booking-complete', {}] }
  it('accepts a confirmation from the embedded calendar', () => {
    expect(isConfirmedBooking(confirmation, frame)).toBe(true)
  })
  it.each([
    { ...confirmation, origin: 'https://unrelated.example' },
    { ...confirmation, source: {} },
    { ...confirmation, data: ['msgsndr-booking-complete-failed'] },
    { ...confirmation, data: ['setHeight', 720] },
    { ...confirmation, data: null },
  ])('ignores unrelated or untrusted messages', (event) => {
    expect(isConfirmedBooking(event, frame)).toBe(false)
  })
})
