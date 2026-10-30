// Approved dates remain separate from enduring topics. Planned sessions have
// no booking URL until their GHL, payment, Meet and curriculum checks pass.
export const workshopSessions = [
  ['ai-video-editing', '2026-11-06', '-06:00'],
  ['ai-marketing', '2026-12-04', '-06:00'],
  ['from-resume-to-revenue', '2026-12-11', '-06:00'],
  ['github-copilot-foundations', '2027-01-08', '-06:00'],
  ['ai-for-software-engineering', '2027-01-22', '-06:00'],
  ['ai-for-oracle-plsql', '2027-02-05', '-06:00'],
  ['ai-for-data-engineering', '2027-02-19', '-06:00'],
  ['ai-for-bi-microsoft-365', '2027-03-05', '-06:00'],
  ['agentic-engineering', '2027-03-19', '-05:00'],
].map(([slug, date, offset]) => ({
  slug,
  start: `${date}T11:00:00${offset}`,
  end: `${date}T13:00:00${offset}`,
  status: 'planned',
}))

export const workshopPolicy = {
  minimumAttendees: 3,
  cancellation:
    'Cancel at least 24 hours before the start for a full refund. Later cancellations receive one workshop credit valid for 90 days. You may transfer your place to another attendee at no charge until the session starts. No-shows are nonrefundable.',
  organizer:
    'Texas AI Consulting may cancel a workshop if fewer than three attendees register. If Texas AI Consulting cancels or reschedules, choose a full refund or a new workshop date.',
}

export const workshopCategories = [
  { id: 'all', label: 'All workshops' },
  { id: 'business', label: 'Business & creative' },
  { id: 'careers', label: 'Careers' },
  { id: 'technical', label: 'Engineering & data' },
]

const agenda = (blocks) =>
  blocks.map(([title, detail], index) => ({
    minutes: [10, 20, 15, 40, 20, 15][index],
    title,
    detail,
  }))

