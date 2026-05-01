import "dotenv/config";

import { DealStatus, LeadInteractionStatus, PlanTier } from "@prisma/client";

import { updateDealForUser } from "../src/domains/deals/service";
import { calculateProfitBreakdown } from "../src/domains/fees/calculate";
import { applyLeadInteraction, getLeadFeedForUser } from "../src/domains/leads/service";
import { prisma } from "../src/lib/db";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const [freeUser, proUser, premiumUser] = await Promise.all([
    prisma.user.findUnique({
      where: { email: "demo@flipsignal.app" },
      include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.user.findUnique({
      where: { email: "pro@flipsignal.app" },
      include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.user.findUnique({
      where: { email: "premium@flipsignal.app" },
      include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  if (!freeUser || !proUser || !premiumUser) {
    throw new Error("Seeded users are required for Pass 2 verification.");
  }

  assert(freeUser.subscriptions[0]?.plan === PlanTier.FREE, "Demo user should be on Free.");
  assert(proUser.subscriptions[0]?.plan === PlanTier.STARTER, "Starter user should be on Starter.");
  assert(premiumUser.subscriptions[0]?.plan === PlanTier.SELLER, "Seller user should be on Seller.");

  const [freeFeed, freeFilteredFeed, starterSneakerFeed, sellerFeed] = await Promise.all([
    getLeadFeedForUser({ userId: freeUser.id, plan: PlanTier.FREE, filters: {} }),
    getLeadFeedForUser({ userId: freeUser.id, plan: PlanTier.FREE, filters: { category: "electronics" } }),
    getLeadFeedForUser({ userId: proUser.id, plan: PlanTier.STARTER, filters: { category: "sneakers" } }),
    getLeadFeedForUser({ userId: premiumUser.id, plan: PlanTier.SELLER, filters: {} }),
  ]);

  assert(freeFeed.length <= 6, "Free plan should see a limited feed.");
  assert(freeFeed.every((lead) => !lead.premiumOnly), "Free plan should not see premium-only leads.");
  assert(
    freeFilteredFeed.length === freeFeed.length,
    "Free plan filters should not narrow the feed because filters are gated.",
  );
  assert(starterSneakerFeed.length > 0, "Starter plan should be able to filter leads.");
  assert(starterSneakerFeed.every((lead) => lead.category === "sneakers"), "Starter category filter should work.");
  assert(starterSneakerFeed.every((lead) => !lead.premiumOnly), "Starter plan should not see premium-only leads.");
  assert(sellerFeed.some((lead) => lead.premiumOnly), "Seller plan should see premium-only leads.");

  const calculatorResult = calculateProfitBreakdown({
    cost: 80,
    tax: 6,
    shippingCost: 12,
    marketplace: "EBAY",
    expectedSalePrice: 145,
  });

  assert(calculatorResult.netProfit > 0, "Calculator should compute positive profit for the verification sample.");
  assert(calculatorResult.breakEvenPrice > 0, "Calculator should compute a break-even price.");

  const e2eEmail = "e2e-pass2@flipsignal.app";
  const e2eUser = await prisma.user.upsert({
    where: { email: e2eEmail },
    update: {},
    create: {
      email: e2eEmail,
      name: "Pass 2 E2E",
      passwordHash: "not-used-for-script",
      subscriptions: {
        create: {
          plan: PlanTier.FREE,
          status: "ACTIVE",
        },
      },
      alertPreference: {
        create: {
          categories: [],
          enabled: false,
        },
      },
    },
  });

  await prisma.userLead.deleteMany({ where: { userId: e2eUser.id } });
  await prisma.deal.deleteMany({ where: { userId: e2eUser.id } });
  await prisma.subscription.updateMany({
    where: { userId: e2eUser.id },
    data: { plan: PlanTier.FREE, status: "ACTIVE" },
  });

  const accessibleLeads = await prisma.lead.findMany({
    where: { premiumOnly: false },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  assert(accessibleLeads.length >= 11, "Need at least 11 accessible seeded leads for the free-plan limit check.");

  const firstLead = accessibleLeads[0];

  const saveResult = await applyLeadInteraction({
    userId: e2eUser.id,
    plan: PlanTier.FREE,
    leadId: firstLead.id,
    intent: "save",
  });

  assert(saveResult.success, "Saving a lead should succeed.");

  const savedLink = await prisma.userLead.findUnique({
    where: { userId_leadId: { userId: e2eUser.id, leadId: firstLead.id } },
  });
  const savedDeal = await prisma.deal.findUnique({
    where: { userId_leadId: { userId: e2eUser.id, leadId: firstLead.id } },
  });

  assert(savedLink?.status === LeadInteractionStatus.SAVED, "Saved lead should persist as SAVED.");
  assert(savedDeal?.status === DealStatus.SAVED, "Saved lead should create a SAVED deal.");

  const buyResult = await applyLeadInteraction({
    userId: e2eUser.id,
    plan: PlanTier.FREE,
    leadId: firstLead.id,
    intent: "buy",
  });

  assert(buyResult.success, "Buying a saved lead should succeed.");

  const boughtDeal = await prisma.deal.findUnique({
    where: { userId_leadId: { userId: e2eUser.id, leadId: firstLead.id } },
  });
  assert(boughtDeal?.status === DealStatus.PURCHASED, "Bought lead should become a PURCHASED deal.");

  const updateListed = await updateDealForUser({
    userId: e2eUser.id,
    dealId: boughtDeal!.id,
    status: DealStatus.LISTED,
    actualCost: Number(boughtDeal!.actualCost ?? 0),
    actualShippingCost: 12,
    actualFees: 0,
    notes: "Listed during Pass 2 verification.",
  });
  assert(updateListed, "Updating a deal to LISTED should succeed.");

  const updateSold = await updateDealForUser({
    userId: e2eUser.id,
    dealId: boughtDeal!.id,
    status: DealStatus.SOLD,
    actualCost: 80,
    actualSalePrice: 145,
    actualShippingCost: 12,
    actualFees: 22,
    notes: "Sold during Pass 2 verification.",
  });
  assert(updateSold, "Updating a deal to SOLD should succeed.");

  const soldDeal = await prisma.deal.findUnique({
    where: { id: boughtDeal!.id },
  });
  assert(soldDeal?.status === DealStatus.SOLD, "Deal should persist as SOLD.");
  assert(Number(soldDeal?.actualProfit ?? 0) === 31, "Sold deal should persist actual profit.");

  await prisma.userLead.deleteMany({ where: { userId: e2eUser.id } });
  await prisma.deal.deleteMany({ where: { userId: e2eUser.id } });

  for (const lead of accessibleLeads.slice(0, 10)) {
    const result = await applyLeadInteraction({
      userId: e2eUser.id,
      plan: PlanTier.FREE,
      leadId: lead.id,
      intent: "save",
    });

    assert(result.success, "Free user should be able to save up to 10 deals.");
  }

  const overLimitResult = await applyLeadInteraction({
    userId: e2eUser.id,
    plan: PlanTier.FREE,
    leadId: accessibleLeads[10].id,
    intent: "save",
  });

  assert(!overLimitResult.success, "Free user should be blocked from saving the 11th deal.");

  console.log("Pass 2 verification complete.");
  console.log("- Lead feed gating verified for Free, Starter, and Seller");
  console.log("- Calculator domain logic verified");
  console.log("- Saved deals workflow verified through save, buy, list, and sell");
  console.log("- Free-plan deal limit verified");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
