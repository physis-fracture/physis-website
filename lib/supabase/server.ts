import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Exponential backoff (ms) between data-API 401 retries. Starts fast (most
 * replica clock/JWKS-propagation lag clears in <1s) and extends far enough to
 * cover the occasional longer window observed right after a fresh login.
 */
const RETRY_BACKOFF_MS = [250, 500, 1000, 2000, 4000, 8000];

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

/**
 * PostgREST runs behind multiple replicas. Right after a fresh login the
 * access token's `iat`/signing key can be rejected by a replica whose clock
 * or JWKS cache hasn't caught up yet — the error surfaces as a 401 with
 * "JWT issued at future" or a bare empty body, while the same token is
 * accepted by the other replicas. The condition clears within seconds.
 * Retry data-API 401s with a short backoff instead of failing the render.
 */
const fetchWithJwtSkewRetry: typeof fetch = async (input, init) => {
  const url = requestUrl(input);
  const isDataApi = url.includes("/rest/v1/");

  let response = await fetch(input, init);
  for (let attempt = 0; response.status === 401 && isDataApi; attempt++) {
    if (init?.signal?.aborted || attempt >= RETRY_BACKOFF_MS.length) {
      break;
    }
    await sleep(RETRY_BACKOFF_MS[attempt]);
    response = await fetch(input, init);
  }

  // Log only when we give up, not on every transient retry.
  if (response.status === 401 && isDataApi) {
    const body = await response.clone().text();
    console.error(`[supabase:401] ${url} ${body.slice(0, 200)}`);
  }

  return response;
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
