"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Zod schema — enum values mirror schema.prisma exactly
// ---------------------------------------------------------------------------

const listingConditionSchema = z.enum([
  "NEW",
  "LIKE_NEW",
  "USED_EXCELLENT",
  "USED_GOOD",
  "USED_FAIR",
  "FOR_PARTS",
]);

const sellingGoalSchema = z.enum(["SELL_ASAP", "BALANCED", "MAX_PROFIT"]);

const productDetailsSchema = z.object({
  productName: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: listingConditionSchema.optional(),
  accessories: z.string().optional(),
  defects: z.string().optional(),
  sellingGoal: sellingGoalSchema.optional(),
});

export type ProductDetailsFormValues = z.infer<typeof productDetailsSchema>;
type ConditionValue = z.infer<typeof listingConditionSchema>;
type SellingGoalValue = z.infer<typeof sellingGoalSchema>;

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const conditionOptions: { value: ConditionValue; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "USED_EXCELLENT", label: "Used – Excellent" },
  { value: "USED_GOOD", label: "Used – Good" },
  { value: "USED_FAIR", label: "Used – Fair" },
  { value: "FOR_PARTS", label: "For Parts / Not Working" },
];

const sellingGoalOptions: { value: SellingGoalValue; label: string; description: string }[] = [
  { value: "SELL_ASAP", label: "Sell ASAP", description: "Quick sale, competitive price" },
  { value: "BALANCED", label: "Balanced", description: "Good price, reasonable speed" },
  { value: "MAX_PROFIT", label: "Max Profit", description: "Top dollar, slower turnaround" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductDetailsFormProps {
  value: ProductDetailsFormValues;
  onChange: (value: ProductDetailsFormValues) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductDetailsForm({ value, onChange }: ProductDetailsFormProps) {
  const form = useForm<ProductDetailsFormValues>({
    resolver: zodResolver(productDetailsSchema),
    values: value,
    defaultValues: {
      sellingGoal: "BALANCED",
    },
  });

  // Propagate every field change to parent immediately.
  useEffect(() => {
    const subscription = form.watch((formValues) => {
      // Trim empty strings to undefined so optional fields stay clean.
      const cleaned: ProductDetailsFormValues = {
        productName: formValues.productName?.trim() || undefined,
        brand: formValues.brand?.trim() || undefined,
        model: formValues.model?.trim() || undefined,
        condition: formValues.condition || undefined,
        accessories: formValues.accessories?.trim() || undefined,
        defects: formValues.defects?.trim() || undefined,
        sellingGoal: formValues.sellingGoal || undefined,
      };
      onChange(cleaned);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  return (
    <div className="grid gap-6">
      {/* Two-column field grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="grid gap-4">
          {/* Product name */}
          <div className="grid gap-2">
            <Label htmlFor="productName">Product name</Label>
            <Input
              id="productName"
              placeholder="e.g. Sony WH-1000XM5"
              {...form.register("productName")}
            />
          </div>

          {/* Brand */}
          <div className="grid gap-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              placeholder="e.g. Sony"
              {...form.register("brand")}
            />
          </div>

          {/* Model */}
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="e.g. WH-1000XM5"
              {...form.register("model")}
            />
          </div>

          {/* Condition */}
          <div className="grid gap-2">
            <Label htmlFor="condition">Condition</Label>
            <Controller
              control={form.control}
              name="condition"
              render={({ field }) => (
                <Select
                  id="condition"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : (e.target.value as ConditionValue),
                    )
                  }
                >
                  <option value="">Select a condition…</option>
                  {conditionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="grid gap-4">
          {/* Accessories */}
          <div className="grid gap-2">
            <Label htmlFor="accessories">Accessories included</Label>
            <Textarea
              id="accessories"
              placeholder="Original box, charging cable, manual…"
              {...form.register("accessories")}
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              What&apos;s included? Cables, original box, manual…
            </p>
          </div>

          {/* Defects */}
          <div className="grid gap-2">
            <Label htmlFor="defects">Known defects</Label>
            <Textarea
              id="defects"
              placeholder="Minor scratch on left ear cup…"
              {...form.register("defects")}
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Anything wrong? Scratches, missing parts, scuffs…
            </p>
          </div>
        </div>
      </div>

      {/* Selling goal — full-width pill radio group */}
      <div className="grid gap-3">
        <Label>Selling goal</Label>
        <Controller
          control={form.control}
          name="sellingGoal"
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              {sellingGoalOptions.map((opt) => {
                const checked = field.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-2xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_40%,transparent)]",
                      checked
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:border-[var(--accent)]/50",
                    )}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={cn(
                        "text-xs font-normal",
                        checked ? "text-[var(--accent)]/70" : "text-[var(--muted-foreground)]",
                      )}
                    >
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>
    </div>
  );
}
