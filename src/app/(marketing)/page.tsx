import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, BellRing, Calculator, LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

const leadPreview = [
  { title: "Nike Dunk Low Retro Panda", category: "Sneakers", profit: 28.4, roi: 34.1 },
  { title: "Sony WH-1000XM5 Headphones", category: "Electronics", profit: 36.8, roi: 15.4 },
  { title: "Pokemon 151 ETB", category: "Collectibles", profit: 12.7, roi: 24.3 },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-4 pb-16 pt-4 lg:px-6 lg:pb-24 lg:pt-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center">
        <div className="space-y-6">
          <Badge className="bg-[var(--panel)] text-[var(--accent)] ring-1 ring-[var(--border)]">
            Built for real resellers
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Find profitable products to flip, before everyone else.
            </h1>
            <p className="max-w-2xl text-lg text-[var(--muted-foreground)]">
              Get real resale leads, instant profit calculations, and a simple system to track what actually makes you money.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup" className="inline-flex items-center gap-2">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <div className="grid gap-3 text-sm text-[var(--muted-foreground)] sm:grid-cols-3">
            <p>Curated lead feed with ROI context</p>
            <p>Modular fee engine for resale marketplaces</p>
            <p>Deal tracking from sourced to sold</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(28,161,144,0.16),transparent)]">
            <CardTitle>Tonight&apos;s best flips</CardTitle>
            <CardDescription>Clean signal. No fake dashboards. Just opportunities with the numbers that matter.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5">
            {leadPreview.map((lead) => (
              <div key={lead.title} className="rounded-[24px] border border-[var(--border)] bg-[var(--panel-muted)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{lead.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{lead.category}</p>
                  </div>
                  <Badge tone="success">{formatPercent(lead.roi)}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Projected profit</span>
                  <span className="font-medium">{formatCurrency(lead.profit)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon={<LayoutDashboard className="h-5 w-5" />}
          title="Lead feed"
          description="See curated leads with buy price, sale comps, fees, shipping, ROI, and confidence in one place."
        />
        <FeatureCard
          icon={<Calculator className="h-5 w-5" />}
          title="Profit calculator"
          description="Use marketplace presets for eBay, StockX, GOAT, and Facebook Marketplace before you source."
        />
        <FeatureCard
          icon={<BellRing className="h-5 w-5" />}
          title="Deal workflow"
          description="Move saved deals through purchased, listed, and sold without juggling spreadsheets."
        />
      </section>

      <section className="grid gap-4 rounded-[36px] border border-[var(--border)] bg-[var(--panel)] p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Subscription-ready foundation</p>
          <h2 className="text-3xl font-semibold">Free for calculators. Pro for the full workflow. Premium for the first look.</h2>
          <p className="max-w-2xl text-[var(--muted-foreground)]">
            Plan gating is real from day one, so you can expand billing, premium lead drops, and alerts without rewriting the app later.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/pricing" className="inline-flex items-center gap-2">
            Compare plans
            <BadgeDollarSign className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
