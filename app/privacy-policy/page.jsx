import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Texas AI Consulting — how we collect, use, share, and protect your information, including SMS opt-in data and your rights.',
  alternates: {
    canonical: 'https://texasaiconsulting.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Texas AI Consulting',
    description:
      'How Texas AI Consulting collects, uses, shares, and protects your information, including SMS opt-in data and your rights.',
    url: 'https://texasaiconsulting.com/privacy-policy',
    type: 'article',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50'>
      <header className='bg-[#0e2042] text-white py-10'>
        <div className='container mx-auto px-4 max-w-4xl'>
          <p className='text-xs tracking-widest uppercase text-[#ebcb4c] mb-2'>Texas AI Consulting</p>
          <h1 className='text-3xl md:text-4xl font-bold'>Privacy Policy</h1>
          <p className='text-gray-300 mt-2 text-sm'>Effective Date: January 1, 2026</p>
        </div>
      </header>

      <main className='container mx-auto px-4 py-10 max-w-4xl'>
        <article className='bg-white rounded-2xl shadow-xl p-6 md:p-10 text-gray-800 leading-relaxed'>
          <section className='mb-8 border-l-4 border-[#ebcb4c] bg-yellow-50 p-4 rounded'>
            <h2 className='text-lg font-bold text-[#0e2042] mb-2'>Important Notice Regarding Text Messaging Data</h2>
            <p>
              Texas AI Consulting (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) <strong>DOES NOT</strong>{' '}
              share customer opt-in information, including phone numbers and consent records, with any affiliates or
              third parties for marketing, promotional, or any other purposes unrelated to providing our direct
              services. All text messaging originator opt-in data is kept strictly confidential.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>1. Information We Collect</h2>
            <p className='mb-3'>We collect the following types of information:</p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Personal Information</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Name, email address, phone number, physical address</li>
              <li>Payment information when you make a purchase or request a quote</li>
              <li>Opt-in records and timestamps for all communication channels (SMS, email, etc.)</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Non-Personal Information</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>IP address, browser type, device information</li>
              <li>Website usage patterns and analytics</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Customer Communication</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Records of inquiries and service requests</li>
              <li>Appointment details and preferences</li>
              <li>Service history and feedback</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>2. How We Use Your Information</h2>
            <p className='mb-3'>We use collected data for:</p>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Providing and improving our services</li>
              <li>Processing transactions and payments</li>
              <li>Communicating with you about your inquiries, appointments, and promotions</li>
              <li>Enhancing website functionality and user experience</li>
              <li>Ensuring security and fraud prevention</li>
              <li>Maintaining records of your communication preferences and consent</li>
            </ul>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>3. SMS Messaging &amp; Compliance</h2>
            <h3 className='text-lg font-semibold text-[#0e2042] mb-2'>Text Message Program Terms &amp; Conditions</h3>
            <p className='mb-4'>
              By opting into our SMS messaging services, you agree to receive text messages related to our services,
              including appointment reminders, customer support, and important updates.
            </p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Opt-In &amp; Consent</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>You will only receive messages if you have explicitly opted in</li>
              <li>We maintain timestamped records of all opt-in actions</li>
              <li>We comply with the Telephone Consumer Protection Act (TCPA) and all applicable laws</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Opt-Out Instructions</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>
                You can cancel SMS notifications at any time by replying <strong>&ldquo;STOP&rdquo;</strong>
              </li>
              <li>
                You will receive a final confirmation message, and no further messages will be sent unless you re-opt in
              </li>
              <li>All opt-out requests are processed immediately</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Message Frequency &amp; Content</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Message frequency varies based on your interactions with our business</li>
              <li>Messages will be directly related to the services you have requested</li>
              <li>We do not send promotional content without specific consent</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Help &amp; Support</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>
                Reply <strong>&ldquo;HELP&rdquo;</strong> for assistance or contact us at{' '}
                <a className='text-[#2c75ff] underline' href='mailto:contact@texasaiconsulting.com'>
                  contact@texasaiconsulting.com
                </a>
              </li>
              <li>Customer support is available during regular business hours</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Carrier Information</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Standard message and data rates may apply</li>
              <li>Carriers are not liable for delayed or undelivered messages</li>
              <li>Supported carriers include AT&amp;T, Verizon, T-Mobile, Sprint, and most regional carriers</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>SMS Data Protection Statement</h3>
            <p className='mb-3'>
              No mobile information will be shared with third parties/affiliates for marketing/promotional purposes.
              Information sharing to subcontractors in support services, such as customer service, is permitted. All
              other use case categories exclude text messaging originator opt-in data and consent; this information will
              not be shared with any third parties.
            </p>
            <p>We implement strict data protection measures to safeguard your SMS opt-in information and consent records.</p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>4. Information Sharing &amp; Disclosure</h2>
            <p className='mb-3'>We do not sell, rent, or trade personal information. We may share information with:</p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Service Providers</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Third-party vendors who assist in our operations (e.g., payment processing, appointment scheduling)</li>
              <li>SMS aggregators and providers solely for the purpose of delivering messages you&rsquo;ve consented to receive</li>
              <li>All service providers are contractually obligated to maintain confidentiality and security</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Legal Compliance</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>If required by law, legal process, or to protect our rights</li>
              <li>In response to valid law enforcement requests or court orders</li>
            </ul>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Business Transfers</h3>
            <ul className='list-disc pl-6 space-y-1'>
              <li>In case of mergers, acquisitions, or sale of assets</li>
              <li>In such cases, your data remains protected under the terms of this policy</li>
            </ul>

            <p className='mt-4'>
              All the above categories exclude text messaging originator opt-in data and consent; this information will
              not be shared with any third parties, excluding aggregators and providers of the Text Message services.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>5. Data Security</h2>
            <p className='mb-3'>We implement and maintain reasonable security measures to protect your personal information:</p>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure access controls and authentication mechanisms</li>
              <li>Regular security assessments and updates</li>
              <li>Employee training on data protection</li>
              <li>Breach notification protocols in accordance with applicable laws</li>
              <li>Secure backup systems and disaster recovery procedures</li>
            </ul>
            <p className='mt-3'>
              Despite these measures, no method of transmission over the Internet or electronic storage is 100% secure.
              We strive to use commercially acceptable means to protect your personal information but cannot guarantee
              absolute security.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>6. Cookies &amp; Tracking Technologies</h2>
            <p className='mb-3'>We use cookies and similar technologies to:</p>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Analyze site traffic and user behavior</li>
              <li>Remember your preferences</li>
              <li>Improve website functionality and user experience</li>
              <li>Measure the effectiveness of our services</li>
            </ul>
            <p className='mt-3'>
              You may control cookies through your browser settings. Disabling cookies may limit your ability to use
              certain features of our website.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>7. Your Rights &amp; Choices</h2>
            <p className='mb-3'>You have the right to:</p>
            <ul className='list-disc pl-6 space-y-1'>
              <li>Access, update, or delete your personal information</li>
              <li>
                Opt-out of marketing emails by clicking <strong>&ldquo;unsubscribe&rdquo;</strong> in our emails
              </li>
              <li>
                Opt-out of SMS messages by replying <strong>&ldquo;STOP&rdquo;</strong>
              </li>
              <li>Request information on how we process your data</li>
              <li>Withdraw consent at any time for future communications</li>
              <li>Lodge a complaint with a supervisory authority if you believe your rights have been violated</li>
            </ul>
            <p className='mt-3'>To exercise these rights, please contact us using the information in Section 10.</p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for their privacy practices
              and encourage you to review their policies. This privacy policy applies only to information collected by
              Texas AI Consulting.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>9. Changes to This Privacy Policy</h2>
            <p>
              We may update this policy periodically. The latest version will always be available on our website with
              the effective date. For significant changes, we will notify you by email or through a notice on our
              website.
            </p>
          </section>

          <section className='mb-2'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>10. Contact Us</h2>
            <p className='mb-3'>
              If you have questions about this Privacy Policy or how your information is handled, contact us at:
            </p>
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
              <p className='font-semibold text-[#0e2042]'>Texas AI Consulting</p>
              <p>
                Phone:{' '}
                <a className='text-[#2c75ff] underline' href='tel:+12105507258'>
                  +1 210-550-7258
                </a>
              </p>
              <p>
                Email:{' '}
                <a className='text-[#2c75ff] underline' href='mailto:contact@texasaiconsulting.com'>
                  contact@texasaiconsulting.com
                </a>
              </p>
              <p>
                Website:{' '}
                <a className='text-[#2c75ff] underline' href='https://texasaiconsulting.com/'>
                  https://texasaiconsulting.com/
                </a>
              </p>
            </div>
          </section>

          <p className='text-sm text-gray-500 mt-8 italic'>
            By using our website and services, you consent to this Privacy Policy.
          </p>

          <p className='text-sm text-gray-600 mt-4'>
            To opt out of our communications at any time, please visit our{' '}
            <Link className='text-[#2c75ff] underline' href='/unsubscribe'>
              Unsubscribe
            </Link>{' '}
            page.
          </p>
        </article>

        <div className='mt-8 text-center'>
          <Link href='/' className='text-[#2c75ff] hover:text-[#ebcb4c] underline transition-colors'>
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
