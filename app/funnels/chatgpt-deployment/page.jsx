import Image from 'next/image'
import Link from 'next/link'
import { FunnelHeader, FunnelFooter } from './components/FunnelChrome'
import LeadForm from './components/LeadForm'
import FAQ from './components/FAQ'

const PROBLEMS = [
  {
    title: 'Licenses first, plan later',
    body: 'Seats get bought, a "we have AI now" message goes out, and nobody owns what happens next.',
  },
  {
    title: 'Everyone invents their own use',
    body: 'Each person experiments on top of their real job. A few stick with it. Most try it twice and go back.',
  },
  {
    title: 'No baseline, no proof',
    body: "Without a before-and-after on real work, it's hard to tell whether ChatGPT is saving time or just adding a tab.",
  },
]

const OUTCOMES = [
  {
    title: 'More capacity',
    body: 'The same team handles more proposals, reports, and requests without adding headcount.',
  },
  {
    title: 'Time back for owners',
    body: 'Fewer late nights rewriting drafts and answering the same questions. ChatGPT does the first pass and you approve it.',
  },
  {
    title: 'Consistent quality',
    body: "Shared instructions, templates, and review checklists mean the work looks the same no matter who's out sick.",
  },
]

const METHOD = [
  { title: 'Friction inventory', body: 'Collect the recurring work your team dreads, redoes, or waits on.' },
  { title: 'Frame the real problem', body: 'Turn "reporting is a nightmare" into a specific trigger, pain, and cost.' },
  { title: 'Repeatability test', body: 'Score each candidate on frequency, consistency, ownership, and clear pattern.' },
  { title: 'Workflow map', body: 'Eight plain-language questions on who does the work, with what, and why it matters.' },
  { title: 'Match to AI patterns', body: 'Find the steps ChatGPT handles well: summarize, draft, extract, review, and more.' },
  { title: 'Value and readiness', body: 'Record a baseline, check readiness, then roll out and measure against it.' },
]

const CREDENTIALS = [
  { name: 'ChatGPT Expert', detail: 'All levels achieved · no expiration' },
  { name: 'ChatGPT Deployment Practitioner', detail: 'Oct 2026 · valid through Oct 2027' },
  { name: 'ChatGPT Solutions Practitioner', detail: 'Oct 2026 · valid through Oct 2027' },
  { name: 'OpenAI Consultative Solutions Practitioner', detail: 'Oct 2026 · valid through Oct 2027' },
  { name: 'OpenAI Technical Practitioner', detail: 'Oct 2026 · valid through Oct 2027' },
  { name: 'OpenAI Foundational Knowledge', detail: 'Oct 2026 · valid through Oct 2027' },
]

