# Architecture Notes

See also: [[Home]], [[Code Map]], [[Database State]], [[Product Spec]]

## Top-Level Structure

- `src/app/(marketing)` for public pages and auth pages
- `src/app/(dashboard)/app` for authenticated pages and app shell
- `src/app/api` for route handlers
- `src/actions` for server actions
- `src/domains` for business logic
- `src/lib` for shared infrastructure
- `prisma` for schema and seed

## Main Architectural Decisions

### Domain Logic Separate from UI

The app keeps core logic out of the page components:

- `src/domains/fees/calculate.ts`
- `src/domains/leads/service.ts`
- `src/domains/deals/service.ts`
- `src/domains/alerts/service.ts`

This keeps UI components thinner and makes future extension easier.

### Fee Engine

The fee engine is a pure domain module rather than a form-specific helper.

Benefits:

- reused by the calculator
- reused by the seed script
- can support future admin ingestion
- can support future batch analysis

### Plan Gating

Plan rules live centrally in `src/lib/plans.ts`.

Benefits:

- one place to change Free / Pro / Premium behavior
- easier to extend into real billing later

### Persistence

- Prisma 7 client
- PostgreSQL
- official Postgres adapter via `@prisma/adapter-pg`

## Important Extension Points

### Add a Marketplace

1. Update enum in `prisma/schema.prisma`
2. Add profile to `src/domains/fees/calculate.ts`
3. Add display label to `src/lib/constants.ts`
4. Seed or manage the matching `MarketplaceFeeProfile`

### Add a Lead Source

1. Add ingestion logic into the leads domain
2. Normalize into the `Lead` model
3. Use `createdById` and admin role where needed

### Add Billing

1. Keep `/api/billing/checkout`
2. Add Stripe webhooks
3. Sync `Subscription`
4. Expand gating from existing `src/lib/plans.ts`

## Related Notes

- [[Code Map]]
- [[Setup Runbook]]
- [[Decisions and Next Steps]]
