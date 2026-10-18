'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../AuthProvider'
import { getTasks, postTaskCompletion, putAvatar } from '../lib/api'
import { shiftDate, weekForDate } from '../../../lib/taskSchedule'
import SignInGate from '../mission/components/SignInGate'
import PlayerHud from '../mission/components/PlayerHud'
import AvatarPicker from '../mission/components/AvatarPicker'
import Celebration from '../mission/components/Celebration'
import TaskBoard from './TaskBoard'

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth()
  const [week, setWeek] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [notice, setNotice] = useState('')
  const [picker, setPicker] = useState(false)
  const [celebration, setCelebration] = useState(null)
  const request = useRef(0)
  const refresh = useCallback(async () => {
    const sequence = ++request.current
    setLoading(true)
    setError(null)
    try {
      const result = await getTasks(week)
      if (sequence === request.current) setData(result)
    } catch (e) { if (sequence === request.current) setError(e) }
    finally { if (sequence === request.current) setLoading(false) }
  }, [week])
  useEffect(() => {
    const requests = request
    setData(null)
    setNotice('')
    if (user) refresh()
    return () => { requests.current++ }
  }, [user, refresh])
  // Recheck Central-time dates when returning to the page and across midnight.
  useEffect(() => {
    if (!user) return
    const onFocus = () => { if (!document.hidden) refresh() }
    window.addEventListener('focus', onFocus)
    const timer = setInterval(onFocus, 60000)
    return () => { window.removeEventListener('focus', onFocus); clearInterval(timer) }
  }, [user, refresh])
  const finishCelebration = useCallback(() => setCelebration(null), [])
  async function complete(task, note) {
    if (busy) return
    setBusy(task.id)
    setNotice('')
    try {
      const result = await postTaskCompletion(task.id, note)
      setNotice(result.alreadyCompleted ? 'This task was already completed. Your rewards are saved.' : `Task complete! +${result.points} points · +${result.xp} XP${result.leveledUp ? ' · Level up!' : ''}`)
      if (result.leveledUp) setCelebration('levelUp')
      await refresh()
    } catch (e) { setError(e) }
    finally { setBusy(null) }
  }
  async function pickAvatar(avatarId) {
    setPicker(false)
    try { await putAvatar(avatarId); await refresh() } catch (e) { setError(e) }
  }
  if (authLoading) return <p className='p-6'>Loading your session…</p>
  if (!user) return <SignInGate />
  if (error?.status === 403) return <SignInGate denied />
  return (
    <main className='mx-auto max-w-5xl px-4 py-8 pb-20 sm:py-12'>
      <header className='mb-8'>
        <p className='text-xs uppercase tracking-[0.25em] text-lcars-teal'>Daily operations / Monday–Friday</p>
        <h1 className='mt-3 text-3xl font-bold text-white sm:text-4xl'>Small tasks. Real progress.</h1>
        <p className='mt-3 max-w-xl text-sm leading-6 text-lcars-ice/60'>Your assigned work, one check-off at a time. Shared tasks stay complete for everyone; points and XP go to the person who completes them.</p>
        <p className='mt-2 text-xs text-lcars-ice/50'>Signed in as {user.email}</p>
      </header>
      {error && <div role='alert' className='mb-5 rounded-xl border border-lcars-amber/40 bg-lcars-amber/10 p-4 text-sm text-lcars-amber'>{error.message} <button onClick={refresh} className='ml-2 underline'>Retry</button></div>}
      {notice && <p role='status' className='mb-5 rounded-xl border border-lcars-teal/30 bg-lcars-teal/10 p-4 text-sm text-lcars-teal'>{notice}</p>}
      {!data ? <p role='status' className='py-8 text-sm text-lcars-ice/60'>{loading ? 'Loading your assignments…' : 'Your assignments are temporarily unavailable.'}</p> : <div className='grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]'>
        <aside className='space-y-5'>
          <PlayerHud profile={data.profile} onPickAvatar={() => setPicker(true)} />
          <p className='text-xs text-lcars-ice/60 lg:hidden'><span className='text-ai-gold'>{data.lifetime.points.toLocaleString()} total task points</span> · {data.lifetime.completed} completed</p>
          <div className='hidden rounded-2xl border border-lcars-ice/15 p-5 lg:block'>
            <h2 className='text-xs uppercase tracking-widest text-lcars-ice/60'>Your task record</h2>
            <p className='mt-4 text-3xl font-bold text-ai-gold'>{data.lifetime.points.toLocaleString()} <span className='text-xs font-normal'>pts</span></p>
            <p className='mt-2 text-xs leading-6 text-lcars-ice/60'>{data.lifetime.completed} tasks completed · {data.lifetime.xp.toLocaleString()} task XP</p>
            <p className='mt-4 border-t border-lcars-ice/10 pt-4 text-xs leading-6 text-lcars-ice/50'>Task XP and mission XP contribute to the same level. Weekend breaks preserve your activity streak.</p>
          </div>
        </aside>
        <div className='min-w-0 space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='text-sm font-bold text-white'>Week {data.weekId.split('-W')[1]} <span className='font-normal text-lcars-ice/50'>/ {data.weekId.slice(0, 4)}</span></h2>
            <div className='flex items-center gap-2 text-xs'>
              <button aria-label='Previous week' disabled={Boolean(busy) || loading} onClick={() => setWeek(weekForDate(shiftDate(data.days[0].date, -7)))} className='rounded-full border border-lcars-ice/20 px-3 py-2 disabled:opacity-40'>←</button>
              <button disabled={Boolean(busy) || loading} onClick={() => { setWeek(null); if (!week) refresh() }} className='rounded-full border border-lcars-ice/20 px-3 py-2 disabled:opacity-40'>Current week</button>
              <button aria-label='Next week' disabled={Boolean(busy) || loading} onClick={() => setWeek(weekForDate(shiftDate(data.days[0].date, 7)))} className='rounded-full border border-lcars-ice/20 px-3 py-2 disabled:opacity-40'>→</button>
            </div>
          </div>
          <TaskBoard key={data.weekId} data={data} busy={busy} onComplete={complete} />
        </div>
      </div>}
      <Celebration kind={celebration} onDone={finishCelebration} />
      {picker && <AvatarPicker current={data?.profile?.avatarId} onPick={pickAvatar} onClose={() => setPicker(false)} />}
    </main>
  )
}
