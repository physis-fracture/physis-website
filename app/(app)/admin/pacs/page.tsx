import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PacsIntegrationForm } from '@/features/admin/components/pacs-integration-form';

import { connection } from "next/server";

export const instant = false;

export default async function AdminPacsPage() {
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">PACS Integration</h1>
        <p className="text-sm text-muted-foreground">
          Configure the connection to your hospital PACS.
        </p>
      </div>
      <PacsIntegrationForm />
    </div>
  );
}
