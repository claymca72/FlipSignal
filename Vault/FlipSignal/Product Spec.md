# Product Spec

See also: [[Home]], [[Pass 1 Audit]], [[Architecture Notes]], [[Decisions and Next Steps]]

## Product

FlipSignal is a reseller intelligence platform that helps users find profitable products to flip, calculate real profit after fees, and track deals from sourced to sold.

## MVP Features

### Lead Feed

- Curated resale leads
- Lead fields:
  - title
  - image
  - source store
  - category
  - buy price
  - estimated sale price
  - marketplace
  - estimated fees
  - estimated shipping cost
  - estimated profit
  - estimated ROI
  - sell-through rating
  - confidence score
  - created at
- User actions:
  - view feed
  - filter by category, marketplace, ROI range
  - save
  - skip
  - mark bought

### Profit Calculator

- Inputs:
  - cost
  - tax
  - shipping cost
  - marketplace
  - expected sale price
- Outputs:
  - fees
  - net profit
  - ROI percent
  - margin percent
  - break-even price
- Presets:
  - eBay
  - StockX
  - GOAT
  - Facebook Marketplace

### Saved Deals Workflow

- Statuses:
  - saved
  - purchased
  - listed
  - sold
- Fields:
  - actual cost
  - actual sale price
  - actual shipping cost
  - actual fees
  - actual profit
  - notes

### Email Alerts

- New leads in selected categories
- Leads above selected ROI threshold

## Subscription Model

### Free

- Limited lead feed
- Calculator access
- Save up to 10 deals

### Pro

- Full lead feed
- Unlimited saved deals
- Filters
- Email alerts

### Premium

- Early access flag on premium leads
- Premium-only leads
- Priority alerts

## Non-Goals

- Browser extension
- AI listing generator
- Discord/community features
- Auto-listing
- Repricing engine
- Supplier scraping system
- Admin-heavy CMS
- Mobile app
- SMS or push notifications

## Required Pages

- Public:
  - `/`
  - `/pricing`
  - `/login`
  - `/signup`
- Authenticated:
  - `/app`
  - `/app/leads`
  - `/app/calculator`
  - `/app/deals`
  - `/app/settings`
- Optional:
  - `/app/alerts`

## Design Direction

- Modern SaaS
- Minimal
- High signal, low clutter
- Dashboard-first UX
- Fast loading
- Mobile responsive

## Related Notes

- [[Pass 1 Audit]]
- [[Architecture Notes]]
- [[Code Map]]