export const workshops = [
  {
    slug: 'ai-video-editing',
    title: 'AI Video Editing',
    category: 'business',
    visual: 'video',
    summary:
      'Plan one short AI video shot with a Blender scene, a motion reference and a Seedance generation brief.',
    audience: 'Content creators and visual storytellers ready to try a guided Blender-to-AI video workflow.',
    artifact: 'An editable shot plan, a local motion-reference render and a reusable generation/review checklist.',
    outcomes: [
      'Use a supplied Blender scene to plan one action and one camera move.',
      'Render a local motion reference and prepare a focused Seedance 2.5 generation brief.',
      'Check framing, motion and continuity, then record what to change in the next attempt.',
    ],
    prerequisites: [
      'A computer capable of running Blender, headphones and basic file-management skills.',
      'Complete the supplied setup check before class; use the provided scene or assets you have permission to use.',
    ],
    tools:
      'The planned workflow uses Blender with MCP assistance and Seedance 2.5. Exact setup, model access and any generation-credit allowance or cost will be confirmed before registration. Included paid credits are not yet promised.',
    agenda: agenda([
      ['Set the shot brief', 'Choose one short action, a camera intention and a clear completion check.'],
      ['Watch the workflow', 'See how a Blender blockout and local motion reference guide an AI video request.'],
      ['Plan the shot', 'Mark the action and camera path in the supplied scene; keep the scope to one shot.'],
      ['Build the reference', 'Adjust the starter scene and render a local motion reference with instructor guidance.'],
      ['Prepare and review', 'Write a Seedance generation brief and use a checklist to assess motion and continuity.'],
      ['Make it repeatable', 'Save the scene, brief and checklist, then plan one controlled change for the next attempt.'],
    ]),
    faq: [
      [
        'Do I need my own footage or a finished 3D scene?',
        'No. The planned exercise starts from a supplied Blender scene. Setup instructions will explain the required software and accounts before registration opens.',
      ],
      [
        'Will I leave with a finished AI film?',
        'The two-hour exercise focuses on one shot plan and a local motion reference. A finished AI film is not promised; model access, generation costs and turnaround will be confirmed before enrollment.',
      ],
    ],
  },
  {
    slug: 'ai-marketing',
    title: 'AI Marketing',
    category: 'business',
    visual: 'marketing',
    summary: 'Build a small campaign around a real customer need, with useful drafts and a clear human review process.',
    audience: 'Small-business operators and marketing staff who need a consistent starting point for campaign work.',
    artifact:
      'A campaign kit with an offer brief, three coordinated content drafts and a publication review checklist.',
    outcomes: [
      'Define one audience, one offer and the action you want a customer to take.',
      'Generate connected content drafts from the same campaign brief.',
      'Check claims, brand voice and factual accuracy before anything is published.',
    ],
    prerequisites: [
      'Basic familiarity with a browser and a document editor.',
      'Bring a nonconfidential offer to work on, or use the fictional practice business.',
    ],
    tools:
      'The AI assistant and document tools will be named in the session setup instructions. Any paid account or usage requirement will be disclosed before enrollment.',
    agenda: agenda([
      [
        'Choose the customer problem',
        'Write a short brief for one offer instead of trying to market an entire business.',
      ],
      [
        'Demonstrate a campaign workflow',
        'Turn a customer question into a brief, draft variations and a review checklist.',
      ],
      ['Build the brief', 'Specify the audience, useful proof, tone and next action.'],
      ['Draft the campaign kit', 'Create a short email, a social post and a landing-page section from the same brief.'],
      ['Edit for trust', 'Remove unsupported claims, check facts and revise the voice for the intended customer.'],
      ['Plan the next step', 'Save the kit and choose a practical way to review its usefulness after publication.'],
    ]),
    faq: [
      [
        'Will this place ads or publish for me?',
        'No. You will develop reviewable drafts. Ad spending, account connections and external publication are outside the exercise.',
      ],
      [
        'Can I use my business as the example?',
        'Yes, using information you are comfortable sharing in a teaching environment. A fictional example is also available.',
      ],
    ],
  },
  {
    slug: 'from-resume-to-revenue',
    title: 'From Resume to Revenue (Veteran-Friendly)',
    category: 'careers',
    visual: 'career',
    summary: 'Translate experience into a clear opportunity, a truthful profile update and a small work sample.',
    audience: 'Veterans and career changers exploring how existing skills could support a job or a service offering.',
    artifact:
      'A skills-to-opportunity map, one revised profile section and a work-sample brief with a realistic next action.',
    outcomes: [
      'Translate responsibilities into specific, supportable skills and examples.',
      'Compare an employment direction with a potential service opportunity.',
      'Draft a truthful profile revision and define a work sample that demonstrates a relevant skill.',
    ],
    prerequisites: [
      'A laptop and a short, non-sensitive description of your experience.',
      'A resume is helpful but optional. Remove personal identifiers and sensitive service or employer information.',
    ],
    tools:
      'AI assistant and document-editor requirements will be confirmed before registration. No service records or benefit eligibility documents are needed for the planned exercise.',
    agenda: agenda([
      ['Choose a direction', 'Identify one possible job or customer problem and the experience that connects to it.'],
      [
        'Translate experience',
        'See examples of military and civilian responsibilities rewritten as clear, factual skills.',
      ],
      ['Map the evidence', 'List the examples you can support and mark any gaps that need a work sample.'],
      [
        'Build an opportunity packet',
        'Revise one profile section and draft a small work-sample brief around one target opportunity.',
      ],
      [
        'Review for accuracy',
        'Remove invented achievements, check the language and ask whether the sample proves the intended skill.',
      ],
      [
        'Choose a next action',
        'Define a manageable follow-up, such as finishing the sample or requesting a relevant conversation.',
      ],
    ]),
    faq: [
      [
        'Is this only for veterans?',
        'The outline uses veteran-friendly examples and welcomes career changers from other backgrounds.',
      ],
      [
        'Does attendance guarantee work or income?',
        'No. The workshop helps you clarify and demonstrate skills. It does not provide job placement, earnings guarantees, VA endorsement or approved education benefits.',
      ],
    ],
  },
  {
    slug: 'github-copilot-foundations',
    title: 'AI Engineering Foundations with GitHub Copilot',
    category: 'technical',
    visual: 'copilot',
    summary: 'Use Copilot to make one small repository change, then test and review what it produced.',
    audience: 'Developers beginning AI-assisted engineering who can already read and edit basic code.',
    artifact: 'A small feature change with tests, a readable diff and a checklist for reviewing AI-generated code.',
    outcomes: [
      'Give an assistant a bounded task with context and acceptance criteria.',
      'Inspect generated changes and verify behavior with meaningful tests.',
      'Explain the diff and record what still requires human judgment.',
    ],
    prerequisites: [
      'Basic programming, Git and editor familiarity; this is not a first coding lesson.',
      'A prepared starter repository and setup check will be supplied before the session opens.',
    ],
    tools:
      'A working GitHub Copilot account and compatible editor will be required. Exact plan, editor and starter-project requirements will be confirmed before enrollment; a subscription is not included.',
    agenda: agenda([
      ['Define a small feature', 'Read the starter project and agree on a single observable behavior.'],
      ['Guide Copilot with context', 'Demonstrate a bounded request, repository context and a reviewable change.'],
      ['Write acceptance checks', 'Identify a normal input, a boundary case and an expected failure.'],
      ['Implement with assistance', 'Make the feature change, inspect the diff and run the relevant checks.'],
      ['Review the result', 'Look for unsupported assumptions, unnecessary changes and gaps in verification.'],
      ['Record the workflow', 'Summarize the change and save a reusable prompt-and-review checklist.'],
    ]),
    faq: [
      [
        'How is this different from AI for Software Engineering?',
        'Foundations uses a small prepared repository and introduces the prompt, change, test and review loop. The software engineering workshop starts with an existing-system maintenance problem.',
      ],
    ],
  },
  {
    slug: 'ai-for-software-engineering',
    title: 'AI for Software Engineering',
    category: 'technical',
    visual: 'software',
    summary: 'Trace an existing code path, reproduce a bug and use AI assistance to deliver a verified fix.',
    audience: 'Practicing developers and engineering teams comfortable navigating repositories and running tests.',
    artifact: 'A reviewed bug fix in a training codebase, with a regression test and a concise change explanation.',
    outcomes: [
      'Use repository evidence to narrow a problem before requesting a change.',
      'Reproduce a defect and test the behavior a user actually needs.',
      'Review scope, failure cases and remaining risks before accepting a fix.',
    ],
    prerequisites: [
      'Experience reading an existing application, using Git and running an automated test suite.',
      'Use the supplied training repository rather than confidential production source code.',
    ],
    tools:
      'The coding assistant, language runtime and repository setup will be confirmed before registration. Access to paid assistants is not included unless stated for the session.',
    agenda: agenda([
      ['Read the issue', 'Separate the reported symptom from the behavior the application should provide.'],
      [
        'Trace the code path',
        'Use AI to orient within the training repository, checking every important claim against source.',
      ],
      ['Reproduce the defect', 'Write a regression check that fails for the right reason.'],
      ['Implement a focused fix', 'Constrain the assistant to the relevant path and verify the changed behavior.'],
      [
        'Review failure cases',
        'Inspect the diff, run neighboring checks and look for a fix that only hides the symptom.',
      ],
      ['Prepare the handoff', 'Write a short reviewer note explaining the cause, fix and verification.'],
    ]),
    faq: [
      [
        'Can I bring an employer repository?',
        'The shared exercise uses a training repository. Do not upload employer code, credentials or confidential data without the appropriate permission.',
      ],
    ],
  },
  {
    slug: 'ai-for-oracle-plsql',
    title: 'AI for Oracle/PLSQL',
    category: 'technical',
    visual: 'oracle',
    summary: 'Draft and improve a PL/SQL routine, then check it against a synthetic training schema.',
    audience: 'Oracle developers and database teams with working SQL and introductory PL/SQL knowledge.',
    artifact: 'A tested PL/SQL routine, sample test cases and validation notes explaining its behavior.',
    outcomes: [
      'Give an assistant schema context without exposing production data.',
      'Check a generated routine against explicit business rules and edge cases.',
      'Explain correctness and execution observations using evidence from the training lab.',
    ],
    prerequisites: [
      'Comfort with SQL, database transactions and basic PL/SQL routines.',
      'Complete the supplied lab connection check before the workshop. All practice data is synthetic.',
    ],
    tools:
      'A verified Oracle training environment and SQL client are required. Lab provision, connection details and any account requirements must be confirmed before the session opens; do not assume a database license is included.',
    agenda: agenda([
      ['Read the schema and rules', 'Understand the synthetic order data and the routine we want to produce.'],
      ['Draft with explicit context', 'Demonstrate schema-aware prompting and inspect a generated PL/SQL draft.'],
      ['Define the test cases', 'Choose normal, empty and invalid inputs and state expected transaction behavior.'],
      [
        'Build and test the routine',
        'Compile the routine, run the cases and revise the implementation from observed results.',
      ],
      [
        'Inspect execution behavior',
        'Review exception handling, transaction boundaries and the available execution evidence.',
      ],
      ['Document the result', 'Save the routine, test cases and limitations for a human database review.'],
    ]),
    faq: [
      [
        'Will we connect to a production database?',
        'No. The exercise is designed for an isolated training schema with synthetic data. Production deployment and tuning require separate review.',
      ],
    ],
  },
  {
    slug: 'ai-for-data-engineering',
    title: 'AI for Data Engineering',
    category: 'technical',
    visual: 'data',
    summary: 'Build a small ingestion and transformation pipeline with checks that make bad data visible.',
    audience: 'Data engineers and technical analysts comfortable with basic scripting and tabular data.',
    artifact: 'A small working pipeline, a rejected-record sample and a data-quality validation report.',
    outcomes: [
      'Describe source fields, transformations and expected output before generating code.',
      'Use AI assistance to build a pipeline with explicit data-quality checks.',
      'Verify valid rows, rejected rows and repeat-run behavior.',
    ],
    prerequisites: [
      'Basic scripting, CSV or JSON familiarity and an understanding of tabular data.',
      'Use the supplied synthetic dataset and complete the starter-project setup check.',
    ],
    tools:
      'The language runtime and local data tools will be specified before registration. Cloud subscriptions or production-system access are not assumed.',
    agenda: agenda([
      ['Define the data contract', 'Read a small synthetic source and specify a clean output schema.'],
      ['Demonstrate the pipeline', 'Trace ingestion, transformation, validation and rejected-record handling.'],
      ['Choose quality rules', 'Define required fields, allowed values and duplicate behavior.'],
      ['Build the pipeline', 'Use AI assistance to implement transformations and visible failure handling.'],
      ['Test dirty data', 'Run valid, malformed and duplicate records; compare counts and inspect rejected rows.'],
      ['Save the evidence', 'Package the pipeline, sample output and a short validation report.'],
    ]),
    faq: [
      [
        'Do I need a cloud data platform?',
        'The outline is for a small prepared lab. The exact tools and setup will be disclosed before registration; no particular cloud account is currently promised.',
      ],
    ],
  },
  {
    slug: 'ai-for-bi-microsoft-365',
    title: 'AI for BI and Analytics with Microsoft 365',
    category: 'technical',
    visual: 'analytics',
    summary: 'Turn a sample dataset into a checked analysis and a report a stakeholder can understand.',
    audience: 'Analysts and business teams familiar with spreadsheets, basic metrics and reporting.',
    artifact:
      'A concise report from a sample dataset, with reconciled metrics, source notes and a validation checklist.',
    outcomes: [
      'Turn a stakeholder question into a defined metric and analysis plan.',
      'Use selected Microsoft tools and AI assistance to draft a report.',
      'Reconcile totals and explain the limits of the conclusions.',
    ],
    prerequisites: [
      'Basic spreadsheet skills and familiarity with simple business metrics.',
      'Use the supplied sample data and complete the account/access check before attending.',
    ],
    tools:
      'The exact Microsoft 365 and BI products, tenant permissions and license requirements will be confirmed before enrollment. Microsoft 365 ownership alone does not establish access to every Copilot or BI feature; software licenses are not currently included.',
    agenda: agenda([
      ['Define the question', 'Choose one decision a stakeholder needs to make from the sample data.'],
      [
        'Demonstrate a checked analysis',
        'Follow the path from source data to a metric, chart and written interpretation.',
      ],
      ['Inspect the dataset', 'Check field meanings, missing values and the metric definition.'],
      ['Build the report', 'Create a focused analysis and a short stakeholder narrative using the selected lab tools.'],
      ['Reconcile the claims', 'Compare totals, verify a sample calculation and flag unsupported interpretations.'],
      ['Prepare the handoff', 'Save the report with source notes and a repeatable validation checklist.'],
    ]),
    faq: [
      [
        'Does my Microsoft subscription include the tools?',
        'That depends on the products selected for the session and your tenant. The access checklist will name the exact requirements before you can enroll.',
      ],
    ],
  },
  {
    slug: 'agentic-engineering',
    title: 'Agentic Engineering',
    category: 'technical',
    visual: 'agent',
    summary: 'Build a small tool-using workflow with clear boundaries, observable steps and human review.',
    audience: 'Developers who can work with APIs and tests and want a focused introduction to agent workflows.',
    artifact:
      'A constrained agent in a local lab, an execution trace and a small evaluation set with recorded results.',
    outcomes: [
      'Define a narrow task and a tool contract with explicit boundaries.',
      'Add observable steps, failure handling and review before a consequential action.',
      'Evaluate normal, ambiguous and disallowed requests against expected behavior.',
    ],
    prerequisites: [
      'Comfort with programming, APIs, structured data and automated tests.',
      'Complete the starter-lab check. Use synthetic requests and sandboxed tools.',
    ],
    tools:
      'The framework, model account and any API-credit requirements will be confirmed before registration. The exercise does not require connecting a live customer system.',
    agenda: agenda([
      ['Constrain the task', 'Define a fictional service-request assistant and the actions it is allowed to propose.'],
      ['Trace an agent workflow', 'Inspect tool input, tool output, decision points and a human approval boundary.'],
      ['Define the tool contract', 'Specify allowed fields, rejected requests and an explicit stopping condition.'],
      ['Build the agent', 'Implement a narrow workflow against sandboxed tools and capture its execution trace.'],
      [
        'Evaluate boundary cases',
        'Try a valid request, missing information, a tool failure and an unauthorized action.',
      ],
      ['Record the limits', 'Save evaluation results and identify what would need review before any production use.'],
    ]),
    faq: [
      [
        'Will the agent take live business actions?',
        'The planned lab uses sandboxed tools. Consequential actions are reviewed by a person; production integrations are separate work.',
      ],
    ],
  },
].map((workshop) => ({
  ...workshop,
  priceUSD: workshop.category === 'technical' ? 99 : 49,
  veteranPriceUSD: workshop.slug === 'from-resume-to-revenue' ? 29 : undefined,
  capacity: workshop.category === 'technical' ? 10 : 12,
  delivery: 'Online via Google Meet',
}))

export function getWorkshop(slug) {
  return workshops.find((workshop) => workshop.slug === slug)
}

export function getWorkshopSession(slug, now = Date.now()) {
  return workshopSessions.find(
    (session) => session.slug === slug && new Date(session.start).getTime() > new Date(now).getTime(),
  )
}

export function formatWorkshopFee(workshop) {
  return workshop.veteranPriceUSD
    ? `$${workshop.priceUSD} public / $${workshop.veteranPriceUSD} veterans`
    : `$${workshop.priceUSD}`
}

export function formatWorkshopDate(session) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(session.start))
}

export function filterWorkshops(query = '', category = 'all') {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return workshops.filter((workshop) => {
    const text = [workshop.title, workshop.summary, workshop.audience, ...workshop.outcomes].join(' ').toLowerCase()
    return (category === 'all' || workshop.category === category) && terms.every((term) => text.includes(term))
  })
}
