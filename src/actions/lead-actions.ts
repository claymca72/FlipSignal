"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { applyLeadInteraction } from "@/domains/leads/service";
import { requireUser } from "@/lib/auth/session";

const leadIntentSchema = z.object({
  leadId: z.string().cuid(),
  intent: z.enum(["save", "skip", "buy"]),
});

export type ActionState = {
  success: boolean;
  message: string;
};

export const initialActionState: ActionState = {
  success: false,
  message: "",
};

export async function updateLeadInteractionAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = leadIntentSchema.safeParse({
    leadId: formData.get("leadId"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid lead action." };
  }

  const result = await applyLeadInteraction({
    userId: user.id,
    plan: user.plan,
    leadId: parsed.data.leadId,
    intent: parsed.data.intent,
  });

  revalidatePath("/app");
  revalidatePath("/app/leads");
  revalidatePath("/app/deals");

  return result;
}
