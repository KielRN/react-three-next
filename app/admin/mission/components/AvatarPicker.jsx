'use client'
import { AVATARS, AVATAR_FRAME } from '../../lib/assets'

export default function AvatarPicker({ current, onPick, onClose }) {
  return (
    <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6' onClick={onClose}>
      <div className='w-full max-w-sm rounded-3xl bg-ai-navy p-5 ring-1 ring-lcars-violet/50' onClick={(e) => e.stopPropagation()}>
        <p className='mb-3 text-center uppercase tracking-widest text-ai-gold'>Choose Officer</p>
        <div className='grid grid-cols-3 gap-3'>
          {AVATARS.map((src, i) => {
            const id = `avatar-0${i + 1}`
            return (
              <button key={id} onClick={() => onPick(id)}
                className={`relative aspect-square rounded-xl p-1 ${current === id ? 'ring-2 ring-ai-gold' : 'ring-1 ring-lcars-ice/20'}`}>
                <img src={AVATAR_FRAME} alt='' className='absolute inset-0' />
                <img src={src} alt={id} className='absolute inset-2 rounded-full' />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
