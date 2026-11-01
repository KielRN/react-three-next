# Prepared private output delivery

This feature remains on `feat/workshop-studio-ledger`, with all real learner/transport gates false and the native GHL verifier deny-all. Migration011 has **not** been applied to production. No learner, credential, provider request, production asset or live message was created by this work.

`lib/workshopStudioOutputs.js` prepares private output copies in the app's existing PostgreSQL database. It adds no storage account, public bucket, service or new credentials. A copy is limited to16MiB, has a SHA256 and byte-count constraint, and is bound to the generation job's original access version. The same job cannot store a second different copy. This is bounded small-class storage; deployed database capacity/backups and worker concurrency remain acceptance work before production use.

Only a server-stored completed provider request can supply a source URL. The frozen output origin registry contains the exact CDN host observed in both completed instructor pilots. HTTPS, credentials/port/fragment rejection and a path segment matching the bound provider request ID are required. Browser/owner URL parameters cannot add origins. Requests send only `Accept: video/mp4`, never API authorization; redirects, non200/partial `Content-Range` responses, unbounded/truncated bodies and wrong MIME/MP4 prefix are rejected. Container-prefix admission is not a full codec/playback test. Default gates deny before database/network regardless of this prepared registry.

Import verifies native eligibility/current ownership before HTTP and again afterward, without holding a DB connection during network or GHL calls. A transfer, cancellation, pause, expiry or source change during the copy prevents persistence. Provider observations remain private. No prompts, URLs, contact details or bytes enter audit details.

An imported copy has the cohort access deadline, bounded by the existing seven-day class policy; it can outlive the provider's shorter source retention. Metadata and every256KiB download read join the current session hash/revocation, seat/access version, original job/output version, registration state, pause state and both deadlines in one SQL statement. In-flight reads linearize at that authorization statement: already delivered bytes cannot be recalled, but later reads stop. Downloads also periodically refresh native eligibility after30seconds.

Prepared endpoints:

- `GET /api/workshop-studio/jobs` returns at most50 current-epoch job summaries. No provider IDs, source URLs, private prompts or asset fingerprints are returned.
- `GET /api/workshop-studio/jobs/{jobId}/download` serves only a stored authorized copy as an attachment. Query selectors/range controls are rejected. Responses use no-store/no-referrer/nosniff/sandbox/same-origin/noindex headers. No source redirect or signed public link is issued.

The stream demands each next chunk without prefetch. Client abort, revoked session, transferred registration, missing bytes or expiry interrupts delivery rather than claiming a complete file. Copy hashes are exposed only as private owner metadata, never credentials.

`purgeExpiredStudioOutputs` is an internal cleanup primitive for expired studio copies, preserving every budget/ledger row. Its cleanup scheduler is **not wired**; automatic deletion/deployed retention is not accepted. Access expiry itself is enforced on every read independently of cleanup. Existing database backup retention is a separate deployment policy; active-copy deletion is not a promise to erase every backup.

The existing light/yellow private document now prepares saved-video status and download links. Generation stays disabled. New fields are rendered with DOM text, not HTML. Result revisions stop older refreshes or logged-out responses from restoring links. Session-changing POST/DELETE operations remain serialized locally across visibility/BFcache invalidation; successful stale POSTs broadcast cookie changes before rendering suppression because `Set-Cookie` is applied by the browser independently. Other windows clear their private view on a credential-free BroadcastChannel signal. No codes, tokens or result data are broadcast or stored in local/session storage.

Verification uses synthetic HTTP/native-eligibility fixtures and isolated local databases; it is not a live paid-learner grant. The optional real-pilot-byte test reads the existing saved file into mock HTTP, stores/streams all8,057,470 bytes through real PostgreSQL and the actual download handler, and checks its unchanged hash. It does not inspect video frames or contact the provider.

```powershell
npm test
python scripts/verify-workshop-studio-postgres.py
python scripts/verify-workshop-studio-ui.py --with-server
```

The browser runner owns a direct local preview child on3104 and stops it in `finally`, including a port-closed check. The shared shell helper was tried but left a Windows descendant behind; that owned preview was identified/stopped. All browser sessions are isolated synthetic contexts. These checks currently block service workers: **installed-worker upgrade and authenticated cache acceptance remain OPEN**, alongside actual price/native registration binding, generation/input reference flow, real worker/storage/purge activation, deployed capacity, classroom rehearsal and Elliott's generated-example approval. No successful website build or prepared download route alone opens registration.
