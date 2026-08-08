import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * PostgREST validates a JWT's `iat` against its own server clock, which is a
 * separate service from Auth (GoTrue) that mints the token. Right after a
 * fresh login the token's `iat` can still be ahead of PostgREST's clock, so
 * the first data queries fail transiently with a 401 ("JWT issued at future",
 * or an empty-body 401 for JWT validation failures). The condition clears on
 * its own within ~2s once real time passes `iat`. Retry just those 401s with
 * a short backoff instead of failing the whole page render.
 */
const fetchWithJwtSkewRetry: typeof fetch = async (input, init) => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(input, init);
    if (response.status !== 401 || attempt >= 2) {
      return response;
    }
    if (init?.signal?.aborted) {
      return response;
    }
    const body = (await response.clone().text()).trim();
    const isJwtSkew =
      body === "" ||
      !body.startsWith("{") ||
      body.includes("JWT issued at future") ||
      body.includes("JWT not yet valid");
    if (!isJwtSkew) {
      return response;
    }
    await sleep(1000 * 2 ** attempt);
  }
};

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { fetch: fetchWithJwtSkewRetry },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

/**
 * Service-role client for server-only admin operations.
 * NEVER import or use this in client components.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
