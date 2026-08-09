"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side email/password sign-in.
 *
 * Signing in on the server and letting `redirect()` return the response with
 * the auth cookies avoids the client-router prefetch race where an RSC
 * request reaches the server before the browser has processed the tokens,
 * which caused the "two clicks to log in" bug.
 */
export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    // Do not expose whether account exists (PRD Section 12.1)
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}
