'use client'

import { useRef, useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

/* ─── tiny helpers ─── */
function FadeInSection({ children, className = '', delay = 0 }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-60px' })
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

function GlowCard({ children, className = '', glowColor = 'rgba(44,117,255,0.15)' }) {
    return (
        <div
            className={`relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1628]/90 to-[#0e2042]/80 p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-[#2c75ff]/40 md:p-8 ${className}`}
            style={{ boxShadow: `0 0 30px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)` }}
        >
            {children}
        </div>
    )
}

function SectionHeading({ eyebrow, title, subtitle }) {
    return (
        <div className="mb-12 text-center md:mb-16">
            {eyebrow && (
                <span className="mb-3 inline-block rounded-full border border-[#2c75ff]/30 bg-[#2c75ff]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-ai-blue md:text-sm">
                    {eyebrow}
                </span>
            )}
            <h2 className="mt-4 font-hesdeadjim text-2xl leading-tight text-white md:text-4xl lg:text-5xl">{title}</h2>
            {subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400 md:text-lg">{subtitle}</p>}
        </div>
    )
}

/* ─── page ─── */
export default function AIFaxAssessmentPage() {
    const formRef = useRef(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => { setIsMounted(true) }, [])

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    /* =============================================
       MODULE 1 — HERO
       ============================================= */
    const Hero = () => (
        <section className="relative flex min-h-[90vh] items-center overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src="/img/nurse-meta-glasses.jpg"
                    alt="A professional nurse wearing Meta Ray-Ban smart glasses conducts a patient assessment with augmented reality clinical data overlays"
                    className="size-full object-cover object-top"
                />
                {/* Multi-layer gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
            </div>

            {/* Subtle animated grid lines */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(44,117,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(44,117,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
            />

            <div className="container relative z-10 mx-auto px-6 py-20 md:px-12 md:py-32">
                <div className="max-w-3xl">
                    {/* Precision AI tag */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2c75ff]/30 bg-[#2c75ff]/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-ai-blue backdrop-blur-sm">
                            <span className="size-2 animate-pulse rounded-full bg-ai-blue" />
                            Strategic Advisory For Rural Healthcare
                        </span>
                    </motion.div>

                    {/* Headline (CEO/CNO focus) */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="mb-6 font-hesdeadjim text-3xl leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-6xl"
                    >
                        Protect Rural Healthcare from{' '}
                        <span className="bg-gradient-to-r from-[#2c75ff] to-[#6c97a5] bg-clip-text text-transparent">
                            Legacy Fax Inefficiency.
                        </span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mb-4 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl"
                    >
                        Secure your facility&apos;s role in the <strong className="text-white">$1.4 Billion Rural Health Transformation Program (RHTP)</strong> with an AI-driven modernization roadmap.
                    </motion.p>

                    {/* Value prop & Resume Link */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="mb-10"
                    >
                        <p className="max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                            A 12-month strategic partnership starting with a 1-week rapid discovery sprint. Led by <strong className="text-ai-gold">Eliud &quot;Elliott&quot; Lamboy, RN, MBA</strong> — bridging clinical reality with enterprise AI architecture.
                        </p>
                        <Link
                            href="https://texasaiconsulting.com/elliott-resume"
                            target="_blank"
                            className="group mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ai-gold transition-colors hover:text-ai-gold-bright"
                        >
                            <span>View Clinical & Technical Resume</span>
                            <svg className="size-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="flex flex-col gap-4 sm:flex-row"
                    >
                        <button
                            onClick={scrollToForm}
                            className="group relative overflow-hidden rounded-lg px-8 py-4 text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #2c75ff, #1a5ecc)',
                                boxShadow: '0 0 25px rgba(44,117,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                            }}
                        >
                            <span className="relative z-10 text-white">Request Your Readiness Assessment</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1a5ecc] to-[#2c75ff] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </button>
                    </motion.div>

                    {/* Trust badges row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.9 }}
                        className="mt-10 flex flex-wrap items-center gap-6 whitespace-nowrap text-sm text-gray-400 md:text-base"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-ai-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span>HIPAA Compliant Protocol</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-ai-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span>Veteran-Owned (SDVOSB)</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )

    /* =============================================
       MODULE 2 — THE CORE PROBLEM (C-Suite Focus)
       ============================================= */
    const Problem = () => {
        const painPoints = [
            {
                icon: (
                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                title: 'Nursing Retention & Burnout',
                description: 'Forcing skilled clinical staff to perform manual data entry from paper faxes accelerates burnout, exacerbates rural staffing shortages, and compromises patient care metrics.',
            },
            {
                icon: (
                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                title: 'Hidden Compliance Risks',
                description: 'Undocumented "shadow workflows"—such as sticky notes, manual Excel referral logs, and print-scan-shred cycles—create un-auditable gaps in patient safety and data.',
            },
            {
                icon: (
                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                ),
                title: 'Delayed Revenue Cycles',
                description: 'Disconnected legacy EMRs trap vital patient data in silos, delaying critical care coordination and ultimately slowing down hospital reimbursement cycles.',
            },
        ]

        return (
            <section className="relative bg-gradient-to-b from-black to-[#050a14] py-20 md:py-28">
                {/* Subtle grid background */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(44,117,255,0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }}
                />

                <div className="container relative z-10 mx-auto px-6 md:px-12">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="The Modernization Paradox"
                            title="Your Fax Machine Is Costing You More Than Paper"
                            subtitle="Rural hospitals are the backbone of their communities — but legacy systems and manual workflows are creating an unsustainable financial and clinical burden."
                        />
                    </FadeInSection>

                    {/* Compliance risk callout */}
                    <FadeInSection delay={0.15}>
                        <div className="mx-auto mb-14 max-w-3xl rounded-xl border border-[#ebcb4c]/30 bg-[#ebcb4c]/5 p-6 text-center shadow-[0_0_20px_rgba(235,203,76,0.1)] backdrop-blur-sm">
                            <p className="mb-2 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-ai-gold md:text-base">
                                <svg className="size-5 text-ai-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                RHTP Grant Compliance Risk
                            </p>
                            <p className="text-sm leading-relaxed text-gray-300 md:text-base">
                                The Rural Health Transformation Program explicitly targets a reduction in human fax processing. Facilities relying on legacy manual ingestion risk falling behind <strong className="text-white">state performance metrics and disqualifying for future grant appropriations</strong>.
                            </p>
                        </div>
                    </FadeInSection>

                    {/* Pain point cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                        {painPoints.map((point, i) => (
                            <FadeInSection key={i} delay={0.1 * (i + 1)}>
                                <GlowCard className="h-full text-center" glowColor="rgba(44,117,255,0.1)">
                                    <div className="mb-5 inline-flex size-14 items-center justify-center rounded-xl border border-[#2c75ff]/20 bg-gradient-to-br from-[#2c75ff]/20 to-[#2c75ff]/5 text-ai-blue">
                                        {point.icon}
                                    </div>
                                    <h3 className="mb-3 font-hesdeadjim text-lg tracking-wide text-white md:text-xl">{point.title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-400 md:text-base">{point.description}</p>
                                </GlowCard>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    /* =============================================
       MODULE 3 — THE OFFER
       ============================================= */
    const Offer = () => {
        const sprintDays = [
            {
                day: 'Day 1',
                title: 'Clinical Workflow Mapping',
                desc: 'Tracing the "Life of a Fax" alongside your clinical and HIM teams to identify bottlenecks and dangerous shadow workflows.',
            },
            {
                day: 'Day 2',
                title: 'IT Feasibility & Integration',
                desc: 'Deep-dive with the IT Director reviewing EMR ingestion paths (HL7/FHIR), security perimeters, and zero-trust adherence.',
            },
            {
                day: 'Day 3',
                title: 'ROI Blueprint Development',
                desc: 'Designing the "Future State" architecture, calculating quantifiable clinical hours saved, and ensuring grant sustainability criteria.',
            },
            {
                day: 'Day 4',
                title: 'Executive Presentation',
                desc: 'A comprehensive briefing for the C-Suite and Board, demystifying the AI roadmap and supporting future RHTP applications.',
            },
        ]

        return (
            <section className="relative overflow-hidden bg-gradient-to-b from-[#050a14] to-black py-20 md:py-28">
                {/* Decoration */}
                <div className="pointer-events-none absolute left-0 top-0 size-[400px] rounded-full bg-[#2c75ff]/5 blur-[150px]" />
                <div className="pointer-events-none absolute bottom-0 right-0 size-[400px] rounded-full bg-[#ebcb4c]/5 blur-[150px]" />

                <div className="container relative z-10 mx-auto px-6 md:px-12">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="$24,500 Fixed-Fee Engagement"
                            title="The AI Workflow & Modernization Blueprint"
                            subtitle="A strategic 12-month partnership structured to de-risk technological adoption — with zero hidden software licenses and no recurring monthly IT invoices."
                        />
                    </FadeInSection>

                    {/* Phase 1 */}
                    <FadeInSection delay={0.1}>
                        <div className="mb-16">
                            <div className="mb-8 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#2c75ff]/50 to-transparent" />
                                <span className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-ai-blue">Phase 1 — The 1-Week Rapid Sprint</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-[#2c75ff]/50 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {sprintDays.map((d, i) => (
                                    <FadeInSection key={i} delay={0.08 * (i + 1)}>
                                        <GlowCard className="h-full border-[#2c75ff]/20">
                                            <span className="mb-3 inline-block rounded-md border border-[#ebcb4c]/20 bg-[#ebcb4c]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-ai-gold">
                                                {d.day}
                                            </span>
                                            <h4 className="mb-3 font-hesdeadjim text-base text-white md:text-lg">{d.title}</h4>
                                            <p className="text-sm leading-relaxed text-gray-400">{d.desc}</p>
                                        </GlowCard>
                                    </FadeInSection>
                                ))}
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Phase 2 */}
                    <FadeInSection delay={0.2}>
                        <div>
                            <div className="mb-8 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#ebcb4c]/50 to-transparent" />
                                <span className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-ai-gold">Phase 2 — 11 Months of Advisory</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-[#ebcb4c]/50 to-transparent" />
                            </div>

                            <GlowCard glowColor="rgba(235,203,76,0.1)" className="mx-auto max-w-3xl border-[#ebcb4c]/20">
                                <div className="mb-6 text-center">
                                    <p className="mb-1 text-lg font-bold uppercase tracking-wide text-ai-gold md:text-xl">2 Hours / Month — Fully Included</p>
                                    <p className="text-sm text-gray-400">Satisfies the RHTP Initiative #3 ongoing digital literacy training mandate</p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10">
                                        <h5 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Hour 1: Strategy Formulation</h5>
                                        <p className="text-sm leading-relaxed text-gray-400">Your leadership highlights a new emergent clinical operational challenge. We assess if and how AI integration can cost-effectively solve it.</p>
                                    </div>
                                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10">
                                        <h5 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Hour 2: Executive Education</h5>
                                        <p className="text-sm leading-relaxed text-gray-400">We provide a finalized, documented Zoom briefing to your leadership on actionable AI tactics, maintaining continuous auditable grant compliance.</p>
                                    </div>
                                </div>
                            </GlowCard>
                        </div>
                    </FadeInSection>

                    {/* Deliverables */}
                    <FadeInSection delay={0.3}>
                        <div className="mx-auto mt-16 max-w-3xl">
                            <h3 className="mb-8 text-center font-hesdeadjim text-xl tracking-wide text-white">Tangible Executive Deliverables</h3>
                            <div className="space-y-4">
                                {[
                                    'Current State vs. Future State Workflow Gap Analysis',
                                    'Vendor-Neutral AI Integration Roadmap (Designed for RHTP Grant Sustainability)',
                                    'On-Site Executive & Clinical AI Educational Workshop',
                                    '11 Months of Documented Continuous Digital Literacy Training Briefs',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#2c75ff]/20 bg-[#2c75ff]/10 text-sm font-bold text-ai-blue">
                                            {i + 1}
                                        </div>
                                        <p className="pt-1 align-middle text-sm text-gray-300 md:text-base">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        )
    }

    /* =============================================
       MODULE 4 — WHY TEXAS AI CONSULTING
       ============================================= */
    const WhyUs = () => {
        const credentials = [
            {
                icon: (
                    <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                ),
                title: 'Dual Clinical + Tech Qualifications',
                description: '20+ years as a Registered Nurse (ED, ICU) combined with IBM AI Engineering credentials and a healthcare-focused MBA. We look at technology through the lens of patient safety.',
                accent: '#2c75ff',
            },
            {
                icon: null, // SDVOSB badge image
                title: 'Mission-Driven Vendor',
                description: 'Service-Disabled Veteran-Owned Small Business (SDVOSB). U.S. Air Force Flight Nurse with 5 combat deployments. Delivering military-grade operational reliability to healthcare.',
                accent: '#ebcb4c',
                useBadge: true,
            },
            {
                icon: (
                    <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                ),
                title: 'Enterprise IT Experience Layer',
                description: 'Former Sr. Business Analyst on the HCA/Methodist App Dev Team. We bring large hospital system data pipeline architectures directly to the rural hospital market.',
                accent: '#6c97a5',
            },
        ]

        return (
            <section className="relative bg-gradient-to-b from-black to-[#050a14] py-20 md:py-28">
                <div className="container relative z-10 mx-auto px-6 md:px-12">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="Your AI Partner"
                            title="Why Texas AI Consulting?"
                            subtitle="We don't just supply IT contractors — we supply certified clinical expertise that understands exactly how software impacts care delivery."
                        />
                    </FadeInSection>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                        {credentials.map((cred, i) => (
                            <FadeInSection key={i} delay={0.12 * (i + 1)}>
                                <GlowCard className="h-full text-center" glowColor={`${cred.accent}22`}>
                                    <div className="mb-5 flex justify-center">
                                        {cred.useBadge ? (
                                            <img src="/img/sdvosb-badge.png" alt="Service-Disabled Veteran-Owned Small Business Badge" className="h-[72px] w-auto object-contain drop-shadow-lg" />
                                        ) : (
                                            <div
                                                className="inline-flex size-16 items-center justify-center rounded-2xl border"
                                                style={{ background: `linear-gradient(135deg, ${cred.accent}20, ${cred.accent}08)`, color: cred.accent, borderColor: `${cred.accent}30` }}
                                            >
                                                {cred.icon}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="mb-3 font-hesdeadjim text-lg tracking-wide text-white md:text-xl">{cred.title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-400 md:text-base">{cred.description}</p>
                                </GlowCard>
                            </FadeInSection>
                        ))}
                    </div>

                    {/* Led by with Resume button */}
                    <FadeInSection delay={0.4}>
                        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-[#2c75ff]/20 bg-[#2c75ff]/5 p-8 text-center shadow-[0_0_30px_rgba(44,117,255,0.05)] backdrop-blur-md">
                            <p className="mb-6 text-sm leading-relaxed text-gray-300 md:text-base">
                                Led by <strong className="font-hesdeadjim text-lg tracking-wide text-white">ELIUD "ELLIOTT" LAMBOY, RN, MBA</strong> <br />
                                <span className="inline-block pt-2 opacity-80">Former military Flight Nurse and Senior HCA/Methodist Healthcare Application Developer.</span>
                            </p>

                            <Link
                                href="https://texasaiconsulting.com/elliott-resume"
                                target="_blank"
                                className="group relative inline-flex items-center gap-3 rounded-lg border border-[#ebcb4c]/50 bg-[#0a1628] px-8 py-3 text-sm font-bold uppercase tracking-widest text-ai-gold shadow-[0_0_15px_rgba(235,203,76,0.2)] transition-all duration-300 hover:bg-[#ebcb4c]/10"
                            >
                                <span>Read the Executive & Clinical Resume</span>
                                <svg className="size-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </Link>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        )
    }

    /* =============================================
       MODULE — TRUST & REFERENCES
       ============================================= */
    const References = () => {
        const healthcareRefs = [
            {
                org: 'Methodist Healthcare System',
                orgDetail: 'San Antonio Division — HCA Enterprise',
                contact: 'Talley Fritsch',
                title: 'Cons Technical Analyst',
                duration: 'August 2024 – Present',
                highlights: [
                    'Created the STRACC CRUD application — a React-based automation system deployed on HCA on-premise IIS infrastructure.',
                    'Built an end-to-end data pipeline ingesting STRAC clinician CSV data, archiving via SQL Server, and automating profile creation on the NETBOX Lenel S2 access-control server via XML payload.',
                    'Implemented Windows Authentication via Microsoft Entra ID (RBAC) for HIPAA-compliant security.',
                ],
            },
            {
                org: 'Methodist Healthcare System',
                orgDetail: 'Application Development & BI Team',
                contact: 'Jeffrey Payne',
                title: 'Sr. Technical Analyst — App Dev Team',
                duration: 'August 2024 – Present',
                highlights: [
                    'Built and maintained ETL pipelines following the MEDITECH EHR → OpenGate → Data Repository → SQL Server → SSRS architecture.',
                    'Led the complete SafetyNET annual report pipeline for the STRAC Southwest Texas Crisis Collaborative (22-county TSA-P region).',
                    'Developed .NET 8 enterprise applications for internal workflow management within strict HIPAA compliance requirements.',
                ],
            },
        ]

        const additionalRefs = [
            {
                org: '5678 Dance Life',
                contact: 'Lee Rios',
                desc: 'End-to-end architecture and development of a nationwide marketplace platform with AI-assisted automation workflows.',
                duration: '2025 – Present',
            },
            {
                org: 'Tommy Zion Productions',
                contact: 'Tommy Zion',
                desc: 'Full-stack web development, GoHighLevel e-commerce integration, and AI-driven post-production for the Impostor sci-fi short film.',
                duration: '2024 – Present',
            },
        ]

        return (
            <section className="relative overflow-hidden bg-gradient-to-b from-[#050a14] to-black py-20 md:py-28">
                {/* Subtle decoration */}
                <div className="bg-[#ebcb4c]/3 pointer-events-none absolute right-0 top-20 size-[300px] rounded-full blur-[120px]" />

                <div className="container relative z-10 mx-auto px-6 md:px-12">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="Verified References"
                            title="Enterprise Healthcare Track Record"
                            subtitle="Our work inside large hospital systems speaks directly to the challenges facing rural healthcare administrators."
                        />
                    </FadeInSection>

                    {/* Primary healthcare references */}
                    <div className="mb-12 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
                        {healthcareRefs.map((ref, i) => (
                            <FadeInSection key={i} delay={0.12 * (i + 1)}>
                                <GlowCard className="h-full" glowColor="rgba(44,117,255,0.12)">
                                    {/* Header */}
                                    <div className="mb-5 flex items-start gap-4 border-b border-white/5 pb-5">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#2c75ff]/20 bg-gradient-to-br from-[#2c75ff]/20 to-[#2c75ff]/5">
                                            <svg className="size-6 text-ai-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-hesdeadjim text-base tracking-wide text-white md:text-lg">{ref.org}</h3>
                                            <p className="mt-0.5 text-xs uppercase tracking-wider text-ai-blue">{ref.orgDetail}</p>
                                        </div>
                                    </div>

                                    {/* Contact & Duration */}
                                    <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <svg className="size-4 text-ai-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            <span><strong className="text-white">{ref.contact}</strong>, {ref.title}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-400">
                                            <svg className="size-4 text-ai-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span>{ref.duration}</span>
                                        </div>
                                    </div>

                                    {/* Highlights */}
                                    <ul className="space-y-3">
                                        {ref.highlights.map((h, j) => (
                                            <li key={j} className="flex items-start gap-3 text-sm leading-relaxed text-gray-400">
                                                <svg className="mt-0.5 size-4 shrink-0 text-ai-blue" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                <span>{h}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </GlowCard>
                            </FadeInSection>
                        ))}
                    </div>

                    {/* Additional references */}
                    <FadeInSection delay={0.3}>
                        <div className="mx-auto max-w-4xl">
                            <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-gray-500">Additional Client References Available Upon Request</p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {additionalRefs.map((ref, i) => (
                                    <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-white">{ref.org}</h4>
                                            <span className="text-xs text-gray-500">{ref.duration}</span>
                                        </div>
                                        <p className="mb-2 text-xs leading-relaxed text-gray-400">{ref.desc}</p>
                                        <p className="text-xs text-gray-500">Contact: {ref.contact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        )
    }

    /* =============================================
       MODULE 5 — FINANCIAL & PROCUREMENT
       ============================================= */
    const Financial = () => {
        const benefits = [
            {
                icon: '📊',
                title: 'CAPEX Feasibility',
                description: 'The $24,500 fixed cost predictably avoids the endless OPEX subscription bills of SaaS models. Start assessment immediately without a complex board RFP mandate.',
            },
            {
                icon: '📑',
                title: 'Streamlined Procurement',
                description: 'One overarching Master Services Agreement (MSA) covers the entire 12 month engagement. Completely bypasses recurring vendor oversight burdens.',
            },
            {
                icon: '🏦',
                title: 'Texas R&D Tax Credit Maximization',
                description: 'Texas AI Consulting intentionally structures analytical deliverables to empower your CFO to confidently claim the Texas Subchapter T Research & Development tax credit.',
            },
            {
                icon: '🛡️',
                title: 'VetHUB Compliance Advantage',
                description: 'Engaging our VetHUB-certified SDVOSB directly supports state-mandated diversity procurement goals and mitigates "Good Faith Effort" audit liabilities.',
            },
        ]

        return (
            <section className="relative bg-gradient-to-b from-[#050a14] to-black py-20 md:py-28">
                <div className="container relative z-10 mx-auto px-6 md:px-12">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="Financially Optimized Procurement"
                            title="Built For Healthcare CFOs"
                            subtitle="Structured strictly to minimize vendor risk, eliminate unpredictable OPEX, and maximize state-level subsidies."
                        />
                    </FadeInSection>

                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
                        {benefits.map((b, i) => (
                            <FadeInSection key={i} delay={0.1 * (i + 1)}>
                                <GlowCard className="h-full border-[#ebcb4c]/10" glowColor="rgba(235,203,76,0.05)">
                                    <div className="mb-4 text-3xl">{b.icon}</div>
                                    <h3 className="mb-2 font-hesdeadjim text-base text-white md:text-lg">{b.title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-400">{b.description}</p>
                                </GlowCard>
                            </FadeInSection>
                        ))}
                    </div>

                    {/* Price callout */}
                    <FadeInSection delay={0.5}>
                        <div className="mt-14 text-center">
                            <div className="inline-block rounded-2xl border border-[#2c75ff]/30 bg-gradient-to-br from-[#0a1628] to-[#0e2042] p-10 backdrop-blur-md"
                                style={{ boxShadow: '0 0 50px rgba(44,117,255,0.15)' }}
                            >
                                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-ai-blue">Total Guaranteed Investment</p>
                                <p className="mb-2 font-hesdeadjim text-4xl tracking-wide text-white md:text-6xl">$24,500</p>
                                <p className="mx-auto max-w-sm text-sm text-gray-400">Comprehensive Fixed Fee executing the 1-Week Sprint & 11-Month Strategic Advisory</p>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        )
    }

    /* =============================================
       FORM SECTION
       ============================================= */
    const FormSection = () => (
        <section
            ref={formRef}
            id="assessment-form"
            className="relative bg-gradient-to-b from-black to-[#050a14] py-20 md:py-28"
        >
            {/* Glow decoration */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2c75ff]/5 blur-[150px]" />

            <div className="container relative z-10 mx-auto px-6 md:px-12">
                <FadeInSection>
                    <SectionHeading
                        eyebrow="Initiate The Process"
                        title="Request Your RHTP Readiness Assessment"
                        subtitle="Complete the executive intake form below and our leadership team will schedule your feasibility call within 48 hours."
                    />
                </FadeInSection>

                <FadeInSection delay={0.15}>
                    <div className="mx-auto max-w-2xl">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_0_50px_rgba(44,117,255,0.1)] transition-all hover:shadow-[0_0_60px_rgba(44,117,255,0.15)]">
                            <iframe
                                src="https://link.texasaiconsulting.com/widget/form/Y5nPHPgu01Tu6KGLFv11"
                                style={{ width: '100%', height: '100%', minHeight: '1204px', border: 'none', borderRadius: '3px' }}
                                id="inline-Y5nPHPgu01Tu6KGLFv11"
                                data-layout="{'id':'INLINE'}"
                                data-trigger-type="alwaysShow"
                                data-trigger-value=""
                                data-activation-type="alwaysActivated"
                                data-activation-value=""
                                data-deactivation-type="neverDeactivate"
                                data-deactivation-value=""
                                data-form-name="TX_AI_Website Form - TRS - Campaign"
                                data-height="1204"
                                data-layout-iframe-id="inline-Y5nPHPgu01Tu6KGLFv11"
                                data-form-id="Y5nPHPgu01Tu6KGLFv11"
                                title="TX_AI_Website Form - TRS - Campaign"
                            />
                        </div>
                    </div>
                </FadeInSection>
            </div>

            <Script src="https://link.texasaiconsulting.com/js/form_embed.js" strategy="lazyOnload" />
        </section>
    )

    /* =============================================
       FOOTER
       ============================================= */
    const Footer = () => (
        <footer className="relative border-t border-white/5 bg-black py-12">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex items-center gap-4">
                        <img src="/img/New-Texas-AI-Logo-V2-Full-Large.png" alt="Texas AI Consulting Logo" className="h-12 w-auto drop-shadow-[0_0_10px_rgba(44,117,255,0.3)]" />
                        <img src="/img/sdvosb-badge.png" alt="SDVOSB Badge" className="h-10 w-auto opacity-80" />
                    </div>
                    <div className="text-center text-sm text-gray-500 md:text-right">
                        <p className="font-hesdeadjim tracking-wide text-gray-400">TXAI CONSULTING LLC</p>
                        <p className="mt-1">
                            San Antonio, TX &nbsp;|&nbsp; <a href="tel:210-550-7258" className="text-gray-400 transition-colors hover:text-ai-blue">210-550-7258</a> &nbsp;|&nbsp; <a href="mailto:contact@texasaiconsulting.com" className="text-gray-400 transition-colors hover:text-ai-blue">contact@texasaiconsulting.com</a>
                        </p>
                        <p className="mt-3">
                            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ai-blue transition-colors hover:text-ai-gold">
                                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Return to texasaiconsulting.com
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )

    /* =============================================
       RENDER
       ============================================= */
    if (!isMounted) return null

    return (
        <main className="min-h-screen overflow-x-hidden bg-black text-white selection:bg-ai-blue selection:text-white">
            <Hero />
            <Problem />
            <Offer />
            <WhyUs />
            <References />
            <Financial />
            <FormSection />
            <Footer />
        </main>
    )
}
