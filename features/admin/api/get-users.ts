import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getUsers({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
}): Promise<{ users: UserProfile[]; totalCount: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, is_active, created_at, updated_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  return { users: data, totalCount: count ?? 0 };
}
