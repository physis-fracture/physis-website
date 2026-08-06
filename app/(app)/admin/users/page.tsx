import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUsers } from '@/features/admin/api/get-users';
import { UsersTable } from '@/features/admin/components/users-table';

import { connection } from "next/server";

export const instant = false;

export default async function AdminUsersPage() {
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

  const users = await getUsers();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Users</h1>
        <p className="text-sm text-muted-foreground">Manage system access and roles.</p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
