import { AlertsSettingsForm } from "@/components/app/alerts-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>Alert runner</CardTitle>
          <CardDescription>Ready for cron once you configure Resend and a shared secret.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--muted-foreground)]">
          <p>Trigger `POST /api/alerts/run` with `Authorization: Bearer $ALERTS_CRON_SECRET`.</p>
          <p>The endpoint checks user alert rules, finds matching leads added since the last run, and sends a compact email digest.</p>
          <p>Premium users can keep priority alerts enabled for tighter lead batches.</p>
        </CardContent>
      </Card>
    </div>
  );
}
