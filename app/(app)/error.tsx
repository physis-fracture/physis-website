"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <TriangleAlert className="size-8 text-destructive" aria-hidden />
      <div className="text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The page failed to load. Try again, or go back to the dashboard.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
