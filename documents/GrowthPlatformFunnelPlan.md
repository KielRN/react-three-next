# Growth Platform Funnel — Migration from GHL to Next.js + Stripe

Migrate the 4-step Growth Platform sales funnel from GoHighLevel to the existing Next.js site, with Stripe for payments and a GHL-style 2-step order form — all styled with the TxAI "Command Center" theme.

## User Review Required

> [!IMPORTANT]
> **Stripe Products & Pricing** — The plan creates these Stripe products/prices based on the GHL funnel content. Please confirm these are correct before execution:
>
> | Product | Price | Type |
> |---------|-------|------|
> | Growth Platform — Monthly | $99/mo recurring + $500 one-time setup | Subscription + one-time |
> | Growth Platform — Annual | $1,164/yr recurring (no setup fee) | Subscription |
>
> The monthly option charges **$599 upfront** ($500 setup + $99 first month), then $99/mo. The annual option charges **$1,164 upfront** and renews annually.

> [!WARNING]
> **Stripe API Keys Required** — You'll need to add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your `.env` file. Get these from [Stripe Dashboard → API Keys](https://dashboard.stripe.com/acct_1TNfYmJMSxLnpBGh/apikeys).

> [!IMPORTANT]
> **Funnel Independence** — The funnel pages will live under `app/funnels/growth-platform/` with their own layout (no shared site nav/footer from the main site). This keeps funnels completely separate from blog/portfolio pages as requested.

---

## Proposed Changes

### 1. Stripe Product & Price Setup (via MCP)

Before writing any code, we'll create the actual Stripe products and prices:

1. **Create Product:** "Growth Platform" with description
2. **Create Price — Monthly:** $99/mo recurring (`interval: month`)
3. **Create Price — Annual:** $1,164/yr recurring (`interval: year`)
4. **Create Price — Setup Fee:** $500 one-time (attached to same product)
5. **Create Coupon:** "Annual — Setup Fee Waived" (for display clarity)

These IDs will be stored in a config file referenced by the funnel components.

---

### 2. Funnel Directory Structure

All funnel code is isolated from the main site:

```
app/
  funnels/
    growth-platform/
      layout.jsx          ← [NEW] Standalone layout (no site nav/footer)
      page.jsx            ← [NEW] Step 1: Landing page
      agreement/
        page.jsx          ← [NEW] Step 2: Agreement review + acknowledgement form
      agreement/
        page.jsx          ← [NEW] Step 2: Agreement review + acknowledgement form
        msa/
          page.jsx        ← [NEW] Full MSA rendered as a styled page (from Master_Services_Agreement.md)
      checkout/
        page.jsx          ← [NEW] Step 3: 2-step order form (Stripe Elements)
      thank-you/
        page.jsx          ← [NEW] Step 4: Confirmation + onboarding timeline
      components/
        FunnelHeader.jsx  ← [NEW] Step indicator (Step 1 of 3, etc.)
        PricingCards.jsx   ← [NEW] Monthly vs Annual pricing cards
        AgreementTerms.jsx ← [NEW] Key terms display component
        OrderForm.jsx      ← [NEW] 2-step form with Stripe Payment Element
        TrustBadges.jsx    ← [NEW] Trust badges
      funnel.css          ← [NEW] TxAI Command Center theme CSS
      stripe-config.js    ← [NEW] Stripe price IDs, product config
```

---

### 3. GHL CRM Integration (Stripe → GHL Pipeline)

When a purchase completes via Stripe, the webhook will sync data to your GHL CRM using the same GHL API that your existing Python skills use (`ghl_ops_sync`, `ghl_sales`).

**Flow: Stripe Payment → GHL CRM**
```
Stripe webhook (checkout.session.completed)
  → API route: /api/stripe/webhook
    → 1. Upsert contact in GHL (POST /contacts/upsert)
    → 2. Apply tags: "growth-platform-customer", "plan-monthly" or "plan-annual"
    → 3. Create opportunity in "Growth Platform" pipeline
    → 4. Move opportunity to "Payment Received" stage
    → 5. Set monetary value ($99/mo or $1,164/yr)
```

