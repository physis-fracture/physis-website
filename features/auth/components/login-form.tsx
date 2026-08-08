"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Do not expose whether account exists (PRD Section 12.1)
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="doctor@hospital.id"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
          />
        </Field>
      </FieldGroup>

      <FieldError errors={error ? [{ message: error }] : undefined} />

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Spinner data-icon="inline-start" />}
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
