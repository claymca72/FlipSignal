"use server";

import { AlertFrequency } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { upsertAlertPreference } from "@/domains/alerts/service";
import { requireUser } from "@/lib/auth/session";

const settingsSchema = z.object({
  enabled: z.boolean(),
  categories: z.array(z.string()).default([]),
  roiThreshold: z
    .union([z.string(), z.undefined(), z.null()])
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value == null || (!Number.isNaN(value) && value >= 0 && value <= 300), {
      message: "ROI threshold must be between 0 and 300.",
    }),
  frequency: z.nativeEnum(AlertFrequency),
  priorityAlerts: z.boolean(),
}).superRefine((value, ctx) => {
  if (value.enabled && value.categories.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pick at least one category when alerts are enabled.",
      path: ["categories"],
    });
  }
});

export async function saveAlertPreferenceAction(_: { success: boolean; message: string }, formData: FormData) {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    categories: formData.getAll("categories").map(String),
    roiThreshold: formData.get("roiThreshold")?.toString(),
    frequency: formData.get("frequency"),
    priorityAlerts: formData.get("priorityAlerts") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Unable to save alert preferences.",
    };
  }

  await upsertAlertPreference({
    userId: user.id,
    plan: user.plan,
    enabled: parsed.data.enabled,
    categories: parsed.data.categories,
    roiThreshold: parsed.data.roiThreshold,
    frequency: parsed.data.frequency,
    priorityAlerts: parsed.data.priorityAlerts,
  });

  revalidatePath("/app/settings");
  revalidatePath("/app/alerts");

  return { success: true, message: "Alert preferences saved." };
}
