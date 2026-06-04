# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for Texas AI Consulting that combines traditional web pages with immersive 3D experiences using React Three Fiber. The project is built on the react-three-next starter template, which enables seamless navigation between pages with dynamic DOM and canvas content without reloading or recreating the canvas.

## Development Commands

```bash
# Development
npm run dev              # Start development server (Next.js dev mode)

# Building
npm run build            # Production build
npm run analyze          # Build with bundle analyzer enabled
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint with auto-fix on app directory
```

## Key Architecture Patterns

### 3D Canvas Integration with tunnel-rat

The application uses `tunnel-rat` to portal 3D components between separate renderers. This is the core architectural pattern:

1. **Global tunnel instance** ([src/helpers/global.js](src/helpers/global.js)): Creates a single `r3f` tunnel used throughout the app
2. **Scene component** ([src/components/canvas/Scene.jsx](src/components/canvas/Scene.jsx)): Fixed-position Canvas that persists across route changes, renders `<r3f.Out />`
3. **Layout integration** ([src/components/dom/Layout.jsx](src/components/dom/Layout.jsx)): Scene is mounted in Layout with `pointer-events: none` and uses `gl.scissor` for viewport segmentation
4. **View component** ([src/components/canvas/View.jsx](src/components/canvas/View.jsx)): Wraps 3D content with `<Three>` component which renders `<r3f.In>` to portal content into the Scene canvas

**Usage pattern:**
```jsx
<View orbit className='relative h-48 w-full'>
  <YourThreeJSComponent />
</View>
```

This architecture ensures the WebGL context persists between page navigations while allowing 3D content to be embedded anywhere in the DOM.

### Path Aliases

The project uses `@/*` path alias (configured in [jsconfig.json](jsconfig.json)) that resolves to both `app/*` and `src/*` directories:
- `@/components/...` → `src/components/...`
- `@/helpers/...` → `src/helpers/...`
- When importing from app directory (e.g., layouts), use `@/components/dom/Layout`

### App Directory Structure

- [app/](app/) - Next.js app directory with routes and pages
  - [app/layout.jsx](app/layout.jsx) - Root layout with metadata, fonts, and Google Analytics
  - [app/page.jsx](app/page.jsx) - Homepage
  - [app/blog/](app/blog/) - Blog listing and individual post routes
  - [app/api/contact/](app/api/contact/) - Contact form API route
  - Other routes: `/apps`, `/portfolio`, `/elliott-card`, `/blob`
  - [app/mock-ups/](app/mock-ups/) - Client mockup review pages (`noindex, nofollow`)

- [src/components/](src/components/) - React components organized by type
  - `canvas/` - 3D React Three Fiber components (Scene, View, 3D models)
  - `dom/` - Regular DOM components (Layout, Navigation)
  - `blog/` - Blog-specific components (BlogHeader, BlogList, etc.)
  - `app-page-components/` - Components for the /apps page
  - `mini-apps/` - Interactive mini-application components
  - `portfolio/` - Portfolio-specific components
  - `mdx/` - MDX-specific components

- [src/templates/](src/templates/) - Reusable templates (ContactForm, ProductCard, Scroll, Shader)

- [src/data/](src/data/) - Static data files

- [src/helpers/](src/helpers/) - Helper utilities and shared components

### Blog System

The blog system supports both `.md` and `.mdx` files:

- **Content location**: [content/blog/](content/blog/)
- **Server-side utilities**: [lib/blog.js](lib/blog.js) contains `'use server'` functions for reading blog posts
- **Key functions**:
  - `getBlogPostBySlug(slug)` - Fetches single post, auto-detects .md vs .mdx
  - `getAllBlogPosts()` - Returns all posts sorted by date (newest first using `compareDesc`)
  - `getAllTags()` - Extracts unique tags from all posts
  - `getBlogPostsByTag(tag)` - Filters posts by tag
  - `sortBlogPostsByDate(posts)` - Utility in [lib/blogUtils.js](lib/blogUtils.js) that sorts posts newest first

