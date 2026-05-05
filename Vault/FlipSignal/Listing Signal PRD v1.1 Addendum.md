# Listing Signal PRD v1.1 — Pivot Addendum

See also: [[Listing Signal Spec]], [[Listing Signal Build Tracker]], [[Logs/Decisions]] (2026-05-05 entry)

This addendum supersedes the affected sections of the original PRD (`FlipSignal_Listing_Signal_PRD.docx`, v1.0, 2026-04-30) following the 2026-05-05 pivot. The full v1.0 doc is preserved as the historical record; below is the binding delta.

## Why this addendum

The original v1.0 PRD listed "Direct posting to eBay via API" as a non-goal — deferred to v2 to reduce launch risk. After Week 1–3 implementation and the first end-to-end user test, that decision proved wrong. Marcus (the project owner, 20-year eBay seller) summarized the gap directly:

> "If the user still has to go to eBay and upload the images, why not just upload their personal images at the same time? Right now the Listing Generator is only good for the description… that can chat with any AI and get the description and copy and paste."

The defensible product is **one-click listing creation**: photos + optional details → live eBay listing in a single flow. Without it, FlipSignal Listing Signal is a structured-output prompt around an AI the user could access for free. The pivot reverses the v1.0 decision.

## Goals (revised)

Replaces the original Goals section. Most goals remain; one is updated to reflect the new outcome metric.

1. **Cut average time-to-posted by 60%+ vs. eBay's manual flow** (was: time-to-listed). The seller's time investment is measured end-to-end, including platform posting, not just description generation.
2. Get 25%+ of new free users to **post at least one listing to eBay** in their first session. (Updated success criterion: a posted listing, not a generated draft.)
3. Convert 8%+ of active free users to a paid plan within 30 days of first generation.
4. Reach 70%+ user-perceived quality satisfaction on generated listings (post-generate thumbs-up rate).
5. Keep blended cost-per-generation under $0.15 at MVP volumes.

## Non-Goals (revised)

The "Direct posting to eBay via API" line is **removed** from non-goals. All other non-goals from v1.0 remain in force:

- Mercari, Poshmark, Depop as first-class outputs.
- Image editing / background removal.
- Inventory management or batch listing (CSV export for File Exchange is the v1.1 stopgap; full inventory features remain v2+).
- Live sold-comps scraping for pricing.

## Requirements — additions to P0

The following are added to the v1.0 P0 list. They land as Week 4 in the revised phasing.

1. **eBay account connection (OAuth)**. A logged-in FlipSignal user can connect their eBay account; FlipSignal stores access + refresh tokens scoped to listing creation; reconnect flow handles revocation cleanly.
2. **Sell API client wrapper**. Typed wrapper around eBay's Account, Inventory, Offer, and EPS APIs; sandbox + production endpoints behind an env flag.
3. **Image upload to eBay Picture Services (EPS)**. Photos already in R2 are uploaded to EPS during the post flow; EPS-hosted URLs are what the listing references on eBay.
4. **"Post to eBay" flow**. From the listing-generator output card, user clicks Post → confirmation modal → backend creates inventory item, offer, publishes via the Sell API → listing is live; eBay item ID is persisted on the `Listing` row; user is redirected to a success page with the live URL.
5. **Listing status persistence + sync**. `Listing` model gains `ebayItemId`, `ebayStatus`, `ebayPostedAt`, `ebayUrl`. A daily cron (or on-demand refresh) updates `ebayStatus` to reflect SOLD, ENDED, etc.
6. **CSV export for eBay File Exchange (bridge)**. Generates eBay's bulk-listing CSV format for sellers using File Exchange instead of (or while waiting on) the API path.

## Requirements — P2 items removed

The "Direct eBay API integration" entry in v1.0's P2 list is removed (it's now P0, see above). All other P2 items from v1.0 remain unchanged.

## Phasing (revised — 6 weeks → 8 weeks)

The pivot adds Week 4 dedicated to eBay integration, pushing subsequent weeks back by one.

