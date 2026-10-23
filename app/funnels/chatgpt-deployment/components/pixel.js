/**
 * OpenAI Ads Measurement Pixel helpers for the ChatGPT Deployment funnel.
 *
 * Docs: https://developers.openai.com/ads/measurement-pixel
 *       https://developers.openai.com/ads/supported-events
 *
 * The pixel does not track anything on its own; every event below is sent
 * explicitly with oaiq('measure', ...). Event names must match the conversion
 * events configured in OpenAI Ads Manager.
 *
 * Debug logging is off by default. Add ?pixel_debug=1 to any funnel URL to turn
 * it on for the rest of the browser session (?pixel_debug=0 turns it off).
 */

export const PIXEL_ID = 'DWXxYF7NesAFZHshLXPGsX'
const SDK_URL = 'https://bzrcdn.openai.com/sdk/oaiq.min.js'
const DEBUG_KEY = 'txai_pixel_debug'

export const EVENTS = {
  PAGE_VIEWED: 'page_viewed',
  LEAD_CREATED: 'lead_created',
  APPOINTMENT_SCHEDULED: 'appointment_scheduled',
}

export function isDebug() {
  if (typeof window === 'undefined') return false
  try {
    const flag = new URLSearchParams(window.location.search).get('pixel_debug')
    if (flag === '1') sessionStorage.setItem(DEBUG_KEY, '1')
    if (flag === '0') sessionStorage.removeItem(DEBUG_KEY)
    return sessionStorage.getItem(DEBUG_KEY) === '1'
  } catch {
    return false
  }
}

export function debugLog(...args) {
  if (isDebug()) console.info('[openai-pixel]', ...args)
}

// Official install snippet, run from code so it also works after client-side navigation.
// Safe to call repeatedly: the snippet and init both run only once per page load.
export function loadPixel() {
  if (typeof window === 'undefined') return
  if (!window.oaiq) {
    ;(function (w, d, s, u) {
      if (w.oaiq) return
      const q = function () {
        q.q.push(arguments)
      }
      q.q = []
      w.oaiq = q
      const j = d.createElement(s)
      j.async = 1
      j.src = u
      const f = d.getElementsByTagName(s)[0]
      f.parentNode.insertBefore(j, f)
    })(window, document, 'script', SDK_URL)
  }
  if (!window.__txaiPixelInit) {
    window.oaiq('init', { pixelId: PIXEL_ID, debug: isDebug() })
    window.__txaiPixelInit = true
    debugLog('init', PIXEL_ID)
  }
}

export function newEventId(prefix) {
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}_${rand}`
}

export function measure(eventName, data, options) {
  if (typeof window === 'undefined') return
  try {
    loadPixel()
    if (options) window.oaiq('measure', eventName, data, options)
    else window.oaiq('measure', eventName, data)
    debugLog('measure', eventName, data, options || {})
  } catch (err) {
    // Tracking must never break the page.
    debugLog('measure failed', err)
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Re-initializes the pixel with hashed contact details so OpenAI can match the
// conversion to the ad click. Email and names are normalized and hashed in the
// browser; this integration never supplies phone numbers or SMS consent records.
export async function identifyUser({ email, firstName, lastName }) {
  if (typeof window === 'undefined' || typeof crypto === 'undefined' || !crypto.subtle) return
  try {
    loadPixel()
    const user = {}
    if (email) user.email_sha256 = await sha256(email.trim().toLowerCase())
    // Exclude phone numbers and SMS consent records from ad matching.
    const normalizeName = (value) => value.toLowerCase().replace(/[\s!-/:-@\[-`{-~]/g, '')
    if (firstName) user.first_name_sha256 = await sha256(normalizeName(firstName))
    if (lastName) user.last_name_sha256 = await sha256(normalizeName(lastName))
    window.oaiq('init', { pixelId: PIXEL_ID, debug: isDebug(), user })
    debugLog('identify', Object.keys(user))
  } catch (err) {
    debugLog('identify failed', err)
  }
}
