import { StudyDetail } from "../api/get-study-detail";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AiSummaryPanel({ study }: { study: StudyDetail }) {
  const { aiResult } = study;

  if (!aiResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">AI analysis unavailable</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>AI Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-muted-foreground">Priority Percentile</span>
          <PriorityBadge percentile={aiResult.priority_percentile || 0} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Study Triage Score</span>
          <span className="font-medium">{aiResult.triage_score != null ? (aiResult.triage_score * 100).toFixed(1) : "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Age Band</span>
          <span className="font-medium">{aiResult.age_band || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Inference Time</span>
          <span className="font-medium">{aiResult.inference_time_ms ? `${aiResult.inference_time_ms} ms` : "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Model Version</span>
          <span className="font-medium">{aiResult.model_version || "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
