/* Standalone document: no analytics, URL credentials, storage or provider calls. */
(() => {
  const form = document.querySelector('#access-form')
  const code = document.querySelector('#access-code')
  const status = document.querySelector('#status')
  const logout = document.querySelector('#logout')
  const allowance = document.querySelector('#allowance')
  const enabled = document.body.dataset.accessEnabled === 'true'
  let busy = false
  let revision = 0
  const options = { credentials: 'same-origin', cache: 'no-store', referrerPolicy: 'no-referrer' }
  const message = (value) => { status.textContent = value }
  function signedOut() {
    allowance.hidden = true
    logout.hidden = true
    form.hidden = false
    form.querySelector('button').disabled = !enabled
    for (const id of ['available', 'held', 'spent', 'expiry']) document.getElementById(id).textContent = ''
    code.value = ''
  }
  async function load(version) {
    const response = await fetch('/api/workshop-studio/session', options)
    if (version !== revision) return
    if (!response.ok) { signedOut(); message(response.status === 401 ? 'Enter your access code to continue.' : 'Studio access is not available. Please contact your instructor.'); return }
    const data = await response.json()
    if (version !== revision) return
    const values = [data.seat?.availableCents, data.seat?.heldCents, data.seat?.spentCents]
    const expiry = new Date(data.accessExpiresAt)
    if (data.currency !== 'USD' || values.some((n) => !Number.isSafeInteger(n) || n < 0) || !Number.isFinite(expiry.getTime())) throw new Error('Invalid response')
    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    for (const [index, id] of ['available', 'held', 'spent'].entries()) document.getElementById(id).textContent = money.format(values[index] / 100)
    document.getElementById('expiry').textContent = 'Access ends ' + new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Chicago' }).format(expiry) + ' Central.'
    allowance.hidden = false
    logout.hidden = false
    form.hidden = true
    message('Your allowance is shown below. Generation is not available yet.')
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!enabled || busy) return
    busy = true
    const version = ++revision
    const button = form.querySelector('button')
    button.disabled = true
    const value = code.value
    code.value = ''
    try {
      const response = await fetch('/api/workshop-studio/session', { ...options, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: value }) })
      if (version !== revision) return
      if (!response.ok) { message(response.status === 401 ? 'That code is invalid or expired. Please check with your instructor.' : 'Studio access is not available yet.'); return }
      await load(version)
    } catch { if (version === revision) { signedOut(); message('Unable to reach your studio. Please try again.') } }
    finally { if (version === revision) { busy = false; button.disabled = false } }
  })
  logout.addEventListener('click', async () => {
    if (busy) return
    busy = true
    ++revision
    try {
      const response = await fetch('/api/workshop-studio/session', { ...options, method: 'DELETE' })
      message(response.ok ? 'You have signed out.' : 'Your browser view is cleared. Sign-out could not be confirmed; close this window and contact your instructor.')
    } catch { message('Your browser view is cleared. Sign-out could not be confirmed; close this window and contact your instructor.') }
    finally { signedOut(); busy = false }
  })
  function refresh() {
    const version = ++revision
    load(version).catch(() => { if (version === revision) { signedOut(); message('Unable to reach your studio. Please try again.') } })
  }
  window.addEventListener('pagehide', () => { ++revision; signedOut() })
  window.addEventListener('pageshow', (event) => { if (event.persisted) { busy = false; signedOut(); if (enabled) refresh() } })
  if (enabled) refresh()
})()
