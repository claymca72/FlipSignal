# Database State

See also: [[Setup Runbook]], [[Pass 1 Audit]], [[Architecture Notes]]

## Current Local Database

- Database name: `flipsignal`
- Host: `localhost`
- Port: `5432`
- Local Postgres role in use: `claymca`

## Prisma State

- Schema file: `prisma/schema.prisma`
- Prisma config: `prisma.config.ts`
- Seed file: `prisma/seed.ts`

## Seed Status

The database has been created, schema pushed, and seed executed successfully.

Verified counts:

- users: `4`
- leads: `15`
- deals: `3`
- fee profiles: `4`

## Seeded Coverage

- Categories:
  - sneakers
  - electronics
  - collectibles
  - accessories
- Plans represented:
  - Free
  - Pro
  - Premium
  - Admin

## Operational Notes

- Prisma 7 is configured with the official Postgres adapter
- This machine does not rely on Docker for local database setup

## Related Notes

- [[Setup Runbook]]
- [[Code Map]]
- [[Decisions and Next Steps]]
