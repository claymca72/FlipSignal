import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Marketplace, PlanTier, Role, SubscriptionStatus } from "@prisma/client";
import { hashSync } from "bcryptjs";

import { calculateProfitBreakdown, marketplaceFeeProfiles } from "../src/domains/fees/calculate";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const password = hashSync("demo1234", 10);

const leadBlueprints = [
  {
    title: "Nike Dunk Low Retro Panda (Men's 10)",
    imageUrl: "/images/leads/sneakers.svg",
    sourceStore: "Nike Outlet",
    category: "sneakers",
    buyPrice: 74,
    estimatedSalePrice: 128,
    marketplace: Marketplace.STOCKX,
    estimatedShippingCost: 14,
    sellThroughRating: 5,
    confidenceScore: 92,
    premiumOnly: false,
    createdAtOffsetHours: 2,
  },
  {
    title: "Adidas Samba OG White Black (Women's 8)",
    imageUrl: "/images/leads/sneakers.svg",
    sourceStore: "Nordstrom Rack",
    category: "sneakers",
    buyPrice: 58,
    estimatedSalePrice: 108,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 13,
    sellThroughRating: 4,
    confidenceScore: 85,
    premiumOnly: false,
    createdAtOffsetHours: 5,
  },
  {
    title: "Sony WH-1000XM5 Noise Canceling Headphones",
    imageUrl: "/images/leads/electronics.svg",
    sourceStore: "Target Clearance",
    category: "electronics",
    buyPrice: 219,
    estimatedSalePrice: 318,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 18,
    sellThroughRating: 4,
    confidenceScore: 87,
    premiumOnly: false,
    createdAtOffsetHours: 8,
  },
  {
    title: "Apple Magic Keyboard for iPad Pro 11-inch",
    imageUrl: "/images/leads/electronics.svg",
    sourceStore: "Best Buy Open Box",
    category: "electronics",
    buyPrice: 104,
    estimatedSalePrice: 168,
    marketplace: Marketplace.FACEBOOK_MARKETPLACE,
    estimatedShippingCost: 10,
    sellThroughRating: 4,
    confidenceScore: 79,
    premiumOnly: false,
    createdAtOffsetHours: 11,
  },
  {
    title: "Pokemon 151 Elite Trainer Box",
    imageUrl: "/images/leads/collectibles.svg",
    sourceStore: "GameStop",
    category: "collectibles",
    buyPrice: 39,
    estimatedSalePrice: 69,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 9,
    sellThroughRating: 5,
    confidenceScore: 88,
    premiumOnly: false,
    createdAtOffsetHours: 13,
  },
  {
    title: "LEGO Star Wars Helmet Collection Bundle",
    imageUrl: "/images/leads/collectibles.svg",
    sourceStore: "Walmart Clearance",
    category: "collectibles",
    buyPrice: 62,
    estimatedSalePrice: 114,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 15,
    sellThroughRating: 4,
    confidenceScore: 83,
    premiumOnly: false,
    createdAtOffsetHours: 16,
  },
  {
    title: "Lululemon Everywhere Belt Bag 1L",
    imageUrl: "/images/leads/accessories.svg",
    sourceStore: "Lululemon Outlet",
    category: "accessories",
    buyPrice: 24,
    estimatedSalePrice: 49,
    marketplace: Marketplace.FACEBOOK_MARKETPLACE,
    estimatedShippingCost: 7,
    sellThroughRating: 5,
    confidenceScore: 81,
    premiumOnly: false,
    createdAtOffsetHours: 18,
  },
  {
    title: "Coach Leather Card Case Gift Set",
    imageUrl: "/images/leads/accessories.svg",
    sourceStore: "Macy's Backstage",
    category: "accessories",
    buyPrice: 21,
    estimatedSalePrice: 48,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 6,
    sellThroughRating: 3,
    confidenceScore: 72,
    premiumOnly: false,
    createdAtOffsetHours: 20,
  },
  {
    title: "New Balance 9060 Sea Salt (Men's 11)",
    imageUrl: "/images/leads/sneakers.svg",
    sourceStore: "JD Sports",
    category: "sneakers",
    buyPrice: 102,
    estimatedSalePrice: 168,
    marketplace: Marketplace.GOAT,
    estimatedShippingCost: 15,
    sellThroughRating: 4,
    confidenceScore: 90,
    premiumOnly: false,
    createdAtOffsetHours: 24,
  },
  {
    title: "Nintendo Switch OLED White",
    imageUrl: "/images/leads/electronics.svg",
    sourceStore: "Sam's Club",
    category: "electronics",
    buyPrice: 279,
    estimatedSalePrice: 348,
    marketplace: Marketplace.FACEBOOK_MARKETPLACE,
    estimatedShippingCost: 12,
    sellThroughRating: 3,
    confidenceScore: 68,
    premiumOnly: false,
    createdAtOffsetHours: 28,
  },
  {
    title: "Funko Pop! Spider-Man Across the Spider-Verse Set",
    imageUrl: "/images/leads/collectibles.svg",
    sourceStore: "Hot Topic",
    category: "collectibles",
    buyPrice: 36,
    estimatedSalePrice: 78,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 10,
    sellThroughRating: 4,
    confidenceScore: 80,
    premiumOnly: false,
    createdAtOffsetHours: 34,
  },
  {
    title: "Ray-Ban RB2140 Wayfarer Polarized Sunglasses",
    imageUrl: "/images/leads/accessories.svg",
    sourceStore: "Saks Off 5th",
    category: "accessories",
    buyPrice: 78,
    estimatedSalePrice: 139,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 9,
    sellThroughRating: 4,
    confidenceScore: 84,
    premiumOnly: false,
    createdAtOffsetHours: 38,
  },
  {
    title: "Jordan 4 Retro Bred Reimagined (Men's 9.5)",
    imageUrl: "/images/leads/sneakers.svg",
    sourceStore: "Boutique Raffle Pickup",
    category: "sneakers",
    buyPrice: 226,
    estimatedSalePrice: 302,
    marketplace: Marketplace.STOCKX,
    estimatedShippingCost: 16,
    sellThroughRating: 5,
    confidenceScore: 95,
    premiumOnly: true,
    createdAtOffsetHours: 1,
  },
  {
    title: "Bose SoundLink Max Bluetooth Speaker",
    imageUrl: "/images/leads/electronics.svg",
    sourceStore: "Costco Manager Markdown",
    category: "electronics",
    buyPrice: 199,
    estimatedSalePrice: 279,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 17,
    sellThroughRating: 4,
    confidenceScore: 89,
    premiumOnly: true,
    createdAtOffsetHours: 3,
    premiumEarlyAccessHours: 24,
  },
  {
    title: "Disney Lorcana First Chapter Sleeved Booster Box",
    imageUrl: "/images/leads/collectibles.svg",
    sourceStore: "Local Hobby Shop",
    category: "collectibles",
    buyPrice: 114,
    estimatedSalePrice: 189,
    marketplace: Marketplace.EBAY,
    estimatedShippingCost: 11,
    sellThroughRating: 5,
    confidenceScore: 91,
    premiumOnly: true,
    createdAtOffsetHours: 6,
    premiumEarlyAccessHours: 18,
  },
];

