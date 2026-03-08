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
            className={`relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1628]/90 to-[#0e2042]/80 backdrop-blur-md p-6 md:p-8 transition-all duration-300 hover:border-[#2c75ff]/40 hover:scale-[1.02] ${className}`}
            style={{ boxShadow: `0 0 30px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)` }}
        >
            {children}
        </div>
    )
}

function SectionHeading({ eyebrow, title, subtitle }) {
    return (
        <div className="text-center mb-12 md:mb-16">
            {eyebrow && (
                <span className="inline-block text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-[#2c75ff] mb-3 px-4 py-1.5 rounded-full border border-[#2c75ff]/30 bg-[#2c75ff]/5">
                    {eyebrow}
                </span>
            )}
            <h2 className="font-hesdeadjim text-2xl md:text-4xl lg:text-5xl text-white mt-4 leading-tight">{title}</h2>
            {subtitle && <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-base md:text-lg">{subtitle}</p>}
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
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src="/img/nurse-meta-glasses.jpg"
                    alt="A professional nurse wearing Meta Ray-Ban smart glasses conducts a patient assessment with augmented reality clinical data overlays"
                    className="w-full h-full object-cover object-top"
                />
                {/* Multi-layer gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
            </div>

            {/* Subtle animated grid lines */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(44,117,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(44,117,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
            />

            <div className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-32">
                <div className="max-w-3xl">
                    {/* Precision AI tag */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase text-[#2c75ff] mb-6 px-4 py-2 rounded-full border border-[#2c75ff]/30 bg-[#2c75ff]/5 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-[#2c75ff] animate-pulse" />
                            Precision AI — Rural Healthcare
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="font-hesdeadjim text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-6"
                    >
                        Stop Losing Clinical Hours to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2c75ff] to-[#6c97a5]">
                            Legacy Fax Workflows.
                        </span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed max-w-2xl"
                    >
                        Secure your facility&apos;s role in the <strong className="text-white">$1.4 Billion Rural Health Transformation Program (RHTP)</strong> with an AI-driven modernization roadmap.
                    </motion.p>

                    {/* Value prop */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="text-base md:text-lg text-gray-400 mb-10 leading-relaxed max-w-2xl"
                    >
                        A 12-month strategic partnership starting with a 1-week rapid discovery sprint, led by an <strong className="text-[#ebcb4c]">RN with 20+ years of bedside experience</strong> and IBM-certified AI engineering credentials.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <button
                            onClick={scrollToForm}
                            className="group relative px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wider overflow-hidden transition-all duration-300 hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #2c75ff, #1a5ecc)',
                                boxShadow: '0 0 25px rgba(44,117,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                            }}
                        >
                            <span className="relative z-10 text-white">Request Your RHTP Readiness Assessment</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1a5ecc] to-[#2c75ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </motion.div>

                    {/* Trust badges row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.9 }}
                        className="flex flex-wrap items-center gap-6 mt-10 text-sm text-gray-400"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#ebcb4c]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#ebcb4c]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span>Veteran-Owned (SDVOSB)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#ebcb4c]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span>IBM AI Certified</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )

    /* =============================================
       MODULE 2 — THE CORE PROBLEM
       ============================================= */
    const Problem = () => {
        const painPoints = [
            {
                icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                title: 'Clinical Burnout',
                description: 'Nurses and HIM staff spend hours on manual data entry from faxes into EMRs — time that should be spent on patient care.',
            },
            {
                icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                title: '"Shadow Workflows"',
                description: 'Sticky notes, manual referral logs in Excel, and print-scan-shred cycles hide inefficiency and create compliance gaps.',
            },
            {
                icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                ),
                title: 'Data Silos',
                description: 'Disconnected legacy EMRs prevent real-time patient care coordination and block participation in value-based care programs.',
            },
        ]

        return (
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-black to-[#050a14]">
                {/* Subtle grid background */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(44,117,255,0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }}
                />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="The Modernization Paradox"
                            title="Your Fax Machine Is Costing You More Than Paper"
                            subtitle="Rural hospitals are the backbone of their communities — but legacy systems and manual fax workflows are creating an unsustainable burden."
                        />
                    </FadeInSection>

                    {/* Compliance risk callout */}
                    <FadeInSection delay={0.15}>
                        <div className="max-w-3xl mx-auto mb-14 p-6 rounded-xl border border-[#ebcb4c]/20 bg-[#ebcb4c]/5 backdrop-blur-sm text-center">
                            <p className="text-[#ebcb4c] font-bold text-sm md:text-base uppercase tracking-wider mb-2">
                                ⚠ RHTP Compliance Risk
                            </p>
                            <p className="text-gray-300 text-sm md:text-base">
                                The Rural Health Transformation Program targets a reduction in human fax processing. Facilities that don&apos;t modernize risk falling behind <strong className="text-white">state performance metrics and future grant eligibility</strong>.
                            </p>
                        </div>
                    </FadeInSection>

                    {/* Pain point cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {painPoints.map((point, i) => (
                            <FadeInSection key={i} delay={0.1 * (i + 1)}>
                                <GlowCard className="h-full text-center" glowColor="rgba(44,117,255,0.1)">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#2c75ff]/20 to-[#2c75ff]/5 text-[#2c75ff] mb-5">
                                        {point.icon}
                                    </div>
                                    <h3 className="font-hesdeadjim text-lg md:text-xl text-white mb-3">{point.title}</h3>
                                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">{point.description}</p>
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
                title: 'Discovery & Workflow Mapping',
                desc: 'Tracing the "Life of a Fax" from receipt to EMR entry. Identifying bottlenecks, manual data entry points, and shadow workflows.',
            },
            {
                day: 'Day 2',
                title: 'Infrastructure & Integration',
                desc: 'Deep-dive with IT: EMR ingestion capabilities (HL7/FHIR), network topology, security protocols, and HIPAA/Zero-Trust compliance.',
            },
            {
                day: 'Day 3',
                title: 'Synthesis & Blueprint',
                desc: 'Developing "Current State" vs. "Future State" architecture, calculating ROI, and designing a Human-in-the-Loop safety model.',
            },
            {
                day: 'Day 4',
                title: 'AI Education & Executive Presentation',
                desc: 'A 2–3 hour executive session demystifying AI, presenting the tailored modernization blueprint, and outlining a phased rollout plan.',
            },
        ]

        return (
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#050a14] to-black overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#2c75ff]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#ebcb4c]/5 rounded-full blur-[120px]" />

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="$24,500 Fixed-Fee Engagement"
                            title="The AI Fax & Workflow Assessment"
                            subtitle="A 12-month strategic partnership structured in two phases — no hidden costs, no recurring invoices."
                        />
                    </FadeInSection>

                    {/* Phase 1 */}
                    <FadeInSection delay={0.1}>
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#2c75ff]/50 to-transparent" />
                                <span className="text-[#2c75ff] font-bold text-sm tracking-[0.2em] uppercase whitespace-nowrap">Phase 1 — The 1-Week Sprint</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-[#2c75ff]/50 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {sprintDays.map((d, i) => (
                                    <FadeInSection key={i} delay={0.08 * (i + 1)}>
                                        <GlowCard className="h-full">
                                            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#ebcb4c] mb-3 px-3 py-1 rounded-md bg-[#ebcb4c]/10 border border-[#ebcb4c]/20">
                                                {d.day}
                                            </span>
                                            <h4 className="font-hesdeadjim text-base md:text-lg text-white mb-3">{d.title}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{d.desc}</p>
                                        </GlowCard>
                                    </FadeInSection>
                                ))}
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Phase 2 */}
                    <FadeInSection delay={0.2}>
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#ebcb4c]/50 to-transparent" />
                                <span className="text-[#ebcb4c] font-bold text-sm tracking-[0.2em] uppercase whitespace-nowrap">Phase 2 — 11 Months of Advisory</span>
                                <div className="h-px flex-1 bg-gradient-to-l from-[#ebcb4c]/50 to-transparent" />
                            </div>

                            <GlowCard glowColor="rgba(235,203,76,0.1)" className="max-w-3xl mx-auto">
                                <div className="text-center mb-6">
                                    <p className="text-[#ebcb4c] font-bold text-lg md:text-xl mb-1">2 Hours / Month — Included</p>
                                    <p className="text-gray-400 text-sm">A $6,600 value included automatically in your engagement</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                                        <h5 className="text-white font-bold text-sm mb-2">Hour 1: Problem Assessment & Strategy</h5>
                                        <p className="text-gray-400 text-sm leading-relaxed">Hospital leadership presents an emerging challenge. We assess how AI can provide a cost-effective solution.</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                                        <h5 className="text-white font-bold text-sm mb-2">Hour 2: Executive Education & Documentation</h5>
                                        <p className="text-gray-400 text-sm leading-relaxed">Customized AI literacy training via documented Zoom brief — satisfying RHTP Initiative #3 digital literacy mandates.</p>
                                    </div>
                                </div>
                            </GlowCard>
                        </div>
                    </FadeInSection>

                    {/* Deliverables */}
                    <FadeInSection delay={0.3}>
                        <div className="mt-16 max-w-3xl mx-auto">
                            <h3 className="font-hesdeadjim text-xl text-white text-center mb-8">What You Receive</h3>
                            <div className="space-y-4">
                                {[
                                    'Current State vs. Target Solution Gap Analysis',
                                    'AI Integration Blueprint & Vendor-Neutral Roadmap (RHTP-ready)',
                                    'On-Site AI Education Workshop for Leadership & Clinical Staff',
                                    '11 Months of Documented Digital Literacy Training (Initiative #3 compliant)',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2c75ff]/10 flex items-center justify-center text-[#2c75ff] font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <p className="text-gray-300 text-sm md:text-base">{item}</p>
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
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                ),
                title: 'Dual Clinical + Technical Expertise',
                description: '20+ years as a Registered Nurse (ED, ICU, PCU) combined with IBM AI Engineering and Full Stack Development certifications, plus an MBA. We understand clinical workflows at the bedside level.',
                accent: '#2c75ff',
            },
            {
                icon: null, // We'll use the SDVOSB badge image
                title: 'Mission-Driven Veteran-Owned',
                description: 'Service-Disabled Veteran-Owned Small Business (SDVOSB). U.S. Air Force Flight Nurse with 5 combat deployments. VetHUB certified — fewer than 500 firms statewide.',
                accent: '#ebcb4c',
                useBadge: true,
            },
            {
                icon: (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                ),
                title: 'Enterprise Healthcare Proven',
                description: 'Built enterprise applications and ETL data pipelines for HCA Methodist Healthcare System — including STRAC clinician access automation and SafetyNET reporting.',
                accent: '#6c97a5',
            },
        ]

        return (
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-black to-[#050a14]">
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="Your Consulting Partner"
                            title="Why Texas AI Consulting?"
                            subtitle="We don't just bring IT consultants — we bring clinical context."
                        />
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {credentials.map((cred, i) => (
                            <FadeInSection key={i} delay={0.12 * (i + 1)}>
                                <GlowCard className="h-full text-center" glowColor={`${cred.accent}22`}>
                                    <div className="flex justify-center mb-5">
                                        {cred.useBadge ? (
                                            <img src="/img/sdvosb-badge.png" alt="Service-Disabled Veteran-Owned Small Business Badge" className="h-16 w-auto object-contain" />
                                        ) : (
                                            <div
                                                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
                                                style={{ background: `linear-gradient(135deg, ${cred.accent}20, ${cred.accent}08)`, color: cred.accent }}
                                            >
                                                {cred.icon}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-hesdeadjim text-lg md:text-xl text-white mb-3">{cred.title}</h3>
                                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">{cred.description}</p>
                                </GlowCard>
                            </FadeInSection>
                        ))}
                    </div>

                    {/* Led by */}
                    <FadeInSection delay={0.4}>
                        <div className="mt-14 max-w-2xl mx-auto text-center">
                            <p className="text-gray-400 text-sm md:text-base italic">
                                Led by <strong className="text-white not-italic">Eliud &quot;Elliott&quot; Lamboy, RN, MBA</strong> — former Senior Business Analyst on the HCA/Methodist App Dev team.
                            </p>
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
                icon: '💰',
                title: 'Low Barrier to Entry',
                description: 'The $24,500 fee often falls under discretionary spending thresholds — start immediately without a lengthy RFP process.',
            },
            {
                icon: '📋',
                title: 'Simplified Procurement',
                description: 'One PO, no OPEX — eliminates the administrative burden of processing recurring monthly invoices.',
            },
            {
                icon: '🏛️',
                title: 'Texas R&D Tax Credit',
                description: 'TxAI structures Statements of Work to help clients qualify for the Texas Subchapter T R&D tax credit — approximately 8.7% offset.',
            },
            {
                icon: '🎖️',
                title: 'VetHUB Compliance',
                description: 'Engaging a VetHUB-certified SDVOSB supports state-mandated diversity procurement goals and "Good Faith Effort" compliance.',
            },
        ]

        return (
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#050a14] to-black">
                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <FadeInSection>
                        <SectionHeading
                            eyebrow="Smart Procurement"
                            title="Financial & Procurement Advantages"
                            subtitle="Structured to make the decision easy for hospital administrators."
                        />
                    </FadeInSection>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {benefits.map((b, i) => (
                            <FadeInSection key={i} delay={0.1 * (i + 1)}>
                                <GlowCard className="h-full" glowColor="rgba(235,203,76,0.08)">
                                    <div className="text-3xl mb-4">{b.icon}</div>
                                    <h3 className="font-hesdeadjim text-base md:text-lg text-white mb-2">{b.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{b.description}</p>
                                </GlowCard>
                            </FadeInSection>
                        ))}
                    </div>

                    {/* Price callout */}
                    <FadeInSection delay={0.5}>
                        <div className="mt-14 text-center">
                            <div className="inline-block p-8 rounded-2xl border border-[#2c75ff]/20 bg-gradient-to-br from-[#0a1628]/90 to-[#0e2042]/80 backdrop-blur-md"
                                style={{ boxShadow: '0 0 40px rgba(44,117,255,0.15)' }}
                            >
                                <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Investment</p>
                                <p className="text-4xl md:text-5xl font-bold text-white mb-1">$24,500</p>
                                <p className="text-gray-400 text-sm">Comprehensive Fixed Fee — Sprint + 11 Months Advisory</p>
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
            className="relative py-20 md:py-28 bg-gradient-to-b from-black to-[#050a14]"
        >
            {/* Glow decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2c75ff]/5 rounded-full blur-[150px]" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <FadeInSection>
                    <SectionHeading
                        eyebrow="Get Started"
                        title="Request Your RHTP Readiness Assessment"
                        subtitle="Complete the form below and we'll schedule your discovery call within 48 hours."
                    />
                </FadeInSection>

                <FadeInSection delay={0.15}>
                    <div className="max-w-2xl mx-auto">
                        <div className="rounded-2xl border border-white/10 bg-white overflow-hidden"
                            style={{ boxShadow: '0 0 50px rgba(44,117,255,0.1)' }}
                        >
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
        <footer className="relative py-12 border-t border-white/5 bg-black">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/img/New-Texas-AI-Logo-V2-Full-Large.png" alt="Texas AI Consulting Logo" className="h-12 w-auto" />
                        <img src="/img/sdvosb-badge.png" alt="SDVOSB Badge" className="h-10 w-auto opacity-70" />
                    </div>
                    <div className="text-center md:text-right text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} TxAI Consulting LLC — Texas AI Consulting</p>
                        <p className="mt-1">
                            San Antonio, TX &nbsp;|&nbsp; <a href="tel:210-664-4093" className="text-gray-400 hover:text-[#2c75ff] transition-colors">210-664-4093</a> &nbsp;|&nbsp; <a href="mailto:contact@texasaiconsulting.com" className="text-gray-400 hover:text-[#2c75ff] transition-colors">contact@texasaiconsulting.com</a>
                        </p>
                        <p className="mt-2">
                            <Link href="/" className="text-[#2c75ff] hover:text-[#ebcb4c] transition-colors text-xs uppercase tracking-wider">
                                ← Back to texasaiconsulting.com
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
        <main className="bg-black min-h-screen text-white overflow-x-hidden">
            <Hero />
            <Problem />
            <Offer />
            <WhyUs />
            <Financial />
            <FormSection />
            <Footer />
        </main>
    )
}
