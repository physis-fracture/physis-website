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

  // Assuming driving image is the one with highest triage_score
  const drivingImageResult = aiResult.imageResults.length > 0 
    ? [...aiResult.imageResults].sort((a, b) => (b.triage_score || 0) - (a.triage_score || 0))[0]
    : null;

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
        {drivingImageResult && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recorded vs Implicit Age</span>
              <span className="font-medium">
                {study.age_years} vs {drivingImageResult.implicit_age != null ? drivingImageResult.implicit_age.toFixed(1) : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Implicit Age Gap</span>
              <span className="font-medium">
                {drivingImageResult.implicit_age_gap != null ? drivingImageResult.implicit_age_gap.toFixed(1) : "N/A"} yrs
              </span>
            </div>
          </>
        )}
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
