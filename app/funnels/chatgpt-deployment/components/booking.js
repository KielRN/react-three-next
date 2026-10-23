export const BOOKING_URL = 'https://link.texasaiconsulting.com/widget/booking/uuJHOQrN5564Px31JrBi'

export function isConfirmedBooking(event, frameWindow) {
  if (!frameWindow || event.source !== frameWindow || event.origin !== new URL(BOOKING_URL).origin) return false
  const message = Array.isArray(event.data) ? event.data[0] : event.data
  return message === 'msgsndr-booking-complete'
}
