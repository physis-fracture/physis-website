import { getAnalytics } from '@/features/analytics/api/get-analytics';
import { AnalyticsDashboard } from '@/features/analytics/components/analytics-dashboard';

import { connection } from "next/server";

export const instant = false;

export default async function AnalyticsPage() {
  await connection();
  const data = await getAnalytics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Operational, inference, and review metrics
        </p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
