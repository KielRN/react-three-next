# Growth Platform — GHL Pipeline Reference

**Pipeline Name:** `Growth Platform`  
**GHL Location:** `d2K8peAv7MftCHYvXMjv`  
**Created:** April 2026  
**Funnel:** `/funnels/growth-platform/`

---

## Pipeline Stages

| # | Stage Name | Trigger | What It Means |
|---|------------|---------|---------------|
| 1 | **New Lead** | Agreement form submitted (Funnel Step 2) | Contact captured via the acknowledgement form. Has reviewed terms but hasn't paid yet. |
| 2 | **Payment Received** | Stripe checkout completed (Funnel Step 3) | Money is in. Stripe webhook fires → GHL contact upserted → opportunity created/moved here automatically. |
| 3 | **Kickoff Scheduled** | You book the Week 1 call | Customer responded to welcome email and booked their kickoff. |
| 4 | **Build-Out** | After kickoff call | Weeks 2-3 of onboarding: domain setup, email/DNS config, CRM pipelines, automations being built. |
| 5 | **Live & Training** | Week 4 launch session | Platform delivered. Live training walkthrough completed. |
| 6 | **Active Client** | Ongoing | Paying monthly/annual, actively using the platform. Eligible for 1hr/mo expert sessions. |

---

## Automated vs Manual Stages

### 🤖 Automated (handled by code)
- **New Lead** — Created automatically when the agreement form is submitted on the funnel
- **Payment Received** — Moved automatically when Stripe webhook fires

### 👤 Manual (you manage)
- **Kickoff Scheduled** — Move here when client books their Week 1 call
- **Build-Out** — Move here after the kickoff call
- **Live & Training** — Move here when platform is ready for handoff
- **Active Client** — Move here after training is complete

### Agent Skills
Your existing Python agent skills can also manage these stages:
```bash
# Query pipeline status
python .agent/skills/ghl_crm_query/query_ghl.py --action opportunities --pipeline "Growth Platform" --status open

# Move an opportunity to a new stage
python .agent/skills/ghl_sales/ghl_sales.py --action update_opportunity --opp-id <OPP_ID> --stage-id <STAGE_ID>
```

---

## Tags Applied

| Tag | When Applied | Purpose |
|-----|-------------|---------|
| `growth-platform-customer` | On Stripe checkout complete | Identifies all Growth Platform customers |
| `plan-monthly` | On checkout (monthly selected) | Billing type segmentation |
| `plan-annual` | On checkout (annual selected) | Billing type segmentation |
| `agreement-signed` | On agreement form submit | Pre-payment tracking |

---

## Opportunity Values

| Plan | Monetary Value | Display |
|------|---------------|---------|
| Monthly | $1,188 | 12-month projected value ($99 × 12) |
| Annual | $1,164 | Annual payment amount |

---

## GHL Workflow Automation Suggestions

After creating this pipeline, consider setting up these GHL workflows:

1. **Trigger:** Opportunity moved to "Payment Received"
   - → Send welcome email with kickoff booking link
   - → Internal notification to Elliott
   - → Wait 24hrs → SMS reminder to book kickoff

2. **Trigger:** Opportunity moved to "Active Client"
   - → Send "You're Live" congratulations email
   - → Schedule 30-day check-in task

3. **Trigger:** Opportunity status changed to "Lost"
   - → Send win-back email sequence (after 30 days)

---

*Document Version: 1.0 — April 2026*
