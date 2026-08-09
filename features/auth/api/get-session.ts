import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Current user + profile, deduplicated per request.
 *
 * Every authenticated page previously ran `getUser()` and a `profiles` query
 * on its own, on top of the same calls in the (app) layout — 4 round-trips per
 * navigation just to resolve "who am I". `React.cache()` memoizes this across
 * the layout and pages within a single render, cutting that to one call each.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, is_active")
    .eq("id", user.id)
    .single();

  return { user, profile };
});