**Blog Components**:
- [src/components/blog/BlogHeader.jsx](src/components/blog/BlogHeader.jsx) - Compact header with LCARS decorations, typewriter effect, and navigation
- [src/components/blog/BlogList.jsx](src/components/blog/BlogList.jsx) - Blog grid with collapsible filter section (reversed array for newest first display)
- [src/components/blog/TagsList.jsx](src/components/blog/TagsList.jsx) - Minimal tag filter buttons
- [src/components/blog/BlogCard.jsx](src/components/blog/BlogCard.jsx) - Individual blog post cards in 3-column grid
- [src/components/blog/BlogLayout.jsx](src/components/blog/BlogLayout.jsx) - Individual post layout with prev/next navigation
- [src/components/blog/ContactForm.jsx](src/components/blog/ContactForm.jsx) - Embedded contact form (1300px height for full mobile display)

**Blog Layout Design Principles**:
- **Collapsible filter section**: Tags hidden by default with "SHOW FILTERS" toggle button to maximize content space
- **Posts sorted newest first**: BlogList reverses the posts array to ensure latest content appears at the top
- **Reduced header padding**: Less vertical space for header elements
- **3-column responsive grid**: 1 column mobile, 2 tablet, 3 desktop
- **Active filter indicator**: Shows active tag in button when filter is collapsed

**Blog post frontmatter format:**
```yaml
---
title: "Post Title"
date: "2025-01-09"
author: "Author Name"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
image: "/path/to/image.jpg"
---
```

**MDX Component Customization**: Custom MDX component styling is defined in [mdx-components.jsx](mdx-components.jsx) at the root level (not in app or src).

## Configuration Files

- [next.config.js](next.config.js) - Next.js configuration with:
  - PWA support (`@ducanh2912/next-pwa`)
  - MDX support (`@next/mdx`)
  - Bundle analyzer
  - Custom webpack loaders for GLSL shaders (`.glsl`, `.vs`, `.fs`, `.vert`, `.frag`) and audio files
  - `output: 'standalone'` for containerized deployments (Railway)
  - ESLint disabled during builds (Railway treats warnings as errors)

- [tailwind.config.js](tailwind.config.js) - Custom theme with Texas AI brand colors:
  - `ai-primary`: #000000
  - `ai-gold`: #ebcb4c
  - `ai-blue`: #2c75ff
  - `ai-navy`: #0e2042
  - Custom font: `font-hesdeadjim` (Arial Black)

- [.eslintrc](.eslintrc) - ESLint extends next, prettier, and tailwindcss plugins

- [.prettierrc](.prettierrc) - Code formatting with single quotes, no semicolons, 120 char line width

## Integrations

### GHL (GoHighLevel) CRM

[lib/ghl.js](lib/ghl.js) provides a Node.js API client mirroring Python skills (`ghl_ops_sync.py`, `ghl_sales.py`). Key functions:

- `upsertContact({ email, firstName, lastName, phone, companyName, tags })` — create or update a contact, deduplicates by email
- `createOpportunity({ pipelineName, oppName, contactId, stageName, value })` — add an opportunity to a named pipeline, resolves pipeline/stage by fuzzy name match
- `updateOpportunity({ oppId, stageId, status, monetaryValue, name })` — move a deal stage or update status (`open`, `won`, `lost`, `abandoned`)
- `getPipelines()` / `resolvePipelineAndStage(pipelineName, stageName)` — internal helpers

Required env vars: `GHL_API_KEY`, `GHL_LOCATION_ID`

### Stripe Payments (Growth Platform Funnel)

The `/funnels/growth-platform` route is a self-contained sales funnel with Stripe embedded checkout:

