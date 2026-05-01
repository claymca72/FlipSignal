# Listing Signal Spec

See also: [[Home]], [[Product Spec]], [[Architecture Notes]], [[Decisions and Next Steps]], [[Logs/Decisions]]

Canonical PRD: `FlipSignal_Listing_Signal_PRD.docx` at the repo root.

Build tracker (checkable tasks with acceptance criteria): [[Listing Signal Build Tracker]].
Vision-model bakeoff plan: [[Vision Model Bakeoff Plan]].

## What It Is

A new feature for FlipSignal. Resellers upload 1–8 product photos, optionally add details (brand, model, condition, accessories, defects, selling goal), and get back a complete eBay listing — title, mobile title, category, item specifics, condition description, SEO description, pricing range, shipping recommendation, keywords, photo improvement notes, and a short cross-listing string.

Distinct from the existing FlipSignal feature (lead feed + profit calculator + deal lifecycle). Lives in the same app, reuses the same auth, plan gating, domain pattern, and UI primitives.

## MVP Scope

- Marketplace: eBay only.
- New routes: `/listing-generator`, `/saved-listings`.
- New components: PhotoUploader, MarketplaceSelector, ProductDetailsForm, ListingOutput, CopyButton, PricingSuggestionCard, ShippingRecommendationCard.
- AI: vision-capable model, JSON-schema output, validated server-side before render.
- Persistence: new `Listing` and `SavedListing` Prisma models.

## Non-Goals (v1)

- Direct posting to eBay via API.
- Mercari, Poshmark, Depop as first-class outputs (a short cross-listing string is included as a placeholder only).
- Image editing or background removal.
- Inventory management or batch listing.
- Live sold-comps scraping for pricing.

## Pricing & Tier Strategy

Decision: unify with the existing app rather than running parallel SKUs. See [[Logs/Decisions]] entry on 2026-04-30.

| Tier | Price | Listings/month |
|---|---|---|
| Free | $0 | 3 |
| Starter | $9/mo | 25 |
| Seller | $19/mo | 75 |
| Power Seller | $49/mo | 250 |

Existing tiers `PRO` and `PREMIUM` get renamed to `STARTER` and `SELLER`; `POWER_SELLER` is added.

## What's Already Built

Reuse as-is:

- Auth + session — `getCurrentUser()` and `requireUser()` in `src/lib/auth/session.ts`.
- Domain layer pattern — mirror `src/domains/deals/service.ts`.
- Server actions pattern — mirror `src/actions/deal-actions.ts` (FormData → Zod → service → state).
- Prisma + Postgres setup.
- UI primitives in `src/components/ui` (shadcn-style with `cn()` and CSS-variable tokens).

Reuse with tweaks:

- Plan gating in `src/lib/plans.ts` — extend `planContent` map with listing quotas; add `canGenerateListing(user)` helper.
- Stripe checkout — refactor hardcoded ternary in `src/app/api/billing/checkout/route.ts` into a tier→priceId map; add 3 new price IDs.
- Tier names — additive `PlanTier` enum migration plus a rename of existing tiers.

Greenfield (no existing infrastructure):

- Image upload pipeline (no S3/R2/Cloudinary anywhere). Recommended: Cloudflare R2 + signed URLs.
- AI / LLM integration (no SDK in `package.json`). Pick vision-capable model after a small bakeoff.

## Safety & Compliance Rules

- No fabricated model-compatibility claims.
- No "tested," "authentic," or "working" claims unless user-confirmed.
- No "new" claims unless packaging shown AND user-confirmed condition = New.
- All uncertainty surfaced in UI; never silent guesses on regulated categories (electronics, designer goods, collectibles).
- Listing footer: "AI-assisted draft. Verify all model numbers and compatibility before posting."

## Phasing — 6-Week Build

Sequenced to retire the two greenfield risks early in parallel tracks.

- Week 1 — Track A: Prisma migration (Listing + SavedListing models, `PlanTier` enum extension, planContent update, Stripe checkout refactor). Track B: image upload spike (R2 + signed URLs) + vision-model bakeoff on 30–50 real photos.
- Week 2 — `/listing-generator` page with PhotoUploader, MarketplaceSelector, ProductDetailsForm wired to upload infra. Backend stub returns canned output. Quota gating live via `canGenerateListing()`.
- Week 3 — Real LLM call replaces stub. System prompt + JSON-schema validation. ListingOutput renders all 11 sections with CopyButton. Confidence/uncertainty flags surfaced.
- Week 4 — PricingSuggestionCard, ShippingRecommendationCard, photo notes. `/saved-listings` page (mirror deals service pattern).
- Week 5 — Stripe SKUs created and wired. Tier migration applied to seeded demo accounts. Onboarding. Internal QA on 100 real items. Cost-per-generation telemetry.
- Week 6 — Beta launch to ~50 invited resellers. Instrument leading metrics. Weekly review.

## Success Metrics

Leading (week 1–4):

- Photo-upload rate: 60%
- Generate-click rate: 80%
- Copy rate: 70%
- Generation latency (perceived): ≤8s
- Thumbs-up rate: 70%

Lagging (month 2–3):

- Free-to-paid conversion: 8% within 30 days of first generation
- Listings/user/month for Starter tier: ≥15 (60% of cap)
- Paid 60-day churn: <12%
- Cost-per-generation: <$0.15 blended

Counter-metrics:

- AI-hallucination complaints: <2%
- eBay listing flag/removal rate: <1%

## Open Questions

- Vision model — GPT-4o vs. Claude with vision vs. Gemini. Bakeoff in week 1 Track B.
- Photo storage retention — keep originals indefinitely or evict 30 days post-listing?
- "Human review" disclaimer scope on regulated categories.
- eBay category tree source — public taxonomy, hard-coded subset, or Browse API.
- Anonymous "demo" generation before login?
- Add-on packs ($5 / 25 extra listings) and/or annual plans at -20%? Decision deferred until post-launch.

## Related Notes

- [[Product Spec]] — original FlipSignal feature spec
- [[Architecture Notes]] — domain layer and gating conventions to follow
- [[Code Map]] — locations of helpers being extended
- [[Database State]] — current Prisma schema
- [[Decisions and Next Steps]] — strategic context
- [[Logs/Decisions]] — 2026-04-30 tier unification decision
- [[Logs/Progress]] — 2026-04-30 entry
