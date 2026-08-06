import { NewStudyFormClient } from "@/features/studies/components/new-study-form-dynamic";

export const metadata = {
  title: "New Study - PHYSIS",
};

export const instant = false;

export default function NewStudyPage() {
  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">New Study</h1>
        <p className="text-sm text-muted-foreground">
          Upload a new pediatric radiograph study for AI analysis.
        </p>
      </div>
      <NewStudyFormClient />
    </div>
  );
}
