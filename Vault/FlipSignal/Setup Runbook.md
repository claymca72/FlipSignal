# Setup Runbook

See also: [[Database State]], [[Code Map]], [[Decisions and Next Steps]]

## Local Setup

### Install

```bash
pnpm install
```

### Environment

Create `.env` from `.env.example`.

Required:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Optional:

- Stripe keys
- Resend keys
- `ALERTS_CRON_SECRET`

### Database

```bash
pnpm prisma:generate
pnpm db:push
pnpm db:seed
```

### Run App

```bash
pnpm dev
```

## Local Verification

```bash
pnpm lint
pnpm build
```

Both checks passed during implementation.

## Seeded Demo Accounts

Password for seeded accounts:

```text
demo1234
```

Accounts:

- `demo@flipsignal.app`
- `pro@flipsignal.app`
- `premium@flipsignal.app`
- `admin@flipsignal.app`

## Notes

- Local Postgres is being used rather than Docker on this machine
- The local app has previously run on port `3002`

## Related Notes

- [[Database State]]
- [[Pass 1 Audit]]
- [[Home]]
