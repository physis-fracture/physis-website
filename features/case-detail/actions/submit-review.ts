"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { revalidatePath } from "next/cache";

type SubmitReviewArgs = {
  studyId: string;
  outcome: Database["public"]["Enums"]["review_outcome"];
  notes?: string;
};

export async function submitReview({
  studyId,
  outcome,
  notes,
}: SubmitReviewArgs) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error: reviewError } = await supabase
    .from("reviews")
    .upsert(
      {
        study_id: studyId,
        reviewer_id: user.id,
        outcome,
        notes: notes || null,
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: "study_id" },
    );

  if (reviewError) {
    console.error("Failed to submit review", reviewError);
    return { success: false, error: reviewError.message };
  }

  const { error: studyError } = await supabase
    .from("studies")
    .update({ status: "reviewed" })
    .eq("id", studyId);

  if (studyError) {
    console.error("Failed to update study status", studyError);
    return { success: false, error: studyError.message };
  }

  const { error: auditError } = await supabase
    .from("audit_events")
    .insert({
      event_type: "review_submitted",
      actor_id: user.id,
      study_id: studyId,
      metadata: { outcome },
    });

  if (auditError) {
    console.error("Failed to record audit event", auditError);
  }

  const { data: nextStudies, error: nextError } = await supabase
    .from("studies")
    .select("id, ai_results!inner(priority_percentile)")
    .eq("status", "ready")
    .eq("ai_results.status", "success")
    .order("priority_percentile", {
      referencedTable: "ai_results",
      ascending: false,
    })
    .limit(1);

  if (nextError) {
    console.error("Failed to load next study", nextError);
  }

  const nextStudyId = nextStudies?.[0]?.id ?? null;

  revalidatePath("/worklist");
  revalidatePath(`/worklist/${studyId}`);

  return { success: true, nextStudyId };
}
