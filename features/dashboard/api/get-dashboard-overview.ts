import { createClient } from "@/lib/supabase/server";
import type { WorklistRow } from "@/features/worklist/types";

export const RECENT_PAGE_SIZE = 5;

/**
 * Studies that are still in the triage pipeline (AI running or done) and are
 * therefore candidates for review. Mirrors the Pending Studies KPI and the
 * `status` filter values the Worklist accepts.
 */
export const PENDING_STATUSES = ["ready", "queued", "processing"] as const;

export type DashboardCounts = {
  /** All high/critical studies (priority_percentile >= 80), reviewed or not. */
  highPriorityCount: number;
  /** High/critical studies still in the pipeline, i.e. not yet reviewed. */
  highPriorityPendingReviewCount: number;
  /** Studies not yet reviewed and still in the pipeline. */
  pendingCount: number;
  /** Studies with a review completed today (reviews.reviewed_at >= UTC today). */
  reviewedTodayCount: number;
  /** Studies whose AI run failed (studies.status = 'ai_failed'). */
  aiFailedCount: number;
  /** Studies with no usable AI score (priority_percentile is null). */
  unscoredCount: number;
};

export type DashboardOverview = {
  counts: DashboardCounts;
  recentStudies: WorklistRow[];
  recentTotalCount: number;
};

/**
 * One server query for the whole operational dashboard.
 *
 * Priority-based counts come from the worklist_studies view (latest successful
 * AI run per study) so they match exactly what /worklist shows.
 *
 * KPI vs Needs Attention distinction:
 * - `highPriorityCount` (KPI) = all high/critical studies, regardless of status.
 * - `highPriorityPendingReviewCount` (Needs Attention) = high/critical AND still
 *   in the pipeline (PENDING_STATUSES). A reviewed study is excluded.
 */
export async function getDashboardOverview({
  recentPage = 1,
}: {
  recentPage?: number;
} = {}): Promise<DashboardOverview> {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const [
    pending,
    highPriority,
    highPriorityPendingReview,
    reviewedToday,
    aiFailed,
    unscored,
    recent,
  ] = await Promise.all([
    supabase
      .from("studies")
      .select("id", { count: "exact", head: true })
      .in("status", PENDING_STATUSES),
    supabase
      .from("worklist_studies")
      .select("id", { count: "exact", head: true })
      .gte("priority_percentile", 80),
    supabase
      .from("worklist_studies")
      .select("id", { count: "exact", head: true })
      .gte("priority_percentile", 80)
      .in("status", PENDING_STATUSES),
    supabase
      .from("reviews")
      .select("study_id", { count: "exact", head: true })
      .gte("reviewed_at", today),
    supabase
      .from("studies")
      .select("id", { count: "exact", head: true })
      .eq("status", "ai_failed"),
    supabase
      .from("worklist_studies")
      .select("id", { count: "exact", head: true })
      .is("priority_percentile", null),
    supabase
      .from("worklist_studies")
      .select(
        "id, study_code, patient_ref, age_years, sex, status, arrived_at, created_at, updated_at, priority_percentile, triage_score, views",
        { count: "exact" },
      )
      // Same ordering as the Worklist default (priority_desc): nulls last, so
      // failed/unscored studies sort to the end instead of behaving as low.
      .order("priority_percentile", { ascending: false, nullsFirst: false })
      .order("arrived_at", { ascending: true })
      .range(
        (recentPage - 1) * RECENT_PAGE_SIZE,
        recentPage * RECENT_PAGE_SIZE - 1,
      ),
  ]);

  const results = [
    pending,
    highPriority,
    highPriorityPendingReview,
    reviewedToday,
    aiFailed,
    unscored,
    recent,
  ];
  for (const result of results) {
    if (result.error) {
      throw new Error(`Failed to load dashboard: ${result.error.message}`);
    }
  }

  const recentStudies: WorklistRow[] = (recent.data ?? []).map((study) => ({
    id: study.id ?? "",
    studyCode: study.study_code ?? "",
    patientRef: study.patient_ref,
    ageYears: study.age_years ?? 0,
    sex: study.sex ?? "unknown",
    status: study.status ?? "draft",
    arrivedAt: study.arrived_at ?? "",
    createdAt: study.created_at ?? "",
    updatedAt: study.updated_at ?? "",
    views: study.views ?? [],
    priorityPercentile: study.priority_percentile,
    triageScore: study.triage_score,
  }));

  return {
    counts: {
      pendingCount: pending.count ?? 0,
      highPriorityCount: highPriority.count ?? 0,
      highPriorityPendingReviewCount: highPriorityPendingReview.count ?? 0,
      reviewedTodayCount: reviewedToday.count ?? 0,
      aiFailedCount: aiFailed.count ?? 0,
      unscoredCount: unscored.count ?? 0,
    },
    recentStudies,
    recentTotalCount: recent.count ?? 0,
  };
}
