import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import type { AnalyticsData } from "../api/get-analytics";
import { AnalyticsSummary } from "./analytics-summary";
import { PriorityDistributionChart } from "./priority-distribution-chart";
import { ReviewOutcomesChart } from "./review-outcomes-chart";
import { AgeDistributionChart } from "./age-distribution-chart";

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 gap-3 py-3">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4">{children}</CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const totalStudies = Object.values(data.studiesByStatus).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (totalStudies === 0) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyTitle>No analytics data yet</EmptyTitle>
          <EmptyDescription>
            Analytics will appear after studies are processed.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsSummary data={data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Priority Distribution"
          description="Studies by AI triage priority"
        >
          <PriorityDistributionChart distribution={data.priorityDistribution} />
        </ChartCard>

        <ChartCard
          title="Review Outcomes"
          description="Radiologist-submitted results"
        >
          <ReviewOutcomesChart outcomes={data.reviewsByOutcome} />
        </ChartCard>
      </div>

      <ChartCard title="Age Distribution">
        <AgeDistributionChart distribution={data.ageDistribution} />
      </ChartCard>
    </div>
  );
}
