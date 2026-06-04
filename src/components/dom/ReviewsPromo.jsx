'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STAR = (
  <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className='size-4'>
    <path d='M12 2.5l2.95 6.36 6.99.74-5.22 4.76 1.49 6.92L12 17.77l-6.21 3.51 1.49-6.92L2.06 9.6l6.99-.74L12 2.5z' />
  </svg>
)

const FiveStars = ({ size = 'text-base', glow = true }) => (
  <span
    className={`inline-flex items-center gap-0.5 text-ai-gold-bright ${size}`}
    style={glow ? { filter: 'drop-shadow(0 0 4px rgba(255, 204, 0, 0.7))' } : undefined}
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} className='reviews-star-twinkle' style={{ animationDelay: `${i * 0.18}s` }}>
        {STAR}
      </span>
    ))}
  </span>
)

/* ─────────────────────────────────────────────────────────────
   1. PRIORITY TRANSMISSION BAR (under navbar)
   ─────────────────────────────────────────────────────────── */
export function ReviewsTransmissionBar() {
  const message = (
    <span className='inline-flex items-center gap-3 px-6'>
      <FiveStars size='text-sm' glow={false} />
      <span className='font-mono text-[12px] uppercase tracking-[0.18em] text-ai-gold-bright/90'>
        Now Live · Texas AI Reviews Service
      </span>
      <span className='font-hesdeadjim text-[13px] text-white/90'>
        Rank #1 on Google With Automated Five-Star Reviews
      </span>
      <span className='font-mono text-[11px] uppercase tracking-[0.2em] text-ai-blue'>
        // 10-Day Free Trial
      </span>
      <span className='text-ai-gold-bright/40'>◆</span>
    </span>
  )

  return (
    <div className='relative z-40 w-full overflow-hidden border-y border-ai-gold/30 bg-gradient-to-r from-black via-[#0a1a3a] to-black'>
      <div className='reviews-shimmer pointer-events-none absolute inset-0 opacity-60' />

      <div className='relative flex items-stretch'>
        {/* Left: Priority indicator */}
        <div className='hidden shrink-0 items-center gap-2 border-r border-ai-gold/30 bg-black/60 px-4 py-2 md:flex'>
          <span className='reviews-beacon size-2 rounded-full bg-[#ff4d4d]' aria-hidden='true' />
          <span className='font-mono text-[10px] uppercase tracking-[0.25em] text-[#ff8585]'>
            PRIORITY
          </span>
          <span className='font-mono text-[10px] uppercase tracking-[0.25em] text-ai-gold-bright/70'>
            TRANSMISSION
          </span>
        </div>

        {/* Marquee */}
        <div className='relative flex flex-1 overflow-hidden py-1.5'>
          <div className='reviews-marquee-track flex shrink-0 whitespace-nowrap'>
            {message}
            {message}
            {message}
            {message}
            {/* Duplicate set for seamless loop */}
            {message}
            {message}
            {message}
            {message}
          </div>
        </div>

        {/* Right: CTA */}
        <Link
          href='/funnels/reviews'
          className='group relative hidden shrink-0 items-center gap-2 border-l border-ai-gold/30 bg-ai-gold/10 px-5 py-2 font-hesdeadjim text-[12px] uppercase tracking-[0.18em] text-ai-gold-bright transition-all duration-300 hover:bg-ai-gold hover:text-black sm:flex'
          style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          <span>Initiate</span>
          <span className='transition-transform duration-300 group-hover:translate-x-1'>→</span>
        </Link>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   2. ABOVE-ROCKET HUD (top-center over the 3D scene)
   ─────────────────────────────────────────────────────────── */
export function ReviewsHud() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  if (!mounted) return null

  return (
    <div className='pointer-events-none absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 md:block'>
      <Link
        href='/funnels/reviews'
        className='reviews-rise pointer-events-auto group block'
      >
        <div className='relative'>
          {/* Top tab */}
          <div className='absolute -top-3 left-6 flex items-center gap-2 bg-black px-3 py-0.5'>
            <span className='reviews-beacon size-1.5 rounded-full bg-ai-gold-bright' />
            <span className='font-mono text-[9px] uppercase tracking-[0.3em] text-ai-gold-bright'>
              REV-S01 · Active
            </span>
          </div>

          {/* Main HUD panel */}
          <div
            className='reviews-scanline reviews-hud-pulse relative overflow-hidden border border-ai-gold/50 bg-black/70 px-6 py-3 backdrop-blur-md reviews-clip-corner'
            style={{ boxShadow: '0 0 24px rgba(255, 204, 0, 0.25), inset 0 0 24px rgba(44, 117, 255, 0.05)' }}
          >
            <div className='reviews-grid-bg pointer-events-none absolute inset-0 opacity-40' />

            <div className='relative flex items-center gap-5'>
              {/* Stars block */}
              <div className='flex flex-col items-center border-r border-ai-gold/30 pr-5'>
                <FiveStars size='text-lg' />
                <span className='mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-white/60'>
                  5.0 · Google
                </span>
              </div>

              {/* Message */}
              <div>
                <div className='font-hesdeadjim text-[15px] leading-tight text-ai-gold-bright'>
                  <span className='text-white/90'>NEW SERVICE //</span> Reviews Automation
                </div>
                <div className='mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-white/70'>
                  Be the obvious choice on Google · 10-day free trial
                </div>
              </div>

              {/* Arrow */}
              <div className='flex items-center border-l border-ai-gold/30 pl-4'>
                <span className='font-hesdeadjim text-xs uppercase tracking-widest text-ai-gold-bright transition-colors duration-300 group-hover:text-ai-blue'>
                  Engage
                </span>
                <span className='ml-2 text-lg text-ai-gold-bright transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ai-blue'>
                  ▸
                </span>
              </div>
            </div>
          </div>

          {/* Bottom corner cuts */}
          <div className='absolute -bottom-1 left-0 h-1 w-12 bg-ai-gold/60' />
          <div className='absolute -bottom-1 right-0 h-1 w-12 bg-ai-blue/60' />
        </div>
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   3. BELOW-ROCKET MISSION BRIEFING (bottom CTA panel)
   ─────────────────────────────────────────────────────────── */
export function ReviewsBriefing() {
  return (
    <>
      {/* ===== MOBILE: stacked VetHub seal + Reviews pill (< sm) ===== */}
      <div className='reviews-rise absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2 sm:hidden' style={{ animationDelay: '500ms' }}>
        {/* VetHub trust seal */}
        <div
          className='reviews-hud-pulse relative flex items-center gap-3 overflow-hidden border-2 border-ai-gold/70 bg-gradient-to-r from-[#0e2042]/90 via-black/90 to-[#0e2042]/90 px-3 py-2 backdrop-blur-md'
          style={{ boxShadow: '0 0 20px rgba(255, 204, 0, 0.3), inset 0 0 18px rgba(44, 117, 255, 0.08)' }}
        >
          <div className='reviews-grid-bg pointer-events-none absolute inset-0 opacity-40' />

          <div
            className='relative flex shrink-0 items-center justify-center border border-ai-gold/40 bg-black/70 p-1.5'
            style={{ boxShadow: '0 0 10px rgba(255, 204, 0, 0.4)' }}
          >
            <img
              src='/img/vethub-logo.svg'
              alt='Texas State VetHub Certified'
              className='h-10 w-auto'
              style={{ filter: 'drop-shadow(0 0 6px rgba(255, 204, 0, 0.6))' }}
            />
          </div>

          <div className='relative flex-1 leading-tight'>
            <div className='flex items-center gap-1.5'>
              <span className='reviews-star-twinkle text-ai-gold-bright text-[11px]'>★</span>
              <span
                className='font-hesdeadjim text-[13px] uppercase tracking-[0.1em] text-ai-gold-bright'
                style={{ textShadow: '0 0 8px rgba(255, 204, 0, 0.5)' }}
              >
                Veteran Owned
              </span>
              <span className='reviews-star-twinkle text-ai-gold-bright text-[11px]' style={{ animationDelay: '0.6s' }}>★</span>
            </div>
            <div className='font-hesdeadjim text-[10px] uppercase tracking-[0.15em] text-white'>
              Texas State <span className='text-ai-gold-bright'>VetHub Certified</span>
            </div>
          </div>
        </div>

        {/* Reviews CTA pill */}
        <Link
          href='/funnels/reviews'
          className='pointer-events-auto relative flex items-center gap-3 overflow-hidden border-2 border-ai-gold-bright bg-black/90 px-3 py-2.5 backdrop-blur-md'
          style={{ boxShadow: '0 0 22px rgba(255, 204, 0, 0.35)' }}
        >
          <div className='reviews-shimmer pointer-events-none absolute inset-0 opacity-25' />
          <FiveStars size='text-[13px]' />
          <div className='relative flex-1 leading-tight'>
            <div className='font-hesdeadjim text-[12px] uppercase tracking-[0.08em] text-ai-gold-bright'>
              Reviews Service
            </div>
            <div className='font-mono text-[9px] uppercase tracking-[0.2em] text-white/70'>
              10-Day Free Trial
            </div>
          </div>
          <div className='relative flex items-center gap-1 bg-ai-gold-bright px-3 py-1.5 font-hesdeadjim text-[11px] uppercase tracking-wider text-black'>
            Start <span>▸</span>
          </div>
        </Link>
      </div>

      {/* ===== TABLET / DESKTOP: full mission briefing (sm+) ===== */}
      <div className='pointer-events-none absolute bottom-4 left-1/2 z-20 hidden w-full max-w-[640px] -translate-x-1/2 px-4 sm:block lg:left-auto lg:right-6 lg:max-w-[560px] lg:translate-x-0 lg:px-0'>
        <div
          className='reviews-rise pointer-events-auto relative w-full'
          style={{ animationDelay: '500ms' }}
        >
          {/* LCARS top bar */}
          <div className='flex items-end gap-1'>
            <div className='h-1.5 w-14 rounded-t-sm bg-ai-gold' />
            <div className='h-3 w-3 rounded-t-sm bg-ai-blue' />
            <div className='h-1.5 flex-1 rounded-t-sm bg-ai-gold/40' />
            <span className='font-mono text-[9px] uppercase tracking-[0.3em] text-ai-gold-bright/70'>
              // MISSION BRIEFING · 04
            </span>
            <div className='h-1.5 w-6 rounded-t-sm bg-ai-blue/60' />
          </div>

          <div
            className='relative overflow-hidden border-x border-b border-ai-gold/40 bg-black/80 backdrop-blur-md'
            style={{ boxShadow: '0 -4px 28px rgba(255, 204, 0, 0.18)' }}
          >
            <div className='reviews-grid-bg pointer-events-none absolute inset-0 opacity-50' />

            <div className='relative grid grid-cols-1 md:grid-cols-[1fr_auto] md:items-stretch'>
              {/* Left: Pitch */}
              <div className='flex flex-col justify-center gap-2 px-5 py-4 md:px-7'>
                <div className='flex items-center gap-3'>
                  <FiveStars size='text-sm' />
                  <span className='font-mono text-[10px] uppercase tracking-[0.25em] text-ai-gold-bright/80'>
                    Texas AI · Reviews Service
                  </span>
                </div>
                <h3
                  className='font-hesdeadjim text-lg leading-tight text-white sm:text-xl'
                  style={{ textShadow: '0 0 12px rgba(255, 204, 0, 0.25)' }}
                >
                  Get Found First on Google.{' '}
                  <span className='text-ai-gold-bright'>Automate Five-Star Reviews.</span>
                </h3>
                <p className='font-mono text-[11px] leading-relaxed text-white/60 sm:text-[12px]'>
                  Done-for-you review collection, response, and ranking signals. No credit card surprises — cancel anytime in your 10-day trial.
                </p>

                {/* Inline veteran credential row — shows when the standalone seal is hidden */}
                <div className='mt-2 flex items-center gap-2 border-t border-ai-gold/15 pt-2 lg:hidden'>
                  <img
                    src='/img/vethub-logo.svg'
                    alt='Texas State VetHub Certified'
                    className='h-7 w-auto'
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255, 204, 0, 0.5))' }}
                  />
                  <span className='font-mono text-[10px] uppercase tracking-[0.22em] text-ai-gold-bright'>
                    <span>★</span> Veteran Owned · VetHub Certified <span>★</span>
                  </span>
                </div>
              </div>

              {/* Right: CTAs */}
              <div className='flex flex-col gap-2 border-t border-ai-gold/20 bg-gradient-to-br from-black/40 to-[#0e2042]/60 p-4 md:border-l md:border-t-0 md:p-5'>
                <Link
                  href='/funnels/reviews'
                  className='group relative inline-flex items-center justify-center gap-2 border-2 border-ai-gold-bright bg-ai-gold-bright px-5 py-2.5 font-hesdeadjim text-sm uppercase tracking-wider text-black transition-all duration-300 hover:bg-black hover:text-ai-gold-bright'
                  style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)', boxShadow: '0 0 15px rgba(255, 204, 0, 0.4)' }}
                >
                  Launch Free Trial
                  <span className='text-base transition-transform group-hover:translate-x-1'>▸</span>
                </Link>
                <Link
                  href='/funnels/reviews/pricing'
                  className='inline-flex items-center justify-center gap-2 border border-ai-blue/60 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ai-blue transition-all duration-300 hover:border-ai-gold-bright hover:text-ai-gold-bright'
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>

          {/* LCARS bottom bar */}
          <div className='flex items-start gap-1'>
            <div className='h-1.5 w-6 rounded-b-sm bg-ai-blue/60' />
            <div className='h-1.5 flex-1 rounded-b-sm bg-ai-gold/40' />
            <div className='h-3 w-3 rounded-b-sm bg-ai-blue' />
            <div className='h-1.5 w-14 rounded-b-sm bg-ai-gold' />
          </div>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   4. VETERAN-OWNED TRUST SEAL (bottom-left credibility)
   ─────────────────────────────────────────────────────────── */
export function VetHubSeal() {
  return (
    <div
      className='reviews-rise absolute bottom-4 left-4 z-20 hidden lg:block'
      style={{ animationDelay: '650ms' }}
    >
      {/* LCARS top accent */}
      <div className='flex items-end gap-1 pl-2'>
        <div className='h-1.5 w-8 rounded-t-sm bg-ai-gold' />
        <div className='h-2.5 w-2.5 rounded-t-sm bg-ai-blue' />
        <div className='h-1.5 w-20 rounded-t-sm bg-ai-gold/40' />
        <span className='font-mono text-[8px] uppercase tracking-[0.3em] text-ai-gold-bright/70'>
          // CREDENTIALS
        </span>
      </div>

      <div
        className='relative overflow-hidden border-2 border-ai-gold/60 bg-gradient-to-br from-[#0e2042]/90 via-black to-[#0e2042]/70 backdrop-blur-md reviews-hud-pulse'
        style={{ boxShadow: '0 0 28px rgba(255, 204, 0, 0.3), inset 0 0 28px rgba(44, 117, 255, 0.08)' }}
      >
        <div className='reviews-grid-bg pointer-events-none absolute inset-0 opacity-40' />
        <div className='reviews-shimmer pointer-events-none absolute inset-0 opacity-25' />

        <div className='relative flex items-center gap-4 px-5 py-4'>
          {/* Hero: VetHub logo */}
          <div
            className='flex shrink-0 items-center justify-center border border-ai-gold/40 bg-gradient-to-b from-black/60 to-[#0e2042]/80 p-2'
            style={{ boxShadow: '0 0 14px rgba(255, 204, 0, 0.35), inset 0 0 12px rgba(44, 117, 255, 0.15)' }}
          >
            <img
              src='/img/vethub-logo.svg'
              alt='Texas State VetHub Certified'
              className='h-16 w-auto'
              style={{ filter: 'drop-shadow(0 0 8px rgba(255, 204, 0, 0.55))' }}
            />
          </div>

          {/* Right: Texts */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center gap-1.5'>
              <span className='reviews-star-twinkle text-ai-gold-bright' style={{ filter: 'drop-shadow(0 0 5px rgba(255, 204, 0, 0.8))' }}>★</span>
              <span
                className='font-hesdeadjim text-[15px] uppercase tracking-[0.14em] text-ai-gold-bright'
                style={{ textShadow: '0 0 10px rgba(255, 204, 0, 0.45)' }}
              >
                Veteran Owned
              </span>
              <span className='reviews-star-twinkle text-ai-gold-bright' style={{ animationDelay: '0.6s', filter: 'drop-shadow(0 0 5px rgba(255, 204, 0, 0.8))' }}>★</span>
            </div>

            <div className='font-hesdeadjim text-[12px] uppercase tracking-[0.18em] text-white'>
              Texas State <span className='text-ai-gold-bright'>VetHub Certified</span>
            </div>

            <div className='mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em]'>
              <Link
                href='/privacy-policy'
                className='text-white/45 transition-colors hover:text-ai-gold-bright'
              >
                Privacy
              </Link>
              <span className='text-white/20'>·</span>
              <Link
                href='/terms-of-use'
                className='text-white/45 transition-colors hover:text-ai-gold-bright'
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className='absolute -top-0.5 left-0 h-0.5 w-12 bg-ai-gold' />
        <div className='absolute -bottom-0.5 right-0 h-0.5 w-12 bg-ai-blue' />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   5. PRODUCTS CARD — REDESIGNED (Reviews hero + Agent grid)
   ─────────────────────────────────────────────────────────── */

const AGENT_LINEUP = [
  {
    code: 'AG-01',
    name: 'Closer Agent',
    tag: 'Sales · Revenue',
    bullets: ['Auto-qualifies leads', 'Summarizes deals', 'Books appointments'],
    accent: '#2c75ff',
  },
  {
    code: 'AG-02',
    name: 'Assistant Agent',
    tag: 'Executive Support',
    bullets: ['Email triage', 'Calendar optimization', 'Travel booking'],
    accent: '#ebcb4c',
  },
  {
    code: 'AG-03',
    name: 'Workflow Agent',
    tag: 'Operations',
    bullets: ['SOP builder', 'Office manager bot', 'Customer support'],
    accent: '#2c75ff',
  },
  {
    code: 'AG-04',
    name: 'Amplifier Agent',
    tag: 'Marketing · Content',
    bullets: ['Brand-voice content', 'Performance analysis', 'Multi-format output'],
    accent: '#ebcb4c',
  },
  {
    code: 'AG-05',
    name: 'Money Agent',
    tag: 'Financial Mgmt',
    bullets: ['Real-time cash flow', 'Invoice automation', 'Fraud detection'],
    accent: '#2c75ff',
  },
]

export function ProductsCard({ isVisible, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-500 ${
        isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/85 backdrop-blur-md' />

      <div
        className={`relative w-full max-w-5xl transform transition-all duration-500 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LCARS top frame */}
        <div className='flex items-end gap-1'>
          <div className='h-2 w-20 rounded-t-md bg-ai-gold' />
          <div className='h-5 w-5 rounded-t-md bg-ai-blue' />
          <div className='h-2 flex-1 rounded-t-md bg-ai-gold/40' />
          <span className='font-mono text-[10px] uppercase tracking-[0.3em] text-ai-gold-bright/80'>
            // TXAI · PRODUCT ROSTER
          </span>
          <div className='h-2 w-10 rounded-t-md bg-ai-blue/60' />
        </div>

        <div
          className='relative overflow-hidden border border-ai-gold/40 bg-gradient-to-b from-[#0a1428] via-black to-[#0a1428]'
          style={{ boxShadow: '0 0 60px rgba(255, 204, 0, 0.15), inset 0 0 60px rgba(44, 117, 255, 0.06)' }}
        >
          <div className='reviews-grid-bg pointer-events-none absolute inset-0 opacity-50' />

          {/* Close button */}
          <button
            className='absolute right-4 top-4 z-10 flex size-8 items-center justify-center border border-ai-gold/50 bg-black/70 text-ai-gold-bright transition-all duration-300 hover:rotate-90 hover:border-ai-gold-bright hover:bg-ai-gold-bright hover:text-black'
            onClick={onClose}
            aria-label='Close products card'
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='size-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>

          <div className='relative max-h-[85vh] overflow-y-auto px-6 py-7 sm:px-10 sm:py-9'>
            {/* Header */}
            <div className='mb-6 flex items-baseline gap-3'>
              <span className='font-mono text-[11px] uppercase tracking-[0.3em] text-ai-blue'>
                CATALOG / 6 SERVICES
              </span>
              <span className='h-px flex-1 bg-gradient-to-r from-ai-gold/60 to-transparent' />
              <span className='font-mono text-[11px] uppercase tracking-[0.3em] text-ai-gold-bright/70'>
                v 2026.06
              </span>
            </div>

            <h2
              className='font-hesdeadjim text-3xl leading-none text-white sm:text-4xl'
              style={{ textShadow: '0 0 18px rgba(255, 204, 0, 0.25)' }}
            >
              Our <span className='text-ai-gold-bright'>Products</span>
            </h2>
            <p className='mt-2 max-w-2xl font-mono text-[12px] leading-relaxed text-white/60 sm:text-[13px]'>
              Five agents and a flagship reviews service — built to put Texas small businesses ahead.
              Pick a system. We deploy it.
            </p>

            {/* ===== FEATURED: REVIEWS SERVICE ===== */}
            <div className='relative mt-8'>
              {/* "Featured" tag */}
              <div className='absolute -top-3 left-6 z-10 flex items-center gap-2 border border-ai-gold-bright bg-black px-3 py-1'>
                <span className='reviews-beacon size-1.5 rounded-full bg-ai-gold-bright' />
                <span className='font-hesdeadjim text-[10px] uppercase tracking-[0.25em] text-ai-gold-bright'>
                  Featured · New
                </span>
              </div>

              <div
                className='reviews-scanline relative overflow-hidden border-2 border-ai-gold/60 bg-gradient-to-br from-[#0e2042]/90 via-black to-[#1a1006]'
                style={{ boxShadow: '0 0 40px rgba(255, 204, 0, 0.25), inset 0 0 40px rgba(255, 204, 0, 0.06)' }}
              >
                <div className='reviews-shimmer pointer-events-none absolute inset-0 opacity-30' />

                <div className='relative grid gap-6 px-6 py-7 sm:grid-cols-[1fr_auto] sm:px-9 sm:py-8'>
                  <div>
                    <div className='mb-3 flex flex-wrap items-center gap-3'>
                      <FiveStars size='text-xl' />
                      <span className='font-mono text-[11px] uppercase tracking-[0.25em] text-white/70'>
                        Google · Yelp · Facebook
                      </span>
                    </div>

                    <h3
                      className='font-hesdeadjim text-2xl leading-tight text-white sm:text-3xl'
                      style={{ textShadow: '0 0 12px rgba(255, 204, 0, 0.35)' }}
                    >
                      Texas AI <span className='text-ai-gold-bright'>Reviews Service</span>
                    </h3>
                    <p className='mt-2 max-w-xl font-mono text-[12px] leading-relaxed text-white/70 sm:text-[13px]'>
                      Done-for-you review collection, response and ranking signals. We turn happy customers into a
                      compounding source of new ones — and lift you to the top of local Google search.
                    </p>

                    <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3'>
                      {[
                        ['+87%', 'reviews captured'],
                        ['#1', 'on Google Maps'],
                        ['10-day', 'free trial'],
                      ].map(([k, v]) => (
                        <div
                          key={v}
                          className='border-l-2 border-ai-gold-bright/70 bg-black/40 px-3 py-2'
                        >
                          <div className='font-hesdeadjim text-lg leading-none text-ai-gold-bright'>
                            {k}
                          </div>
                          <div className='mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60'>
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='flex flex-col justify-center gap-2 sm:w-52'>
                    <Link
                      href='/funnels/reviews'
                      className='group inline-flex items-center justify-center gap-2 border-2 border-ai-gold-bright bg-ai-gold-bright px-5 py-3 font-hesdeadjim text-sm uppercase tracking-wider text-black transition-all duration-300 hover:bg-black hover:text-ai-gold-bright'
                      style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)', boxShadow: '0 0 18px rgba(255, 204, 0, 0.5)' }}
                    >
                      Start Free Trial
                      <span className='transition-transform group-hover:translate-x-1'>▸</span>
                    </Link>
                    <Link
                      href='/funnels/reviews/pricing'
                      className='inline-flex items-center justify-center border border-ai-blue/60 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ai-blue transition-all duration-300 hover:border-ai-gold-bright hover:text-ai-gold-bright'
                    >
                      See Pricing
                    </Link>
                    <Link
                      href='/funnels/reviews/demo'
                      className='inline-flex items-center justify-center gap-1 px-5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white'
                    >
                      Watch Demo →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== AGENT LINEUP ===== */}
            <div className='mt-9'>
              <div className='mb-4 flex items-center gap-3'>
                <span className='font-hesdeadjim text-sm uppercase tracking-[0.22em] text-ai-blue'>
                  Agent Lineup
                </span>
                <span className='h-px flex-1 bg-gradient-to-r from-ai-blue/60 to-transparent' />
                <span className='font-mono text-[10px] uppercase tracking-[0.25em] text-white/50'>
                  5 systems
                </span>
              </div>

              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {AGENT_LINEUP.map((agent, i) => (
                  <div
                    key={agent.code}
                    className='group reviews-rise relative overflow-hidden border border-ai-gold/20 bg-black/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ai-gold/70'
                    style={{
                      animationDelay: `${i * 90}ms`,
                      boxShadow: 'inset 0 0 20px rgba(44, 117, 255, 0.04)',
                    }}
                  >
                    <div
                      className='absolute left-0 top-0 h-full w-0.5 transition-all duration-300 group-hover:w-1'
                      style={{ background: agent.accent, boxShadow: `0 0 10px ${agent.accent}` }}
                    />

                    <div className='mb-1 flex items-baseline justify-between'>
                      <span className='font-mono text-[10px] uppercase tracking-[0.22em] text-white/40'>
                        {agent.code}
                      </span>
                      <span className='font-mono text-[9px] uppercase tracking-[0.22em] text-ai-blue/80'>
                        {agent.tag}
                      </span>
                    </div>

                    <h4
                      className='font-hesdeadjim text-base text-ai-gold-bright'
                      style={{ textShadow: '0 0 6px rgba(255, 204, 0, 0.25)' }}
                    >
                      {agent.name}
                    </h4>

                    <ul className='mt-2 space-y-1'>
                      {agent.bullets.map((b) => (
                        <li
                          key={b}
                          className='flex items-start gap-2 font-mono text-[11px] leading-snug text-white/70'
                        >
                          <span className='mt-1 size-1 shrink-0 rounded-full bg-ai-gold-bright/70' />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer row */}
            <div className='mt-9 flex flex-col items-center gap-4 border-t border-ai-gold/20 pt-6 sm:flex-row sm:justify-between'>
              <p className='font-mono text-[11px] uppercase tracking-[0.22em] text-white/60'>
                Build the AI workforce your business deserves.
              </p>
              <Link
                href='/blog'
                className='group inline-flex items-center gap-2 border border-ai-gold-bright px-5 py-2 font-hesdeadjim text-xs uppercase tracking-[0.18em] text-ai-gold-bright transition-all duration-300 hover:bg-ai-gold-bright hover:text-black'
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
              >
                Explore Our Blog
                <span className='transition-transform group-hover:translate-x-1'>▸</span>
              </Link>
            </div>
          </div>
        </div>

        {/* LCARS bottom frame */}
        <div className='flex items-start gap-1'>
          <div className='h-2 w-10 rounded-b-md bg-ai-blue/60' />
          <div className='h-2 flex-1 rounded-b-md bg-ai-gold/40' />
          <div className='h-5 w-5 rounded-b-md bg-ai-blue' />
          <div className='h-2 w-20 rounded-b-md bg-ai-gold' />
        </div>
      </div>
    </div>
  )
}
