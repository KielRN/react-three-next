# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] — 2026-04-26

### Added
- Stripe integration: payment processing via `@stripe/stripe-js` and `@stripe/react-stripe-js`
- Stripe webhook handler at `/api/webhooks/stripe` for processing payment events
- Checkout session API route at `/api/create-checkout-session`
- Environment variables: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
