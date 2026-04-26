import Link from 'next/link'

export const metadata = {
  title: 'Master Services Agreement | Texas AI Consulting',
  robots: 'noindex, nofollow',
}

export default function MSAPage() {
  return (
    <main className="section-txai" style={{ background: '#000', minHeight: '100vh', padding: '100px 20px' }}>
      <div className="msa-content animate-fade-up-txai">
        <Link href="/funnels/growth-platform/agreement" style={{ 
          color: '#ebcb4c', 
          textDecoration: 'none', 
          fontSize: '14px', 
          display: 'block', 
          marginBottom: '40px' 
        }}>
          ← BACK TO AGREEMENT
        </Link>
        
        <h1>MASTER SERVICES AGREEMENT & ORDER FORM</h1>
        <p><strong>TEXAS AI CONSULTING</strong> (&quot;Provider&quot;)<br />
        1248 FM 78 Ste 102 PMB 2006<br />
        Schertz, TX 78154</p>

        <h3>1. SERVICE ORDER FORM</h3>
        <p>By proceeding to payment, the Client agrees to subscribe to the Growth Platform Services, subject to the Terms and Conditions attached hereto.</p>

        <table>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>The AI Voice Agent</strong></td>
              <td>Intelligent 24/7 inbound voice interface for routing and booking.</td>
              <td>INCLUDED</td>
            </tr>
            <tr>
              <td><strong>Automated Invoicing</strong></td>
              <td>Automated revenue recovery and invoice follow-up engine.</td>
              <td>INCLUDED</td>
            </tr>
            <tr>
              <td><strong>Reputation Management</strong></td>
              <td>24/7 review monitoring, response, and generation system.</td>
              <td>INCLUDED</td>
            </tr>
            <tr>
              <td><strong>Full CRM & Funnels</strong></td>
              <td>The core Growth Platform engine.</td>
              <td>INCLUDED</td>
            </tr>
          </tbody>
        </table>

        <h3>STANDARD TERMS AND CONDITIONS</h3>

        <h4>1. DEFINITIONS</h4>
        <ul>
          <li>&quot;Services&quot; means the specific software and automation products selected in the Service Order Form.</li>
          <li>&quot;Provider IP&quot; means all software, source code, AI models, prompts, automation workflows, and documentation owned or developed by Provider.</li>
          <li>&quot;Client Data&quot; means all data, content, and information provided by Client to Provider for use with the Services.</li>
        </ul>

        <h4>2. SERVICES & EXCLUSIONS</h4>
        <p><strong>2.1 Scope of Services.</strong> Provider agrees to provide the Services selected in the Service Order Form. The Services are provided as a managed software-as-a-service (SaaS) solution.</p>
        <p><strong>2.2 No Professional Services.</strong> Unless explicitly stated in a separate Statement of Work (SOW), this Agreement does not include custom software development, IT network configuration, or hardware procurement.</p>

        <h4>3. CLIENT OBLIGATIONS & WARRANTIES</h4>
        <p><strong>3.1 Compliance with Laws.</strong> Client represents and warrants that it will use the Services in full compliance with all applicable local, state, and federal laws, including TCPA, TSR, CAN-SPAM, and FDCPA.</p>
        <p><strong>3.2 Consent to Contact.</strong> Client warrants that it has obtained all necessary prior express written consents from any individuals whose contact information is provided to the Services.</p>

        <h4>4. FEES AND PAYMENT</h4>
        <p><strong>4.1 Subscription Fees.</strong> Fees are billed in advance on the 1st of each month.</p>
        <p><strong>4.2 Automatic Payment.</strong> Client authorizes Provider to automatically charge the payment method on file for all fees due.</p>

        <h4>5. THE &quot;NO-RISK&quot; GUARANTEE</h4>
        <p>If Client is not satisfied with the results or efficiency of the Services after the first <strong>three (3) months</strong> of the Term, Provider will issue a <strong>100% refund</strong> of all subscription fees paid under this Agreement.</p>

        <h4>6. PROPRIETARY RIGHTS</h4>
        <p><strong>6.1 Provider Ownership.</strong> Provider retains all right, title, and interest in and to Provider IP. Client receives a limited, non-exclusive license to use the Services.</p>
        
        <h4>11. GENERAL PROVISIONS</h4>
        <p><strong>11.1 Governing Law.</strong> This Agreement shall be governed by the laws of the <strong>State of Texas</strong>.</p>
        <p><strong>11.2 Venue.</strong> Any legal action shall be brought exclusively in <strong>Guadalupe County or Bexar County, Texas</strong>.</p>

        <div style={{ marginTop: '60px', padding: '20px', border: '1px solid #333' }}>
          <p style={{ color: '#ebcb4c' }}>NOTE: This is a digital rendering of the Master Services Agreement for review purposes. By signing the acknowledgement form on the previous page and completing the payment on the following page, you are legally agreeing to these terms.</p>
        </div>
      </div>
    </main>
  )
}
