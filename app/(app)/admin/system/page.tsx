import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getSystemStatus } from '@/features/admin/api/get-system-status';
import { SystemStatusDisplay } from '@/features/admin/components/system-status';

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

  const status = await getSystemStatus();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin System</h1>
        <p className="text-sm text-muted-foreground">System status, performance metrics, and configuration.</p>
      </div>
      <SystemStatusDisplay status={status} />
    </div>
  );
}
