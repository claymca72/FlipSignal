"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Radar, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

import { dashboardNavigation } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppShell({
  children,
  name,
  email,
  planLabel,
}: {
  children: ReactNode;
  name: string;
  email: string;
  planLabel: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="flex w-full flex-col gap-5 rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5 lg:w-[280px]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--accent)]/12 p-3 text-[var(--accent)]">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">FlipSignal</p>
              <p className="text-sm text-[var(--muted-foreground)]">Reseller intelligence</p>
            </div>
          </div>

          <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{email}</p>
              </div>
              <Badge>{planLabel}</Badge>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {dashboardNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-2">
            <Link
              href="/app/settings"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-[var(--muted-foreground)] hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)]"
            >
              <Settings className="h-4 w-4" />
              Account settings
            </Link>
            <Button variant="outline" className="justify-start rounded-2xl" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
