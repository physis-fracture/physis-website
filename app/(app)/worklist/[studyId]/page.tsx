import { notFound } from "next/navigation";
import { getStudyDetail } from "@/features/case-detail/api/get-study-detail";
import { CaseHeader } from "@/features/case-detail/components/case-header";
import { XrayViewer } from "@/features/case-detail/components/xray-viewer";
import { AiSummaryPanel } from "@/features/case-detail/components/ai-summary-panel";
import { AiVisualization } from "@/features/case-detail/components/ai-visualization";
import { ReviewPanel } from "@/features/case-detail/components/review-panel";

import { connection } from "next/server";

export const instant = false;

export default async function StudyDetailPage({
  params,
}: {
  params: Promise<{ studyId: string }>;
}) {
  await connection();
  const { studyId } = await params;
  const study = await getStudyDetail(studyId);

  if (!study) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <CaseHeader study={study} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <XrayViewer study={study} />
          <AiVisualization study={study} />
        </div>

        <div className="flex flex-col gap-6">
          <AiSummaryPanel study={study} />
          <ReviewPanel study={study} />
        </div>
      </div>
    </div>
  );
}
