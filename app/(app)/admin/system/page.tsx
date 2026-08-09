import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getSystemStatus } from '@/features/admin/api/get-system-status';
import { SystemOverview } from '@/features/admin/components/system-overview';
import { getInferenceHealth } from '@/lib/inference/client';

import { connection } from "next/server";

export const instant = false;

export default async function AdminSystemPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
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
