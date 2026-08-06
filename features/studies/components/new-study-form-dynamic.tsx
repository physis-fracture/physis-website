"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

const NewStudyForm = dynamic(
  () =>
    import("@/features/studies/components/new-study-form").then(
      (mod) => mod.NewStudyForm,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-72 items-center justify-center rounded-lg border">
        <Spinner />
      </div>
    ),
  },
);

export function NewStudyFormClient() {
  return <NewStudyForm />;
}
