import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { signPutUrl } from "@/lib/storage/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  contentLength: z.number().int().positive().max(MAX_FILE_SIZE),
});

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateKey(userId: string, filename: string): string {
  const randomId = crypto.randomUUID().replace(/-/g, "");
  const sanitized = sanitizeFilename(filename);
  return `listings/${userId}/${randomId}-${sanitized}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { filename, contentType, contentLength } = parsed.data;

  const key = generateKey(user.id, filename);

  const result = await signPutUrl({ key, contentType, contentLength });

  if (!result) {
    return NextResponse.json(
      { error: "Image storage not configured" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    uploadUrl: result.uploadUrl,
    publicUrl: result.publicUrl,
    key,
  });
}
