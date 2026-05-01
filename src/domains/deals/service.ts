import { DealStatus, type PlanTier } from "@prisma/client";

import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/utils";

export function calculateActualProfit({
  actualCost,
  actualSalePrice,
  actualShippingCost,
  actualFees,
}: {
  actualCost?: number | null;
  actualSalePrice?: number | null;
  actualShippingCost?: number | null;
  actualFees?: number | null;
}) {
  if (actualSalePrice == null) {
    return null;
  }

  return Number(
    (
      actualSalePrice -
      (actualCost ?? 0) -
      (actualShippingCost ?? 0) -
      (actualFees ?? 0)
    ).toFixed(2),
  );
}

export async function getDealsForUser(userId: string) {
  const deals = await prisma.deal.findMany({
    where: { userId },
    include: { lead: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  const statusOrder = {
    [DealStatus.SAVED]: 0,
    [DealStatus.PURCHASED]: 1,
    [DealStatus.LISTED]: 2,
    [DealStatus.SOLD]: 3,
  } as const;

  return deals
    .map((deal) => ({
      id: deal.id,
      leadId: deal.leadId,
      title: deal.title,
      status: deal.status,
      actualCost: deal.actualCost ? toNumber(deal.actualCost) : null,
      actualSalePrice: deal.actualSalePrice ? toNumber(deal.actualSalePrice) : null,
      actualShippingCost: deal.actualShippingCost ? toNumber(deal.actualShippingCost) : null,
      actualFees: deal.actualFees ? toNumber(deal.actualFees) : null,
      actualProfit: deal.actualProfit ? toNumber(deal.actualProfit) : null,
      notes: deal.notes ?? "",
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
      soldAt: deal.soldAt,
      estimatedRoi: deal.lead ? toNumber(deal.lead.estimatedRoi) : null,
    }))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

export async function getDashboardSnapshot(userId: string, plan: PlanTier) {
  const { buildLeadVisibilityWhere } = await import("@/domains/leads/service");
  const [openDeals, soldDeals, visibleLeads] = await Promise.all([
    prisma.deal.count({
      where: {
        userId,
        status: {
          in: [DealStatus.SAVED, DealStatus.PURCHASED, DealStatus.LISTED],
        },
      },
    }),
    prisma.deal.aggregate({
      where: { userId, status: DealStatus.SOLD },
      _sum: { actualProfit: true },
      _count: true,
    }),
    prisma.lead.findMany({
      where: buildLeadVisibilityWhere({ plan }),
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    openDeals,
    soldDealCount: soldDeals._count,
    soldProfit: soldDeals._sum.actualProfit ? toNumber(soldDeals._sum.actualProfit) : 0,
    newestLeads: visibleLeads.map((lead) => ({
      id: lead.id,
      title: lead.title,
      category: lead.category,
      marketplace: lead.marketplace,
      estimatedProfit: toNumber(lead.estimatedProfit),
      estimatedRoi: toNumber(lead.estimatedRoi),
    })),
  };
}

export async function updateDealForUser({
  userId,
  dealId,
  status,
  actualCost,
  actualSalePrice,
  actualShippingCost,
  actualFees,
  notes,
}: {
  userId: string;
  dealId: string;
  status: DealStatus;
  actualCost?: number | null;
  actualSalePrice?: number | null;
  actualShippingCost?: number | null;
  actualFees?: number | null;
  notes?: string;
}) {
  const actualProfit = calculateActualProfit({
    actualCost,
    actualSalePrice,
    actualShippingCost,
    actualFees,
  });

  const updated = await prisma.deal.updateMany({
    where: {
      id: dealId,
      userId,
    },
    data: {
      status,
      actualCost,
      actualSalePrice,
      actualShippingCost,
      actualFees,
      actualProfit,
      notes,
      soldAt: status === DealStatus.SOLD ? new Date() : null,
    },
  });

  return updated.count > 0;
}
