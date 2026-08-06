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
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6 p-6">
      <CaseHeader study={study} />
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel - Viewer & Vis */}
        <div className="flex flex-col gap-6 lg:w-[70%] min-h-0">
          <div className="flex-1 min-h-0">
            <XrayViewer study={study} />
          </div>
          <AiVisualization study={study} />
        </div>

        {/* Right Panel - Metadata & Review */}
        <div className="flex flex-col gap-6 lg:w-[30%] overflow-y-auto pr-2">
          <AiSummaryPanel study={study} />
          <ReviewPanel study={study} />
        </div>
      </div>
    </div>
  );
}
