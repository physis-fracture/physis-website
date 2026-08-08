import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>

      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
