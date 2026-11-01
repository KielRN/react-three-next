# Prepared studio worker acceptance

`lib/workshopStudioWorker.js` composes the existing private quote/claim ledger with the protocol client. It has **no route, scheduler, live invocation, access issuer, accepted media resolver or download transport**. Immutable learner/transport gates remain false. A future code release must deliberately connect these pieces after acceptance; an environment flag or owner paid override cannot activate them.

`dispatchStudioJob` accepts only server-derived seat/access-version/job identity. It claims the bound frozen quote once, committing unknown/held before any possible provider POST. It then verifies current eligibility/epoch/budget state and quote/payload bindings again. The final prePOST transaction commit is dispatch authorization: a later transfer does not promise canceling an already claimed request; usage stays on the registration and the old ownership epoch remains private. Provider submission uses the persisted internal job UUID and exact stored body. No automatic retry follows a timeout, crash or failed receipt write.

Migration010 adds private provider ID/status URL/state/video URL/expiry observations. Receipt and audit updates commit together using cohort→seat→job locks. Result URLs never appear in worker views, learner projections or audit details. This module **does not fetch media**; a future private output-storage/download path must enforce an accepted origin registry, bounded size/type, cancellation/expiry/ownership rechecks and no analytics/cache leakage.

`pollStudioJob` reads the exact saved provider endpoint and can reconcile lifecycle after registration transfer, pause or expiry, retaining ownership isolation. Terminal outcomes cannot regress, a changed terminal output conflicts, and observed retention can shorten but never extend. Expired or unknown-expiry provider outputs are not reported ready. Provider lifecycle and ledger billing state remain separate: completed/failed/canceled/moderated results do not settle cost or release holds. The current account's rounded analytics views are not exact job settlement proof.

Monetary finalization of a claimed dispatch requires its provider identity first. Provisional account snapshots while POST could still happen cannot clear or understate its hold. A lost acceptance receipt needs exact provider binding or a future explicit fenced-abandon procedure. That recovery flow is **not implemented**, and no automatic zero-charge conclusion is allowed. Independent definitive per-job billing evidence remains required after correlation.

`createStudioTransport` reads `HF_CREDENTIALS` or the existing `HIGGSFIELD_API_KEY` only at method runtime after its gate checks. Unit tests use synthetic strings and HTTP only. No real credentials/provider call is needed for worker acceptance tests.

## Isolated real PostgreSQL acceptance

```powershell
python scripts/verify-workshop-studio-postgres.py
```

Run inside the app root. The launcher uses installed PostgreSQL17 binaries (`PG_BIN` override) to create a fresh owned loopback SCRAM cluster under ignored `.tmp/workshop-studio/postgres-concurrency/`. It never loads project `.env`/`DATABASE_URL` or uses a preexisting database service. Before schema operations, the conditional integration suite checks its owner marker, actual server data directory, local endpoint and isolated user. Normal `npm test` skips those nine integration cases; the launcher runs them with physically independent connections.

Coverage: distinct backend PIDs,13 concurrent reservations sharing the6000-cent cap, same-intent idempotency, same-seat exclusion, an access-version change while another connection is demonstrably lock-blocked, one quote consumption, one worker dispatch, one code exchange, and settlement/reservation accounting. All contacts/provider responses/prices are synthetic local fixtures, never GHL attendees or live eligibility.

The launcher stops only its validated owned directory even after partial startup/readiness failure, removes its temporary password file and retains test/server logs. Daemon startup writes directly to a log rather than a captured pipe, avoiding Windows inherited-pipe hangs. The cleanup failure path was also exercised by a deliberate post-start readiness exception. No production migration or provider call occurs. Real local PostgreSQL acceptance closes the former single-connection PGlite gap; deployed database/runtime acceptance remains separate.
