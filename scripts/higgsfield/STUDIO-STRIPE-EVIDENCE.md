# Prepared Stripe order evidence — not studio access

Registration now uses the website's Stripe account and embedded checkout. GHL is
the contact/fulfillment system. Its separate Payments account and nine inactive
calendar checkouts are not the studio's payment authority.

`lib/workshopStudioStripeEvidence.js` prepares a read-only server contract. It is
not imported by an access route, issuer, worker or the actual registration
verifier. `verifyStudioRegistration` still always throws
`ELIGIBILITY_NOT_ACCEPTED`; all immutable access/provider gates remain false.

## Implemented observation

The caller must supply a **trusted server binding**, never a browser body or URL:
expected Stripe account/mode, Checkout Session, PaymentIntent, latest Charge,
original Customer and purchaser GHL contact, dated workshop, exact price/product,
and (if applicable) the approved Resume promotion/coupon references. The reader
copies validated primitives before its first await. This contract does not yet
load or persist that binding; providing an object to this function does not prove
who owns a seat.

The installed official Stripe SDK performs six bounded GETs, with retries off:
own account (`accounts.retrieve(null)`), exact Checkout Session, its line items,
exact PaymentIntent, refunds for the pinned Charge, then the Charge last.

Validation includes:

- Correct account, live/test mode and every object ID/relation; completed paid
  one-time checkout; exact workshop and cohort instant in checkout/intent metadata.
- One item/one attendee, the pinned dated price/product and lookup key; approved
  $49/$99 amounts, or $29 Resume with the pinned promotion. No additional line
  items, pagination, recurring/custom prices, shipping or unadopted tax amounts.
- Matching original buyer Customer and fulfilled purchaser contact in intent
  metadata. Buyer email, a GHL tag and a receipt page are never access evidence.
- Captured/succeeded payment and charge for the exact total; no partial/full
  refund, pending/succeeded refund, dispute or open review. Unknown/paginated
  refund state fails closed. Fully observed failed/canceled refunds with zero
  refunded amount do not by themselves revoke payment evidence.

The result is frozen, minimal `stripe-order-evidence-v1`: references, amounts and
the server check-start timestamp. It contains no access/seat/epoch grant, email,
name, client secret, receipt URL or card data. It cannot satisfy the existing seat
proof validator. SDK failures are replaced with a generic error, without raw
response/credential details. Dates use the approved session registry directly;
the future-only catalog helper would incorrectly reject evidence after class.

**Consistency limit:** Stripe reads are not a distributed transaction. Reading the
Charge last catches observed completed refunds, but does not freeze refunds or
disputes after the read. Future access/provider mutation must enforce fresh
proofs and accepted revocation/ownership logic, not reuse this snapshot forever.

## Native schema readback and local tests

November 6: two read-only SDK requests inspected the current account ID and an
already-owned expired/unpaid Resume test checkout from the saved November 4
rollout. No session was created, paid, expired again or changed. Sanitized evidence
is in `GHL/Plans/workshop-studio-stripe-2026-11-06/native-schema-readback.json`.
The native discounted session has `coupon:null` and the exact promotion-code ID;
the reader supports that shape instead of requiring a non-null coupon field.
The mode is live but the expired/unpaid session is **not eligible payment proof**.

The new tests use synthetic objects and the real installed SDK against an owned
local HTTP server. They cover exact GET paths, the three fee cases, negative
identity/state/refund/discount cases, mutable-binding isolation, sanitized errors
and continued denial by the real registration verifier. No test credentials or
learner records are provisioned. The existing database, cache and teaching assets
are unchanged.

## Next source-binding work — not implemented or accepted yet

1. Add a source-specific, immutable bridge from the canonical Stripe order to
   one existing studio seat/cohort. Globally preserve `(account, mode, checkout)`
   identity and retired references so another buyer, transfer or contact change
   cannot mint a second allowance. Do not disguise Stripe IDs as GHL appointments.
2. Store original purchaser/order references separately from the **current** seat
   owner. An approved transfer changes current ownership/access version and
   revokes old codes/sessions; it preserves the same order, usage and old-job
   isolation. Stripe's original buyer contact is not the transferee identity.
3. Load the accepted server binding, read current native evidence, then compare
   binding/cohort/current owner/epoch again under the existing seat lock before
   any learner mutation. Reject changed/deleted bindings and stale/future proofs.
   Production binding mode must be live; test orders cannot grant real access.
4. Accept native paid/refund/transfer/current-contact linkage and deployed-runtime
   behavior before wiring the real verifier or provisioning anything. Existing
   sandbox registration evidence does not establish this new studio bridge.
   Reschedules and 90-day credits need an explicit accepted attendance mapping;
   never rewrite original order history to make a different cohort pass.
5. Preserve fresh `main` changes during integration. Its migration `012_caller_pay`
   already occupies that number; coordinate a later migration rather than reuse
   it. No migration is created/applied by this reader, and running the generic
   migrator from the studio branch would include still-unapproved studio DDL.

Remaining pricing, provider/input/output lifecycle, deployed cache/storage,
materials and instructor review gates remain open. This module alone does not
make the studio operational or fund learner generation.

## Primary sources

- [Checkout Session](https://docs.stripe.com/api/checkout/sessions/object)
- [Session line items](https://docs.stripe.com/api/checkout/sessions/line_items)
- [Charge](https://docs.stripe.com/api/charges/object)
- [Refund list](https://docs.stripe.com/api/refunds/list)
- The installed Stripe SDK account resource documents `retrieve(null)` for the
  authenticated own account; its typed Session discount accepts nullable coupon
  and promotion-code references. The native readback confirms the used shape.
