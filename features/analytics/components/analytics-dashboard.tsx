import { AnalyticsData } from '../api/get-analytics';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function CountTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Array<{ label: string; count: number }>;
}) {
  return (
    <div className="w-full max-w-sm rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{caption}</TableHead>
            <TableHead className="text-right">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell>{row.label}</TableCell>
              <TableCell className="text-right">{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { studiesByStatus, reviewsByOutcome, inferenceStats, priorityDistribution, ageDistribution } = data;

  const totalStudies = Object.values(studiesByStatus).reduce((a, b) => a + b, 0);
  const pendingCount = (studiesByStatus['queued'] || 0) + (studiesByStatus['processing'] || 0) + (studiesByStatus['ready'] || 0);
  const reviewedCount = studiesByStatus['reviewed'] || 0;
  const failedCount = studiesByStatus['ai_failed'] || 0;

  const successRate = inferenceStats.totalRuns > 0
    ? ((inferenceStats.successCount / inferenceStats.totalRuns) * 100).toFixed(1)
    : 0;

  return (
    <div className="flex flex-col gap-6 text-sm text-foreground">
      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Study Overview</h2>
        <div className="flex flex-wrap gap-4">
          <div>Total: <span className="font-medium">{totalStudies}</span></div>
          <div>Pending: <span className="font-medium">{pendingCount}</span></div>
          <div>Reviewed: <span className="font-medium">{reviewedCount}</span></div>
          <div>AI Failed: <span className="font-medium">{failedCount}</span></div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Inference Performance</h2>
        <div className="flex flex-wrap gap-4">
          <div>Total Runs: <span className="font-medium">{inferenceStats.totalRuns}</span></div>
          <div>Success Rate: <span className="font-medium">{successRate}%</span></div>
          <div>Avg Latency: <span className="font-medium">{Math.round(inferenceStats.avgInferenceTimeMs)} ms</span></div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Priority Distribution</h2>
        <CountTable
          caption="Priority"
          rows={[
            { label: 'Critical', count: priorityDistribution.critical },
            { label: 'High', count: priorityDistribution.high },
            { label: 'Standard', count: priorityDistribution.standard },
            { label: 'Unscored', count: priorityDistribution.unscored },
          ]}
        />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Review Outcomes</h2>
        <CountTable
          caption="Outcome"
          rows={[
            { label: 'Fracture', count: reviewsByOutcome['fracture'] || 0 },
            { label: 'No Fracture', count: reviewsByOutcome['no_fracture'] || 0 },
            { label: 'Uncertain', count: reviewsByOutcome['uncertain'] || 0 },
          ]}
        />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Age Distribution</h2>
        <CountTable
          caption="Age Band"
          rows={[
            { label: '0-4', count: ageDistribution['0-4'] },
            { label: '5-9', count: ageDistribution['5-9'] },
            { label: '10-14', count: ageDistribution['10-14'] },
            { label: '15-19', count: ageDistribution['15-19'] },
            { label: '20-25', count: ageDistribution['20-25'] },
          ]}
        />
      </section>
    </div>
  );
}
