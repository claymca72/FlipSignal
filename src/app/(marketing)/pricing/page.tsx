import type { ReactNode } from "react";
import Link from "next/link";
import { PlanTier } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth/session";
import { switchLocalPlanAction } from "@/actions/subscription-actions";
import { planContent } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  const params = (await searchParams) ?? {};
  const billingMessage = typeof params.billing === "string" ? params.billing : null;
  const canUseLocalPlanSwitch = process.env.NODE_ENV !== "production" && !env.STRIPE_SECRET_KEY;

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 lg:px-6 lg:py-14">
      <div className="space-y-3">
        <Badge tone="muted">Pricing</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">Simple plans for a flipping workflow that scales with you.</h1>
        <p className="max-w-2xl text-[var(--muted-foreground)]">
          Start with a free lead sample and calculator, then unlock full feed access, alerts, and premium-first leads when you need more signal.
        </p>
        {billingMessage ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Stripe checkout is scaffolded. Set Stripe keys in your environment to enable live checkout sessions.
          </p>
        ) : null}
        {canUseLocalPlanSwitch ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Local development mode: logged-in users can switch plans here without Stripe so gating can be tested end to end.
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <PlanCard
          name="Free"
          price="$0"
          description="A practical starter plan for testing the product and running profit checks."
          features={[
            "Limited lead feed preview",
            "Calculator access",
            "Save up to 10 deals",
          ]}
          action={
            <Button className="w-full" asChild>
              <Link href={user ? "/app" : "/signup?plan=free"}>{user ? "Open app" : "Start free"}</Link>
            </Button>
          }
          supplementalAction={
            canUseLocalPlanSwitch && user ? (
              <LocalPlanSwitchForm plan={PlanTier.FREE} currentPlan={user.plan} />
            ) : null
          }
        />
        <PlanCard
          name="Starter"
          price="$29/mo"
          description="For active resellers who want the complete workflow and alerts."
          highlight
          features={[
            "Full lead feed",
            "Advanced filters",
            "Unlimited saved deals",
            "Email alerts",
          ]}
          action={
            user ? (
              canUseLocalPlanSwitch ? (
                <LocalPlanSwitchForm plan={PlanTier.STARTER} currentPlan={user.plan} />
              ) : (
                <form action="/api/billing/checkout" method="POST">
                  <input type="hidden" name="plan" value={PlanTier.STARTER} />
                  <Button className="w-full" type="submit">
                    Upgrade to Starter
                  </Button>
                </form>
              )
            ) : (
              <Button className="w-full" asChild>
                <Link href="/signup?plan=starter">Start Starter</Link>
              </Button>
            )
          }
        />
        <PlanCard
          name="Seller"
          price="$79/mo"
          description="For resellers who want premium-only flips and earlier access to the best leads."
          features={[
            "Everything in Starter",
            "Premium-only leads",
            "Early access flag on premium drops",
            "Priority alerts",
          ]}
          action={
            user ? (
              canUseLocalPlanSwitch ? (
                <LocalPlanSwitchForm plan={PlanTier.SELLER} currentPlan={user.plan} />
              ) : (
                <form action="/api/billing/checkout" method="POST">
                  <input type="hidden" name="plan" value={PlanTier.SELLER} />
                  <Button variant="outline" className="w-full" type="submit">
                    Upgrade to Seller
                  </Button>
                </form>
              )
            ) : (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup?plan=seller">Start Seller</Link>
              </Button>
            )
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan gating in the MVP</CardTitle>
          <CardDescription>These limits are already wired into the app so billing can extend naturally later.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {Object.entries(planContent).map(([tier, content]) => (
            <div key={tier} className="rounded-[24px] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted-foreground)]">
              <p className="font-medium text-[var(--foreground)]">{content.label}</p>
              <p className="mt-2">Lead limit: {content.leadLimit ?? "Full feed"}</p>
              <p>Deal limit: {content.dealLimit ?? "Unlimited"}</p>
              <p>Filters: {content.filters ? "Included" : "Locked"}</p>
              <p>Email alerts: {content.emailAlerts ? "Included" : "Locked"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function PlanCard({
  name,
  price,
  description,
  features,
  action,
  supplementalAction,
  highlight = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  action: ReactNode;
  supplementalAction?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-[var(--accent)] shadow-[0_24px_60px_rgba(28,161,144,0.18)]" : ""}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <div className="text-3xl font-semibold">{price}</div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <ul className="grid gap-3 text-sm text-[var(--muted-foreground)]">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        {action}
        {supplementalAction}
      </CardContent>
    </Card>
  );
}

function LocalPlanSwitchForm({
  plan,
  currentPlan,
}: {
  plan: PlanTier;
  currentPlan: PlanTier;
}) {
  const isCurrent = plan === currentPlan;

  return (
    <form action={switchLocalPlanAction}>
      <input type="hidden" name="plan" value={plan} />
      <Button className="w-full" variant={plan === PlanTier.SELLER ? "outline" : "default"} type="submit" disabled={isCurrent}>
        {isCurrent ? "Current plan" : `Use ${plan.toLowerCase()} locally`}
      </Button>
    </form>
  );
}
