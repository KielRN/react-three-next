'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FunnelHeader from '../components/FunnelHeader'
import TrustBadges from '../components/TrustBadges'
import PricingCards from '../components/PricingCards'

export default function GrowthPlatformAgreement() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    industry: 'Other',
    termsAccepted: false,
  })
  const [phoneError, setPhoneError] = useState('')
  const [plan, setPlan] = useState('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill from session if exists
  useEffect(() => {
    const saved = sessionStorage.getItem('gp_customer_info')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(prev => ({ ...prev, ...parsed }))
        if (parsed.plan) setPlan(parsed.plan)
      } catch (e) {
        console.error('Error parsing session data', e)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'phone') {
      // Strip non-digit characters
      const digits = value.replace(/\D/g, '').slice(0, 10)
      setFormData(prev => ({ ...prev, phone: digits }))
      setPhoneError(digits.length > 0 && digits.length < 10 ? 'Phone number must be 10 digits' : '')
      return
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Format phone for display: (XXX) XXX-XXXX
  const formatPhone = (digits) => {
    if (!digits) return ''
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.termsAccepted) return
    if (formData.phone.length !== 10) {
      setPhoneError('Phone number must be 10 digits')
      return
    }

    setIsSubmitting(true)

    // Read prior IDs (in case the user is resubmitting after going back)
    let opportunityId = ''
    let contactId = ''
    try {
      const prior = JSON.parse(sessionStorage.getItem('gp_customer_info') || '{}')
      opportunityId = prior.opportunityId || ''
      contactId = prior.contactId || ''
    } catch (_) { /* ignore */ }

    // Best-effort: register/update the lead in GHL pre-payment.
    // Failures here must not block the user from reaching checkout —
    // the Stripe webhook will create an opportunity as a fallback.
    try {
      const res = await fetch('/api/ghl/agreement-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          plan,
          opportunityId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        opportunityId = data.opportunityId || opportunityId
        contactId = data.contactId || contactId
      } else {
        console.warn('GHL agreement-lead returned', res.status)
      }
    } catch (err) {
      console.warn('GHL agreement-lead call failed:', err)
    }

    const sessionData = { ...formData, plan, opportunityId, contactId }
    sessionStorage.setItem('gp_customer_info', JSON.stringify(sessionData))

    router.push('/funnels/growth-platform/checkout')
  }

  return (
    <main className="section-txai">
      <FunnelHeader currentStep={2} />

      <div className="section-container-txai animate-fade-up-txai" style={{ marginTop: '40px' }}>
        <h2 style={{ textAlign: 'center' }}>Step 2: Service Agreement</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
          Please review the terms and provide your business information to continue.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Plan Selection */}
          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ marginBottom: '20px', color: '#1a1a1a' }}>1. Select Your License Plan</h4>
            <PricingCards 
              selected={plan} 
              onSelect={setPlan} 
              variant="light" 
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '40px 0' }} />

          {/* Business Info */}
          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ marginBottom: '20px', color: '#1a1a1a' }}>2. Entity Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>FIRST NAME</label>
                <input 
                  type="text" name="firstName" required className="input-light-txai"
                  placeholder="John" value={formData.firstName} onChange={handleChange}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>LAST NAME</label>
                <input 
                  type="text" name="lastName" required className="input-light-txai"
                  placeholder="Doe" value={formData.lastName} onChange={handleChange}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>EMAIL ADDRESS</label>
                <input 
                  type="email" name="email" required className="input-light-txai"
                  placeholder="john@business.com" value={formData.email} onChange={handleChange}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>PHONE NUMBER</label>
                <input 
                  type="tel" name="phone" required className="input-light-txai"
                  placeholder="(210) 555-0199" value={formatPhone(formData.phone)} onChange={handleChange}
                  pattern="\(\d{3}\) \d{3}-\d{4}"
                  title="Please enter a valid 10-digit phone number"
                />
                {phoneError && <span style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px', display: 'block' }}>{phoneError}</span>}
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>BUSINESS NAME</label>
                <input 
                  type="text" name="businessName" required className="input-light-txai"
                  placeholder="Acme Growth Inc." value={formData.businessName} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Acknowledgement */}
          <div style={{ 
            background: '#1a1a1a', 
            color: '#fff', 
            padding: '30px', 
            borderRadius: '4px',
            fontFamily: "'Space Mono', monospace"
          }}>
            <h4 style={{ color: '#ebcb4c', marginTop: 0 }}>SERVICE ACKNOWLEDGEMENT</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '13px', color: '#bbb', marginBottom: '20px' }}>
              <p>By proceeding, Client acknowledges and agrees to the following core terms:</p>
              <ul>
                <li>12-Month minimum service term for local business licenses.</li>
                <li>TCPA/A2P Compliance: Client is responsible for all messaging consent.</li>
                <li>Managed SaaS: The platform is provided as-is with ongoing maintenance.</li>
                <li>Termination: 30-day notice required after initial term.</li>
              </ul>
              <p>For full legal details, please review our Master Services Agreement.</p>
            </div>
            
            <Link href="/funnels/growth-platform/agreement/msa" target="_blank" style={{ 
              color: '#ebcb4c', fontSize: '13px', display: 'block', marginBottom: '20px' 
            }}>
              VIEW FULL MASTER SERVICES AGREEMENT (MSA) ↗
            </Link>

            <div style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', marginBottom: '20px' }}>
                <input 
                  type="checkbox" name="termsAccepted" required 
                  checked={formData.termsAccepted} onChange={handleChange}
                />
                <span style={{ fontSize: '13px' }}>I have read and agree to the Master Services Agreement.</span>
              </label>

            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <button 
              type="submit" 
              className="btn-solid-txai" 
              style={{ width: '100%' }}
              disabled={isSubmitting || !formData.termsAccepted}
            >
              {isSubmitting ? 'PROCESSING...' : 'SIGN & GO TO CHECKOUT'}
            </button>
          </div>
        </form>

        <TrustBadges />
      </div>
    </main>
  )
}
