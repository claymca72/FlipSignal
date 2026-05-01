import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_STARTER_PRICE_ID: z.string().optional(),
  STRIPE_SELLER_PRICE_ID: z.string().optional(),
  STRIPE_POWER_PRICE_ID: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  ALERTS_CRON_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
