"use client";

import { useActionState } from "react";
import { AlertFrequency, type PlanTier } from "@prisma/client";

import { saveAlertPreferenceAction } from "@/actions/settings-actions";
import { categoryOptions } from "@/lib/constants";
import { canUseEmailAlerts, canUsePriorityAlerts } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState = {
  success: false,
  message: "",
};

export function AlertsSettingsForm({
  plan,
  preference,
}: {
  plan: PlanTier;
  preference: {
    enabled: boolean;
    categories: string[];
    roiThreshold: number | null;
    frequency: AlertFrequency;
    priorityAlerts: boolean;
  } | null;
}) {
  const [state, formAction] = useActionState(saveAlertPreferenceAction, initialState);
  const alertsEnabled = canUseEmailAlerts(plan);
  const priorityEnabled = canUsePriorityAlerts(plan);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email alerts</CardTitle>
        <CardDescription>
          Choose categories and ROI thresholds for the lead alerts you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="enabled" defaultChecked={preference?.enabled} disabled={!alertsEnabled} />
            Enable lead alerts
          </label>

          <div className="grid gap-3">
            <p className="text-sm font-medium">Categories</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {categoryOptions.map((category) => (
                <label key={category} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    name="categories"
                    value={category}
                    defaultChecked={preference?.categories.includes(category)}
                    disabled={!alertsEnabled}
                  />
                  <span className="capitalize">{category}</span>
                </label>
              ))}
            </div>
            {!alertsEnabled ? null : (
              <p className="text-sm text-[var(--muted-foreground)]">
                Pick at least one category when alerts are enabled.
              </p>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              ROI threshold
              <Input
                name="roiThreshold"
                type="number"
                min="0"
                max="300"
                defaultValue={preference?.roiThreshold ?? ""}
                disabled={!alertsEnabled}
                placeholder="25"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Delivery cadence
              <select
                name="frequency"
                defaultValue={preference?.frequency ?? AlertFrequency.DAILY}
                disabled={!alertsEnabled}
                className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 text-sm outline-none"
              >
                <option value={AlertFrequency.DAILY}>Daily digest</option>
                <option value={AlertFrequency.INSTANT}>As leads match</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="priorityAlerts"
              defaultChecked={preference?.priorityAlerts}
              disabled={!alertsEnabled || !priorityEnabled}
            />
            Premium priority alerts
          </label>

          {!alertsEnabled ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Email alerts unlock on Pro and above. Your saved preferences will be ready when you upgrade.
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className={state.message ? (state.success ? "text-sm text-[var(--muted-foreground)]" : "text-sm text-[#b42318]") : "text-sm text-[var(--muted-foreground)]"}>
              {state.message}
            </p>
            <Button type="submit">Save preferences</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