- [app/funnels/growth-platform/page.jsx](app/funnels/growth-platform/page.jsx) — landing/pricing page
- [app/funnels/growth-platform/checkout/page.jsx](app/funnels/growth-platform/checkout/page.jsx) — checkout flow
- [app/funnels/growth-platform/agreement/page.jsx](app/funnels/growth-platform/agreement/page.jsx) — MSA agreement pages
- [app/funnels/growth-platform/stripe-config.js](app/funnels/growth-platform/stripe-config.js) — price IDs and product config
- [app/api/stripe/create-checkout-session/route.js](app/api/stripe/create-checkout-session/route.js) — creates Stripe session
- [app/api/stripe/webhook/route.js](app/api/stripe/webhook/route.js) — handles Stripe events

Stripe is currently in **test/sandbox mode**. Required env vars:

```
STRIPE_SECRET_KEY                 # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET             # whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # pk_test_... or pk_live_...
NEXT_PUBLIC_GP_PRODUCT_ID         # prod_...
NEXT_PUBLIC_GP_PRICE_MONTHLY      # recurring monthly
NEXT_PUBLIC_GP_PRICE_ANNUAL       # recurring yearly
NEXT_PUBLIC_GP_PRICE_SETUP        # one-time setup fee
```

**Critical operational rules:**

1. **Test/live keys cannot mix with the wrong-mode price IDs.** A `sk_test_` key with a live `price_…` ID returns `resource_missing: No such price …`, the API returns 500, and on Railway the body is stripped — the frontend used to show "Unexpected end of JSON input" with no detail (now surfaces the real status/body).
2. **`NEXT_PUBLIC_*` env vars are inlined at build time.** Adding or changing them on Railway requires a **redeploy**, not just a restart.
3. **Always update the hardcoded fallbacks in `stripe-config.js`** to match the currently active mode. Keep the inactive-mode IDs in the comment block at the top for easy cutover.
4. **The setup fee is a one-time price** (no `recurring` block); it's added as a second line item in subscription mode and billed on the first invoice.

**To create new products/prices** (test or live), use the `.agent/skills/manage_stripe_products` skill — it includes a parameterized `create_stripe_products.js` script that refuses to run with mismatched key/mode, prints copy-paste-ready env var lines, and walks through the full wiring update (local `.env`, fallbacks, Railway).

### Stripe Payments (Reviews Service Funnel)

