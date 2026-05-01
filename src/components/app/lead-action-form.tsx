"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { DealStatus, LeadInteractionStatus } from "@prisma/client";

import { initialActionState, updateLeadInteractionAction } from "@/actions/lead-actions";
import { Button } from "@/components/ui/button";

function SubmitButton({ label, intent, tone = "outline" }: { label: string; intent: string; tone?: "default" | "outline" | "secondary" }) {
  const { pending } = useFormStatus();

  return (
    <Button variant={tone} size="sm" disabled={pending} name="intent" value={intent} type="submit">
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function LeadActionForm({
  leadId,
  interactionStatus,
  dealStatus,
}: {
  leadId: string;
  interactionStatus: LeadInteractionStatus | null;
  dealStatus: DealStatus | null;
}) {
  const [state, formAction] = useActionState(updateLeadInteractionAction, initialActionState);
  const lockedToDeals = dealStatus === DealStatus.LISTED || dealStatus === DealStatus.SOLD;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      {lockedToDeals ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--panel-muted)] px-4 py-3 text-sm">
          <span className="text-[var(--muted-foreground)]">
            This lead is already tracked as {dealStatus?.toLowerCase()}. Update it from Deals.
          </span>
          <Button asChild size="sm">
            <Link href="/app/deals">Open deals</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <SubmitButton label={interactionStatus === LeadInteractionStatus.SAVED ? "Saved" : "Save"} intent="save" tone="default" />
          <SubmitButton label={interactionStatus === LeadInteractionStatus.BOUGHT ? "Purchased" : "Bought"} intent="buy" />
          <SubmitButton label={interactionStatus === LeadInteractionStatus.SKIPPED ? "Skipped" : "Skip"} intent="skip" tone="secondary" />
        </div>
      )}
      {interactionStatus || dealStatus ? (
        <p className="text-xs text-[var(--muted-foreground)]">
          Current state: {dealStatus ? dealStatus.toLowerCase() : interactionStatus?.toLowerCase()}
        </p>
      ) : null}
      {state.message ? <p className="text-xs text-[var(--muted-foreground)]">{state.message}</p> : null}
    </form>
  );
}
