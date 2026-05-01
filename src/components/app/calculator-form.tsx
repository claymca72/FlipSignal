"use client";

import { Marketplace } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { calculateProfitBreakdown, marketplaceFeeProfiles } from "@/domains/fees/calculate";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const calculatorSchema = z.object({
  cost: z.number().min(0),
  tax: z.number().min(0),
  shippingCost: z.number().min(0),
  marketplace: z.nativeEnum(Marketplace),
  expectedSalePrice: z.number().min(1),
});

type CalculatorValues = z.infer<typeof calculatorSchema>;

export function CalculatorForm() {
  const form = useForm<CalculatorValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      cost: 80,
      tax: 6.4,
      shippingCost: 12,
      marketplace: Marketplace.EBAY,
      expectedSalePrice: 145,
    },
    mode: "onChange",
  });

  const values = useWatch({ control: form.control });
  const breakdown = calculateProfitBreakdown({
    cost: values.cost ?? 0,
    tax: values.tax ?? 0,
    shippingCost: values.shippingCost ?? 0,
    marketplace: values.marketplace ?? Marketplace.EBAY,
    expectedSalePrice: values.expectedSalePrice ?? 0,
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Profit calculator</CardTitle>
          <CardDescription>Quickly estimate fees, net profit, ROI, margin, and your break-even price.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" type="number" step="0.01" {...form.register("cost", { valueAsNumber: true })} />
              {form.formState.errors.cost ? (
                <p className="text-sm text-[#b42318]">{form.formState.errors.cost.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" type="number" step="0.01" {...form.register("tax", { valueAsNumber: true })} />
              {form.formState.errors.tax ? (
                <p className="text-sm text-[#b42318]">{form.formState.errors.tax.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shippingCost">Shipping cost</Label>
              <Input
                id="shippingCost"
                type="number"
                step="0.01"
                {...form.register("shippingCost", { valueAsNumber: true })}
              />
              {form.formState.errors.shippingCost ? (
                <p className="text-sm text-[#b42318]">{form.formState.errors.shippingCost.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expectedSalePrice">Expected sale price</Label>
              <Input
                id="expectedSalePrice"
                type="number"
                step="0.01"
                {...form.register("expectedSalePrice", { valueAsNumber: true })}
              />
              {form.formState.errors.expectedSalePrice ? (
                <p className="text-sm text-[#b42318]">{form.formState.errors.expectedSalePrice.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Select id="marketplace" {...form.register("marketplace")}>
                {marketplaceFeeProfiles.map((profile) => (
                  <option key={profile.marketplace} value={profile.marketplace}>
                    {profile.label}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-[var(--muted-foreground)]">
                {marketplaceFeeProfiles.find((profile) => profile.marketplace === values.marketplace)?.description}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projected outcome</CardTitle>
          <CardDescription>Use this before you source so you know what a winning lead really looks like.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!form.formState.isValid ? (
            <p className="text-sm text-[#b42318]">Enter valid non-negative values to see a trustworthy projection.</p>
          ) : null}
          <div className="grid gap-3 rounded-[24px] bg-[var(--panel-muted)] p-4">
            <ResultRow label="Fees" value={formatCurrency(breakdown.fees)} />
            <ResultRow label="Net profit" value={formatCurrency(breakdown.netProfit)} highlight />
            <ResultRow label="ROI" value={formatPercent(breakdown.roiPercent)} />
            <ResultRow label="Margin" value={formatPercent(breakdown.marginPercent)} />
            <ResultRow label="Break-even price" value={formatCurrency(breakdown.breakEvenPrice)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--panel)] px-4 py-3">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className={highlight ? "font-semibold text-[var(--accent)]" : "font-medium"}>{value}</span>
    </div>
  );
}
