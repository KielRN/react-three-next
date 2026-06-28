'use client'
import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

// kind: 'win' | 'levelUp' | null. Loads the JSON from /public at runtime.
export default function Celebration({ kind, onDone }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!kind) return
    const url = kind === 'win'
      ? '/admin/assets/celebrations/win-booked.json'
      : '/admin/assets/xp/level-up-burst.json'
    let alive = true
    fetch(url).then((r) => r.json()).then((j) => { if (alive) setData(j) }).catch(() => {})
    const t = setTimeout(onDone, 2200)
    return () => { alive = false; clearTimeout(t) }
  }, [kind, onDone])

  if (!kind) return null
  return (
    <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center'>
      {data && <Lottie animationData={data} loop={false} className='w-72' />}
    </div>
  )
}
