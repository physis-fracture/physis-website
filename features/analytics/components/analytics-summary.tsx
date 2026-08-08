import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { AnalyticsData } from "../api/get-analytics";
import { formatLatency, formatPercent } from "../utils/format";

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="gap-1 py-2">
      <CardHeader className="px-4 pb-0">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function AnalyticsSummary({ data }: { data: AnalyticsData }) {
  const totalStudies = Object.values(data.studiesByStatus).reduce(
    (sum, count) => sum + count,
    0,
  );
  const reviewed = data.studiesByStatus["reviewed"] ?? 0;
  const aiFailed = data.studiesByStatus["ai_failed"] ?? 0;
  const completionRate =
    totalStudies > 0 ? (reviewed / totalStudies) * 100 : 0;
  const successRate =
    data.inferenceStats.totalRuns > 0
      ? (data.inferenceStats.successCount / data.inferenceStats.totalRuns) * 100
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard label="Total Studies" value={String(totalStudies)} />
      <MetricCard
        label="Reviewed"
        value={String(reviewed)}
        sub={`${formatPercent(completionRate)} of studies`}
      />
      <MetricCard label="AI Failed" value={String(aiFailed)} />
      <MetricCard
        label="Avg Latency"
        value={formatLatency(data.inferenceStats.avgInferenceTimeMs)}
      />
      <MetricCard label="Total Runs" value={String(data.inferenceStats.totalRuns)} />
      <MetricCard label="Success Rate" value={formatPercent(successRate)} />
    </div>
  );
}
