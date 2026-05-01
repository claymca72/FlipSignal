# FlipSignal Architecture

## Major Modules

### App Router

- `src/app/(marketing)` contains the public site and auth pages
- `src/app/(dashboard)/app` contains the authenticated product shell
- `src/app/api` contains route handlers for auth, billing, and alert execution

### Domain Layer

- `src/domains/leads` handles lead feed visibility, plan-aware filtering, and reusable lead scoring helpers
- `src/domains/fees` contains the marketplace fee engine and presets
- `src/domains/deals` handles deal summaries, deal limits, lifecycle updates, and actual profit math
- `src/domains/alerts` stores alert settings and prepares alert runs

### Actions

- `src/actions` contains thin server actions for user registration, lead state changes, deal updates, local plan switching, and alert preference updates
- The actions validate input with Zod and then hand off the actual business rules to the domain layer

### Shared Infrastructure

- `src/lib/db.ts` holds the Prisma client setup
- `src/lib/auth` contains NextAuth config and user/session helpers
- `src/lib/plans.ts` centralizes plan gating rules
- `src/lib/constants.ts` and `src/lib/utils.ts` provide app-wide helpers and formatting

## Why the Fee Engine Is Structured This Way

The fee engine lives in `src/domains/fees/calculate.ts` as a pure domain module instead of being buried inside a form component. That keeps it reusable for:

- the calculator UI
- seeded lead estimation
- future admin lead ingestion
- future bulk analysis features

Each marketplace is represented as a fee profile with:

- `baseFeePercent`
- `paymentFeePercent`
- `fixedFee`
- `defaultShippingCost`

That gives the MVP enough structure to stay accurate without overbuilding a rules engine.

The UI consumes the same calculator contract that seeded leads and future ingestion flows can use, which keeps marketplace changes isolated to the fee domain instead of scattering pricing rules across forms and pages.

## Where to Add New Marketplaces

To add a marketplace:

1. Add the enum value in `prisma/schema.prisma`
2. Add the preset in `src/domains/fees/calculate.ts`
3. Add the display label in `src/lib/constants.ts`
4. Seed or update the matching `MarketplaceFeeProfile`

If a marketplace eventually needs more complex rules, extend the fee domain with marketplace-specific calculators without changing the UI contract.

## Where to Add New Lead Sources

For the MVP, leads are seeded and the schema already supports future manual curation.

Current extension points:

1. Add new lead records through `prisma/seed.ts` for local/demo data
2. Add future ingestion logic that writes to the `Lead` model
3. Use `createdById` and the `ADMIN` role for future admin-managed lead creation

If you add manual ingestion next, keep parsing/normalization in a new `src/domains/leads` service and keep the page layer focused on review and editing.

## Validation and Workflow Boundaries

- Auth, settings, and deal forms validate with Zod close to the server boundary
- Lead and deal mutations use domain services so feed actions and dashboard screens share the same workflow rules
- Plan gating stays in `src/lib/plans.ts` so UI checks and server checks are aligned
- Empty states and page-level CTA decisions stay in the component layer, where they can evolve without touching domain logic

This keeps the MVP readable: pages compose data and components, actions validate and orchestrate, and domains own the business rules.

## Data Model Notes

The Prisma models are normalized for the MVP, but designed for clean expansion:

- `User` supports roles and future admin tooling
- `Subscription` stores plan state separately from the user record
- `Lead` holds curated marketplace opportunities
- `UserLead` stores per-user lead interactions like saved/skipped/bought
- `Deal` stores lifecycle progression and actual profit fields
- `AlertPreference` stores category + ROI alert rules
- `MarketplaceFeeProfile` supports future admin-managed fee tuning

This split keeps feed interaction history separate from actual deal tracking, which makes future analytics and workflow changes easier.

## Operational Notes

- `scripts/verify-pass2.ts` is the current local end-to-end sanity check for the major MVP flows
- `Vault/FlipSignal` contains the Obsidian project notes, audits, and logs used as the project second brain
- Local development supports direct plan switching from `/pricing` outside production so gating can be tested without fake Stripe billing flows
