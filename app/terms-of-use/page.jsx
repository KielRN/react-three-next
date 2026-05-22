import Link from 'next/link'

export const metadata = {
  title: 'Terms of Use',
  description:
    'Terms of Service for Texas AI Consulting — SMS messaging terms, intellectual property, disclaimers, account responsibilities, and governing law.',
  alternates: {
    canonical: 'https://texasaiconsulting.com/terms-of-use',
  },
  openGraph: {
    title: 'Terms of Use | Texas AI Consulting',
    description:
      'Terms of Service for Texas AI Consulting — SMS messaging terms, intellectual property, disclaimers, account responsibilities, and governing law.',
    url: 'https://texasaiconsulting.com/terms-of-use',
    type: 'article',
  },
}

export default function TermsOfUsePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50'>
      <header className='bg-[#0e2042] text-white py-10'>
        <div className='container mx-auto px-4 max-w-4xl'>
          <p className='text-xs tracking-widest uppercase text-[#ebcb4c] mb-2'>Texas AI Consulting</p>
          <h1 className='text-3xl md:text-4xl font-bold'>Terms of Use</h1>
          <p className='text-gray-300 mt-2 text-sm'>Effective Date: January 1, 2026</p>
        </div>
      </header>

      <main className='container mx-auto px-4 py-10 max-w-4xl'>
        <article className='bg-white rounded-2xl shadow-xl p-6 md:p-10 text-gray-800 leading-relaxed'>
          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>SMS Messaging Terms &amp; Compliance</h2>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>1. Program Description</h3>
            <p>
              This messaging program sends appointment confirmation and reminder messages to customers who have booked
              an appointment with Texas AI Consulting through our website at{' '}
              <a className='text-[#2c75ff] underline' href='https://texasaiconsulting.com'>
                https://texasaiconsulting.com
              </a>
              , or via our scheduling forms, and have explicitly opted in to receive SMS notifications. Opt-in is
              collected via web forms with a dedicated checkbox for SMS consent. Messages include scheduling
              confirmations, appointment reminders, rescheduling updates, and customer support communications.
            </p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>2. Cancellation Instructions</h3>
            <p>
              You can cancel the SMS service at any time. Simply text <strong>&ldquo;STOP&rdquo;</strong> to the same
              number that sent you messages. Upon sending &ldquo;STOP,&rdquo; we will confirm your unsubscribe status
              via SMS. Following this confirmation, you will no longer receive SMS messages from us. To rejoin, sign up
              as you did initially, and we will resume sending SMS messages to you.
            </p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>3. Support Information</h3>
            <p>
              If you experience issues with the messaging program, reply with the keyword{' '}
              <strong>&ldquo;HELP&rdquo;</strong> for more assistance, or reach out directly to{' '}
              <a className='text-[#2c75ff] underline' href='mailto:contact@texasaiconsulting.com'>
                contact@texasaiconsulting.com
              </a>{' '}
              or call{' '}
              <a className='text-[#2c75ff] underline' href='tel:+12109722543'>
                +1 210-972-2543
              </a>{' '}
              during business hours.
            </p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>4. Carrier Liability</h3>
            <p>Carriers are not liable for delayed or undelivered messages.</p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>5. Message &amp; Data Rates</h3>
            <p>
              Message and data rates may apply for messages sent to you from us and to us from you. Message frequency
              varies based on your service usage and appointment schedule. For questions about your text plan or data
              plan, contact your wireless provider.
            </p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>6. Supported Carriers</h3>
            <p>
              Our SMS program works with all major U.S. wireless carriers, including AT&amp;T, T-Mobile, Verizon,
              Sprint, and most regional carriers.
            </p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>7. Age Restriction</h3>
            <p>You must be 18 years or older to participate in our SMS program.</p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>8. Privacy Policy</h3>
            <p>
              For privacy-related inquiries, please refer to our{' '}
              <Link className='text-[#2c75ff] underline' href='/privacy-policy'>
                Privacy Policy
              </Link>
              .
            </p>

            <p className='mt-4'>
              We comply with all applicable laws and regulations, including the Telephone Consumer Protection Act (TCPA)
              and CTIA guidelines, regarding the use of SMS communications.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>General Terms</h2>
            <p className='mb-3'>
              This website (the &ldquo;Site&rdquo;) is owned and operated by Texas AI Consulting (&ldquo;COMPANY,&rdquo;
              &ldquo;we&rdquo; or &ldquo;us&rdquo;). By using the Site, you agree to be bound by these Terms of Service
              and to use the Site in accordance with these Terms of Service, our{' '}
              <Link className='text-[#2c75ff] underline' href='/privacy-policy'>
                Privacy Policy
              </Link>
              , and any additional terms and conditions that may apply to specific sections of the Site or to products
              and services available through the Site or from Texas AI Consulting.
            </p>
            <p className='mb-3'>
              Accessing the Site, in any manner, whether automated or otherwise, constitutes use of the Site and your
              agreement to be bound by these Terms of Service.
            </p>
            <p>
              We reserve the right to change these Terms of Service or to impose new conditions on the use of the Site
              from time to time, in which case we will post the revised Terms of Service on this website. By continuing
              to use the Site after we post any such changes, you accept the Terms of Service, as modified.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>Intellectual Property Rights</h2>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Our Limited License to You</h3>
            <p className='mb-3'>
              This Site and all the materials available on the Site are the property of Texas AI Consulting and/or our
              affiliates or licensors and are protected by copyright, trademark, and other intellectual property laws.
              The Site is provided solely for your personal non-commercial use.
            </p>
            <p className='mb-3'>
              You may not use the Site or the materials available on the Site in a manner that constitutes an
              infringement of our rights or that has not been authorized by us.
            </p>
            <p>
              Unless explicitly authorized, you may not modify, copy, reproduce, republish, upload, post, transmit,
              translate, sell, create derivative works, exploit, or distribute in any manner or medium any material
              from the Site. However, you may download and/or print one copy of individual pages for your personal,
              non-commercial use, provided that you keep intact all copyright and other proprietary notices.
            </p>

            <h3 className='text-lg font-semibold text-[#0e2042] mt-4 mb-2'>Your License to Us</h3>
            <p>
              By posting or submitting any material (including comments, blog entries, social media posts, photos, and
              videos) to us via the Site, internet groups, or other digital venues, you represent that you own the
              material or have obtained the necessary permissions. You grant us a royalty-free, perpetual, irrevocable,
              non-exclusive, worldwide license to use, modify, transmit, sell, exploit, create derivative works from,
              distribute, and publicly perform or display such material.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>Disclaimers</h2>
            <p className='mb-3'>
              Throughout the Site, we may provide links and pointers to Internet sites maintained by third parties. Our
              linking to such third-party sites does not imply an endorsement or sponsorship of such sites or the
              information, products, or services offered on or through the sites.
            </p>
            <p className='mb-3'>
              The information, products, and services offered on or through the Site are provided &ldquo;as is&rdquo;
              and without warranties of any kind, either express or implied. To the fullest extent permissible pursuant
              to applicable law, we disclaim all warranties, including implied warranties of merchantability and fitness
              for a particular purpose.
            </p>
            <p>
              You agree at all times to indemnify and hold harmless Texas AI Consulting, its affiliates, and their
              respective officers, directors, agents, and employees from any claims, causes of action, damages,
              liabilities, costs, and expenses arising out of or related to your breach of any obligation, warranty, or
              representation under these Terms of Service.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>Online Commerce</h2>
            <p className='mb-3'>
              Certain sections of the Site may allow you to purchase products and services from third-party vendors. We
              are not responsible for the quality, accuracy, timeliness, reliability, or any other aspect of these
              products and services. If you make a purchase from a third party linked through the Site, the information
              obtained during your visit, including payment information, may be collected by both the merchant and us.
            </p>
            <p>
              Your participation in any dealings with third-party vendors is solely between you and the third party.
              Texas AI Consulting shall not be responsible for any loss or damage incurred as a result of such dealings.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>Registration &amp; Passwords</h2>
            <p className='mb-3'>
              To access certain features of the Site, you may be required to register and create an account. You agree
              to provide accurate, current, and complete information during the registration process. You are
              responsible for maintaining the confidentiality of your login credentials and for all activities
              conducted under your account.
            </p>
            <p>
              If you suspect unauthorized use of your account, notify us immediately at{' '}
              <a className='text-[#2c75ff] underline' href='mailto:contact@texasaiconsulting.com'>
                contact@texasaiconsulting.com
              </a>
              . We are not liable for any loss or damage arising from your failure to comply with this obligation.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>Termination</h2>
            <p>
              We reserve the right to terminate or suspend your access to the Site, without notice, if we determine
              that you have violated these Terms of Service or engaged in conduct that we deem inappropriate or
              unlawful. Upon termination, you must cease all use of the Site and any content obtained from it.
            </p>
          </section>

          <section className='mb-8'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the state in
              which Texas AI Consulting operates. Any dispute arising under these Terms shall be resolved exclusively
              through binding arbitration in that jurisdiction.
            </p>
          </section>

          <section className='mb-2'>
            <h2 className='text-2xl font-bold text-[#0e2042] mb-3'>Changes to Terms of Service</h2>
            <p className='mb-3'>
              We may update these Terms of Service from time to time. The latest version will always be available on
              our website with the effective date.
            </p>
            <p className='mb-3'>For any questions regarding these Terms of Service, please contact us at:</p>
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
              <p className='font-semibold text-[#0e2042]'>Texas AI Consulting</p>
              <p>
                Phone:{' '}
                <a className='text-[#2c75ff] underline' href='tel:+12109722543'>
                  +1 210-972-2543
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
            By using our website and services, you consent to these Terms of Service.
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
