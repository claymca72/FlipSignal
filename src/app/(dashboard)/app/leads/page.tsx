import Image from "next/image";

import { LeadActionForm } from "@/components/app/lead-action-form";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryOptions, marketplaceOptions } from "@/lib/constants";
import { requireUser } from "@/lib/auth/session";
import { canUseLeadFilters } from "@/lib/plans";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { getLeadFeedForUser } from "@/domains/leads/service";

function parseMarketplace(value?: string | string[]) {
  const match = marketplaceOptions.find((option) => option.value === value);
  return match?.value;
}

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};

  const filters = {
    category: typeof params.category === "string" ? params.category : undefined,
    marketplace: parseMarketplace(params.marketplace),
    roiMin: typeof params.roiMin === "string" ? Number(params.roiMin) : undefined,
    roiMax: typeof params.roiMax === "string" ? Number(params.roiMax) : undefined,
  };

  const leads = await getLeadFeedForUser({
    userId: user.id,
    plan: user.plan,
    filters,
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead feed</CardTitle>
          <CardDescription>Curated leads with real numbers, not vanity metrics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-3 lg:grid-cols-4">
            <select
              name="category"
              defaultValue={filters.category ?? ""}
              disabled={!canUseLeadFilters(user.plan)}
              className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm outline-none"
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category[0].toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              name="marketplace"
              defaultValue={filters.marketplace ?? ""}
              disabled={!canUseLeadFilters(user.plan)}
              className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm outline-none"
            >
              <option value="">All marketplaces</option>
              {marketplaceOptions.map((marketplace) => (
                <option key={marketplace.value} value={marketplace.value}>
                  {marketplace.label}
                </option>
              ))}
            </select>
            <input
              name="roiMin"
              type="number"
              min="0"
              placeholder="Min ROI"
              defaultValue={filters.roiMin ?? ""}
              disabled={!canUseLeadFilters(user.plan)}
              className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm outline-none"
            />
            <div className="flex gap-3">
              <input
                name="roiMax"
                type="number"
                min="0"
                placeholder="Max ROI"
                defaultValue={filters.roiMax ?? ""}
                disabled={!canUseLeadFilters(user.plan)}
                className="h-11 min-w-0 flex-1 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm outline-none"
              />
              <button type="submit" className="rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white">
                Apply
              </button>
            </div>
          </form>

          {!canUseLeadFilters(user.plan) ? (
            <p className="text-sm text-[var(--muted-foreground)]">Advanced lead filters unlock on Pro and above.</p>
          ) : null}
          {user.plan === "FREE" ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Free plan preview: showing the six newest standard leads. Upgrade for the full feed and advanced filters.
            </p>
          ) : null}
          {user.plan === "PRO" ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Pro includes the full standard feed. Premium-only leads still unlock on Premium.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {leads.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {leads.map((lead) => (
          <Card key={lead.id} className="overflow-hidden">
            <CardContent className="grid gap-5 p-5">
              <div className="flex gap-4">
                <div className="relative h-28 w-28 overflow-hidden rounded-[24px] bg-[var(--panel-muted)]">
                  <Image src={lead.imageUrl} alt={lead.title} fill className="object-cover" sizes="112px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="capitalize">{lead.category}</Badge>
                    <Badge tone="muted">{lead.marketplace.replaceAll("_", " ")}</Badge>
                    {lead.premiumOnly ? <Badge tone="warning">Premium</Badge> : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{lead.title}</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {lead.sourceStore} • Added {formatDate(lead.createdAt)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-5 text-sm">
                    <Metric label="Buy" value={formatCurrency(lead.buyPrice)} />
                    <Metric label="Sale" value={formatCurrency(lead.estimatedSalePrice)} />
                    <Metric label="Profit" value={formatCurrency(lead.estimatedProfit)} />
                    <Metric label="ROI" value={formatPercent(lead.estimatedRoi)} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Estimated fees" value={formatCurrency(lead.estimatedFees)} />
                <Detail label="Shipping" value={formatCurrency(lead.estimatedShippingCost)} />
                <Detail label="Sell-through" value={`${lead.sellThroughRating}/5 • ${lead.sellThroughLabel}`} />
                <Detail label="Confidence" value={`${lead.confidenceScore}/100 • ${lead.confidenceLabel}`} />
              </div>

              <LeadActionForm
                leadId={lead.id}
                interactionStatus={lead.interactionStatus}
                dealStatus={lead.dealStatus}
              />
            </CardContent>
          </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No leads match these filters"
          description="Try widening your filters or switch to a plan with broader lead access."
        />
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[var(--muted-foreground)]">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-[var(--panel-muted)] px-4 py-3">
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
