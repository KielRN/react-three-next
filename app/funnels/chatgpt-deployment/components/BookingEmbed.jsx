'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { EVENTS, debugLog, measure, newEventId } from './pixel'

const BOOKING_URL = 'https://link.texasaiconsulting.com/widget/booking/uuJHOQrN5564Px31JrBi'
const WIDGET_ORIGINS = /(^|\.)(leadconnectorhq\.com|msgsndr\.com|link\.texasaiconsulting\.com)$/

// The GHL calendar runs inside an iframe, so the page can't see the booking
// directly. The widget posts a message to this page when a booking is confirmed
// (reported format: an array whose first item starts with
// "msgsndr-booking-complete"). That message is what fires appointment_scheduled.
// With ?pixel_debug=1 every widget message is logged so the format can be checked.
function isBookingComplete(data) {
  const first = Array.isArray(data) ? data[0] : data
  return typeof first === 'string' && first.startsWith('msgsndr-booking-complete')
}

export default function BookingEmbed() {
  const sent = useRef(false)

  useEffect(() => {
    const onMessage = (event) => {
      let host = ''
      try {
        host = new URL(event.origin).hostname
      } catch {
        return
      }
      if (!WIDGET_ORIGINS.test(host)) return
      debugLog('booking widget message', event.origin, event.data)

      if (sent.current || !isBookingComplete(event.data)) return
      sent.current = true
      measure(EVENTS.APPOINTMENT_SCHEDULED, { type: 'customer_action' }, { event_id: newEventId('appt') })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <>
      <iframe
        src={BOOKING_URL}
        title='Book a call with Texas AI Consulting'
        scrolling='no'
        id='uuJHOQrN5564Px31JrBi_chatgpt'
        style={{ width: '100%', minHeight: '720px', border: 'none', overflow: 'hidden' }}
      />
      <Script src='https://link.texasaiconsulting.com/js/form_embed.js' strategy='afterInteractive' />
    </>
  )
}
