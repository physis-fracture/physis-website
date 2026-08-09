import { redirect } from 'next/navigation';
import { getSession } from '@/features/auth/api/get-session';
import { getSystemStatus } from '@/features/admin/api/get-system-status';
import { SystemOverview } from '@/features/admin/components/system-overview';
import { getInferenceHealth } from '@/lib/inference/client';

import { connection } from "next/server";

export const instant = false;

export default async function AdminSystemPage() {
  await connection();
  const { user, profile } = await getSession();

  if (!user) redirect('/login');

  if (profile?.role !== 'admin') redirect('/dashboard');

  const [status, health] = await Promise.all([
    getSystemStatus(),
    getInferenceHealth(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System &amp; Model</h1>
        <p className="text-sm text-muted-foreground">
          Inference service status, model capabilities, and operational metrics.
        </p>
      </div>
      <SystemOverview status={status} health={health} />
    </div>
  );
}
