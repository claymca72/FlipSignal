import { PlanTier, SubscriptionStatus, type Subscription } from "@prisma/client";

export const planContent = {
  [PlanTier.FREE]: {
    label: "Free",
    leadLimit: 6,
    dealLimit: 10,
    filters: false,
    emailAlerts: false,
    premiumOnlyLeads: false,
    priorityAlerts: false,
  },
  [PlanTier.PRO]: {
    label: "Pro",
    leadLimit: null,
    dealLimit: null,
    filters: true,
    emailAlerts: true,
    premiumOnlyLeads: false,
    priorityAlerts: false,
  },
  [PlanTier.PREMIUM]: {
    label: "Premium",
    leadLimit: null,
    dealLimit: null,
    filters: true,
    emailAlerts: true,
    premiumOnlyLeads: true,
    priorityAlerts: true,
  },
} as const;

export function getUserPlan(subscription?: Subscription | null) {
  if (!subscription) {
    return PlanTier.FREE;
  }

  if (
    subscription.status === SubscriptionStatus.ACTIVE ||
    subscription.status === SubscriptionStatus.TRIALING
  ) {
    return subscription.plan;
  }

  return PlanTier.FREE;
}

export function canUseLeadFilters(plan: PlanTier) {
  return planContent[plan].filters;
}

export function canUseEmailAlerts(plan: PlanTier) {
  return planContent[plan].emailAlerts;
}

export function canAccessPremiumLeads(plan: PlanTier) {
  return planContent[plan].premiumOnlyLeads;
}

export function canUsePriorityAlerts(plan: PlanTier) {
  return planContent[plan].priorityAlerts;
}
