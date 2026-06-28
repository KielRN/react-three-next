import { auth } from '../../../lib/firebaseClient'

async function authedFetch(path, options = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export const getMission = (week) => authedFetch(`/api/admin/mission${week ? `?week=${week}` : ''}`)
export const getLeads = (week) => authedFetch(`/api/admin/leads${week ? `?week=${week}` : ''}`)
export const getWeeks = () => authedFetch('/api/admin/weeks')
export const postOutcome = (leadId, payload) =>
  authedFetch(`/api/admin/leads/${leadId}/outcome`, { method: 'POST', body: JSON.stringify(payload) })
export const getProfile = () => authedFetch('/api/admin/profile')
export const putAvatar = (avatarId) =>
  authedFetch('/api/admin/profile', { method: 'PUT', body: JSON.stringify({ avatarId }) })
