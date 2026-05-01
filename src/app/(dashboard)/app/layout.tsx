import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/lib/auth/session";
import { planContent } from "@/lib/plans";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell name={user.name ?? "FlipSignal User"} email={user.email} planLabel={planContent[user.plan].label}>
      {children}
    </AppShell>
  );
}
