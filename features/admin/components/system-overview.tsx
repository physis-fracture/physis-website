import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type InferenceHealth,
  type InferenceHealthStatus,
} from "@/lib/inference/client";
import {
  LATERALITY_LABELS,
  MAX_AGE_YEARS,
  MIN_AGE_YEARS,
  SUPPORTED_LATERALITY,
  SUPPORTED_VIEWS,
} from "@/lib/inference/contract";
import { formatLatency, formatPercent } from "@/features/analytics/utils/format";
import { formatRelativeTime } from "@/features/worklist/utils/relative-time";
import type { SystemStatus } from "../api/get-system-status";

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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg leading-none font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

function CapabilityRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-32 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap items-center gap-1.5 text-sm">{children}</dd>
    </div>
  );
}

export function SystemOverview({
  status,
  health,
}: {
  status: SystemStatus;
  health: InferenceHealth;
}) {
  const { lastInference, performance } = status;

  const successRate =
    performance.totalRuns > 0
      ? formatPercent((performance.successCount / performance.totalRuns) * 100)
      : null;
  const avgLatency =
    performance.totalRuns > 0 && performance.avgInferenceTimeMs > 0
      ? formatLatency(performance.avgInferenceTimeMs)
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">
              Inference Service
            </CardTitle>
            <CardDescription>Current inference service health.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    healthDotClass[health.status],
                  )}
                />
                {healthLabel[health.status]}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                Last successful inference
              </span>
              {lastInference.completedAt ? (
                <span className="font-medium tabular-nums">
                  {formatRelativeTime(lastInference.completedAt)} ago
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No successful inference yet
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">Model</CardTitle>
            <CardDescription>Active model and contract.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Model</span>
              {lastInference.modelVersion ? (
                <span className="font-mono text-xs font-medium">
                  {lastInference.modelVersion}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No successful inference yet
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Contract</span>
              <span
                className={
                  health.contractVersion
                    ? "font-medium tabular-nums"
                    : "text-muted-foreground"
                }
              >
                {health.contractVersion ?? "Unknown"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <CardDescription>Inference run history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Runs" value={String(performance.totalRuns)} />
              <Metric label="Success Rate" value={successRate ?? "—"} />
              <Metric label="Avg Latency" value={avgLatency ?? "—"} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium">
            Model Capabilities
          </CardTitle>
          <CardDescription>Supported input constraints.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3">
            <CapabilityRow label="Age Range">
              <span className="font-medium tabular-nums">
                {MIN_AGE_YEARS}–{MAX_AGE_YEARS} years
              </span>
            </CapabilityRow>
            <CapabilityRow label="Views">
              {SUPPORTED_VIEWS.map((view) => (
                <Badge key={view} variant="outline">
                  {view}
                </Badge>
              ))}
            </CapabilityRow>
            <CapabilityRow label="Laterality">
              {SUPPORTED_LATERALITY.map((laterality) => (
                <Badge key={laterality} variant="secondary">
                  {LATERALITY_LABELS[laterality]}
                </Badge>
              ))}
            </CapabilityRow>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
