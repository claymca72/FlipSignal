"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarketplaceSelectorProps {
  value: "EBAY";
  onChange: (value: "EBAY") => void;
}

const marketplaces = [
  { id: "EBAY", label: "eBay", enabled: true },
  { id: "MERCARI", label: "Mercari", enabled: false },
  { id: "POSHMARK", label: "Poshmark", enabled: false },
  { id: "DEPOP", label: "Depop", enabled: false },
] as const;

export function MarketplaceSelector({ value, onChange }: MarketplaceSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {marketplaces.map((marketplace) => (
        <button
          key={marketplace.id}
          onClick={() => {
            if (marketplace.enabled) {
              onChange(marketplace.id as "EBAY");
            }
          }}
          disabled={!marketplace.enabled}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
            marketplace.enabled
              ? value === marketplace.id
                ? "bg-[var(--accent)] text-white shadow-sm hover:shadow-md"
                : "bg-[var(--panel)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)]/50"
              : "bg-[var(--panel-muted)] text-[var(--muted-foreground)] cursor-not-allowed",
          )}
        >
          {marketplace.label}
          {!marketplace.enabled && (
            <span className="text-xs font-normal text-[var(--muted-foreground)]">
              Coming soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
