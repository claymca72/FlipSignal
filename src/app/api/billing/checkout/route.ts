import { PlanTier } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getCurrentUser } from "@/lib/auth/session";
import { env } from "@/lib/env";

const checkoutPlans = [PlanTier.PRO, PlanTier.PREMIUM] as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const plan = String(formData.get("plan")) as PlanTier;

  if (!checkoutPlans.includes(plan as (typeof checkoutPlans)[number])) {
    return NextResponse.redirect(new URL("/pricing?error=invalid-plan", request.url));
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/signup?plan=${plan.toLowerCase()}`, request.url));
  }

  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL("/pricing?billing=unconfigured", request.url));
  }

  const priceId = plan === PlanTier.PRO ? env.STRIPE_PRO_PRICE_ID : env.STRIPE_PREMIUM_PRICE_ID;

  if (!priceId) {
    return NextResponse.redirect(new URL("/pricing?billing=missing-price", request.url));
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXTAUTH_URL ?? new URL(request.url).origin}/app/settings?billing=success`,
    cancel_url: `${env.NEXTAUTH_URL ?? new URL(request.url).origin}/pricing?billing=canceled`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      requestedPlan: plan,
    },
  });

  if (!session.url) {
    return NextResponse.redirect(new URL("/pricing?billing=failed", request.url));
  }

  return NextResponse.redirect(session.url);
}
