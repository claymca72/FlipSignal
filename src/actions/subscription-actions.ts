"use server";

import { PlanTier } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const localPlanSwitchSchema = z.object({
  plan: z.nativeEnum(PlanTier),
});

export async function switchLocalPlanAction(formData: FormData) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const user = await requireUser();
  const parsed = localPlanSwitchSchema.safeParse({
    plan: formData.get("plan"),
  });

  if (!parsed.success) {
    return;
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan: parsed.data.plan,
        status: "ACTIVE",
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: parsed.data.plan,
        status: "ACTIVE",
      },
    });
  }

  revalidatePath("/pricing");
  revalidatePath("/app");
  revalidatePath("/app/leads");
  revalidatePath("/app/settings");
}
