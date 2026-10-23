'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { EVENTS, debugLog, measure, newEventId } from './pixel'
import { BOOKING_URL, isConfirmedBooking } from './booking'

// The GHL calendar runs inside an iframe, so the page can't see the booking
// directly. The widget posts a message to this page when a booking is confirmed
// (reported format: an array whose first item is
// "msgsndr-booking-complete"). That message is what fires appointment_scheduled.
// With ?pixel_debug=1 a confirmation is logged without exposing booking details.
export default function BookingEmbed() {
  const sent = useRef(false)
  const frame = useRef(null)

  useEffect(() => {
    const onMessage = (event) => {
      if (sent.current || !isConfirmedBooking(event, frame.current?.contentWindow)) return
      debugLog('booking confirmed')
      sent.current = true
      measure(EVENTS.APPOINTMENT_SCHEDULED, { type: 'customer_action' }, { event_id: newEventId('appt') })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <>
      <iframe
        ref={frame}
        src={BOOKING_URL}
        title='Book a call with Texas AI Consulting'
        id='uuJHOQrN5564Px31JrBi_chatgpt'
        style={{ width: '100%', minHeight: '720px', border: 'none', overflow: 'hidden' }}
      />
      <Script src='https://link.texasaiconsulting.com/js/form_embed.js' strategy='afterInteractive' />
      <p className='cgd-booking-fallback'>
        Calendar not loading? <a href={BOOKING_URL} target='_blank' rel='noopener noreferrer'>Open our booking calendar</a>.
      </p>
    </>
  )
}
