import "server-only";

import type { PlanTier } from "@prisma/client";

import { prisma } from "@/lib/db";
import { planContent } from "@/lib/plans";

/**
 * Returns the user's current listing-quota status for the calendar month (UTC).
 *
 * Server-only because it reads from the database. Pure plan-tier helpers that
 * need to run in client components should stay in `src/lib/plans.ts`.
 */
export async function canGenerateListing(
  userId: string,
  plan: PlanTier,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const used = await prisma.listing.count({
    where: {
      userId,
      createdAt: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });

  const limit = planContent[plan].listingLimit;
  return { allowed: used < limit, used, limit };
}