- **Week 1 — Foundations + greenfield risks** ✓ (DONE)
- **Week 2 — UI scaffold** ✓ (DONE)
- **Week 3 — AI integration** ✓ (substantially complete; W3-4 ListingOutput component is the remaining polish)
- **Week 4 — eBay integration (NEW; PIVOT).** OAuth + Sell API client + EPS image upload + Post-to-eBay flow + listing status sync + CSV export bridge. Dependencies: eBay Developer Program approval (3–7 business days; start in parallel with W3 polish).
- **Week 5 — Persistence + cards (was Week 4).** Pricing card, shipping card, photo notes, `/saved-listings` page, plus listing status badges showing live eBay state.
- **Week 6 — Billing + polish (was Week 5).** Stripe SKUs and tier migration, onboarding flow updates, internal QA on 100 real items + post-to-eBay smoke tests, cost telemetry.
- **Week 7 — Beta launch (was Week 6).** Invite list, leading-metric instrumentation, weekly review process.

## Pricing & Tier Strategy (open question revisited)

The unified Free / Starter / Seller / Power Seller pricing was set on **per-generation quotas** (3 / 25 / 75 / 250 listings/month). With direct posting, the cost profile changes — a user might generate many drafts and post few, or vice versa. Three reasonable models:

| Model | Pros | Cons |
|---|---|---|
| Per-generation only | Simple; matches AI cost driver | Doesn't capture posted-listing value |
| Per-post only | Aligns price with realized value | Unbounded generation cost; risk of abuse |
| Hybrid (generation + post quotas) | Captures both cost + value | More complex pricing page; harder to communicate |

**Decision: park until we have data.** Ship v1.1 with the existing per-generation quotas. After 4 weeks of beta usage, look at the generation-to-post ratio and pick a model. Add this to W7 retrospective.

## Risks (additions)

These are added to v1.0's risk list. Existing risks remain in force.

- **eBay Developer Program rejection or slow approval.** Mitigation: W4E-1 starts immediately. CSV export (W4E-7) is the bridge that delivers value without API access. Worst case (rejection): lean fully on CSV + browser-extension fallback (deferred to a v1.2 contingency).
- **eBay account suspension if AI-generated listings violate eBay policy.** Mitigation: the safety rules in the system prompt already forbid fabricated claims. Add an internal QA pass on 100 generations specifically for policy compliance before opening posting to non-internal users.
- **OAuth token leakage / scope creep.** Mitigation: minimal scopes (Sell only, not Account read); refresh tokens encrypted at rest; explicit revoke flow on the user's settings page.
- **Listing quality at scale leading to negative seller feedback.** Mitigation: the Post button always opens a confirmation modal showing the full preview; user has the final review responsibility. Also: track "how often does the user edit before posting" as a leading metric.
- **Rate limiting from eBay's Sell API.** Mitigation: queueing + exponential backoff in the EbayClient wrapper; surface "we're being rate-limited, try in a moment" rather than dropping requests.

## Open Questions (additions)

Added to the v1.0 list:

- **(Eng)** eBay sandbox vs. production: do we need separate seeded test accounts for QA, or can we use the production flow against a personal eBay seller account during dev? (Sandbox is more correct but slower; some Sell API features differ between environments.)
- **(Product)** Do we charge for posted listings independently of generated ones, or one combined quota? Defer until usage data is in.
- **(Product/Trust)** Should we require explicit user confirmation per-listing, or offer a "trust the AI" mode that auto-posts without the modal? Default is per-listing confirmation; auto-post is post-MVP.
- **(Eng)** Image hosting strategy: keep R2 as the seller-facing photo store and re-upload to EPS at post time, or shift to EPS-hosted as primary? R2 is the simpler answer for MVP; revisit if EPS storage costs are negligible.
- **(Compliance)** Does eBay's API TOS require us to register the FlipSignal app brand somewhere visible on the listing? Investigate before W4E-2.

## Implementation gates

- **W4E-1 (eBay Developer Program approval)** is an external 3–7 day blocker. Apply immediately; don't sequence W4E-2..W4E-6 as dependent on its completion. The team can build against eBay's sandbox while production approval is pending.
- **W4E-2 (OAuth)** is the first user-data-touching change post-pivot. Approval-required per the build tracker.
- **W4E-5 (Post to eBay)** is the highest-stakes user action FlipSignal has shipped. Approval-required; expect to iterate on the confirmation modal copy before opening to beta.

## Reference

- v1.0 PRD: `FlipSignal_Listing_Signal_PRD.docx` at the repo root (the original, preserved).
- Tracker: [[Listing Signal Build Tracker]] (operational task list, updated 2026-05-05 with W4 eBay integration section).
- Decision log entry: [[Logs/Decisions]] 2026-05-05.

## Related Notes

- [[Listing Signal Spec]]
- [[Listing Signal Build Tracker]]
- [[Logs/Decisions]]
- [[Logs/Progress]]
