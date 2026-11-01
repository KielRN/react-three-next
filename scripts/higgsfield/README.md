# Higgsfield instructor verification

Run from `react-three-next/`, using npm/Node and the official `@higgsfield/client/v2` SDK. This script is private instructor tooling, not the learner studio or a public HTTP endpoint.

Credentials stay in an ignored `.env.local` or existing `.env`, loaded quietly at runtime. Use `HF_CREDENTIALS=key-id:key-secret`; the existing `HIGGSFIELD_API_KEY` alias and Python-style `HF_KEY` are also supported. Enter/edit values locally. Never paste credentials in chat, print environment files, enable HTTP debugging, or commit credentials. No `NEXT_PUBLIC_` variable is used.

```powershell
node scripts/higgsfield/index.mjs smoke
node scripts/higgsfield/index.mjs reference
node scripts/higgsfield/index.mjs status smoke
node scripts/higgsfield/index.mjs status reference
```

`smoke` uses the requested sunset prompt, Seedance2.5 text-to-video,5s/720p/16:9/MP4, audio off. `reference` uploads only the hash-checked supplied primitive corridor previz and tests the existing ten-second class prompt/settings. Runtime key permissions proved sufficient on November1; no new key was created.

Both commands can be billable and require current instructor spending authorization. Existing saved records are reused, never replaced to trigger another generation. The initial two pilots are already submitted; use **status** to resume polling. The script saves its exact body/idempotency key before one SDK `subscribe` POST with `maxRetries:0` and `withPolling:false`, then polls the saved status endpoint. Explicit polling handles canceled responses, which SDK0.2.6's automatic poller does not recognize as terminal. Failed/moderated/canceled states are not success. An uncertain submission is never automatically retried. A crash lock needs process/receipt inspection before local removal; removing a lock is not authorization to delete or reset the request record.

Receipts are private ignored `.tmp/workshop-studio/funded-pilot/{smoke,reference}.json`. Successful output prints a video URL; status alone does not prove exact account charges/refunds. API credentials are never written to these records. Inputs and provider URLs are private workshop working data; do not put them in public indexes.

The actual account `/estimate` response can return `type:description` and `pricing_description` instead of the documentation's `usd`. Instructor-only formula fallback accepts the verified model rate and records its nonbinding nature. Initial planning estimates: USD2.3112 smoke and USD5.54688 reference (232/555 cents conservatively). Local instructor planning limits300/600 cents do not impose provider-side spending limits or guarantee the final charge. These limits are not the learner allowance: student500-cent and cohort6000-cent limits remain unchanged. No formula response is accepted by the production studio's USD quote issuer. Public access/provider gates remain disabled pending acceptance.

Official references: [SDK](https://docs.higgsfield.ai/docs/how-to/sdk), [text-to-video](https://console.higgsfield.ai/models/bytedance/seedance-2.5/text-to-video/api-reference), [reference-to-video](https://console.higgsfield.ai/models/bytedance/seedance-2.5/reference-to-video/api-reference), [uploads](https://docs.higgsfield.ai/docs/concepts/file-uploads), [billing](https://docs.higgsfield.ai/docs/concepts/billing-and-retention).
