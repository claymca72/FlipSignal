// TODO(W2-1-approval): add Listing Generator nav link to dashboardNavigation in src/lib/constants.ts
// Proposed entry: { href: "/app/listing-generator", label: "Listing Generator" }
// Insert after the Deals entry, before Settings.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ListingGeneratorPage() {
  await requireUser();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Listing Generator</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Upload photos, add details, generate an optimized eBay listing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>Full UI lands in W2-6.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            The Listing Generator will allow you to upload item photos, fill in key details, and
            receive an AI-optimised eBay listing title and description in seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
