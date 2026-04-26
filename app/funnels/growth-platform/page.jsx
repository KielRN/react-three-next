import Link from 'next/link'
import FunnelHeader from './components/FunnelHeader'
import TrustBadges from './components/TrustBadges'

export const metadata = {
  title: 'Growth Platform — All-In-One CRM & Marketing | Texas AI',
  description: 'Replace 5+ tools with one. CRM, email, SMS, funnels, calendars, and AI automation for $99/mo.',
}

export default function GrowthPlatformLanding() {
  return (
    <main className="section-txai">
      <FunnelHeader currentStep={1} />

      <div className="section-container-txai animate-fade-up-txai" style={{ marginTop: '40px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="text-hero-txai">
            THE <span className="text-gradient-txai">GROWTH PLATFORM</span>
          </h1>
          <p className="text-subhero-txai" style={{ color: '#555', marginTop: '-10px' }}>
            COMMAND CENTER FOR YOUR BUSINESS
          </p>
          <div style={{ 
            maxWidth: '800px', 
            margin: '20px auto', 
            padding: '20px', 
            background: '#000', 
            color: '#ebcb4c',
            border: '2px dashed #ebcb4c',
            fontFamily: "'Space Mono', monospace"
          }}>
            STOP PAYING THE &quot;TOOL-STACK TAX&quot;
          </div>
        </div>

        {/* Value Prop Cards */}
        <div className="grid-txai">
          <div className="card-txai heritage-card-txai">
            <h3>Unified CRM</h3>
            <p className="text-meta-txai">Stop losing leads in spreadsheets. Track every opportunity from first click to final invoice in one place.</p>
          </div>
          <div className="card-txai blue-card-txai">
            <h3>Omnichannel Marketing</h3>
            <p className="text-meta-txai">Email, SMS, and Social Media automations that work while you sleep. Reach your customers where they are.</p>
          </div>
          <div className="card-txai heritage-card-txai">
            <h3>AI Automation</h3>
            <p className="text-meta-txai">The Digital Associate engine. Automate follow-ups, appointment setting, and customer support.</p>
          </div>
        </div>

        {/* The Problem vs Solution */}
        <div style={{ marginTop: '80px' }}>
          <h2 style={{ textAlign: 'center' }}>WHY GROWTH PLATFORM?</h2>
          <div className="grid-txai">
            <div style={{ flex: 1, padding: '20px' }}>
              <h4 style={{ color: '#ff4444' }}>THE TOOL-STACK TAX</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>❌ ClickFunnels: $297/mo</li>
                <li>❌ Mailchimp: $150/mo</li>
                <li>❌ Calendly: $15/mo</li>
                <li>❌ HubSpot: $450/mo</li>
                <li>❌ Twilio: $Pay-As-You-Go</li>
                <li style={{ marginTop: '10px', fontWeight: 'bold' }}>TOTAL: $912+/MO</li>
              </ul>
            </div>
            <div style={{ flex: 1, padding: '20px', borderLeft: '2px solid #ebcb4c' }}>
              <h4 style={{ color: '#2c75ff' }}>THE GROWTH PLATFORM</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>✅ Funnel Builder: INCLUDED</li>
                <li>✅ Email + SMS: INCLUDED</li>
                <li>✅ Calendar Sync: INCLUDED</li>
                <li>✅ Advanced CRM: INCLUDED</li>
                <li>✅ AI Workflows: INCLUDED</li>
                <li style={{ marginTop: '10px', fontWeight: 'bold', color: '#ebcb4c' }}>TOTAL: $99/MO</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ marginTop: '60px', padding: '40px', background: '#f0f0f0', borderRadius: '4px' }}>
          <h3 style={{ textAlign: 'center' }}>EVERYTHING IN THE BOX</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ fontSize: '14px' }}>✓ Unlimited Funnels</div>
            <div style={{ fontSize: '14px' }}>✓ Unlimited Contacts</div>
            <div style={{ fontSize: '14px' }}>✓ Reputation Management</div>
            <div style={{ fontSize: '14px' }}>✓ Mobile App (iOS/Android)</div>
            <div style={{ fontSize: '14px' }}>✓ Workflow Automation</div>
            <div style={{ fontSize: '14px' }}>✓ Invoicing & Payments</div>
            <div style={{ fontSize: '14px' }}>✓ Two-Way SMS/Email</div>
            <div style={{ fontSize: '14px' }}>✓ GMB & Social Posting</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <Link href="/funnels/growth-platform/agreement">
            <button className="btn-solid-txai" style={{ width: '100%', maxWidth: '500px' }}>
              ACTIVATE THE PLATFORM — START STEP 2
            </button>
          </Link>
          <p style={{ fontSize: '12px', marginTop: '15px', color: '#666' }}>
            * 100% Risk-Free Guarantee. Month-to-month. No long term contracts.
          </p>
        </div>

        <TrustBadges />
      </div>
    </main>
  )
}
