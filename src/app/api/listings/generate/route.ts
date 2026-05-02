import { ListingCondition, SellingGoal } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { canGenerateListing } from "@/lib/listing-quota";
import {
  cannedListingOutput,
  createListingForUser,
} from "@/domains/listings/service";

const generateSchema = z.object({
  photos: z.array(z.string().url()).min(1).max(8),
  marketplace: z.literal("EBAY"),
  productName: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.nativeEnum(ListingCondition).optional(),
  accessories: z.string().optional(),
  defects: z.string().optional(),
  sellingGoal: z.nativeEnum(SellingGoal).optional(),
});

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

  const parsed = generateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    photos,
    marketplace,
    productName,
    brand,
    model,
    condition,
    accessories,
    defects,
    sellingGoal,
  } = parsed.data;

  const { allowed, used, limit } = await canGenerateListing(
    user.id,
    user.plan,
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Quota reached", used, limit },
      { status: 403 },
    );
  }

  const output = cannedListingOutput();

  const listing = await createListingForUser({
    userId: user.id,
    marketplace,
    photos,
    productName,
    brand,
    model,
    accessories,
    defects,
    condition,
    sellingGoal,
    output,
  });

  return NextResponse.json({
    id: listing.id,
    output,
    used: used + 1,
    limit,
  });
}
