import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return `${amount.toFixed(1)}%`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  return format(new Date(value), "MMM d, yyyy");
}

export function toNumber(value: unknown) {
  if (value == null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  if (typeof value === "object" && "toNumber" in (value as Record<string, unknown>)) {
    return Number((value as { toNumber(): number }).toNumber());
  }

  return Number(value);
}
