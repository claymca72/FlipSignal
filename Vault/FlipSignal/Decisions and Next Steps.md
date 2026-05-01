# Decisions and Next Steps

See also: [[Pass 1 Audit]], [[Architecture Notes]], [[Code Map]]

Related log: [[Logs/Decisions]]

## Important Decisions Already Made

- Build only the MVP, not the broader reseller platform vision
- Use Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth
- Keep fee logic modular and reusable
- Keep plan gating real even before full billing
- Use local seeded data to make the app feel real early
- Support admin role in the schema without building an admin panel yet

## Issues Resolved

### Styling Pipeline

- Symptom: app rendered like plain text with almost no styling
- Cause: missing `postcss.config.mjs`
- Fix: restored PostCSS Tailwind config and restarted dev server

### Button Label Rendering

- Symptom: teal button with no visible text
- Cause: shared `Button` component did not render `children`
- Fix: updated `src/components/ui/button.tsx`

## Next Best Steps

### Product

1. Do a focused UI polish pass on the landing page and dashboard
2. Improve error and loading states across forms and mutations
3. Add a cleaner visual hierarchy to leads and deals pages

### Platform

1. Add Stripe webhooks and sync live subscription state into `Subscription`
2. Add scheduled alert execution for `/api/alerts/run`
3. Add admin lead ingestion and curation workflow

### Data and Analytics

1. Add richer sold-deal analytics
2. Track lead interactions and conversion metrics
3. Expand seed coverage or move to managed manual ingestion

## Working Definition of Pass 2

Pass 2 should focus on:

- UI polish
- production-ready subscription handling
- production-ready alerts
- admin lead management

## Related Notes

- [[Pass 1 Audit]]
- [[Home]]
