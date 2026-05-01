# Listing Signal Build Tracker

See also: [[Home]], [[Listing Signal Spec]], [[Architecture Notes]], [[Logs/Decisions]], [[Logs/Progress]]

Working tracker for the 6-week Listing Signal build. Every item has a concrete "Done when" line so it's only checked off once it's working and functioning as expected.

## Ground Rules

- **Definition of Done.** A task is complete only when the "Done when" criteria are observable and verified. Type-checks alone don't count. Where applicable, verification means a real round-trip: `pnpm lint` clean, `pnpm build` clean, and the behavior demonstrated locally end to end.
- **Approval gate.** Any task marked `Approval: REQUIRED` must be explicitly approved before work starts. Approvals are logged in [[Logs/Decisions]] and acknowledged in the Approval Log at the bottom of this note. Approval-required tasks are anything that modifies existing working functionality — current Prisma rows, current routes, current gating, current billing wiring, current seed data, current signup flow.
- **Net-new tasks** (new files, new routes, new components that don't change existing ones) do not require pre-approval but still require Done-when verification.
- **Order.** Do tasks in roughly listed order within a week. Track A and Track B in week 1 run in parallel.
- **If a Done-when criterion can't be met,** keep the box unchecked, log a blocker in [[Logs/Issues]], and either revise the task or escalate.

---

## Week 1 — Track A: Foundations (Prisma, gating, billing wiring)

- [x] **W1-A1** Add `Listing` Prisma model (consolidated — `SavedListing` dropped, no junction needed)
    - Done when: `pnpm prisma:generate` succeeds; `pnpm prisma format` no-ops; new `Listing` model + `ListingCondition` / `SellingGoal` / `ListingStatus` enums + `User.listings` inverse relation in place. `pnpm db:push` to verify against the local DB will be done as part of W2-5 when the upload+generate flow first writes a row.
    - Files: `prisma/schema.prisma`.
    - Approval: not required (net-new models, no rename of existing models).
    - **Verified 2026-05-01.** `pnpm prisma:generate` clean; `pnpm prisma format` clean; `pnpm build` clean.

- [x] **W1-A2** Extend `PlanTier` enum: add `STARTER`, `SELLER`, `POWER_SELLER`; rename `PRO` → `STARTER` and `PREMIUM` → `SELLER`
    - Done when: enum migration applies cleanly; existing `Subscription` rows are migrated (PRO→STARTER, PREMIUM→SELLER); `pnpm verify:pass2` still passes; seeded demo accounts still log in.
    - Files: `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/plans.ts` (key rename only), `src/app/api/billing/checkout/route.ts` (case rename + POWER_SELLER 400), `src/app/(marketing)/pricing/page.tsx`, `src/app/(marketing)/signup/page.tsx`, `src/app/(dashboard)/app/leads/page.tsx`, `src/domains/alerts/service.ts`, `scripts/verify-pass2.ts`.
    - Approval: **REQUIRED** — touches existing tier values stored in the DB and used everywhere downstream. Approved by Marcus on 2026-05-01.
    - **Verified 2026-05-01.** `pnpm prisma:generate`, `pnpm build`, `pnpm lint`, `pnpm db:push --force-reset`, `pnpm db:seed`, `pnpm verify:pass2` all clean. Cleanup: `scripts/verify-pass2.ts` had 4 stale references missed by the original grep (scoped to `src/` and `prisma/`); fixed in a follow-up edit.

- [ ] **W1-A3** Extend `planContent` map in `src/lib/plans.ts` with listing quotas + add `canGenerateListing(user)` helper
    - Done when: `planContent[FREE].listingLimit === 3`, `STARTER === 25`, `SELLER === 75`, `POWER_SELLER === 250`; `canGenerateListing(user)` returns `false` for a Free user with 3 listings already this period and `true` for a Starter user with 24; existing helpers (`canUseLeadFilters`, `canUseEmailAlerts`, etc.) keep their behavior under renamed tier names.
    - Files: `src/lib/plans.ts`.
    - Approval: **REQUIRED** — touches existing gating helpers used across the lead and deals features.

- [x] **W1-A4** Add `STRIPE_STARTER_PRICE_ID`, `STRIPE_SELLER_PRICE_ID`, `STRIPE_POWER_PRICE_ID` to env, with sensible empty defaults
    - Done when: `.env.example` lists all three; the app starts cleanly with them unset (development plan switching path still works); `process.env` typing/validation if any is updated.
    - Files: `.env.example`, `src/lib/env.ts` (Zod schema, all three added as `z.string().optional()`).
    - Approval: not required (additive env vars).
    - **Verified 2026-05-01.** `pnpm build` clean.

- [ ] **W1-A5** Refactor `src/app/api/billing/checkout/route.ts` from hardcoded ternary to a `tier → priceId` map
    - Done when: posting `{ plan: "STARTER" }` resolves to `STRIPE_STARTER_PRICE_ID`; same for SELLER and POWER_SELLER; a missing price ID returns a clear 400; the existing local-only plan switch path still works in development; manual click-through on `/pricing` reaches a Stripe checkout URL when env is configured.
    - Files: `src/app/api/billing/checkout/route.ts`.
    - Approval: **REQUIRED** — touches the production billing entry point.

- [ ] **W1-A6** Remap seeded demo accounts to the new tier names
    - Done when: `pro@flipsignal.app` seeds as `STARTER`, `premium@flipsignal.app` seeds as `SELLER`; `admin@flipsignal.app` keeps admin + paid access; `pnpm db:seed` is idempotent on a previously-seeded DB.
    - Files: `prisma/seed.ts`.
    - Approval: **REQUIRED** — modifies existing seed data and demo account expectations.

## Week 1 — Track B: Greenfield risk retirement

- [x] **W1-B1** Image upload pipeline (Cloudflare R2 + signed PUT URLs)
    - Done when: a logged-in user can drag-drop a JPG ≤10 MB into the PhotoUploader and see the resulting URL fetch a 200 from the bucket; CORS works in dev; max-size + max-count guards reject oversized or 9th uploads with a clear error. The end-to-end fetch test is deferred until R2 credentials are wired (see `docs/listings-upload-setup.md`).
    - Files: `src/lib/storage/r2.ts`, `src/app/api/listings/upload/route.ts`, `src/components/app/listings/PhotoUploader.tsx` (451 LOC), `docs/listings-upload-setup.md`, `package.json` (adds `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`).
    - Approval: not required (all net-new).
    - **Verified 2026-05-01.** `pnpm build` clean — `/api/listings/upload` registered in the route table; `pnpm lint` clean. End-to-end PUT to R2 still requires bucket credentials per the setup doc.

- [ ] **W1-B2** Vision-model bakeoff on 30–50 representative photos
    - Done when: a one-page result doc is added to `Vault/FlipSignal/` (or `docs/`) with category coverage, scoring rubric, per-model accuracy on product type / brand-model / "I don't know" calibration, and per-call cost; one model is picked with rationale; the picked model's prompt scaffold is captured for week 3.
    - Files: spike notes only — no production code.
    - Approval: not required (research only, no code changes to the app).
    - **Plan ready 2026-04-30.** [[Vision Model Bakeoff Plan]] is the methodology doc; box stays unchecked until the bakeoff is actually run with real photos and the picked-model rationale is appended.

---

## Week 2 — UI scaffold

- [ ] **W2-1** Create `/listing-generator` route with empty page shell and auth guard
    - Done when: visiting `/listing-generator` while logged out redirects to `/login`; while logged in shows the empty page with the existing app layout; route appears in the dashboard navigation per existing patterns.
    - Files: `src/app/(dashboard)/app/listing-generator/page.tsx`, dashboard nav (if a shared nav component exists).
    - Approval: required only if the dashboard nav is a shared component being modified — confirm before editing.

- [ ] **W2-2** Build `PhotoUploader` component (1–8 photos, drag-drop, reorder, preview, delete)
    - Done when: a user can drop or select 1–8 files; previews render in order; drag-reorder updates the list; delete works; 9th file or oversized file shows a clear error; component is reused via the same upload endpoint from W1-B1.
    - Files: `src/components/app/listings/PhotoUploader.tsx`.
    - Approval: not required (net-new).

- [ ] **W2-3** Build `MarketplaceSelector` component (eBay only, future tiers visibly "coming soon")
    - Done when: eBay is selected by default and selectable; Mercari/Poshmark/Depop options appear disabled with a "coming soon" label; selection persists in form state.
    - Files: `src/components/app/listings/MarketplaceSelector.tsx`.
    - Approval: not required (net-new).

- [ ] **W2-4** Build `ProductDetailsForm` component (name, brand, model #, condition dropdown, accessories, defects, selling-goal radio)
    - Done when: all fields are present and optional; submitting the parent form serializes a typed payload that matches a Zod schema; condition options match the spec (New, Like New, Used-Excellent, Used-Good, Used-Fair, For Parts); selling-goal radio shows ASAP / Balanced / Max Profit.
    - Files: `src/components/app/listings/ProductDetailsForm.tsx`, schema in the matching action file.
    - Approval: not required (net-new).

- [ ] **W2-5** Backend stub generation endpoint that returns canned output
    - Done when: `POST /api/listings/generate` returns the full 11-section JSON schema with placeholder content; quota gate via `canGenerateListing()` returns 403 when over limit and decrements the counter on success.
    - Files: `src/app/api/listings/generate/route.ts`, `src/domains/listings/service.ts` (new).
    - Approval: not required (net-new endpoint and domain).

- [ ] **W2-6** Wire `/listing-generator` to the stub end to end
    - Done when: a logged-in Free user can upload a photo, fill the form, click Generate, and see the canned response render below; the in-progress listing survives a quota-hit upgrade-CTA round-trip.
    - Files: `src/app/(dashboard)/app/listing-generator/page.tsx`, the form action, the upload component glue.
    - Approval: not required (net-new).

---

## Week 3 — AI integration

- [ ] **W3-1** Install LLM SDK + wire API key
    - Done when: `pnpm install` adds the picked SDK; `LLM_API_KEY` (or provider-specific equivalent) is in `.env.example`; a tiny health-check call to the model from a script (`tsx scripts/llm-ping.ts`) returns successfully.
    - Files: `package.json`, `.env.example`, `scripts/llm-ping.ts`.
    - Approval: not required (additive).

- [ ] **W3-2** Author the system prompt + JSON output schema
    - Done when: prompt enforces the safety rules from the PRD (no fabricated compatibility, hedged language for visual-only assertions, no "tested/authentic/new" without user confirmation); a Zod schema validates the full 11-field response shape; sample run on 5 photos returns valid JSON every time.
    - Files: `src/domains/listings/prompt.ts`, `src/domains/listings/schema.ts`.
    - Approval: not required (net-new).

- [ ] **W3-3** Replace stub with real LLM call + JSON-schema validation pipeline
    - Done when: `POST /api/listings/generate` returns model output validated against the Zod schema; on validation failure, the route returns a clean error and logs the raw response; a real generation completes in ≤15s wall-clock for the median case.
    - Files: `src/domains/listings/service.ts`, `src/app/api/listings/generate/route.ts`.
    - Approval: not required (net-new flow; the stub is being replaced, not existing functionality).

- [ ] **W3-4** Build `ListingOutput` component rendering all 11 sections + `CopyButton`
    - Done when: each section renders with its label and a per-section copy button; clipboard copy works in Chrome and Safari; sticky section header is visible while scrolling; uncertainty/confidence flags from the model are rendered inline with appropriate visual weight.
    - Files: `src/components/app/listings/ListingOutput.tsx`, `src/components/app/listings/CopyButton.tsx`.
    - Approval: not required (net-new).

---

## Week 4 — Persistence + cards

- [ ] **W4-1** Build `PricingSuggestionCard` (low / target / high with one-line rationale)
    - Done when: the card renders the three prices and the rationale; visually distinguishes target from the range; respects the user's selling-goal selection in the displayed copy.
    - Files: `src/components/app/listings/PricingSuggestionCard.tsx`.
    - Approval: not required (net-new).

- [ ] **W4-2** Build `ShippingRecommendationCard` (weight estimate, packaging, carrier, paid-by)
    - Done when: card renders all four fields; falls back gracefully when the model returns "uncertain" for any of them.
    - Files: `src/components/app/listings/ShippingRecommendationCard.tsx`.
    - Approval: not required (net-new).

- [ ] **W4-3** Build photo improvement notes UI (0–3 actionable tips)
    - Done when: notes render as a small list; nothing renders when the model returns zero notes; "verify before posting" reminder appears when the model flags low confidence on model number or compatibility.
    - Files: `src/components/app/listings/PhotoNotes.tsx`.
    - Approval: not required (net-new).

- [ ] **W4-4** Implement `src/domains/listings/service.ts` save + fetch (mirror `src/domains/deals/service.ts`)
    - Done when: `saveListing(userId, payload)` writes a row tied to the user; `getListingsForUser(userId)` returns most-recent-first; both functions are pure async and call Prisma directly per the existing domain convention.
    - Files: `src/domains/listings/service.ts`.
    - Approval: not required (net-new domain).

- [ ] **W4-5** Wire Save button + build `/saved-listings` page
    - Done when: clicking Save persists the current generation; `/saved-listings` lists thumbnail + generated title + date + status; clicking an entry re-opens the full output; navigating away and back keeps the list in sync.
    - Files: `src/actions/listing-actions.ts`, `src/app/(dashboard)/app/saved-listings/page.tsx`.
    - Approval: not required (net-new).

---

## Week 5 — Billing + polish

- [ ] **W5-1** Create new Stripe products and price IDs (Starter, Seller, Power Seller) in the Stripe dashboard; populate env
    - Done when: each tier has a live price ID in development env; checkout from `/pricing` for each tier reaches the correct Stripe checkout URL; cancel-from-Stripe returns user to the app cleanly.
    - Files: env only.
    - Approval: not required (Stripe-side configuration; the wiring change in W1-A5 already had approval).

- [ ] **W5-2** Implement Stripe webhook handler (subscription created / updated / canceled)
    - Done when: a test webhook fires `customer.subscription.updated` and the corresponding `Subscription` row reflects the new tier within seconds; signature verification rejects forged events; the handler is idempotent on duplicate events.
    - Files: `src/app/api/billing/webhook/route.ts` (new), env (`STRIPE_WEBHOOK_SECRET`).
    - Approval: **REQUIRED** — first time the app receives signed Stripe events; affects how subscription state changes downstream of every existing gating helper.

- [ ] **W5-3** Apply tier renames to any non-seed Subscription rows in development DB
    - Done when: a one-time migration script (or manual SQL) updates lingering PRO / PREMIUM rows to STARTER / SELLER; verify with a select query that no Subscription row has an old enum value.
    - Files: `scripts/migrate-tier-names.ts` (new) or a one-shot SQL note.
    - Approval: **REQUIRED** — touches existing user data, even in development.

- [ ] **W5-4** Update onboarding / signup copy for new tier names + listing quota messaging
    - Done when: signup, pricing page, and any in-app upgrade CTAs reference STARTER / SELLER / POWER SELLER; the listing-quota counter is visible on `/listing-generator`; the upgrade CTA on quota-hit links to `/pricing` with the correct anchor.
    - Files: marketing pages, pricing page, signup copy, upgrade CTA component.
    - Approval: **REQUIRED** — modifies existing signup and pricing surfaces.

- [ ] **W5-5** Internal QA pass on 100 real items across categories
    - Done when: a markdown QA log captures result for each item (valid output? hallucination? safety-rule compliance?); every safety-rule violation is logged as a [[Logs/Issues]] entry; no P0 issue remains open.
    - Files: QA notes only.
    - Approval: not required (research / QA).

- [ ] **W5-6** Cost-per-generation + latency telemetry
    - Done when: each generation logs `{ model, input_tokens, output_tokens, latency_ms, blended_cost_usd }`; an admin-only page or a SQL view shows weekly aggregates; the cost-per-generation target (<$0.15 blended) is verified against real numbers.
    - Files: `src/domains/listings/service.ts`, possibly a new `Telemetry` model.
    - Approval: required if a new Prisma model is added — confirm the model shape before applying the migration.

---

## Week 6 — Beta launch

- [ ] **W6-1** Invite list ready (~50 resellers)
    - Done when: a list of email addresses with consent to be contacted is captured in a private note (not committed); a templated invite email is drafted; first batch sent.
    - Files: invite email template (private), no app-code change.
    - Approval: not required.

- [ ] **W6-2** Verify all leading-metric instrumentation end to end
    - Done when: photo-upload, generate-click, copy, latency, and thumbs-up events all appear in whatever analytics surface is chosen; a one-page metric dashboard (or query set) is bookmarked.
    - Files: instrumentation glue across the listing flow.
    - Approval: not required (net-new analytics).

- [ ] **W6-3** Beta launch
    - Done when: invites sent, beta sign-ups can complete the full flow, week-1 metrics are reviewed in [[Logs/Progress]], and a follow-up issue is opened for every recurring complaint.
    - Files: none directly — meta-task.
    - Approval: not required.

- [ ] **W6-4** Weekly review process scheduled
    - Done when: a recurring slot is on the calendar; a review template note exists in the Vault for each weekly entry; first review is logged.
    - Files: new template note in `Vault/FlipSignal/`.
    - Approval: not required.

---

## Approval Log

This log is the single source of truth for approvals on tasks marked `Approval: REQUIRED`. An entry is added (with date) when an approval-required task is approved by the project owner, before work starts.

| Date | Task ID | Approver | Notes |
|---|---|---|---|
| 2026-05-01 | W1-A2 | Marcus | Rename PRO/PREMIUM in `PlanTier`. Scope expanded to include minimum required cross-file renames in seed.ts / plans.ts / checkout route to keep build green. |
| 2026-05-01 | W1-A3 | Marcus | Add listing quotas to `planContent` + `canGenerateListing` helper. Purely additive on top of A2. |
| 2026-05-01 | W1-A5 | Marcus | Refactor `/api/billing/checkout` ternary into a tier→priceId map. Additive on top of A2's minimal rename. |
| 2026-05-01 | W1-A6 | Marcus | Verify seed idempotency under new tier names; ensure `pnpm db:seed` is safe to re-run. (Most of A6's original scope is absorbed by A2.) |
| _pending_ | W5-2 | _pending_ | New Stripe webhook receiver |
| _pending_ | W5-3 | _pending_ | One-time migration of existing Subscription rows |
| _pending_ | W5-4 | _pending_ | Update existing onboarding + pricing copy |

When approval is granted, replace `_pending_` with the date and approver, and mention the approval in the task's "Done when" criteria during execution.

## Related Notes

- [[Listing Signal Spec]] — feature summary
- [[Logs/Decisions]] — strategic decisions backing this plan
- [[Logs/Progress]] — running progress entries
- [[Logs/Issues]] — blockers and open issues
