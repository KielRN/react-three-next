'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import FunnelHeader from '../components/FunnelHeader'
import TrustBadges from '../components/TrustBadges'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (sessionId) {
      setSuccess(true)
      // Clear session data on success
      sessionStorage.removeItem('gp_customer_info')
    }
  }, [sessionId])

  return (
    <div className="section-container-txai animate-fade-up-txai" style={{ marginTop: '40px', textAlign: 'center' }}>
      <div style={{ padding: '40px 0' }}>
        <div style={{ 
          fontSize: '80px', 
          color: '#ebcb4c', 
          marginBottom: '20px',
          textShadow: '0 0 20px rgba(235, 203, 76, 0.4)'
        }}>
          🏆
        </div>
        <h1 className="text-hero-txai">WELCOME TO THE<br />
          <span className="text-gradient-txai">GROWTH PLATFORM</span>
        </h1>
        <p className="text-subhero-txai" style={{ color: '#2c75ff', marginTop: '10px' }}>
          YOUR LICENSE IS NOW ACTIVE
        </p>
      </div>

      <div style={{ 
        background: '#000', 
        color: '#ebcb4c', 
        padding: '40px', 
        borderRadius: '4px',
        border: '2px solid #ebcb4c',
        textAlign: 'left',
        marginTop: '40px'
      }}>
        <h3 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          ONBOARDING TIMELINE: WEEK 1 - 4
        </h3>
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          <div>
            <strong style={{ color: '#ebcb4c' }}>WEEK 1: KICKOFF & CONFIG</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bbb' }}>Check your email for the kickoff booking link. We&apos;ll configure your DNS, Domain, and core CRM settings.</p>
          </div>
          <div>
            <strong style={{ color: '#ebcb4c' }}>WEEK 2: DATA HYGIENE</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bbb' }}>We import your existing contacts, tags, and pipelines and clean up any &quot;junk&quot; data.</p>
          </div>
          <div>
            <strong style={{ color: '#ebcb4c' }}>WEEK 3: AUTOMATION ENGINE</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bbb' }}>Building your Digital Associate workflows, SMS templates, and reputation management triggers.</p>
          </div>
          <div>
            <strong style={{ color: '#ebcb4c' }}>WEEK 4: GO LIVE & TRAINING</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#bbb' }}>Final walkthrough, training session for your team, and full platform handoff.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '60px' }}>
        <h4 style={{ color: '#1a1a1a' }}>NEXT STEPS</h4>
        <div className="grid-txai">
          <div className="card-txai blue-card-txai" style={{ flex: 1 }}>
            <h5>SCHEDULE KICKOFF</h5>
            <p style={{ fontSize: '13px' }}>Book your Week 1 onboarding strategy session with our team.</p>
            <a href="https://link.texasaiconsulting.com/widget/booking/QvjdHXPK68aTVKU30GOG" target="_blank" rel="noopener noreferrer" className="btn-solid-txai" style={{ fontSize: '14px', padding: '10px 20px', display: 'inline-block', textDecoration: 'none' }}>BOOK NOW</a>
          </div>
          <div className="card-txai heritage-card-txai" style={{ flex: 1 }}>
            <h5>CHECK EMAIL</h5>
            <p style={{ fontSize: '13px' }}>We sent a copy of your signed agreement and login instructions to your inbox.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '60px', padding: '20px', borderTop: '1px solid #e0e0e0' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Need immediate help? Contact Elliott at <strong>210-550-7258</strong> or <strong>elliott@texasaiconsulting.com</strong>
        </p>
      </div>

      <TrustBadges />
    </div>
  )
}

export default function GrowthPlatformThankYou() {
  return (
    <main className="section-txai">
      <FunnelHeader currentStep={3} />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px', color: '#ebcb4c' }}>Loading...</div>}>
        <ThankYouContent />
      </Suspense>
    </main>
  )
}
