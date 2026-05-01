# Progress Log

See also: [[Home]], [[Pass 1 Audit]], [[Database State]], [[Logs/Decisions]], [[Logs/Issues]]

This note records tangible delivery progress over time.

## 2026-05-01 (later)

- **W1-A2 complete and verified.** `PlanTier` enum renamed PRO→STARTER and PREMIUM→SELLER; POWER_SELLER added. 9 files modified across schema, seed, plans, checkout route, marketing/dashboard pages, alerts service, and the verify-pass2 script. `pnpm prisma:generate`, `pnpm build`, `pnpm lint`, `pnpm db:push --force-reset`, `pnpm db:seed`, `pnpm verify:pass2` all clean. Note: original agent grep was scoped to `src/` + `prisma/` and missed `scripts/verify-pass2.ts`; fixed in a follow-up edit. Lesson: future rename prompts should grep the whole repo, not just app source.
- Cowork's Agent tool does not honor user-level (`~/.claude/`) `WorktreeCreate` / `WorktreeRemove` hooks even after install. Hooks live in a Cowork-specific location we don't have access to. Working pattern for now: dispatch agents without isolation, review via `git diff` against the latest commit, roll back with `git reset --hard <baseline>` if anything's wrong.

## 2026-05-01

- Configured `WorktreeCreate` / `WorktreeRemove` hooks (Cowork session installer at `.claude-setup/`) so future agent dispatches can use real worktree isolation.
- Committed FlipSignal app + Vault baseline as `f8bad9f` and force-pushed to `origin/main` at https://github.com/claymca72/FlipSignal.git. Repo is now the source of truth.
- Round 1 of Listing Signal build complete and verified locally:
  - **W1-A1** — `Listing` model + `ListingCondition` / `SellingGoal` / `ListingStatus` enums + `User.listings` inverse relation. `SavedListing` dropped (no junction needed). `pnpm prisma:generate` and `pnpm prisma format` clean.
  - **W1-A4** — `STRIPE_STARTER_PRICE_ID` / `STRIPE_SELLER_PRICE_ID` / `STRIPE_POWER_PRICE_ID` added to `.env.example` and `src/lib/env.ts` (Zod schema, all optional).
  - **W1-B1** — Image upload pipeline. `src/lib/storage/r2.ts`, `src/app/api/listings/upload/route.ts`, `PhotoUploader.tsx` (451 LOC), `docs/listings-upload-setup.md`. `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` added. `pnpm build` and `pnpm lint` clean. End-to-end PUT to R2 still requires bucket credentials per the setup doc.
  - **W1-B2** — [[Vision Model Bakeoff Plan]] (methodology only; bakeoff itself runs once a photo set is assembled).
- Agent orchestration in place: per-task model right-sizing (Haiku for mechanical, Sonnet for implementation, Opus reserved for safety-critical and review), parallel dispatch, worktree isolation now wired.

## 2026-04-30

- Drafted the Listing Signal MVP PRD as a Word doc at `FlipSignal_Listing_Signal_PRD.docx` (canonical).
- Added [[Listing Signal Spec]] vault note as the second-brain summary, linked from [[Home]].
- Audited existing FlipSignal infrastructure for Listing Signal reuse; results captured in the PRD's "What's Already Built" section.
  - Reuse as-is: auth + session, domain layer pattern, server actions pattern, Prisma + Postgres setup, UI primitives.
  - Reuse with tweaks: plan gating (`src/lib/plans.ts`), Stripe checkout (`src/app/api/billing/checkout/route.ts`), tier names.
  - Greenfield: image upload pipeline (no existing S3/R2/Cloudinary infra), AI / LLM integration (no SDK in `package.json`).
- Decided to unify pricing tiers rather than run parallel SKUs — see [[Logs/Decisions]] for rationale and migration plan.
- Revised the 6-week phasing so the two greenfield risks (image upload, vision-model bakeoff) run as parallel Track B in week 1 instead of gating UI work.

## 2026-04-17

- Added structured Obsidian second-brain notes for product, architecture, setup, database state, source docs, and next steps.
- Added a dedicated `Logs` folder with decision, issue, and progress tracking.
- Fixed shared button rendering so button labels display correctly.
- Confirmed the styling pipeline issue was caused by a missing `postcss.config.mjs` and restored it.
- Completed Pass 2 logic work for lead feed, saved deals workflow, and subscription gating.
- Added local-only plan switching on Pricing for end-to-end subscription-gating verification in development.
- Tightened signup so new accounts always start on Free.
- Refactored lead and deal mutations into reusable domain-level functions.
- Added a local verification script at `scripts/verify-pass2.ts`.
- Verified Pass 2 flows locally:
  - Free, Pro, and Premium lead visibility
  - Calculator domain logic
  - Save → buy → list → sell deal workflow
  - Free-plan saved-deal limit
- Completed Pass 3 polish and cleanup work:
  - improved shared empty-state presentation and added better CTA paths from dashboard and deals pages
  - added stronger field-level validation feedback for login, signup, calculator, deals, and alert preferences
  - removed dead helper code and cleaned stray macOS metadata files from workspace directories
  - refined `README.md` and `ARCHITECTURE.md` to document local verification and local plan switching
  - fixed a root layout markup regression and a deal-action TypeScript narrowing issue caught by build verification
- Passed `pnpm lint`
- Passed `pnpm verify:pass2`
- Passed `pnpm build`

## 2026-04-16

- Created the local PostgreSQL database `flipsignal`.
- Added working local `.env` values for database and auth secrets.
- Applied the Prisma schema with `pnpm db:push`.
- Seeded the database successfully with demo users, leads, deals, and marketplace fee profiles.
- Verified database counts after seed:
  - users: 4
  - leads: 15
  - deals: 3
  - fee profiles: 4

## 2026-04-15

- Scaffolded the Next.js app and core project structure.
- Implemented Prisma schema, seed script, and domain modules.
- Built marketing pages and authenticated dashboard routes.
- Implemented lead feed, calculator, deals workflow, settings, and alerts page scaffold.
- Wired credentials auth flow and protected dashboard layout.
- Added README and ARCHITECTURE docs.
- Passed `pnpm lint`.
- Passed `pnpm build`.