#### GHL API Integration Module

##### [NEW] `lib/ghl.js`
- Node.js module that mirrors the GHL API calls from your Python skills
- Uses `GHL_API_KEY` and `GHL_LOCATION_ID` from `.env`
- Functions:
  - `upsertContact({ email, firstName, lastName, phone, companyName, tags })` — POST `/contacts/upsert`
  - `createOpportunity({ pipelineName, oppName, contactId, stageName, value })` — resolves pipeline/stage names → IDs, then POST `/opportunities/`
  - `updateOpportunity({ oppId, stageId, status, monetaryValue })` — PUT `/opportunities/{id}`
- Same `BASE_URL` (`https://services.leadconnectorhq.com`) and headers (`Version: 2021-07-28`) as your Python scripts

##### GHL Pipeline Setup (Manual in GHL Dashboard)
You'll need a pipeline in GHL for this funnel. Suggested stages:

| Stage | Description |
|-------|-------------|
| New Lead | Contact captured (agreement form submitted) |
| Agreement Signed | Terms acknowledged |
| Payment Received | Stripe checkout completed |
| Onboarding | Kickoff call scheduled |
| Active | Platform live |

> [!TIP]
> If you already have a suitable pipeline, just provide the pipeline name and stage names and I'll wire them in. If not, you can create one in GHL and I'll reference it.