The `/funnels/reviews` route is a self-contained sales funnel for the Texas AI Reviews Service. It **reuses the shared Stripe account** (same `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as the Growth Platform funnel). The two funnels stay separated by using distinct product/price IDs (`NEXT_PUBLIC_REV_*`) and a distinct webhook endpoint (`/api/stripe/webhook-reviews`) with its own signing secret.

- [app/funnels/reviews/page.jsx](app/funnels/reviews/page.jsx) — landing page (hero, problem/solution, timeline, FAQ)
- [app/funnels/reviews/pricing/page.jsx](app/funnels/reviews/pricing/page.jsx) — 3-tier pricing with monthly/annual toggle
- [app/funnels/reviews/demo/page.jsx](app/funnels/reviews/demo/page.jsx) — demo lead-capture (posts to `/api/contact` with `source: 'reviews_funnel_demo'`)
- [app/funnels/reviews/checkout/page.jsx](app/funnels/reviews/checkout/page.jsx) — Stripe embedded checkout (subscription mode + 10-day trial)
- [app/funnels/reviews/thank-you/page.jsx](app/funnels/reviews/thank-you/page.jsx) — post-purchase confirmation
- [app/funnels/reviews/stripe-config.js](app/funnels/reviews/stripe-config.js) — tier definitions, price IDs, display copy
- [app/funnels/reviews-test-live/](app/funnels/reviews-test-live/) — LIVE-mode smoke test mirror (red TEST PAGE banner, `noindex,nofollow`, $1.50/$5.50 dummy prices)
- [app/api/stripe/create-checkout-session-reviews/route.js](app/api/stripe/create-checkout-session-reviews/route.js) — production API route
- [app/api/stripe/create-checkout-session-reviews-test-live/route.js](app/api/stripe/create-checkout-session-reviews-test-live/route.js) — test-live API route
- [app/api/stripe/webhook-reviews/route.js](app/api/stripe/webhook-reviews/route.js) — Stripe webhook handler; short-circuits events with `metadata.source === 'reviews_funnel_test_live'` (no GHL writes for test purchases)
- [lib/stripe-reviews.js](lib/stripe-reviews.js) — Stripe SDK singleton bound to `REV_STRIPE_SECRET_KEY`

Required env vars (in addition to the shared `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` used by the Growth Platform funnel):

```
STRIPE_REVIEWS_WEBHOOK_SECRET                  # whsec_... (from the /api/stripe/webhook-reviews endpoint)

# Production products (3 tiers × 2 cadences = 6 prices)
NEXT_PUBLIC_REV_PRODUCT_STARTER
NEXT_PUBLIC_REV_PRODUCT_GROWTH
NEXT_PUBLIC_REV_PRODUCT_PRO
NEXT_PUBLIC_REV_PRICE_STARTER_MONTHLY / _ANNUAL
NEXT_PUBLIC_REV_PRICE_GROWTH_MONTHLY  / _ANNUAL
NEXT_PUBLIC_REV_PRICE_PRO_MONTHLY     / _ANNUAL

# Test-live dummy products (LIVE-mode only; set at cutover)
NEXT_PUBLIC_REV_TL_PRODUCT_STARTER / _GROWTH / _PRO
NEXT_PUBLIC_REV_TL_PRICE_STARTER_MONTHLY / _ANNUAL  (and growth, pro)
```

**Fulfillment:** webhook upserts a GHL contact and creates an opportunity in the **"Reviews Service"** pipeline (must be created manually in GHL with these 5 stages: `Trial Started`, `Trial Ending Soon`, `Active Subscription`, `Trial Ended No Conversion`, `Churned`).

**To create products** for the Reviews funnel: use `.agent/skills/manage_stripe_products/scripts/create_reviews_products.js --mode=<test|live> --prefix=<REV|REV_TL>`. The same operational rules from the Growth Platform section apply (test/live mode mismatch refused, NEXT_PUBLIC_* require redeploy, fallbacks must match active mode).

### Contact Form & Webhooks

[app/api/contact/route.js](app/api/contact/route.js) proxies form submissions to a Make.com webhook (`NEXT_PUBLIC_CONTACT_WEBHOOK`). The ROI calculator posts to a GHL webhook (`NEXT_PUBLIC_ROI_CALCULATOR_WEBHOOK`).

## Required Environment Variables

Copy `.env.example` to `.env` and populate:

```
NEXT_PUBLIC_CONTACT_WEBHOOK=      # Make.com webhook URL
NEXT_PUBLIC_ROI_CALCULATOR_WEBHOOK=  # GHL webhook URL
GHL_API_KEY=                      # GoHighLevel API key
GHL_LOCATION_ID=                  # GHL location ID
STRIPE_SECRET_KEY=                # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=            # whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # pk_test_... or pk_live_...
NEXT_PUBLIC_GP_PRICE_MONTHLY=     # Stripe price ID
NEXT_PUBLIC_GP_PRICE_ANNUAL=      # Stripe price ID
NEXT_PUBLIC_GP_PRICE_SETUP=       # Stripe price ID
```

## Deployment

Configured for Railway deployment:
- Uses `output: 'standalone'` in Next.js config
- [Procfile](Procfile) and [railway.json](railway.json) define deployment settings
- Environment variables should be set in Railway dashboard

## Styling

- Tailwind CSS with JIT mode
- Custom animations: `pulse-slow`, `blink-slow`
- Global styles in [app/global.css](app/global.css)
- Font: Space Mono (loaded via next/font/google in layout)

## Special Features

- **PWA Support**: Progressive Web App enabled via `@ducanh2912/next-pwa` (disabled in development)
- **GLSL Shader Support**: Import `.glsl` files directly using raw-loader and glslify-loader
- **React Three Fiber**: 3D rendering with `@react-three/fiber` and `@react-three/drei`
- **MDX Support**: Both `.md` and `.mdx` files supported for blog posts with custom component styling
