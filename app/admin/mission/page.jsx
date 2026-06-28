'use client'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../AuthProvider'
import { getMission, getLeads, getWeeks, postOutcome, putAvatar } from '../lib/api'
import SignInGate from './components/SignInGate'
import PlayerHud from './components/PlayerHud'
import MissionBar from './components/MissionBar'
import LeadCard from './components/LeadCard'
import LeadList from './components/LeadList'
import WeekSelector from './components/WeekSelector'
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
  const [view, setView] = useState('focus') // 'focus' (single-card flow) | 'list' (full roster)
  const [week, setWeek] = useState(null) // null = current ISO week (server default)
  const [weeks, setWeeks] = useState([])
  const [currentWeek, setCurrentWeek] = useState(null) // actual current ISO week (for the "(current)" marker)
  const [selectedLeadId, setSelectedLeadId] = useState(null) // manual override from the list

  const refresh = useCallback(async (wk) => {
    setLoading(true)
    try {
      const [m, l] = await Promise.all([getMission(wk), getLeads(wk)])
      setMission(m)
      setLeads(l.leads)
      setDenied(false)
    } catch (e) {
      if (e.status === 403) setDenied(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (user) refresh(week) }, [user, week, refresh])
  useEffect(() => {
    if (!user) return
    getWeeks().then((d) => { setWeeks(d.weeks); setCurrentWeek(d.current); if (!week) setWeek(d.current) }).catch(() => {})
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  function changeWeek(wk) {
    setSelectedLeadId(null)
    setWeek(wk)
  }

  // Manual pick from the list wins; otherwise fall back to the natural call queue.
  const activeLead =
    (selectedLeadId && leads.find((l) => l.id === selectedLeadId)) ||
    leads.find((l) => l.status === 'not_called') ||
    leads.find((l) => l.status === 'follow_up')

  async function handleOutcome(leadId, payload) {
    setBusy(true)
    try {
      const res = await postOutcome(leadId, payload)
      if (payload.outcome === 'booked') setCelebration('win')
      else if (res.leveledUp) setCelebration('levelUp')
      setSelectedLeadId(null) // logged — return to the natural next-best lead
      await refresh(week)
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  function selectFromList(leadId) {
    setSelectedLeadId(leadId)
    setView('focus')
  }

  async function handlePickAvatar(avatarId) {
    setShowPicker(false)
    try { await putAvatar(avatarId); await refresh(week) } catch (e) { alert(e.message) }
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

      <div className='flex items-center justify-between gap-3'>
        <ViewToggle view={view} onChange={setView} />
        <WeekSelector weeks={weeks} value={week} current={currentWeek} onChange={changeWeek} />
      </div>

      {view === 'list' ? (
        <LeadList leads={leads} activeId={activeLead?.id} onSelect={selectFromList} />
      ) : missionComplete && !selectedLeadId ? (
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

function ViewToggle({ view, onChange }) {
  const tabs = [
    { key: 'focus', label: 'Focus' },
    { key: 'list', label: 'Full list' },
  ]
  return (
    <div className='flex rounded-full bg-black/40 p-1 ring-1 ring-lcars-ice/20'>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
            view === t.key ? 'bg-ai-blue text-white' : 'text-lcars-ice/60'
          }`}>
          {t.label}
        </button>
      ))}
    </div>
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
