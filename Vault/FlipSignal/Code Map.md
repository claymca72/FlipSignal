# Code Map

See also: [[Architecture Notes]], [[Setup Runbook]], [[Database State]]

## Core Files

### App Shell and Pages

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/(marketing)/layout.tsx`
- `src/app/(marketing)/page.tsx`
- `src/app/(marketing)/pricing/page.tsx`
- `src/app/(marketing)/login/page.tsx`
- `src/app/(marketing)/signup/page.tsx`
- `src/app/(dashboard)/app/layout.tsx`
- `src/app/(dashboard)/app/page.tsx`
- `src/app/(dashboard)/app/leads/page.tsx`
- `src/app/(dashboard)/app/calculator/page.tsx`
- `src/app/(dashboard)/app/deals/page.tsx`
- `src/app/(dashboard)/app/settings/page.tsx`
- `src/app/(dashboard)/app/alerts/page.tsx`

### API Routes

- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/billing/checkout/route.ts`
- `src/app/api/alerts/run/route.ts`

### Server Actions

- `src/actions/auth-actions.ts`
- `src/actions/lead-actions.ts`
- `src/actions/deal-actions.ts`
- `src/actions/settings-actions.ts`

### Domains

- `src/domains/fees/calculate.ts`
- `src/domains/leads/service.ts`
- `src/domains/leads/models/lead-scoring.ts`
- `src/domains/deals/service.ts`
- `src/domains/alerts/service.ts`

### Auth and Infra

- `src/lib/auth/options.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/password.ts`
- `src/lib/db.ts`
- `src/lib/plans.ts`
- `src/lib/constants.ts`
- `src/lib/utils.ts`
- `src/lib/env.ts`

### Database

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `prisma.config.ts`

## UI Components

### Shared UI

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/badge.tsx`

### Product Components

- `src/components/app/app-shell.tsx`
- `src/components/app/calculator-form.tsx`
- `src/components/app/lead-action-form.tsx`
- `src/components/app/deal-update-form.tsx`
- `src/components/app/alerts-settings-form.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/signup-form.tsx`

## Current File-Level Notes

- `src/components/ui/button.tsx` had a bug where button children were not rendered; fixed on April 17, 2026
- `postcss.config.mjs` was restored after Tailwind styles failed to compile

## Related Notes

- [[Architecture Notes]]
- [[Pass 1 Audit]]
- [[Decisions and Next Steps]]