##### Existing Skills Compatibility
The Node.js `lib/ghl.js` module will be 100% API-compatible with your existing Python skills:
- [ghl_ops_sync.py](file:///G:/My%20Drive/Texas%20AI%20Consulting/.agent/skills/ghl_ops_sync/ghl_ops_sync.py) — `upsert_contact`, `create_opportunity`
- [ghl_sales.py](file:///G:/My%20Drive/Texas%20AI%20Consulting/.agent/skills/ghl_sales/ghl_sales.py) — `update_opportunity`

So your agent workflows can also use the Python skills to manage these same contacts/opportunities downstream (e.g., moving stages, sending emails).

---

### 4. Component Details

#### [NEW] `app/funnels/growth-platform/layout.jsx`
- Standalone layout that does NOT use the main site's `<Layout>` / `<Navigation>` components
- Loads Google Fonts (Space Mono), GA4 tracking, and the funnel-specific CSS
- Dark background (`#000000`) full-bleed, no nav bar

#### [NEW] `app/funnels/growth-platform/funnel.css`
- Port of [TxAI_GHL_Custom_CSS_3_2026.html](file:///G:/My%20Drive/Texas%20AI%20Consulting/GHL/Template%20-%20TxAI_GHL_Theme/TxAI_GHL_Custom_CSS_3_2026.html) adapted for Next.js
- All the same CSS variables, classes: `.section-txai`, `.section-container-txai`, `.card-txai`, `.btn-txai`, `.btn-solid-txai`, `.grid-txai`, `.animate-fade-up-txai`, etc.
- Removes GHL-specific overrides (`.hl_wrapper`, `.bg-fixed`, etc.)
- Plus new 2-step form styling (`.order-form-step`, progress indicator)
- Responsive breakpoints preserved

#### [NEW] `app/funnels/growth-platform/page.jsx` — Step 1: Landing
- Direct port of [Step1_Landing.html](file:///G:/My%20Drive/Texas%20AI%20Consulting/GHL/Sites-Funnels/GrowthPlatform/Step1_Landing.html) as React JSX
- Hero section with "THE GROWTH PLATFORM" headline
- Tool-stack tax problem → $99/mo solution
- 6 value prop cards (CRM, Email/SMS, Reputation, Funnels, Calendar, AI Automation)
- "Everything in the Box" feature grid
- Monthly vs Annual pricing comparison
- Comparison table (You vs Tool-Stack Tax)
- Industry vertical grid (Medical, Legal, Contractors, etc.)
- CTA → links to `/funnels/growth-platform/agreement`
- Trust elements footer

#### [NEW] `app/funnels/growth-platform/agreement/page.jsx` — Step 2: Agreement
- Port of [Step2_Agreement.html](file:///G:/My%20Drive/Texas%20AI%20Consulting/GHL/Sites-Funnels/GrowthPlatform/Step2_Agreement.html) as React JSX
- "View Full Agreement" button → links to `/funnels/growth-platform/agreement/msa` (rendered MSA page)
- Service details summary grid
- Monthly vs Annual pricing options
- Key Terms in dark "terminal" style box (License, 12-Month Term, Non-Payment, Data Retention)
- "Payment = Agreement Acceptance" notice
- **Acknowledgement form** (replaces GHL iframe):
  - Fields: First Name, Last Name, Email, Phone, Business Name, Industry (dropdown), Title (optional)
  - Terms acceptance checkbox (mandatory)
  - Electronic signature (text input for legal name)
  - Date auto-populated
  - Submit → stores data in `sessionStorage`, redirects to checkout
  - No backend needed here — data carried forward to checkout

#### [NEW] `app/funnels/growth-platform/agreement/msa/page.jsx` — Full MSA Page
- Content converted from [Master_Services_Agreement.md](file:///G:/My%20Drive/Texas%20AI%20Consulting/GHL/Agreements/Master_Services_Agreement.md)
- Rendered in the TxAI Command Center theme (dark "terminal" aesthetic for legal text)
- Read-only display — no form, no interactive elements
- "← Back to Agreement" link at top
- SEO: `noindex` (legal document, not a landing page)

#### [NEW] `app/funnels/growth-platform/checkout/page.jsx` — Step 3: 2-Step Order Form
This is the core GHL-replacement page with Stripe integration, matching the UI from the images.

**Step 1 ("Start Your Growth Engine"):**
- Pre-filled from agreement data (sessionStorage) or manual entry
- Fields: Company Name, Full Name, Email Address, Phone Number
- "Go To Step #2" button → validates and advances

**Step 2 ("Activate Your License & Setup"):**
- "← Edit Shipping Details" link to go back
- Order summary: item, quantity, price (based on selected plan)
- Coupon code input with "Apply" button
- **Stripe Payment Element** — embedded via `@stripe/react-stripe-js`
- "Complete Order" button with lock icon
- "* 100% Secure & Safe Payments *" trust message

**Architecture:**
1. Client selects Monthly or Annual plan
2. API route creates a Stripe Checkout Session with correct price(s)
3. Stripe Payment Element renders inside the form
4. On payment confirmation → Stripe creates Customer + Subscription
5. Redirect to thank-you page

#### [NEW] `app/funnels/growth-platform/thank-you/page.jsx` — Step 4: Confirmation
- Port of [Step4_ThankYou.html](file:///G:/My%20Drive/Texas%20AI%20Consulting/GHL/Sites-Funnels/GrowthPlatform/Step4_ThankYou.html)
- Success animation + "WELCOME TO THE GROWTH PLATFORM"
- 4-week build-out timeline (Kickoff → Email → CRM → Launch)
- "Do These 4 Things Right Now" action items
- Support resources cards
- Contact info

---

### 5. Backend API Routes

#### [NEW] `app/api/stripe/create-checkout-session/route.js`
- POST endpoint
- Accepts: `planType` ("monthly" | "annual"), customer info (name, email, phone, company)
- Creates Stripe Customer with metadata
- Creates Checkout Session with:
  - Monthly: `$500 setup fee (one-time) + $99/mo subscription`
  - Annual: `$1,164/yr subscription (no setup)`
  - `ui_mode: "embedded"` for Payment Element integration
  - `success_url` → `/funnels/growth-platform/thank-you?session_id={CHECKOUT_SESSION_ID}`
- Returns `clientSecret` for the Payment Element

#### [NEW] `app/api/stripe/webhook/route.js`
- Handles Stripe webhooks for:
  - `checkout.session.completed`:
    1. Log successful purchase
    2. **Call `lib/ghl.js` → upsert contact** (name, email, phone, company from Stripe metadata)
    3. **Apply tags** (`growth-platform-customer`, `plan-monthly` or `plan-annual`)
    4. **Create opportunity** in Growth Platform pipeline with monetary value
    5. Move to "Payment Received" stage
  - `invoice.paid` → track recurring payments, update opportunity if needed
  - `customer.subscription.deleted` → update opportunity status to "lost" or "abandoned"
- Webhook secret stored in `.env`

#### [NEW] `app/api/ghl/sync/route.js` (optional — future use)
- POST endpoint for manual GHL sync operations from admin tools
- Wraps `lib/ghl.js` functions for on-demand contact/opportunity management

---

### 6. Dependencies

#### [MODIFY] [package.json](file:///E:/PROJECTS/TexasAI%20Landing%20Page/react-three-next/package.json)
```diff
+ "@stripe/stripe-js": "^7.x",
+ "@stripe/react-stripe-js": "^4.x",
+ "stripe": "^18.x"
```

#### [MODIFY] [.env](file:///E:/PROJECTS/TexasAI%20Landing%20Page/react-three-next/.env)
Keys will be copied from the master env at [G:\My Drive\Texas AI Consulting\.env](file:///G:/My%20Drive/Texas%20AI%20Consulting/.env):
```diff
# Stripe (already in master .env)
+ STRIPE_SECRET_KEY=sk_live_51TNfYm...  (from master .env)
+ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51TNfYm...  (from master .env)
+ STRIPE_WEBHOOK_SECRET=whsec_...  (generate via Stripe Dashboard)

# GHL CRM Integration (from master .env)
+ GHL_API_KEY=pit-63c5b4d3-...  (from master .env)
+ GHL_LOCATION_ID=d2K8peAv7MftCHYvXMjv  (from master .env)
```

---

### 7. SEO & Metadata

Each funnel page gets its own metadata:

| Page | Title | Description |
|------|-------|-------------|
| Landing | "Growth Platform — All-In-One CRM & Marketing \| Texas AI" | "Replace 5 tools with one. CRM, email, SMS, funnels, and AI automation for $99/mo." |
| Agreement | "Service Agreement — Growth Platform \| Texas AI" | "Review the Growth Platform service agreement." |
| Checkout | "Activate Your Growth Platform \| Texas AI" | "Complete your order and activate your Growth Platform." |
| Thank You | "Welcome to the Growth Platform \| Texas AI" | "You're in. Here's what happens next." |

Funnel pages: Landing & Agreement are indexable. Checkout & Thank You are `noindex`.

---

## Resolved Decisions

- ✅ **GHL Pipeline:** "Growth Platform" created with 6 stages (New Lead → Active Client). See [Pipeline Reference](file:///E:/PROJECTS/TexasAI%20Landing%20Page/react-three-next/documents/GrowthPlatform_Pipeline_Reference.md).
- ✅ **MSA:** Rendered as a page at `/funnels/growth-platform/agreement/msa` from [Master_Services_Agreement.md](file:///G:/My%20Drive/Texas%20AI%20Consulting/GHL/Agreements/Master_Services_Agreement.md). No PDF needed.
- ✅ **GHL CRM:** Stripe webhook → upsert contact + create opportunity automatically.

## Open Questions

> [!IMPORTANT]
> **Stripe Mode** — Should we build with **test keys** first so you can test the full flow, then switch to live keys when ready? (Recommended)

> [!IMPORTANT]
> **Coupon Codes** — The GHL form shows a coupon code field. Do you want me to create any Stripe coupons now, or just build the UI and you'll create coupons later?

---

## Verification Plan

### Automated Tests
1. **Build check:** `npm run build` — no compilation errors
2. **API route test:** `curl` the create-checkout-session endpoint with test data
3. **Stripe product verification:** Use MCP to list products/prices and confirm correct creation

### Manual Verification
1. **Visual review:** Navigate all 4 funnel pages at `localhost:3000/funnels/growth-platform/`
2. **Mobile responsiveness:** Test at 375px and 768px widths
3. **Full checkout flow:** Test with Stripe test card `4242 4242 4242 4242`
4. **Theme consistency:** Verify gold (#ebcb4c), blue (#2c75ff), dark (#000000) match GHL theme
5. **Step navigation:** Verify step indicator, back navigation, and form validation
6. **Recording:** Create browser recording of the complete purchase flow
