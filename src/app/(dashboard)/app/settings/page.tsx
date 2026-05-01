import Link from "next/link";

import { AlertsSettingsForm } from "@/components/app/alerts-settings-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { planContent } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <AlertsSettingsForm
        plan={user.plan}
        preference={
          user.alertPreference
            ? {
                enabled: user.alertPreference.enabled,
                categories: user.alertPreference.categories,
                roiThreshold: user.alertPreference.roiThreshold,
                frequency: user.alertPreference.frequency,
                priorityAlerts: user.alertPreference.priorityAlerts,
              }
            : null
        }
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your current FlipSignal setup.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--muted-foreground)]">Name</p>
              <p className="mt-1 font-medium">{user.name ?? "No name provided"}</p>
            </div>
            <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--muted-foreground)]">Email</p>
              <p className="mt-1 font-medium">{user.email}</p>
            </div>
            <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
              <p className="text-[var(--muted-foreground)]">Role</p>
              <p className="mt-1 font-medium">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Current access level and next unlocks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Badge className="w-fit">{planContent[user.plan].label}</Badge>
            <p className="text-[var(--muted-foreground)]">
              Filters: {planContent[user.plan].filters ? "Included" : "Upgrade to unlock"}
            </p>
            <p className="text-[var(--muted-foreground)]">
              Email alerts: {planContent[user.plan].emailAlerts ? "Included" : "Upgrade to unlock"}
            </p>
            <p className="text-[var(--muted-foreground)]">
              Premium leads: {planContent[user.plan].premiumOnlyLeads ? "Included" : "Upgrade to unlock"}
            </p>
            <Link href="/pricing" className="text-[var(--accent)]">
              Compare plans
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
