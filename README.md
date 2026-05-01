# FlipSignal

FlipSignal is a production-minded MVP for a reseller intelligence SaaS. It helps users review curated leads, estimate real profit after fees, and move deals from sourced to sold without relying on spreadsheets.

## What’s in the MVP

- Public marketing pages: `/`, `/pricing`, `/login`, `/signup`
- Authenticated app shell: `/app`
- Lead feed with plan gating, filters, and save/skip/bought actions
- Profit calculator with modular marketplace fee presets
- Saved deals workflow with statuses and actual profit tracking
- Email alert preferences with a cron-ready alert endpoint
- Seeded data for leads, fee profiles, demo users, and sample deals
- Real subscription-aware gating for Free, Pro, and Premium plans

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- NextAuth credentials auth
- Zod + React Hook Form
- Stripe checkout scaffolding
- Resend email scaffolding

## Project Structure

```text
prisma/
  schema.prisma
  seed.ts
scripts/
  verify-pass2.ts
src/
  actions/
  app/
    (marketing)/
    (dashboard)/app/
    api/
  components/
    app/
    auth/
    ui/
  domains/
    alerts/
    deals/
    fees/
    leads/
  lib/
    auth/
  types/
public/
  images/leads/
Vault/
  FlipSignal/
```

## Environment Variables

Copy `.env.example` to `.env` and fill in what you need.

```bash
cp .env.example .env
```

Required for local app + database:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Optional for billing:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_PREMIUM_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Optional for alerts:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ALERTS_CRON_SECRET`

## Database Setup

### Option 1: Local Postgres with Docker

```bash
docker run --name flipsignal-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=flipsignal \
  -p 5432:5432 \
  -d postgres:16
```

Use this local URL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flipsignal"
```

### Option 2: Hosted Postgres

Any standard Postgres provider works. Neon, Supabase, Railway, or RDS are all fine for this MVP.

## Install and Run

```bash
pnpm install
pnpm prisma:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

If port `3000` is already in use, start the dev server on another port:

```bash
pnpm dev -- --port 3002
```

## Seeded Demo Accounts

All seeded users use the same password:

```text
demo1234
```

Accounts:

- `demo@flipsignal.app` → Free
- `pro@flipsignal.app` → Pro
- `premium@flipsignal.app` → Premium
- `admin@flipsignal.app` → Admin + Premium access

New signups always start on `Free`.

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm prisma:generate
pnpm db:push
pnpm db:seed
pnpm db:studio
```

## Billing Notes

Stripe is wired as a real extension point, but not a full production billing system yet.

- `/pricing` submits to `/api/billing/checkout`
- If Stripe env vars are configured, checkout sessions can be created
- In local development, signed-in users can switch plans directly from `/pricing` to test gating end to end
- Subscription syncing, webhook handling, and customer portal flows are intentionally left for the next phase

## Email Alert Notes

Alert preferences are fully stored in the database and plan-gated.

- Cron-ready endpoint: `POST /api/alerts/run`
- Requires `Authorization: Bearer $ALERTS_CRON_SECRET`
- Uses Resend when configured
- Sends matched leads based on selected categories and ROI threshold

## Local Verification

These checks passed during implementation:

```bash
pnpm lint
pnpm verify:pass2
pnpm build
```

`pnpm verify:pass2` runs a database-backed sanity check for the main MVP flows:

- Free / Pro / Premium lead visibility and gating
- Calculator domain logic
- Save → buy → list → sell deal lifecycle
- Free-plan saved-deal limit

## Deployment Notes

The app is ready for a standard Next.js deployment on Vercel or a Node-based host.

Recommended production setup:

1. Deploy app on Vercel
2. Use managed Postgres
3. Store all env vars in the platform
4. Add a scheduled job or cron to call `/api/alerts/run`
5. Add Stripe webhooks before turning on live paid plans

## What’s Still Intentionally Stubbed

- Full Stripe subscription lifecycle management
- Admin UI for lead ingestion and moderation
- Automated lead sourcing
- SMS/push alerts
- Advanced analytics/event tracking

## Next Best Steps

1. Add Stripe webhooks and sync subscription status into `Subscription`
2. Add an admin lead entry workflow for manual curation
3. Add richer deal analytics on sold inventory
4. Add scheduled alert execution in deployment
