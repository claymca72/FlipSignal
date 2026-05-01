"use server";

import { PlanTier } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80, "Keep your name under 80 characters."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Use 72 characters or fewer."),
  plan: z.nativeEnum(PlanTier).default(PlanTier.FREE),
});

export async function registerUserAction(input: z.input<typeof signUpSchema>) {
  const parsed = signUpSchema.safeParse({
    ...input,
    email: input.email?.toLowerCase(),
    plan: input.plan ?? PlanTier.FREE,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Unable to create your account.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with that email already exists.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const requestedPlan = parsed.data.plan;

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      subscriptions: {
        create: {
          plan: PlanTier.FREE,
          status: "ACTIVE",
        },
      },
      alertPreference: {
        create: {
          enabled: false,
          categories: [],
        },
      },
    },
  });

  return {
    success: true,
    message:
      requestedPlan === PlanTier.FREE
        ? "Account created successfully."
        : "Account created on Free. Use Pricing to switch plans locally or upgrade when billing is configured.",
  };
}
