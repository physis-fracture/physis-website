import Link from "next/link";
import { FilePlus } from "lucide-react";
import { Suspense } from "react";

import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getDashboardOverview } from "@/features/dashboard/api/get-dashboard-overview";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import {
  SystemStatusCard,
  SystemStatusCardSkeleton,
} from "@/features/dashboard/components/system-status-card";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const supabase = await createClient();

  const [{ data: { user } }, overview] = await Promise.all([
    supabase.auth.getUser(),
    getDashboardOverview(),
  ]);

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

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
      >
        <Suspense fallback={<SystemStatusCardSkeleton />}>
          <SystemStatusCard isAdmin={isAdmin} />
        </Suspense>
      </DashboardOverview>
    </div>
  );
}
