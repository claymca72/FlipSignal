"use client";

import { useState, useTransition } from "react";
import { PlanTier } from "@prisma/client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { registerUserAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80, "Keep your name under 80 characters."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer."),
  plan: z.nativeEnum(PlanTier),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignupForm({ requestedPlan }: { requestedPlan: PlanTier }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      plan: requestedPlan,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await registerUserAction(values);
      setMessage(result.message);

      if (!result.success) {
        return;
      }

      await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl: values.plan === PlanTier.FREE ? "/app" : `/pricing?localUpgrade=${values.plan.toLowerCase()}`,
      });

      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" autoComplete="name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-[#b42318]">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-[#b42318]">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" autoComplete="new-password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-[#b42318]">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label>Starting access</Label>
        <input type="hidden" {...form.register("plan")} />
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm">
          <p className="font-medium">Free</p>
          <p className="mt-1 text-[var(--muted-foreground)]">
            {requestedPlan === PlanTier.FREE
              ? "New accounts start on Free so subscription gating stays real."
              : `You requested ${requestedPlan.toLowerCase()}. Create the account first, then switch plans from Pricing in local development.`}
          </p>
        </div>
      </div>
      <p className={message ? "text-sm text-[var(--muted-foreground)]" : "text-sm text-[var(--muted-foreground)]"}>
        {message || "You can upgrade from Pricing after signup. Seeded Pro and Premium accounts are also available for local testing."}
      </p>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
