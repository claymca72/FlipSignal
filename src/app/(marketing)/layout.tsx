import type { ReactNode } from "react";
import Link from "next/link";
import { Radar } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-5 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--accent)]/12 p-3 text-[var(--accent)]">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">FlipSignal</p>
            <p className="text-sm text-[var(--muted-foreground)]">Reseller intelligence</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-3 md:flex">
          <Link href="/pricing" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Pricing
          </Link>
          <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Start Free</Link>
          </Button>
        </nav>
      </header>
      {children}
    </div>
  );
}