export default function ChatGPTDeploymentPage() {
  return (
    <main>
      <FunnelHeader />

      {/* Hero + lead form */}
      <section className='cgd-hero'>
        <div className='cgd-container cgd-hero-grid'>
          <div>
            <span className='cgd-eyebrow'>CHATGPT DEPLOYMENT · TEXAS</span>
            <h1>Your team has ChatGPT. Give it a real job.</h1>
            <p className='cgd-hero-sub'>
              We find the recurring work where ChatGPT actually saves time, then roll it out with your team so it
              sticks. Workflow first, then the tool.
            </p>
            <div className='cgd-hero-links'>
              <a href='#workflow-first-video'>Watch the workflow-first walkthrough</a>
              <Link href='/blog/identify-the-right-workflow-before-ai'>Read the free guide</Link>
            </div>
            <ul className='cgd-checks'>
              <li>Pick the two or three workflows worth changing, not fifty scattered experiments</li>
              <li>Shared instructions, templates, and training your team uses the same way</li>
              <li>A before-and-after baseline so you can see what changed</li>
            </ul>
            <p className='cgd-trustline'>
              <span>Veteran-owned</span>
              <span>San Antonio, Texas</span>
              <span>VetHUB certified</span>
              <span>Member of the OpenAI Partner Network</span>
            </p>
          </div>

          <div id='request' className='cgd-card cgd-form-card'>
            <h2>Request a ChatGPT rollout consultation</h2>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              Tell us a little about your team. We&apos;ll set up a short call to find your best starting workflow.
            </p>
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id='workflow-first-video' className='cgd-section cgd-section-soft'>
        <div className='cgd-container cgd-video-grid'>
          <div>
            <h2>See how to find your first workflow</h2>
            <p className='cgd-lead'>
              Watch Elliott walk through the workflow-first approach, then use the free guide to map the recurring
              work on your own team.
            </p>
            <Link href='/blog/identify-the-right-workflow-before-ai' className='cgd-btn cgd-btn-primary'>
              Read the free workflow guide
            </Link>
            <p className='cgd-video-fallback'>
              <a href='https://youtu.be/jrk6FUoHgrs' target='_blank' rel='noopener noreferrer'>Watch on YouTube</a>
            </p>
          </div>
          <div className='cgd-video'>
            <iframe
              src='https://www.youtube-nocookie.com/embed/jrk6FUoHgrs'
              title='Workflow first: identify the right workflow before you buy AI — Elliott Lamboy'
              loading='lazy'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              referrerPolicy='strict-origin-when-cross-origin'
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className='cgd-section cgd-section-soft'>
        <div className='cgd-container'>
          <h2>Why most ChatGPT rollouts stall</h2>
          <p className='cgd-lead'>
            The tool usually isn&apos;t the problem. The order is. Starting with the tool asks every employee to invent
            use cases on top of their real job.
          </p>
          <div className='cgd-grid-3'>
            {PROBLEMS.map((p) => (
              <div key={p.title} className='cgd-card'>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className='cgd-section'>
        <div className='cgd-container'>
          <h2>What a workflow-first rollout is built to deliver</h2>
          <p className='cgd-lead'>
            When ChatGPT has a specific job, an owner, and a way to prove it worked, it stops being a novelty.
          </p>
          <div className='cgd-grid-3'>
            {OUTCOMES.map((o, i) => (
              <div key={o.title} className='cgd-card'>
                <span className='cgd-card-num'>0{i + 1}</span>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Method */}
      <section className='cgd-section cgd-section-navy'>
        <div className='cgd-container'>
          <h2>The six-step workflow-first method</h2>
          <p className='cgd-lead'>
            The same method we teach in{' '}
            <Link href='/blog/identify-the-right-workflow-before-ai' style={{ color: '#ebcb4c' }}>
              How to Identify the Right Workflow Before You Buy AI
            </Link>
            . We run it with your team, then help you roll out what it finds.
          </p>
          <ol className='cgd-steps'>
            {METHOD.map((m) => (
              <li key={m.title}>
                <h3>{m.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.82)' }}>{m.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Illustrative example */}
      <section className='cgd-section'>
        <div className='cgd-container cgd-grid-2'>
          <div>
            <h2>From &ldquo;use AI more&rdquo; to a workflow your team can adopt</h2>
            <p className='cgd-lead'>
              The output of the method is a plain-English instruction with a trigger, a job for ChatGPT, and a human
              checkpoint. That is something a team can actually follow and measure.
            </p>
          </div>
          <div className='cgd-example'>
            <span className='cgd-tag'>ILLUSTRATIVE EXAMPLE</span>
            <h3>The proposal workflow</h3>
            <p style={{ color: '#555' }}>
              <strong>Before:</strong> An account manager spends hours building each proposal from scratch, quality
              varies by who writes it, and leads wait days.
            </p>
            <p className='cgd-quote'>
              &ldquo;When a new lead completes the intake form, ChatGPT drafts the proposal from our template, current
              pricing, and the client&apos;s notes. The account manager reviews and edits it. The owner approves
              anything over $10,000.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className='cgd-section cgd-section-soft'>
        <div className='cgd-container'>
          <div className='cgd-creds'>
            <Image
              src='/img/chatgpt-expert-badge.png'
              alt='ChatGPT Expert badge earned by Elliott Lamboy'
              width={400}
              height={438}
              style={{ width: '200px', height: 'auto', display: 'block' }}
            />
            <div>
              <h2>The credentials behind the method</h2>
              <p className='cgd-lead' style={{ marginBottom: '24px' }}>
                Texas AI Consulting is a member of the OpenAI Partner Network. Founder Elliott Lamboy, RN, a retired U.S.
                Air Force Reservist, holds these OpenAI and ChatGPT credentials:
              </p>
              <ul className='cgd-cred-list'>
                {CREDENTIALS.map((c) => (
                  <li key={c.name}>
                    {c.name}
                    <span>{c.detail}</span>
                  </li>
                ))}
              </ul>
              <div className='cgd-note'>
                <strong>Teams of 25 or more:</strong> we can request a live, trainer-led OpenAI certification session
                for your team through the OpenAI Partner Network. Sessions are subject to OpenAI&apos;s approval and
                availability.
              </div>
              <p style={{ fontSize: '14px', marginTop: '16px' }}>
                <Link href='/elliott-resume' style={{ color: '#0e2042', fontWeight: 'bold' }}>
                  View certificates and full background →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className='cgd-section'>
        <div className='cgd-container'>
          <h2 className='cgd-center'>Questions owners ask</h2>
          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className='cgd-section cgd-section-navy cgd-center'>
        <div className='cgd-container'>
          <h2>Start with one workflow</h2>
          <p className='cgd-lead' style={{ marginBottom: '32px' }}>
            Tell us where your team&apos;s time goes. We&apos;ll help you find the first piece of work worth handing to
            ChatGPT.
          </p>
          <div className='cgd-btn-row'>
            <a href='#request' className='cgd-btn cgd-btn-gold'>
              Request a consultation
            </a>
            <Link href='/funnels/chatgpt-deployment/book' className='cgd-btn cgd-btn-outline'>
              Book a call now
            </Link>
          </div>
        </div>
      </section>

      <FunnelFooter />
    </main>
  )
}
