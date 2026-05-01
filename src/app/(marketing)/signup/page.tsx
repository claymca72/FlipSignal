import Link from "next/link";
import { PlanTier } from "@prisma/client";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function getDefaultPlan(plan?: string | string[]) {
  if (plan === "starter") {
    return PlanTier.STARTER;
  }

  if (plan === "seller") {
    return PlanTier.SELLER;
  }

  return PlanTier.FREE;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  const params = (await searchParams) ?? {};
  const requestedPlan = getDefaultPlan(params.plan);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1200px] items-center px-4 py-12 lg:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Start your workflow</p>
          <h1 className="text-4xl font-semibold tracking-tight">Create your account and start building a smarter flipping system.</h1>
          <p className="max-w-xl text-[var(--muted-foreground)]">
            The MVP already supports real plan gating, saved deal limits on Free, and subscription-ready billing hooks for Pro and Premium.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Create your account on Free, then switch or upgrade from Pricing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SignupForm requestedPlan={requestedPlan} />
            <p className="text-sm text-[var(--muted-foreground)]">
              Already have an account? <Link href="/login" className="text-[var(--accent)]">Log in</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
