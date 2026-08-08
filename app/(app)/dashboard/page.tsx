import Link from "next/link";
import { FilePlus } from "lucide-react";

import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getDashboardOverview } from "@/features/dashboard/api/get-dashboard-overview";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getInferenceHealth } from "@/lib/inference/client";
import { getSystemStatus } from "@/features/admin/api/get-system-status";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();

  const [{ data: { user } }, overview] = await Promise.all([
    supabase.auth.getUser(),
    getDashboardOverview(),
  ]);

  let lastInferenceAt: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      try {
        const status = await getSystemStatus();
        lastInferenceAt = status.lastInference.completedAt;
      } catch {
        lastInferenceAt = null;
      }
    }
  }

  const inferenceHealth = await getInferenceHealth();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
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

      <DashboardOverview
        counts={overview.counts}
        recentStudies={overview.recentStudies}
        inferenceHealth={inferenceHealth}
        lastInferenceAt={lastInferenceAt}
      />
    </div>
  );
}
