import Link from "next/link";

import { DealUpdateForm } from "@/components/app/deal-update-form";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDealsForUser } from "@/domains/deals/service";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const user = await requireUser();
  const deals = await getDealsForUser(user.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved deals workflow</CardTitle>
        <CardDescription>Move products from saved to purchased, listed, and sold while tracking real numbers.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {deals.length ? (
          deals.map((deal) => <DealUpdateForm key={deal.id} deal={deal} />)
        ) : (
          <EmptyState
            title="No deals yet"
            description="Save a lead from the feed to start tracking your workflow and actual profit."
            action={
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/app/leads">Browse leads</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/app/calculator">Open calculator</Link>
                </Button>
              </div>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
