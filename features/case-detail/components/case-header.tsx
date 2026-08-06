import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { StatusBadge } from "@/components/shared/status-badge";
import { StudyDetail } from "../api/get-study-detail";

export function CaseHeader({ study }: { study: StudyDetail }) {
  const diffMs = Date.now() - new Date(study.arrived_at).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const waitingTime = diffHours > 0 ? `${diffHours}h ${diffMins % 60}m` : `${diffMins}m`;

  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-border">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/worklist">Worklist</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{study.study_code}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{study.study_code}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{study.age_years} yrs</span>
            <span aria-hidden="true">-</span>
            <span className="capitalize">{study.sex}</span>
          </div>
          <StatusBadge status={study.status} />
        </div>
        <div className="text-sm text-muted-foreground">Waiting: {waitingTime}</div>
      </div>
    </div>
  );
}
