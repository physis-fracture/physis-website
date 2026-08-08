import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { InferenceHealthStatus } from "@/lib/inference/client";
import {
  PENDING_STATUSES,
  type DashboardCounts,
} from "@/features/dashboard/api/get-dashboard-overview";
import type { WorklistRow } from "@/features/worklist/types";
import { formatRelativeTime } from "@/features/worklist/utils/relative-time";
import { RecentStudiesTable } from "./recent-studies-table";

const pendingQuery = PENDING_STATUSES.join(",");

const kpiCards: { key: keyof DashboardCounts; title: string; href: string }[] = [
  {
    key: "pendingCount",
    title: "Pending Studies",
    href: `/worklist?status=${pendingQuery}`,
  },
  {
    key: "highPriorityCount",
    title: "High Priority",
    href: "/worklist?priority=high",
  },
  {
    key: "reviewedTodayCount",
    title: "Reviewed Today",
    href: "/worklist?status=reviewed",
  },
  { key: "aiFailedCount", title: "AI Failed", href: "/worklist?status=ai_failed" },
];

const attentionRows: {
  key: keyof DashboardCounts;
  label: string;
  href: string;
}[] = [
  {
    key: "highPriorityPendingReviewCount",
    label: "High Priority Pending Review",
    href: `/worklist?priority=high&status=${pendingQuery}`,
  },
  { key: "aiFailedCount", label: "AI Failed", href: "/worklist?status=ai_failed" },
  { key: "unscoredCount", label: "Unscored Studies", href: "/worklist?priority=unscored" },
];

const healthLabel: Record<InferenceHealthStatus, string> = {
  ok: "Operational",
  model_unavailable: "Model unavailable",
  unreachable: "Unreachable",
};

// Domain-semantic status colors (allowed exception per design-tokens.md).
const healthDotClass: Record<InferenceHealthStatus, string> = {
  ok: "bg-green-500",
  model_unavailable: "bg-amber-500",
  unreachable: "bg-red-500",
};

export function DashboardOverview({
  counts,
  recentStudies,
  inferenceHealth,
  lastInferenceAt,
}: {
  counts: DashboardCounts;
  recentStudies: WorklistRow[];
  inferenceHealth: InferenceHealthStatus;
  lastInferenceAt: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="py-4 transition-colors hover:bg-muted/50">
              <CardHeader className="px-6 pb-1">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
                <div className="text-2xl font-semibold tabular-nums">
                  {counts[card.key]}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <CardDescription>Studies that require action.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {attentionRows.map((row) => (
              <Link
                key={row.key}
                href={row.href}
                className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
              >
                <span className={counts[row.key] > 0 ? "font-medium" : "text-muted-foreground"}>
                  {row.label}
                </span>
                <span className="flex items-center gap-1 tabular-nums">
                  <span
                    className={
                      counts[row.key] > 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {counts[row.key]}
                  </span>
                  <ChevronRight
                    data-icon="inline-end"
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CardDescription>Inference service health.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Inference API</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className={`size-2 rounded-full ${healthDotClass[inferenceHealth]}`} />
                {healthLabel[inferenceHealth]}
              </span>
            </div>
            {lastInferenceAt !== null && (
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Last successful inference</span>
                <span className="font-medium">
                  {formatRelativeTime(lastInferenceAt)} ago
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium">Recent / Priority Studies</h2>
            <p className="text-sm text-muted-foreground">
              Top studies by triage priority.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/worklist">
              View Worklist
              <ChevronRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <RecentStudiesTable rows={recentStudies} />
      </div>
    </div>
  );
}
