import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FilePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { connection } from "next/server";

async function getDashboardMetrics() {
  const supabase = await createClient();

  const [pending, highPriority, reviewedToday, aiProcessing] =
    await Promise.all([
      supabase
        .from("studies")
        .select("id", { count: "exact", head: true })
        .in("status", ["ready", "queued", "processing"]),
      supabase
        .from("ai_results")
        .select("id", { count: "exact", head: true })
        .eq("status", "success")
        .gte("priority_percentile", 90),
      supabase
        .from("studies")
        .select("id", { count: "exact", head: true })
        .eq("status", "reviewed")
        .gte("updated_at", new Date().toISOString().split("T")[0]),
      supabase
        .from("studies")
        .select("id", { count: "exact", head: true })
        .in("status", ["processing", "ai_failed"]),
    ]);

  return {
    pending: pending.count ?? 0,
    highPriority: highPriority.count ?? 0,
    reviewedToday: reviewedToday.count ?? 0,
    aiProcessing: aiProcessing.count ?? 0,
  };
}

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const metrics = await getDashboardMetrics();

  const cards = [
    {
      title: "Pending Studies",
      value: metrics.pending,
      href: "/worklist?status=ready",
    },
    {
      title: "High Priority",
      value: metrics.highPriority,
      href: "/worklist?priority=high&status=ready",
    },
    {
      title: "Reviewed Today",
      value: metrics.reviewedToday,
      href: "/worklist?status=reviewed",
    },
    {
      title: "AI Processing / Failed",
      value: metrics.aiProcessing,
      href: "/worklist?status=processing",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Operational overview of the Physis triage system.
          </p>
        </div>
        <Button asChild>
          <Link href="/studies/new">
            <FilePlus data-icon="inline-start" />
            New Study
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/worklist">Open Worklist</Link>
        </Button>
      </div>
    </div>
  );
}
