import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSystemStatus } from "@/features/admin/api/get-system-status";
import { formatRelativeTime } from "@/features/worklist/utils/relative-time";
import {
  getInferenceHealth,
  type InferenceHealthStatus,
} from "@/lib/inference/client";

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

export async function SystemStatusCard({ isAdmin }: { isAdmin: boolean }) {
  const [health, status] = await Promise.all([
    getInferenceHealth(),
    isAdmin ? getSystemStatus().catch(() => null) : Promise.resolve(null),
  ]);
  const lastInferenceAt = status?.lastInference.completedAt ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        <CardDescription>Inference service health.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Inference API</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className={`size-2 rounded-full ${healthDotClass[health]}`} />
            {healthLabel[health]}
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
  );
}

export function SystemStatusCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        <CardDescription>Inference service health.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
