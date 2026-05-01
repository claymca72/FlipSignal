import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1200px] items-center px-4 py-12 lg:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Welcome back</p>
          <h1 className="text-4xl font-semibold tracking-tight">Log in to review new leads, profits, and your current deal pipeline.</h1>
          <p className="max-w-xl text-[var(--muted-foreground)]">
            For local development, use the seeded demo credentials: <strong>demo@flipsignal.app</strong> / <strong>demo1234</strong>.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Access the dashboard, calculator, and saved deal workflow.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <LoginForm />
            <p className="text-sm text-[var(--muted-foreground)]">
              New here? <Link href="/signup" className="text-[var(--accent)]">Create an account</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
