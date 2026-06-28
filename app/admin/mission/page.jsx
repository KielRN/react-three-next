'use client'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../AuthProvider'
import { getMission, getLeads, postOutcome, putAvatar } from '../lib/api'
import SignInGate from './components/SignInGate'
import PlayerHud from './components/PlayerHud'
import MissionBar from './components/MissionBar'
import LeadCard from './components/LeadCard'
import Celebration from './components/Celebration'
import AvatarPicker from './components/AvatarPicker'
import { STATE_ART } from '../lib/assets'

export default function MissionPage() {
  const { user, loading: authLoading } = useAuth()
  const [denied, setDenied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mission, setMission] = useState(null)
  const [leads, setLeads] = useState([])
  const [busy, setBusy] = useState(false)
  const [celebration, setCelebration] = useState(null)
  const [showPicker, setShowPicker] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [m, l] = await Promise.all([getMission(), getLeads()])
      setMission(m)
      setLeads(l.leads)
      setDenied(false)
    } catch (e) {
      if (e.status === 403) setDenied(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (user) refresh() }, [user, refresh])

  const activeLead = leads.find((l) => l.status === 'not_called') || leads.find((l) => l.status === 'follow_up')

  async function handleOutcome(leadId, payload) {
    setBusy(true)
    try {
      const res = await postOutcome(leadId, payload)
      if (payload.outcome === 'booked') setCelebration('win')
      else if (res.leveledUp) setCelebration('levelUp')
      await refresh()
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function handlePickAvatar(avatarId) {
    setShowPicker(false)
    try { await putAvatar(avatarId); await refresh() } catch (e) { alert(e.message) }
  }

  if (authLoading) return <CenterArt src={STATE_ART.loading} label='Booting…' />
  if (!user) return <SignInGate />
  if (denied) return <SignInGate denied />
  if (loading) return <CenterArt src={STATE_ART.loading} label='Loading mission…' />

  const missionComplete = mission && mission.remaining === 0 && leads.every((l) => l.status !== 'follow_up')

  return (
    <main className='mx-auto flex max-w-md flex-col gap-4 p-4 pb-24'>
      <PlayerHud profile={mission?.profile} onPickAvatar={() => setShowPicker(true)} />
      <MissionBar mission={mission} />

      {missionComplete ? (
        <CenterArt src={STATE_ART.completed} label='Campaign complete — week cleared!' />
      ) : activeLead ? (
        <LeadCard lead={activeLead} busy={busy} onOutcome={handleOutcome} />
      ) : (
        <CenterArt src={STATE_ART.empty} label='No active targets in this mission.' />
      )}

      <Celebration kind={celebration} onDone={() => setCelebration(null)} />
      {showPicker && (
        <AvatarPicker current={mission?.profile?.avatarId} onPick={handlePickAvatar} onClose={() => setShowPicker(false)} />
      )}
    </main>
  )
}

function CenterArt({ src, label }) {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
      <img src={src} alt='' className='w-56' />
      <p className='text-sm uppercase tracking-widest text-lcars-ice/70'>{label}</p>
    </div>
  )
}
