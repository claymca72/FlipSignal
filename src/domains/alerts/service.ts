import { AlertFrequency, type PlanTier } from "@prisma/client";
import { Resend } from "resend";

import { canUseEmailAlerts, canUsePriorityAlerts } from "@/lib/plans";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { formatCurrency, formatPercent, toNumber } from "@/lib/utils";

export async function getAlertPreference(userId: string) {
  return prisma.alertPreference.findUnique({
    where: { userId },
  });
}

export async function upsertAlertPreference({
  userId,
  plan,
  enabled,
  categories,
  roiThreshold,
  frequency,
  priorityAlerts,
}: {
  userId: string;
  plan: PlanTier;
  enabled: boolean;
  categories: string[];
  roiThreshold?: number;
  frequency: AlertFrequency;
  priorityAlerts: boolean;
}) {
  if (!canUseEmailAlerts(plan)) {
    return prisma.alertPreference.upsert({
      where: { userId },
      update: {
        enabled: false,
        categories,
        roiThreshold,
        newLeadAlerts: false,
        priorityAlerts: false,
        frequency: AlertFrequency.DAILY,
      },
      create: {
        userId,
        enabled: false,
        categories,
        roiThreshold,
        newLeadAlerts: false,
        priorityAlerts: false,
        frequency: AlertFrequency.DAILY,
      },
    });
  }

  return prisma.alertPreference.upsert({
    where: { userId },
    update: {
      enabled,
      categories,
      roiThreshold,
      newLeadAlerts: enabled,
      priorityAlerts: canUsePriorityAlerts(plan) ? priorityAlerts : false,
      frequency,
    },
    create: {
      userId,
      enabled,
      categories,
      roiThreshold,
      newLeadAlerts: enabled,
      priorityAlerts: canUsePriorityAlerts(plan) ? priorityAlerts : false,
      frequency,
    },
  });
}

export async function runLeadAlerts() {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return { sent: 0, skipped: true, reason: "Resend is not configured." };
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const preferences = await prisma.alertPreference.findMany({
    where: {
      enabled: true,
      user: {
        subscriptions: {
          some: {
            status: "ACTIVE",
            plan: { in: ["STARTER", "SELLER", "POWER_SELLER"] },
          },
        },
      },
    },
    include: {
      user: {
        include: {
          subscriptions: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  let sent = 0;

  for (const preference of preferences) {
    const since = preference.lastAlertSentAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
    const subscription = preference.user.subscriptions[0];
    const plan = subscription?.plan ?? "FREE";

    const leads = await prisma.lead.findMany({
      where: {
        createdAt: { gt: since },
        category: preference.categories.length ? { in: preference.categories } : undefined,
        estimatedRoi: preference.roiThreshold ? { gte: preference.roiThreshold } : undefined,
        premiumOnly: plan === "SELLER" || plan === "POWER_SELLER" ? undefined : false,
      },
      orderBy: { createdAt: "desc" },
      take: preference.priorityAlerts ? 8 : 5,
    });

    if (!leads.length) {
      continue;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; padding: 24px;">
        <h1 style="font-size: 20px; margin-bottom: 12px;">New FlipSignal leads</h1>
        <p style="margin-bottom: 16px;">${leads.length} fresh opportunities matched your alert rules.</p>
        <ul style="padding-left: 18px;">
          ${leads
            .map(
              (lead) =>
                `<li style="margin-bottom: 12px;"><strong>${lead.title}</strong><br />${lead.category} on ${lead.marketplace}<br />Profit ${formatCurrency(
                  toNumber(lead.estimatedProfit),
                )} | ROI ${formatPercent(toNumber(lead.estimatedRoi))}</li>`,
            )
            .join("")}
        </ul>
      </div>
    `;

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: preference.user.email,
      subject: `FlipSignal: ${leads.length} new ${preference.categories.join(", ") || "resale"} leads`,
      html,
    });

    await prisma.alertPreference.update({
      where: { id: preference.id },
      data: { lastAlertSentAt: new Date() },
    });

    sent += 1;
  }

  return { sent, skipped: false };
}
