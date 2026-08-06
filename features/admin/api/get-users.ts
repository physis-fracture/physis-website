import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getUsers(): Promise<UserProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  return data;
}
