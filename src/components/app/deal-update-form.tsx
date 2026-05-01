"use client";

import { useActionState } from "react";
import { type DealStatus } from "@prisma/client";

import { initialDealActionState, updateDealAction } from "@/actions/deal-actions";
import { dealStatusOptions } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type DealRow = {
  id: string;
  title: string;
  status: DealStatus;
  actualCost: number | null;
  actualSalePrice: number | null;
  actualShippingCost: number | null;
  actualFees: number | null;
  actualProfit: number | null;
  notes: string;
};

export function DealUpdateForm({ deal }: { deal: DealRow }) {
  const [state, formAction] = useActionState(updateDealAction, initialDealActionState);

  return (
    <form action={formAction} className="grid gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-4">
      <input type="hidden" name="dealId" value={deal.id} />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{deal.title}</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Profit {deal.actualProfit == null ? "updates once sale data is entered." : `$${deal.actualProfit.toFixed(2)}`}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <Select name="status" defaultValue={deal.status}>
          {dealStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input name="actualCost" type="number" step="0.01" min="0" defaultValue={deal.actualCost ?? ""} placeholder="Cost" />
        <Input
          name="actualSalePrice"
          type="number"
          step="0.01"
          min="0"
          defaultValue={deal.actualSalePrice ?? ""}
          placeholder="Sale price"
        />
        <Input
          name="actualShippingCost"
          type="number"
          step="0.01"
          min="0"
          defaultValue={deal.actualShippingCost ?? ""}
          placeholder="Shipping"
        />
        <Input name="actualFees" type="number" step="0.01" min="0" defaultValue={deal.actualFees ?? ""} placeholder="Fees" />
      </div>

      <Textarea name="notes" defaultValue={deal.notes} placeholder="Notes on sourcing, listing, or the sale." />
      <div className="flex items-center justify-between gap-3">
        <p className={state.message ? (state.success ? "text-sm text-[var(--muted-foreground)]" : "text-sm text-[#b42318]") : "text-sm text-transparent"}>
          {state.message || "Ready"}
        </p>
        <Button type="submit">Update deal</Button>
      </div>
    </form>
  );
}
