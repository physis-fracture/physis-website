import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUsers } from '@/features/admin/api/get-users';
import { UsersTable } from '@/features/admin/components/users-table';

import { connection } from "next/server";

export const instant = false;

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const params = await searchParams;
  const rawPage = typeof params.page === "string" ? parseInt(params.page) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  const { users, totalCount } = await getUsers({ page, pageSize: PAGE_SIZE });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Users</h1>
        <p className="text-sm text-muted-foreground">Manage system access and roles.</p>
      </div>
      <UsersTable
        users={users}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