async function main() {
  for (const profile of marketplaceFeeProfiles) {
    await prisma.marketplaceFeeProfile.upsert({
      where: { marketplace: profile.marketplace },
      update: {
        name: profile.label,
        description: profile.description,
        baseFeePercent: profile.baseFeePercent,
        paymentFeePercent: profile.paymentFeePercent,
        fixedFee: profile.fixedFee,
        defaultShippingCost: profile.defaultShippingCost,
      },
      create: {
        marketplace: profile.marketplace,
        name: profile.label,
        description: profile.description,
        baseFeePercent: profile.baseFeePercent,
        paymentFeePercent: profile.paymentFeePercent,
        fixedFee: profile.fixedFee,
        defaultShippingCost: profile.defaultShippingCost,
      },
    });
  }

  const [freeUser, proUser, premiumUser, adminUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: "demo@flipsignal.app" },
      update: { name: "Demo User", passwordHash: password },
      create: {
        email: "demo@flipsignal.app",
        name: "Demo User",
        passwordHash: password,
        subscriptions: {
          create: { plan: PlanTier.FREE, status: SubscriptionStatus.ACTIVE },
        },
        alertPreference: { create: { categories: ["sneakers"], roiThreshold: 25 } },
      },
    }),
    prisma.user.upsert({
      where: { email: "pro@flipsignal.app" },
      update: { name: "Starter Seller", passwordHash: password },
      create: {
        email: "pro@flipsignal.app",
        name: "Starter Seller",
        passwordHash: password,
        subscriptions: {
          create: { plan: PlanTier.STARTER, status: SubscriptionStatus.ACTIVE },
        },
        alertPreference: {
          create: {
            enabled: true,
            categories: ["sneakers", "electronics"],
            roiThreshold: 20,
            newLeadAlerts: true,
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "premium@flipsignal.app" },
      update: { name: "Pro Seller", passwordHash: password },
      create: {
        email: "premium@flipsignal.app",
        name: "Pro Seller",
        passwordHash: password,
        subscriptions: {
          create: { plan: PlanTier.SELLER, status: SubscriptionStatus.ACTIVE },
        },
        alertPreference: {
          create: {
            enabled: true,
            categories: ["sneakers", "collectibles", "electronics"],
            roiThreshold: 18,
            newLeadAlerts: true,
            priorityAlerts: true,
            frequency: "INSTANT",
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@flipsignal.app" },
      update: { name: "FlipSignal Admin", role: Role.ADMIN, passwordHash: password },
      create: {
        email: "admin@flipsignal.app",
        name: "FlipSignal Admin",
        passwordHash: password,
        role: Role.ADMIN,
        subscriptions: {
          create: { plan: PlanTier.SELLER, status: SubscriptionStatus.ACTIVE },
        },
      },
    }),
  ]);

  for (const blueprint of leadBlueprints) {
    const profit = calculateProfitBreakdown({
      cost: blueprint.buyPrice,
      tax: 0,
      shippingCost: blueprint.estimatedShippingCost,
      marketplace: blueprint.marketplace,
      expectedSalePrice: blueprint.estimatedSalePrice,
    });

    await prisma.lead.upsert({
      where: {
        title_sourceStore_marketplace: {
          title: blueprint.title,
          sourceStore: blueprint.sourceStore,
          marketplace: blueprint.marketplace,
        },
      },
      update: {
        category: blueprint.category,
        imageUrl: blueprint.imageUrl,
        buyPrice: blueprint.buyPrice,
        estimatedSalePrice: blueprint.estimatedSalePrice,
        estimatedFees: profit.fees,
        estimatedShippingCost: blueprint.estimatedShippingCost,
        estimatedProfit: profit.netProfit,
        estimatedRoi: profit.roiPercent,
        sellThroughRating: blueprint.sellThroughRating,
        confidenceScore: blueprint.confidenceScore,
        premiumOnly: blueprint.premiumOnly,
        premiumEarlyAccessUntil: blueprint.premiumEarlyAccessHours
          ? new Date(Date.now() + blueprint.premiumEarlyAccessHours * 60 * 60 * 1000)
          : null,
        createdById: adminUser.id,
        createdAt: new Date(Date.now() - blueprint.createdAtOffsetHours * 60 * 60 * 1000),
      },
      create: {
        title: blueprint.title,
        sourceStore: blueprint.sourceStore,
        category: blueprint.category,
        imageUrl: blueprint.imageUrl,
        buyPrice: blueprint.buyPrice,
        estimatedSalePrice: blueprint.estimatedSalePrice,
        marketplace: blueprint.marketplace,
        estimatedFees: profit.fees,
        estimatedShippingCost: blueprint.estimatedShippingCost,
        estimatedProfit: profit.netProfit,
        estimatedRoi: profit.roiPercent,
        sellThroughRating: blueprint.sellThroughRating,
        confidenceScore: blueprint.confidenceScore,
        premiumOnly: blueprint.premiumOnly,
        premiumEarlyAccessUntil: blueprint.premiumEarlyAccessHours
          ? new Date(Date.now() + blueprint.premiumEarlyAccessHours * 60 * 60 * 1000)
          : null,
        createdById: adminUser.id,
        createdAt: new Date(Date.now() - blueprint.createdAtOffsetHours * 60 * 60 * 1000),
      },
    });
  }

  const recentLeads = await prisma.lead.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  if (recentLeads[0]) {
    await prisma.userLead.upsert({
      where: { userId_leadId: { userId: freeUser.id, leadId: recentLeads[0].id } },
      update: { status: "SAVED" },
      create: { userId: freeUser.id, leadId: recentLeads[0].id, status: "SAVED" },
    });

    await prisma.deal.upsert({
      where: { userId_leadId: { userId: freeUser.id, leadId: recentLeads[0].id } },
      update: {
        title: recentLeads[0].title,
        status: "SAVED",
        actualCost: recentLeads[0].buyPrice,
      },
      create: {
        userId: freeUser.id,
        leadId: recentLeads[0].id,
        title: recentLeads[0].title,
        status: "SAVED",
        actualCost: recentLeads[0].buyPrice,
      },
    });
  }

  if (recentLeads[1]) {
    await prisma.userLead.upsert({
      where: { userId_leadId: { userId: proUser.id, leadId: recentLeads[1].id } },
      update: { status: "BOUGHT" },
      create: { userId: proUser.id, leadId: recentLeads[1].id, status: "BOUGHT" },
    });

    await prisma.deal.upsert({
      where: { userId_leadId: { userId: proUser.id, leadId: recentLeads[1].id } },
      update: {
        title: recentLeads[1].title,
        status: "LISTED",
        actualCost: recentLeads[1].buyPrice,
        actualShippingCost: recentLeads[1].estimatedShippingCost,
        notes: "Listed cross-posted to eBay and Facebook.",
      },
      create: {
        userId: proUser.id,
        leadId: recentLeads[1].id,
        title: recentLeads[1].title,
        status: "LISTED",
        actualCost: recentLeads[1].buyPrice,
        actualShippingCost: recentLeads[1].estimatedShippingCost,
        notes: "Listed cross-posted to eBay and Facebook.",
      },
    });
  }

  if (recentLeads[2]) {
    const soldProfit =
      Number(recentLeads[2].estimatedSalePrice) -
      Number(recentLeads[2].buyPrice) -
      Number(recentLeads[2].estimatedFees) -
      Number(recentLeads[2].estimatedShippingCost);

    await prisma.deal.upsert({
      where: { userId_leadId: { userId: premiumUser.id, leadId: recentLeads[2].id } },
      update: {
        title: recentLeads[2].title,
        status: "SOLD",
        actualCost: recentLeads[2].buyPrice,
        actualSalePrice: recentLeads[2].estimatedSalePrice,
        actualShippingCost: recentLeads[2].estimatedShippingCost,
        actualFees: recentLeads[2].estimatedFees,
        actualProfit: soldProfit,
        soldAt: new Date(),
        notes: "Moved same day through private buyer list.",
      },
      create: {
        userId: premiumUser.id,
        leadId: recentLeads[2].id,
        title: recentLeads[2].title,
        status: "SOLD",
        actualCost: recentLeads[2].buyPrice,
        actualSalePrice: recentLeads[2].estimatedSalePrice,
        actualShippingCost: recentLeads[2].estimatedShippingCost,
        actualFees: recentLeads[2].estimatedFees,
        actualProfit: soldProfit,
        soldAt: new Date(),
        notes: "Moved same day through private buyer list.",
      },
    });
  }
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
