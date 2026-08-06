import { Badge } from "@/components/ui/badge";

type StudyStatus =
  | "draft"
  | "uploading"
  | "queued"
  | "processing"
  | "ready"
  | "ai_failed"
  | "reviewed";

const statusConfig: Record<
  StudyStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  uploading: { label: "Uploading", variant: "outline" },
  queued: { label: "Queued", variant: "outline" },
  processing: { label: "Processing", variant: "secondary" },
  ready: { label: "Ready", variant: "default" },
  ai_failed: { label: "AI Failed", variant: "destructive" },
  reviewed: { label: "Reviewed", variant: "secondary" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as StudyStatus] ?? {
    label: status,
    variant: "outline" as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
