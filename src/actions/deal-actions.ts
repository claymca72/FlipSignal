"use server";

import { DealStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateDealForUser } from "@/domains/deals/service";
import { requireUser } from "@/lib/auth/session";

const optionalCurrency = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value == null || value === "") {
      return null;
    }

    const amount = Number(value);
    return Number.isNaN(amount) ? null : amount;
  });

const dealUpdateSchema = z.object({
  dealId: z.string().cuid(),
  status: z.nativeEnum(DealStatus),
  actualCost: optionalCurrency,
  actualSalePrice: optionalCurrency,
  actualShippingCost: optionalCurrency,
  actualFees: optionalCurrency,
  notes: z.string().max(500, "Keep notes under 500 characters.").optional(),
}).superRefine((value, ctx) => {
  const requiresActualCost =
    value.status === DealStatus.PURCHASED ||
    value.status === DealStatus.LISTED ||
    value.status === DealStatus.SOLD;

  if (requiresActualCost && value.actualCost == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Actual cost is required once a deal has been purchased.",
      path: ["actualCost"],
    });
  }

  if (value.status === DealStatus.SOLD && value.actualSalePrice == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Actual sale price is required before marking a deal as sold.",
      path: ["actualSalePrice"],
    });
  }
});

export type DealActionState = {
  success: boolean;
  message: string;
};

export const initialDealActionState: DealActionState = {
  success: false,
  message: "",
};

export async function updateDealAction(
  _: DealActionState,
  formData: FormData,
): Promise<DealActionState> {
  const user = await requireUser();
  const parsed = dealUpdateSchema.safeParse({
    dealId: formData.get("dealId"),
    status: formData.get("status"),
    actualCost: formData.get("actualCost"),
    actualSalePrice: formData.get("actualSalePrice"),
    actualShippingCost: formData.get("actualShippingCost"),
    actualFees: formData.get("actualFees"),
    notes: formData.get("notes")?.toString(),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Unable to update deal.",
    };
  }

  const updated = await updateDealForUser({
    userId: user.id,
    dealId: parsed.data.dealId,
    status: parsed.data.status,
    actualCost: parsed.data.actualCost,
    actualSalePrice: parsed.data.actualSalePrice,
    actualShippingCost: parsed.data.actualShippingCost,
    actualFees: parsed.data.actualFees,
    notes: parsed.data.notes,
  });

  if (!updated) {
    return {
      success: false,
      message: "Deal not found or you do not have access to update it.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/deals");

  return {
    success: true,
    message: `Deal updated to ${parsed.data.status.toLowerCase()}.`,
  };
}
