'use client'
import { useState } from 'react'

function shortDate(day) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
}

export default function TaskBoard({ data, busy, onComplete }) {
  const [selected, setSelected] = useState('all')
  const missed = data.tasks.filter((task) => task.missed_at && !task.routine).length
  const expired = data.tasks.filter((task) => task.missed_at && task.routine).length
  const todaysRoutine = data.tasks.filter((task) => task.routine && task.due_date === data.today)
  // Routines live in their own strip; "All days" lists the one-off and weekly work.
  const visible = selected === 'all' ? data.tasks.filter((task) => !task.routine) : data.tasks.filter((task) => task.due_date === selected)
  const progress = data.weekly.total ? Math.round(data.weekly.completed / data.weekly.total * 100) : 0
  const multiplier = data.routine?.multiplier ?? 1
  return (
    <>
      <section aria-label='Weekly progress' className='rounded-2xl border border-lcars-ice/15 bg-black/25 p-5 sm:p-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-widest text-lcars-ice/60'>This week&apos;s progress</p>
            <p className='mt-2 text-3xl font-bold text-white'>{data.weekly.completed}<span className='text-lg font-normal text-lcars-ice/50'> / {data.weekly.total} tasks</span></p>
          </div>
          <div className='text-right text-sm'><p className='font-bold text-ai-gold'>{data.weekly.points} points you earned</p><p className='mt-1 text-lcars-violet'>+{data.weekly.xp} XP for you this week</p></div>
        </div>
        <div role='progressbar' aria-label='Tasks completed this week' aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className='mt-5 h-2 overflow-hidden rounded-full bg-white/10'>
          <div className='h-full rounded-full bg-lcars-teal transition-all motion-reduce:transition-none' style={{ width: `${progress}%` }} />
        </div>
        {data.weekly.total > 0 && data.weekly.completed === data.weekly.total && <p className='mt-3 text-sm text-lcars-teal'>Week cleared. Nice work keeping things moving.</p>}
        {missed > 0 && <p className='mt-3 text-sm text-lcars-amber'>{missed} not done when the week ended · each one restarted the following week.</p>}
        {expired > 0 && <p className='mt-1 text-sm text-lcars-ice/50'>{expired} daily routine {expired === 1 ? 'check' : 'checks'} expired unchecked.</p>}
      </section>

      {data.routine && data.weekId === data.currentWeek && <section aria-label="Today's routine" className='rounded-2xl border border-lcars-teal/30 bg-lcars-teal/5 p-5 sm:p-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-widest text-lcars-teal'>Today&apos;s routine</p>
            <p className='mt-2 text-3xl font-bold text-white'>{data.routine.streak}<span className='text-lg font-normal text-lcars-ice/50'> day{data.routine.streak === 1 ? '' : 's'} streak</span></p>
          </div>
          <div className='text-right text-sm'>
            <p className='font-bold text-ai-gold'>×{multiplier.toFixed(1)} points on today&apos;s checks</p>
            <p className='mt-1 text-xs text-lcars-ice/60'>+10% for each cleared day in a row, up to ×2</p>
          </div>
        </div>
        <p className={`mt-3 text-sm ${data.routine.perfectWeek ? 'text-lcars-teal' : 'text-lcars-ice/60'}`}>{data.routine.perfectWeek
          ? `Perfect routine week earned · +${data.routine.bonus.points} points`
          : `Clear every routine Monday through Friday for a +${data.routine.bonus.points} point perfect-week bonus. A missed day resets the streak.`}</p>
        {todaysRoutine.length > 0 && <div className='mt-4 space-y-3'>{[...todaysRoutine].sort((a, b) => Number(Boolean(a.completed_at)) - Number(Boolean(b.completed_at))).map((task) =>
          <TaskCard key={task.id} task={task} today={data.today} businessDay={data.isBusinessDay} busy={busy} onComplete={onComplete} multiplier={multiplier} />,
        )}</div>}
      </section>}

      <div aria-label='Filter by business day' className='grid grid-cols-5 gap-1 sm:gap-2'>
        {data.days.map((day) => {
          const tasks = data.tasks.filter((task) => task.due_date === day.date)
          return <button key={day.date} onClick={() => setSelected(day.date)} aria-pressed={selected === day.date}
            className={`min-w-0 rounded-xl border px-1 py-3 text-center transition-colors sm:px-3 ${selected === day.date ? 'border-lcars-teal bg-lcars-teal/10 text-white' : 'border-lcars-ice/15 bg-black/15 text-lcars-ice/70 hover:border-lcars-ice/40'}`}>
            <span className='block text-xs font-bold uppercase tracking-wider'>{day.label.slice(0, 3)}</span>
            <span className='mt-1 block text-[10px] sm:text-xs'>{shortDate(day.date)}</span>
            <span className={`mt-2 block text-[10px] ${day.date === data.today ? 'text-lcars-teal' : 'text-lcars-ice/50'}`}>{day.date === data.today ? 'TODAY · ' : ''}{tasks.filter((t) => t.completed_at).length}/{tasks.length}</span>
          </button>
        })}
      </div>
      <div className='flex flex-wrap items-center gap-4 text-xs'>
        <button onClick={() => setSelected('all')} aria-pressed={selected === 'all'} className={`py-2 ${selected === 'all' ? 'text-lcars-teal underline underline-offset-4' : 'text-lcars-ice/60'}`}>All days</button>
        <span className='ml-auto text-lcars-ice/50'>America/Chicago</span>
      </div>
      {!data.isBusinessDay && <p className='rounded-xl border border-lcars-amber/30 bg-lcars-amber/10 p-4 text-sm text-lcars-amber'>Weekend breather. Review your tasks here; check-offs resume Monday. Your streak is preserved over the weekend.</p>}
      <section aria-label='Assigned tasks' className='space-y-3'>
        {!visible.length ? <div className='rounded-2xl border border-dashed border-lcars-ice/25 px-6 py-12 text-center'>
          <h2 className='text-lg text-white'>No tasks {selected === 'all' ? 'assigned this week' : 'on this day'}.</h2>
          <p className='mx-auto mt-3 max-w-sm text-sm leading-6 text-lcars-ice/60'>{data.tasks.length ? 'Choose another day or view all days to see your assignments.' : 'Your next assignments will appear here once your weekly task plan is loaded.'}</p>
        </div> : [...visible].sort((a, b) => Number(Boolean(a.completed_at || a.missed_at)) - Number(Boolean(b.completed_at || b.missed_at))).map((task) =>
          <TaskCard key={task.id} task={task} today={data.today} businessDay={data.isBusinessDay} busy={busy} onComplete={onComplete} multiplier={multiplier} />,
        )}
      </section>
    </>
  )
}

