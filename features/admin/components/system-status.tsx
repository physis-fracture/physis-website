import { SystemStatus } from '../api/get-system-status';
import { Separator } from '@/components/ui/separator';

export function SystemStatusDisplay({ status }: { status: SystemStatus }) {
  const { lastInference, performance } = status;

  const successRate = performance.totalRuns > 0
    ? ((performance.successCount / performance.totalRuns) * 100).toFixed(1)
    : 0;
    
  const isServiceHealthy = lastInference.completedAt !== null; 
  
  return (
    <div className="flex flex-col gap-6 text-sm text-foreground">
      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Inference Service</h2>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            Status: 
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`size-2 rounded-full ${isServiceHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
              {isServiceHealthy ? 'Operational' : 'Unknown'}
            </span>
          </div>
          <div>Last Inference: <span className="font-medium">{lastInference.completedAt ? new Date(lastInference.completedAt).toLocaleString() : 'N/A'}</span></div>
          <div>Model Version: <span className="font-medium">{lastInference.modelVersion || 'N/A'}</span></div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Performance</h2>
        <div className="flex flex-col gap-1">
          <div>Total Inference Runs: <span className="font-medium">{performance.totalRuns}</span></div>
          <div>Success Rate: <span className="font-medium">{successRate}%</span></div>
          <div>Avg Latency: <span className="font-medium">{Math.round(performance.avgInferenceTimeMs)} ms</span></div>
        </div>
      </section>
      
      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Configuration</h2>
        <div className="flex flex-col gap-1">
          <div>Supported Age Range: <span className="font-medium">0-25 years</span></div>
          <div>Supported Views: <span className="font-medium">PA, AP, LATERAL, OTHER, UNKNOWN</span></div>
          <div>Supported Laterality: <span className="font-medium">Left, Right, Unknown</span></div>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground font-medium">Model Limitations</h2>
        <ul className="list-disc list-inside flex flex-col gap-1 text-muted-foreground">
          <li>Triage aid, not diagnosis</li>
          <li>Pediatric wrist radiograph scope</li>
          <li>Research/competition prototype</li>
          <li>Performance may vary across populations</li>
          <li>Calibration limitations apply</li>
        </ul>
      </section>
    </div>
  );
}
