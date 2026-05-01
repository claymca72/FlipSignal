# Decisions Log

See also: [[Home]], [[Decisions and Next Steps]], [[Architecture Notes]], [[Logs/Progress]]

This note captures decisions that shape implementation, scope, and architecture.

## 2026-04-30

### Listing Signal Joins FlipSignal as a Unified Feature

- Decision: build Listing Signal as a feature inside the existing FlipSignal app, reusing auth, plan gating, the domain pattern, and UI primitives. Do not split it into a separate app.
- Why: the surrounding plumbing is already there and the two features share the same reseller user.

### Unify Pricing Tiers Instead of Parallel SKUs

- Decision: rename `PRO` → `STARTER` and `PREMIUM` → `SELLER` in `PlanTier`, add `POWER_SELLER` as a new tier, and treat listings/month as one feature in each tier's bundle alongside existing lead-feed limits. Reject the parallel-SKU alternative (separate billing for Listing Signal).
- Why: one pricing surface, one Stripe product set, one mental model. The app isn't live with paying customers yet (sign-ups default to Free; Stripe is scaffolded, not in production), so the migration is low-risk now and gets harder later.
- Implementation: additive Prisma enum migration; extend the `planContent` map in `src/lib/plans.ts` with listing quotas and a new `canGenerateListing(user)` helper following the existing `canUseLeadFilters` pattern; refactor the hardcoded ternary in `src/app/api/billing/checkout/route.ts` into a tier→priceId map; remap seeded demo accounts.

### eBay Only at MVP, No Direct Posting

- Decision: ship Listing Signal v1 with eBay as the only marketplace and copyable text as the only output. Do not integrate the eBay API for direct posting, and do not generate first-class outputs for Mercari, Poshmark, or Depop. Include a short cross-listing string as a placeholder only.
- Why: avoids eBay API approval delay and live-listing edge cases on the first launch; lets us validate quality and pricing before adding integration risk.

### Pricing Range from Model + Goal, Not Live Sold-Comps

- Decision: at MVP, suggest a pricing range derived from model knowledge plus the user's selling goal (ASAP / Balanced / Max Profit). Do not scrape live sold-comps.
- Why: scraping is a ToS gray area; the goal-aware range is the wedge without legal risk. Sold-comps via Terapeak / eBay APIs is a P2 future consideration.

### Vision-Model Bakeoff Runs in Parallel, Not as a Gate

- Decision: run a 30–50 photo benchmark across GPT-4o, Claude with vision, and Gemini in week 1 as parallel Track B alongside the Prisma and tier migration work. Do not gate UI scaffolding on the bakeoff result.
- Why: model choice can swap behind the same JSON-schema contract; gating UI on it would burn a week.

## 2026-04-17

### MVP Scope Only

- Decision: build only the MVP and avoid overbuilding into admin-heavy systems, mobile apps, browser extensions, or speculative automation.
- Why: keep the repo production-minded, clean, and easy to extend without premature complexity.

### Domain Logic Separate from UI

- Decision: keep fee logic, lead visibility, deal calculations, alerts, and plan gating in domain or shared modules rather than page components.
- Why: improves maintainability and makes future admin ingestion, analytics, and billing changes easier.

### Credentials Auth for Pass 1

- Decision: use NextAuth credentials login/signup for the MVP instead of building more expansive auth options.
- Why: fastest practical path to a working authenticated workflow.

### Real Plan Gating Before Full Billing

- Decision: implement Free, Pro, and Premium gating in app logic before full Stripe lifecycle support.
- Why: validates product boundaries early and creates a clean billing extension point later.

### Prisma 7 with Official Postgres Adapter

- Decision: use Prisma 7 with `@prisma/adapter-pg` and `pg`.
- Why: Prisma 7 runtime requires an adapter path for PostgreSQL in this setup.

### Local Postgres on Host Machine

- Decision: use the locally installed PostgreSQL 16 service on this machine instead of Docker.
- Why: Docker was not available, and host Postgres was already installed.

### Obsidian Vault as Codex Second Brain

- Decision: maintain a linked vault inside `Vault/FlipSignal` for project memory.
- Why: gives Codex a stable place for product context, audits, setup state, and running logs.

### Local Plan Switching for Pass 2 Verification

- Decision: add a local-only plan switch path on Pricing when Stripe is not configured in development.
- Why: major subscription-gated flows need to work end to end locally without pretending Stripe billing is complete.

### New Accounts Start on Free

- Decision: signup always creates a Free subscription even if a user arrived from a Pro or Premium CTA.
- Why: preserves real subscription gating and avoids granting paid access through signup before billing is implemented.

### Validate at the Server Boundary

- Decision: harden auth, deal, calculator, and alert preference validation close to the action boundary with Zod and return actionable messages to the UI.
- Why: keeps invalid state from leaking into domain logic and gives users useful feedback without duplicating business rules in components.

### Keep Empty States in the UI Layer

- Decision: treat empty-state copy and CTA composition as component concerns instead of abstracting them into a generic workflow system.
- Why: the MVP only needs a few purposeful empty states, and keeping them close to the page preserves clarity.

### Remove Weak Helpers Instead of Preserving Them

- Decision: delete unused helpers like `canCreateMoreDeals` instead of keeping speculative abstractions around deal limits.
- Why: dead abstractions make the MVP harder to read and create uncertainty about which code paths are actually authoritative.
