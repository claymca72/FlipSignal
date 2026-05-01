import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "muted";
}) {
  const toneClasses = {
    default: "bg-[var(--panel-muted)] text-[var(--foreground)]",
    success: "bg-[#dcfce7] text-[#166534] dark:bg-[#0c3b2a] dark:text-[#91e6b3]",
    warning: "bg-[#fff7d6] text-[#92400e] dark:bg-[#3e2f0f] dark:text-[#f7c873]",
    muted: "bg-transparent text-[var(--muted-foreground)] ring-1 ring-inset ring-[var(--border)]",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
