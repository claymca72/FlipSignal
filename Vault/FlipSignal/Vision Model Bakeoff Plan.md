# Vision Model Bakeoff Plan

See also: [[Home]], [[Listing Signal Spec]], [[Listing Signal Build Tracker]]

This note defines the methodology for the Week 1 Track B bakeoff that picks the vision model powering Listing Signal. No model calls are executed here — this is planning only.

## Goal

Pick the vision model that produces the most accurate, least-hallucinating eBay listings on real reseller-quality photos at the lowest cost-per-call. The winning model must identify product type and brand correctly, surface uncertainty when it cannot, and respect the safety rules in the spec — all while keeping blended cost-per-generation under the $0.15 success metric set for the feature.

## Scope

### In scope

- 30–50 photos drawn from 5–7 reseller categories (see Photo Set Requirements below)
- 2–3 photos per item, matching the real upload pattern (users send multiple angles)
- A deliberate mix of easy and hard cases: clear brand logos, missing brand logos, good lighting, dim/low-contrast lighting
- A few items with original packaging and a few without
- Scoring each model against the rubric in this note
- Capturing prompt scaffold and cost data for the winning model

### Out of scope

- Image generation models (DALL-E, Imagen, Flux, etc.)
- Audio or speech models
- Multi-turn / conversational evaluation
- Live eBay search or sold-comps scraping
- Any production code changes — harness is a follow-up task

## Photo Set Requirements

Assemble a set of 30–50 real reseller photos before running the bakeoff. The agent cannot assemble this set — it must be done manually by the user. Use the checklist below to ensure adequate coverage.

### Categories to cover (5–7 total)

- Small electronics (phones, earbuds, cables, chargers)
- Branded clothing (visible logo or tag)
- Unbranded or generic clothing
- Kitchenware (cookware, appliances, utensils)
- Collectibles and figures (toys, trading cards, figurines)
- Parts and accessories (OEM parts, aftermarket accessories)
- Beauty and personal care (skincare, tools, fragrance)

### Assembly checklist

- [ ] At least 4 items per selected category
- [ ] 2–3 photos per item (front, back, detail — simulating real upload behavior)
- [ ] At least 5 items where a brand logo or label is clearly visible in at least one photo
- [ ] At least 5 items where no brand is visible and the correct answer is "unknown brand"
- [ ] At least 5 photos taken in good natural or studio light
- [ ] At least 5 photos taken in dim, yellow, or otherwise poor light
- [ ] At least 5 items photographed with original packaging present
- [ ] At least 5 items photographed without packaging
- [ ] At least 3 deliberately ambiguous items (brand plausible but not confirmable from photos alone)
- [ ] Assign each item a short ID (e.g. `ELEC-01`, `CLTH-B-02`) for the scoresheet

## Models to Test

Confirm exact version strings at run time — model naming changes frequently.

| Model | Suggested version string | Key tradeoff |
|---|---|---|
| GPT-4o | `gpt-4o-2024-08-06` or current stable | Strong general reasoning and instruction following; OpenAI pricing is the cost baseline for comparison |
| Claude Sonnet with vision | `claude-sonnet-4-5` or current Sonnet | Strong instruction-following on structured output and safety rules; similar pricing tier to GPT-4o |
| Gemini 2.5 | `gemini-2.5-flash` (preferred for cost) or `gemini-2.5-pro` if Flash hallucinates more | Cheapest input-token pricing of the three; image-grounded reasoning is less proven on reseller photos |

Note: if a newer stable version of any model is available at run time, prefer it and record the actual version string in the scoresheet.

## Prompt Template

Use this prompt verbatim for every model and every photo set to ensure a fair comparison. Pass all photos for one item in a single call.

```
You are an eBay listing assistant. You will receive 1–8 photos of a secondhand item that a reseller wants to list.

SAFETY RULES — follow these exactly:
- Do not fabricate model-compatibility claims. If compatibility cannot be confirmed from the photos and user-provided details, omit it or flag it as unverified.
- Do not use the words "tested," "authentic," or "working" unless the user has explicitly confirmed this in the user-provided fields below.
- Do not use the word "new" unless (a) original packaging is visible in the photos AND (b) the user has confirmed condition = New in the user-provided fields.
- Surface all uncertainty in the output fields — never make a silent guess on regulated categories (electronics, designer goods, collectibles).
- The listing must include the footer: "AI-assisted draft. Verify all model numbers and compatibility before posting."

USER-PROVIDED FIELDS (treat these as user-confirmed facts; mark them as such in your output):
- brand: {brand_or_empty}
- model_number: {model_number_or_empty}
- condition: {condition_or_empty}  (one of: New, Like New, Used-Excellent, Used-Good, Used-Fair, For Parts)
- accessories_included: {accessories_or_empty}
- known_defects: {defects_or_empty}
- selling_goal: {selling_goal_or_empty}  (one of: ASAP, Balanced, Max Profit)

Fields left empty above are NOT user-confirmed. Do not infer them without flagging the inference.

Return ONLY a JSON object matching this schema — no prose outside the JSON:

{
  "optimized_title": "string, ≤80 chars, eBay title best practices",
  "mobile_title": "string, ≤40 chars, front-loaded keywords",
  "category_suggestion": "string, eBay category path",
  "item_specifics": { "key": "value" },
  "condition_description": "string, plain-English condition notes",
  "seo_description": "string, full listing description with footer",
  "pricing": {
    "low": "number, USD",
    "target": "number, USD",
    "high": "number, USD",
    "rationale": "string"
  },
  "shipping": {
    "weight": "string, estimated weight with unit",
    "packaging": "string, recommended packaging",
    "carrier": "string, recommended carrier and service",
    "paid_by": "string, Seller or Buyer"
  },
  "keywords": ["string"],
  "photo_notes": ["string, 0–3 actionable improvement tips"],
  "cross_listing_short": "string, ≤200 chars for Mercari/Poshmark/Depop",
  "confidence": "number, 0.0–1.0 overall confidence",
  "uncertainty_flags": ["string, one entry per uncertain field or inference"]
}
```

