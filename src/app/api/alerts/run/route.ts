import { type NextRequest, NextResponse } from "next/server";

import { runLeadAlerts } from "@/domains/alerts/service";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.replace("Bearer ", "");

  if (!env.ALERTS_CRON_SECRET || bearer !== env.ALERTS_CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runLeadAlerts();
  return NextResponse.json(result);
}
