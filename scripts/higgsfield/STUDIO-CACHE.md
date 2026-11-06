# Private studio cache preparation

This is feature-branch preparation. It does not open access, issue learner codes,
authorize a provider request, apply migrations or release the studio. The native
eligibility adapter still denies access. Deployment acceptance remains separate.

The previous `NetworkOnly` rule protected a newly installed worker, but did not
address a browser still controlled by the old production worker or old entries in
CacheStorage. HTTP `Cache-Control: no-store` does not govern the Cache API. See the
[official Workbox caching guide](https://developer.chrome.com/docs/workbox/caching-strategies-overview).

The November 5 test reproduced the old worker caching a synthetic private response
despite that HTTP header. The original studio client then sent private requests
through that controller. No real learner response or access was involved.

## Prepared protection

- The first Workbox runtime rule recognizes the private document/API namespace,
  encoded aliases, repeated slashes and normalized paths; all remain network-only.
- The generated worker imports `public/workshop-studio/cache-guard.js`. Activation
  and a versioned MessageChannel acknowledgment remove only same-origin private
  request entries from existing caches. Public and unrelated-origin entries stay.
  A failed deletion cannot produce a successful acknowledgment. Bodies are not read.
- The studio client verifies its current controller before any session/job fetch,
  code exchange, logout request or download navigation. An old/unknown controller
  blocks those actions and asks the user to reconnect/reload. A controller change
  immediately clears the view, invalidates pending renders and checks again.
- With no controller, native network requests retain the existing no-store headers
  and response policy. The acknowledgment is a cache-compatibility check, not
  authentication or native payment/eligibility proof.
- The private document uses `studio.js?v=cache-guard-1` to avoid a legacy cached
  unguarded script at the old URL. Bump that version when changing this protocol.
  Neither private documents nor private API responses are precache assets.

## Local verification

Save the *pre-studio production build's* generated `public/sw.js` and its matching
`public/workbox-*.js` files in `.tmp/workshop-studio-sw/legacy` before building this
branch. These are generated public artifacts, not credentials; do not commit them.
An alternative saved artifact directory can be supplied with `--legacy-dir`.

From the actual app repository:

```powershell
npm run build
python -X utf8 scripts/verify-workshop-studio-service-worker.py --legacy-dir <saved-worker-directory>
python -X utf8 scripts/verify-workshop-studio-ui.py --with-server
npm test -- --reporter=dot
```

The worker verifier serves actual generated old/new workers and matching Workbox
code on isolated `127.0.0.1:3143`. Public precache resources and private endpoint
payloads are inert/synthetic fixtures, not a deployed Next app or real eligibility.
It uses an owned persistent Chromium profile, restarts the browser with the old
worker/cache retained, upgrades the controller while the private page is open,
then tests offline behavior and rollback to an unrecognized controller. It checks
current/next synthetic-owner responses, auth/closed errors, aliases and downloads.
Its owned profile path/marker are verified before cleanup; the owned server is
closed and the port checked. It does not load `.env` or contact any provider/CRM.

`--legacy-only --red-baseline` serves the pre-change client from commit `946ab1a`
and intentionally fails the no-private-requests assertion. It reproduces the
baseline leak into the synthetic worker cache. Do not interpret this expected
failure as operational learner access. Normal mode must pass.

Unit tests separately force a failed cache deletion and verify a negative reply,
unknown-version rejection and preservation of public/foreign entries. The existing
18 UI checks exercise actual closed endpoints plus synthetic session/result and
cookie/logout races; those checks block service workers and remain complementary.

## Remaining release acceptance

The local installed-worker tests are complete; deployed-host upgrade/cache behavior
still needs verification before learner activation. No authenticated private HTML
or learner session has previously been released, so the upgrade test begins with
the actual pre-studio worker and synthetic legacy entries. It does not claim to
repair a historical real learner exposure. Do not activate access to obtain test
data. Keep all immutable access/provider gates closed while native Stripe-order
eligibility, trusted pricing, provider/output lifecycle, deployed storage/retention,
class materials and instructor rehearsal/example review remain outstanding.