Now analyze the provided photos and generate the listing.
```

For the bakeoff, pass empty strings for all user-provided fields so model behavior on photos-only is isolated. Optionally run a second pass with some fields filled to test instruction-following on user-confirmed data.

## Scoring Rubric

### Primary metrics (per item)

- **Product type accuracy** — Pass / Fail. Did the model correctly identify what kind of item this is (e.g. "wireless earbuds" not "headphones")?
- **Brand and model accuracy** — three verdicts:
  - Pass: brand/model correctly identified when visible
  - Fail: wrong brand or model stated with apparent confidence
  - Correctly said unknown: brand/model flagged as unconfirmed when not visible (this is the desired behavior on ambiguous photos)
- **Hallucination count** — integer count of violations per call:
  - Fabricated compatibility claim not visible in photos
  - Use of "tested," "authentic," "working," or "new" without user confirmation
  - Missing "AI-assisted draft. Verify all model numbers and compatibility before posting." footer
  - Silent guess on a regulated category field that should have been flagged

### Secondary metrics (per call)

- **Cost per call** — (input tokens × input price) + (output tokens × output price) in USD. Record at run time using the pricing page for the exact version tested.
- **Wall-clock latency** — milliseconds from request sent to full response received. Use a simple `Date.now()` diff around the API call, or note it manually.

## Run Procedure

1. Assemble the photo set following the checklist in Photo Set Requirements. Assign item IDs.
2. Create API keys for all three providers: OpenAI (`OPENAI_API_KEY`), Anthropic (`ANTHROPIC_API_KEY`), Google AI (`GEMINI_API_KEY`). Store in a local `.env` file — do not commit.
3. For each item in the photo set, run the prompt template against all three models in sequence, passing all photos for that item in one call.
4. Capture the raw JSON response for each call. Log any call that errors or returns malformed JSON separately — count it as a Fail on product type and Fail on brand-model, and add hallucination count = 1 for the missing safety footer.
5. Fill in one row of the scoresheet (see Scoresheet Template below) per item per model as you go.
6. After all calls are complete, compute per-model aggregates: product-type pass rate, brand-model pass/fail/correctly-said-unknown counts, total hallucination count, average cost per call, median latency.
7. Apply the decision criteria below to pick a winner.

Note on harness: the run can be done with manual API calls in a REST client or with a small `tsx scripts/bakeoff.ts` script. Writing that script is a small follow-up task (W1-B2 extension) if the team prefers scripted repeatability. Do not write that script as part of this planning note.

## Decision Criteria

1. **Disqualification threshold** — any model with more than 2 total hallucination violations across the entire test set is disqualified. Hallucination is a safety risk that outweighs accuracy or cost advantages.
2. **Primary ranking** — among surviving models, rank by combined score: (product-type pass count) + (brand-model Pass count) + (brand-model "correctly said unknown" count). Higher is better.
3. **Tiebreak** — if two models are within 2 points of each other on the primary ranking, the lower average cost per call wins.
4. **No survivor** — if all three models exceed the hallucination threshold, do not pick a winner. Surface this to the team and revisit the prompt template before proceeding. Do not allow the build to move to W3 without a passing model.

The picked model's version string, cost-per-call figure, and the prompt scaffold from the Prompt Template section become the inputs for W3-1 and W3-2.

## Scoresheet Template

Copy this table into a new note (e.g. `Vault/FlipSignal/Bakeoff Results.md`) when running the bakeoff. Add one row per item per model.

| Item ID | Category | Photo Count | Model | Product Type Pass | Brand-Model Verdict | Hallucination Count | Latency (ms) | Cost (USD) | Notes |
|---|---|---|---|---|---|---|---|---|---|
| ELEC-01 | Small electronics | 3 | gpt-4o-2024-08-06 | Pass | Pass | 0 | 4200 | 0.031 | Identified as iPhone 12, correct |
| ELEC-01 | Small electronics | 3 | claude-sonnet-4-5 | Pass | Correctly said unknown | 0 | 3800 | 0.028 | No IMEI visible, model hedged correctly |
| CLTH-B-03 | Branded clothing | 2 | gemini-2.5-flash | Fail | Fail | 1 | 2100 | 0.009 | Misread logo, claimed "tested" without confirmation |

Add aggregate rows at the bottom: one per model summing pass counts and total hallucinations, averaging cost and latency.

## What This Unblocks

Once a model is selected from this bakeoff, the prompt template captured here becomes the direct basis for W3-2 (final system prompt and Zod JSON schema), and the picked SDK gets installed in W3-1. The measured cost-per-call figure feeds directly into the blended $0.15/generation success metric — if the winning model's per-call cost leaves no headroom for infrastructure overhead, the team should adjust photo limits or explore prompt compression before proceeding to beta.

## Related Notes

- [[Listing Signal Spec]]
- [[Listing Signal Build Tracker]]
- [[Logs/Decisions]]
