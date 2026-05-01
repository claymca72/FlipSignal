import { LeadInteractionStatus, Marketplace, PlanTier, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { canAccessPremiumLeads, canUseLeadFilters, planContent } from "@/lib/plans";
import { toNumber } from "@/lib/utils";
import { getConfidenceLabel, getSellThroughLabel } from "@/domains/leads/models/lead-scoring";

export type LeadFilters = {
  category?: string;
  marketplace?: Marketplace;
  roiMin?: number;
  roiMax?: number;
};

export function buildLeadVisibilityWhere({
  plan,
  filters,
}: {
  plan: PlanTier;
  filters?: LeadFilters;
}): Prisma.LeadWhereInput {
  const now = new Date();
  const conditions: Prisma.LeadWhereInput[] = [];

  if (!canAccessPremiumLeads(plan)) {
    conditions.push({ premiumOnly: false });
    conditions.push({
      OR: [{ premiumEarlyAccessUntil: null }, { premiumEarlyAccessUntil: { lte: now } }],
    });
  }

  if (filters && canUseLeadFilters(plan)) {
    if (filters.category) {
      conditions.push({ category: filters.category });
    }

    if (filters.marketplace) {
      conditions.push({ marketplace: filters.marketplace });
    }

    if (filters.roiMin != null || filters.roiMax != null) {
      conditions.push({
        estimatedRoi: {
          ...(filters.roiMin != null ? { gte: filters.roiMin } : {}),
          ...(filters.roiMax != null ? { lte: filters.roiMax } : {}),
        },
      });
    }
  }

  return conditions.length ? { AND: conditions } : {};
}

export async function getLeadFeedForUser({
  userId,
  plan,
  filters,
}: {
  userId: string;
  plan: PlanTier;
  filters: LeadFilters;
}) {
  const where = buildLeadVisibilityWhere({ plan, filters });

  const rawLeads = await prisma.lead.findMany({
    where,
    include: {
      userLeads: {
        where: { userId },
        take: 1,
      },
      deals: {
        where: { userId },
        take: 1,
      },
    },
    orderBy: [{ premiumOnly: "desc" }, { createdAt: "desc" }],
  });

  const leadLimit = planContent[plan].leadLimit;
  const leads = leadLimit ? rawLeads.slice(0, leadLimit) : rawLeads;

  return leads.map((lead) => ({
    id: lead.id,
    title: lead.title,
    imageUrl: lead.imageUrl,
    sourceStore: lead.sourceStore,
    category: lead.category,
    buyPrice: toNumber(lead.buyPrice),
    estimatedSalePrice: toNumber(lead.estimatedSalePrice),
    marketplace: lead.marketplace,
    estimatedFees: toNumber(lead.estimatedFees),
    estimatedShippingCost: toNumber(lead.estimatedShippingCost),
    estimatedProfit: toNumber(lead.estimatedProfit),
    estimatedRoi: toNumber(lead.estimatedRoi),
    sellThroughRating: lead.sellThroughRating,
    sellThroughLabel: getSellThroughLabel(lead.sellThroughRating),
    confidenceScore: lead.confidenceScore,
    confidenceLabel: getConfidenceLabel(lead.confidenceScore),
    createdAt: lead.createdAt,
    premiumOnly: lead.premiumOnly,
    premiumEarlyAccessUntil: lead.premiumEarlyAccessUntil,
    interactionStatus: lead.userLeads[0]?.status ?? null,
    dealStatus: lead.deals[0]?.status ?? null,
  }));
}

export async function getLeadFeedStats(userId: string) {
  const [saved, skipped, bought] = await Promise.all([
    prisma.userLead.count({ where: { userId, status: LeadInteractionStatus.SAVED } }),
    prisma.userLead.count({ where: { userId, status: LeadInteractionStatus.SKIPPED } }),
    prisma.userLead.count({ where: { userId, status: LeadInteractionStatus.BOUGHT } }),
  ]);

  return { saved, skipped, bought };
}

type LeadInteractionIntent = "save" | "skip" | "buy";

export async function applyLeadInteraction({
  userId,
  plan,
  leadId,
  intent,
}: {
  userId: string;
  plan: PlanTier;
  leadId: string;
  intent: LeadInteractionIntent;
}) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    return { success: false, message: "Lead not found." };
  }

  const visibleLead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      ...buildLeadVisibilityWhere({ plan }),
    },
  });

  if (!visibleLead) {
    return { success: false, message: "This lead is not available on your current plan." };
  }

  const existingDeal = await prisma.deal.findUnique({
    where: { userId_leadId: { userId, leadId } },
  });

  if (existingDeal && [existingDeal.status === "LISTED", existingDeal.status === "SOLD"].some(Boolean)) {
    return {
      success: false,
      message: "This lead is already in your active deal workflow. Update it from Deals.",
    };
  }

  if (intent === "skip") {
    await prisma.userLead.upsert({
      where: { userId_leadId: { userId, leadId } },
      update: { status: LeadInteractionStatus.SKIPPED },
      create: {
        userId,
        leadId,
        status: LeadInteractionStatus.SKIPPED,
      },
    });

    await prisma.deal.deleteMany({
      where: { userId, leadId },
    });

    return { success: true, message: "Lead skipped." };
  }

  if (!existingDeal) {
    const currentDealCount = await prisma.deal.count({
      where: { userId },
    });

    if (planContent[plan].dealLimit != null && currentDealCount >= planContent[plan].dealLimit) {
      return {
        success: false,
        message: "Free plan limit reached. Upgrade to save more than 10 deals.",
      };
    }
  }

  const interactionStatus = intent === "buy" ? LeadInteractionStatus.BOUGHT : LeadInteractionStatus.SAVED;
  const dealStatus = intent === "buy" ? "PURCHASED" : "SAVED";

  await prisma.userLead.upsert({
    where: { userId_leadId: { userId, leadId } },
    update: { status: interactionStatus },
    create: {
      userId,
      leadId,
      status: interactionStatus,
    },
  });

  await prisma.deal.upsert({
    where: { userId_leadId: { userId, leadId } },
    update: {
      title: lead.title,
      status: dealStatus,
      actualCost: intent === "buy" ? lead.buyPrice : existingDeal?.actualCost ?? null,
    },
    create: {
      userId,
      leadId,
      title: lead.title,
      status: dealStatus,
      actualCost: intent === "buy" ? lead.buyPrice : null,
    },
  });

  return {
    success: true,
    message: intent === "buy" ? "Lead moved to purchased." : "Lead saved to your workflow.",
  };
}
