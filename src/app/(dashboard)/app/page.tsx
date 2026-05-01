import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { MetricCard } from "@/components/app/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSnapshot } from "@/domains/deals/service";
import { getLeadFeedStats } from "@/domains/leads/service";
import { requireUser } from "@/lib/auth/session";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AppOverviewPage() {
  const user = await requireUser();
  const [snapshot, stats] = await Promise.all([getDashboardSnapshot(user.id, user.plan), getLeadFeedStats(user.id)]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Open deals" value={String(snapshot.openDeals)} helper="Saved, purchased, and listed deals still in motion." />
          <MetricCard label="Sold profit" value={formatCurrency(snapshot.soldProfit)} helper={`${snapshot.soldDealCount} deal${snapshot.soldDealCount === 1 ? "" : "s"} closed so far.`} />
          <MetricCard label="Lead actions" value={String(stats.saved + stats.bought)} helper={`${stats.saved} saved, ${stats.bought} bought, ${stats.skipped} skipped.`} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What to do next</CardTitle>
            <CardDescription>Use the dashboard as a workflow hub, not just a report.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild>
              <Link href="/app/leads">Review the latest lead feed</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/calculator">Run a quick profit calculation</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/app/deals">Update your saved deals</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Newest leads</CardTitle>
            <CardDescription>Fresh curated opportunities from the feed.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {snapshot.newestLeads.length ? (
              snapshot.newestLeads.map((lead) => (
                <div key={lead.id} className="rounded-[24px] border border-[var(--border)] bg-[var(--panel-muted)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{lead.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{lead.category} on {lead.marketplace}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(lead.estimatedProfit)}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{formatPercent(lead.estimatedRoi)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No leads yet"
                description="No visible leads are available right now for your current plan."
                action={
                  <Button asChild>
                    <Link href="/pricing">Compare plans</Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow summary</CardTitle>
            <CardDescription>Track whether you are acting on good signal or just collecting ideas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--muted-foreground)]">Saved leads</p>
              <p className="mt-1 text-2xl font-semibold">{stats.saved}</p>
            </div>
            <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--muted-foreground)]">Bought leads</p>
              <p className="mt-1 text-2xl font-semibold">{stats.bought}</p>
            </div>
            <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--muted-foreground)]">Skipped leads</p>
              <p className="mt-1 text-2xl font-semibold">{stats.skipped}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
