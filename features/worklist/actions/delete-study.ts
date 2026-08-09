"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { deleteObjects } from "@/lib/r2/client";

export async function deleteStudy(
  studyId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "You must be signed in to delete a study." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { success: false, error: "Admin access required to delete studies." };
  }

  const { data: study } = await supabase
    .from("studies")
    .select("id, study_code")
    .eq("id", studyId)
    .maybeSingle();
  if (!study) {
    return { success: false, error: "Study not found." };
  }

  const { data: images, error: imagesError } = await supabase
    .from("images")
    .select("id, object_key")
    .eq("study_id", studyId);
  if (imagesError) {
    return { success: false, error: `Failed to load study images: ${imagesError.message}` };
  }

  // Remove storage first so a failure here leaves the database untouched.
  try {
    await deleteObjects((images ?? []).map((img) => img.object_key).filter(Boolean));
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete study files.",
    };
  }

  const admin = createAdminClient();

  const imageIds = (images ?? []).map((img) => img.id);
  if (imageIds.length > 0) {
    const { error } = await admin.from("ai_image_results").delete().in("image_id", imageIds);
    if (error) {
      return { success: false, error: `Failed to delete AI image results: ${error.message}` };
    }
  }

  for (const table of ["ai_results", "images", "reviews", "audit_events"] as const) {
    const { error } = await admin.from(table).delete().eq("study_id", studyId);
    if (error) {
      return { success: false, error: `Failed to delete ${table}: ${error.message}` };
    }
  }

  const { error: studyError } = await admin.from("studies").delete().eq("id", studyId);
  if (studyError) {
    return { success: false, error: `Failed to delete study: ${studyError.message}` };
  }

  await admin.from("audit_events").insert({
    actor_id: user.id,
    event_type: "study_deleted",
    metadata: { study_id: studyId, study_code: study.study_code },
  });

  revalidatePath("/worklist");
  return { success: true };
}
