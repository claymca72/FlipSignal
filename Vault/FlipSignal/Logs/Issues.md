# Issues Log

See also: [[Home]], [[Code Map]], [[Logs/Progress]], [[Decisions and Next Steps]]

This note tracks meaningful implementation issues, bugs, and setup problems encountered during development.

## Open Issues

### Billing Is Scaffolded, Not Production Ready

- Status: Open
- Area: subscriptions / Stripe
- Notes: checkout session creation exists, but webhook syncing and full lifecycle handling are not implemented yet.

### Alerts Need Production Scheduling

- Status: Open
- Area: alerts
- Notes: alert preferences and runner endpoint exist, but scheduled production execution is not wired yet.

### Broader Visual QA Across Breakpoints

- Status: Open
- Area: frontend
- Notes: Pass 3 improved empty states, form feedback, and general polish, but broader browser and breakpoint QA is still worth doing before launch.

### Full Stripe Billing Lifecycle

- Status: Open
- Area: subscriptions
- Notes: local plan switching now covers end-to-end local verification, but live Stripe subscription syncing is still incomplete.

## Resolved Issues

### Missing Tailwind/PostCSS Pipeline

- Status: Resolved
- Date: 2026-04-17
- Symptom: app looked like mostly plain text with minimal layout styling.
- Cause: missing `postcss.config.mjs`.
- Fix: restored the PostCSS config and restarted the dev server.

### Missing Button Labels

- Status: Resolved
- Date: 2026-04-17
- Symptom: buttons rendered as colored shapes with no visible text.
- Cause: shared `Button` component did not render `children`.
- Fix: updated `src/components/ui/button.tsx` to render button children.

### Unreal Paid Access Through Signup

- Status: Resolved
- Date: 2026-04-17
- Symptom: users could create active Pro or Premium subscriptions directly from signup.
- Cause: signup created whatever requested plan was submitted.
- Fix: signup now always creates Free access, and local paid-plan verification happens through seeded paid users or local plan switching in development.

### Prisma 7 Runtime Configuration

- Status: Resolved
- Date: 2026-04-16
- Symptom: Prisma runtime/build errors due to Prisma 7 adapter requirements and config changes.
- Cause: Prisma 7 changed datasource and runtime expectations.
- Fix: added `prisma.config.ts` and configured the official Postgres adapter path.

### Seed Configuration Missing in Prisma Config

- Status: Resolved
- Date: 2026-04-16
- Symptom: `pnpm db:seed` reported no seed command configured.
- Cause: Prisma 7 expects seed command in `prisma.config.ts`.
- Fix: added `seed: "tsx prisma/seed.ts"` to Prisma config.

### Local Database Not Yet Created

- Status: Resolved
- Date: 2026-04-16
- Symptom: app database setup was blocked.
- Cause: local Postgres database did not exist yet.
- Fix: created `flipsignal`, pushed schema, and seeded data.

### Invalid Root Layout Markup

- Status: Resolved
- Date: 2026-04-17
- Symptom: the root layout temporarily rendered invalid nested `html` markup during the Pass 3 polish work.
- Cause: a scroll-behavior attribute was added as a second `html` node instead of on the existing root element.
- Fix: moved `data-scroll-behavior="smooth"` onto the existing root `html` tag.

### Deal Action Type Narrowing Failure

- Status: Resolved
- Date: 2026-04-17
- Symptom: production build failed during TypeScript checking in `src/actions/deal-actions.ts`.
- Cause: an enum `includes(...)` check narrowed to purchased/listed/sold values while `value.status` could still be `SAVED`.
- Fix: replaced the `includes(...)` check with explicit status comparisons.
