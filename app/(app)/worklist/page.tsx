import { createClient } from "@/lib/supabase/server";
import { WorklistTable } from "@/features/worklist/components/worklist-table";
import { parseWorklistQuery } from "@/features/worklist/schemas/worklist-query";
import type { WorklistRow } from "@/features/worklist/types";
import type { Database } from "@/lib/supabase/database.types";

const PAGE_SIZE = 20;

import { connection } from "next/server";

export const instant = false;

export default async function WorklistPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const params = await searchParams;
  const query = parseWorklistQuery(params);
  const supabase = await createClient();

  let dbQuery = supabase
    .from("worklist_studies")
    .select(
      "id, study_code, patient_ref, age_years, sex, status, arrived_at, created_at, updated_at, priority_percentile, triage_score, views",
      { count: "exact" },
    );

  if (query.q) {
    dbQuery = dbQuery.or(
      `study_code.ilike.%${query.q}%,patient_ref.ilike.%${query.q}%`,
    );
  }
  if (query.status && query.status.length > 0) {
    dbQuery = dbQuery.in("status", query.status as Database["public"]["Enums"]["study_status"][]);
  }
  if (query.sex && query.sex.length > 0) {
    dbQuery = dbQuery.in("sex", query.sex as Database["public"]["Enums"]["sex_type"][]);
  }
  if (query.priority && query.priority.length > 0) {
    const [p] = query.priority;
    if (p === "unscored") {
      dbQuery = dbQuery.is("priority_percentile", null);
    } else if (p === "critical") {
      dbQuery = dbQuery.gte("priority_percentile", 95);
    } else if (p === "high") {
      dbQuery = dbQuery.gte("priority_percentile", 80);
    } else if (p === "standard") {
      dbQuery = dbQuery.lt("priority_percentile", 80);
    }
  }
  if (query.minAge !== undefined) {
    dbQuery = dbQuery.gte("age_years", query.minAge);
  }
  if (query.maxAge !== undefined) {
    dbQuery = dbQuery.lte("age_years", query.maxAge);
  }
  if (query.from) {
    dbQuery = dbQuery.gte("arrived_at", query.from);
  }
  if (query.to) {
    dbQuery = dbQuery.lte("arrived_at", query.to);
  }

  // Sorting is applied server-side so pagination stays correct.
  switch (query.sort) {
    case "newest":
      dbQuery = dbQuery.order("created_at", { ascending: false });
      break;
    case "oldest":
      dbQuery = dbQuery.order("created_at", { ascending: true });
      break;
    case "waiting_desc":
      dbQuery = dbQuery.order("arrived_at", { ascending: true });
      break;
    case "priority_desc":
    default:
      dbQuery = dbQuery
        .order("priority_percentile", { ascending: false, nullsFirst: false })
        .order("arrived_at", { ascending: true });
      break;
  }

  const page = query.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  dbQuery = dbQuery.range(from, to);

  const { data: studies, count, error } = await dbQuery;

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Worklist</h1>
        <p className="text-sm text-destructive">
          Failed to load worklist: {error.message}
        </p>
      </div>
    );
  }

  const rows: WorklistRow[] = (studies ?? []).map((study) => ({
    id: study.id ?? "",
    studyCode: study.study_code ?? "",
    patientRef: study.patient_ref,
    ageYears: study.age_years ?? 0,
    sex: study.sex ?? "unknown",
    status: study.status ?? "draft",
    arrivedAt: study.arrived_at ?? "",
    updatedAt: study.updated_at ?? "",
    views: study.views ?? [],
    priorityPercentile: study.priority_percentile,
    triageScore: study.triage_score,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Worklist</h1>
        <p className="text-sm text-muted-foreground">
          Prioritized radiologist workspace. Studies are ordered by AI triage
          priority.
        </p>
      </div>

      <WorklistTable
        rows={rows}
        totalCount={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        query={query}
      />
    </div>
  );
}