function TaskCard({ task, today, businessDay, busy, onComplete, multiplier = 1 }) {
  const [note, setNote] = useState('')
  const done = Boolean(task.completed_at)
  const missed = !done && Boolean(task.missed_at)
  const future = task.due_date > today
  const overdue = !done && !missed && task.due_date < today
  return (
    <article className={`rounded-2xl border p-5 sm:p-6 ${done ? 'border-lcars-teal/20 bg-lcars-teal/5' : missed ? 'border-lcars-amber/20 bg-black/15' : 'border-lcars-ice/15 bg-black/25'}`}>
      <div className='flex items-start gap-4'>
        <span aria-hidden='true' className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border text-lg ${done ? 'border-lcars-teal bg-lcars-teal text-ai-navy' : missed ? 'border-lcars-amber/60 text-lcars-amber' : 'border-lcars-ice/40'}`}>{done ? '✓' : missed ? '–' : ''}</span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider'>
            <span className={done ? 'text-lcars-teal' : missed || overdue ? 'text-lcars-amber' : 'text-lcars-ice/60'}>{done ? 'Completed' : missed ? (task.routine ? 'Expired' : 'Not done') : overdue ? 'Overdue' : future ? 'Upcoming' : 'Due today'} · {shortDate(task.due_date)}</span>
            {task.routine && <span className='text-lcars-teal'>Daily routine</span>}
            <span className='text-ai-gold'>{done && task.earned_points != null ? task.earned_points : task.points} pts{task.routine && !done && !missed && task.due_date === today && multiplier > 1 ? ` ×${multiplier.toFixed(1)}` : ''}</span><span className='text-lcars-violet'>+{task.xp} XP</span>
          </div>
          <h2 className={`mt-2 break-words text-base font-bold sm:text-lg ${done || missed ? 'text-lcars-ice/70' : 'text-white'}`}>{task.title}</h2>
          {task.restarted_from && <p className='mt-2 text-xs text-lcars-amber'>Restarted · This wasn&apos;t finished last week, so it starts fresh here.</p>}
          {task.is_shared && <p className='mt-2 text-xs text-lcars-teal'>Shared task · Either assignee can complete it for everyone.</p>}
          <p className='mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-lcars-ice/70'>{task.instructions}</p>
          {task.resource_url && <a href={task.resource_url} target='_blank' rel='noreferrer' className='mt-3 inline-block text-sm text-lcars-teal underline underline-offset-4'>Open task resource ↗</a>}
          {task.source && <p className='mt-3 break-words text-[10px] text-lcars-ice/50'>Brief: {task.source}</p>}
          {done ? <div className='mt-4 text-xs text-lcars-teal'>Completed by {task.completed_by_name || 'you'} · Rewards recorded once{task.completion_note && <p className='mt-2 whitespace-pre-wrap break-words text-lcars-ice/60'>{task.completion_note}</p>}</div> : missed ? <p className='mt-4 text-xs text-lcars-amber'>{task.routine ? 'Expired unchecked at the end of its day · Not restarted; the next day has its own check.' : 'Not done when the week ended · Restarted the following week.'}</p> : <form onSubmit={(event) => { event.preventDefault(); onComplete(task, note) }} className='mt-5'>
            <label htmlFor={`note-${task.id}`} className='block text-xs text-lcars-ice/60'>Completion note or result link <span className='text-lcars-ice/40'>(optional)</span></label>
            <textarea id={`note-${task.id}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={2} disabled={Boolean(busy) || future || !businessDay}
              className='mt-2 w-full resize-y rounded-lg border border-lcars-ice/20 bg-black/20 p-3 text-sm text-white outline-none focus:border-lcars-teal disabled:opacity-40' />
            <button type='submit' disabled={Boolean(busy) || future || !businessDay}
              className='mt-3 min-h-[44px] rounded-full bg-lcars-teal px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ai-navy hover:bg-lcars-teal/80 disabled:cursor-not-allowed disabled:opacity-40'>
              {busy === task.id ? 'Saving…' : future ? `Available ${shortDate(task.due_date)}` : !businessDay ? 'Available on a business day' : 'Mark complete'}
            </button>
          </form>}
        </div>
      </div>
    </article>
  )
}
