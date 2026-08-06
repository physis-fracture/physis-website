"use server";

import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { newStudySchema, NewStudyInput } from "../schemas/new-study";
import { buildObjectKey, generateUploadUrl, headObject, generateViewUrl } from "@/lib/r2/client";
import { callInference } from "@/lib/inference/client";
import type { Database, Json } from "@/lib/supabase/database.types";

type AuditEventInput = {
  study_id: string;
  actor_id: string;
  event_type: string;
  metadata?: Json;
};

async function logAudit(
  supabase: SupabaseClient<Database>,
  input: AuditEventInput,
) {
  const { error } = await supabase.from("audit_events").insert({
    study_id: input.study_id,
    actor_id: input.actor_id,
    event_type: input.event_type,
    metadata: (input.metadata ?? {}) as Json,
  });

  if (error) {
    console.error(
      `Failed to record audit event ${input.event_type}`,
      error,
    );
  }
}

export async function createStudy(data: NewStudyInput) {
  const result = newStudySchema.safeParse(data);
  if (!result.success) {
    throw new Error("Validation failed: " + result.error.message);
  }

  const validData = result.data;
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const studyId = crypto.randomUUID();

  const { error: studyError } = await supabase.from("studies").insert({
    id: studyId,
    study_code: validData.study_code,
    age_years: validData.age_years,
    sex: validData.sex,
    notes: validData.notes || null,
    status: "draft",
    created_by: userData.user.id,
  });

  if (studyError) throw new Error(`Failed to create study: ${studyError.message}`);

  const imageUploads = [];
  const imageRows = [];

  for (let i = 0; i < validData.images.length; i++) {
    const img = validData.images[i];
    const imageId = crypto.randomUUID();
    const objectKey = buildObjectKey(studyId, imageId, img.fileName);

    imageRows.push({
      id: imageId,
      study_id: studyId,
      object_key: objectKey,
      original_filename: img.fileName,
      mime_type: img.fileType,
      byte_size: img.fileSize,
      view: img.view,
      laterality: img.laterality,
      sort_order: i + 1,
      storage_status: "pending" as const,
    });

    const uploadUrl = await generateUploadUrl(objectKey, img.fileType);
    imageUploads.push({
      imageId,
      uploadUrl,
      objectKey,
    });
  }

  const { error: imagesError } = await supabase.from("images").insert(imageRows);
  if (imagesError) throw new Error(`Failed to create images: ${imagesError.message}`);

  await logAudit(supabase, {
    study_id: studyId,
    actor_id: userData.user.id,
    event_type: "study_created",
    metadata: { message: "Study draft created" },
  });

  return { studyId, images: imageUploads };
}

export async function finalizeStudy(studyId: string) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("id, study_code, age_years, sex")
    .eq("id", studyId)
    .single();

  if (studyError || !study) throw new Error("Study not found");

  const { data: images, error: imagesError } = await supabase
    .from("images")
    .select("id, object_key, view, laterality")
    .eq("study_id", studyId);

  if (imagesError || !images) throw new Error("Images not found");

  const inferenceImages = [];

  for (const img of images) {
    const head = await headObject(img.object_key);
    if (!head) throw new Error(`File missing in R2 for key: ${img.object_key}`);

    const { error: verifyError } = await supabase
      .from("images")
      .update({ storage_status: "verified" })
      .eq("id", img.id);
    if (verifyError) {
      throw new Error(`Failed to verify image ${img.id}: ${verifyError.message}`);
    }
    const viewUrl = await generateViewUrl(img.object_key);

    inferenceImages.push({
      image_id: img.id,
      image_url: viewUrl,
      view: img.view,
      laterality: img.laterality,
    });
  }

  const { error: uploadingError } = await supabase
    .from("studies")
    .update({ status: "uploading" })
    .eq("id", studyId);
  if (uploadingError) {
    throw new Error(`Failed to update study status: ${uploadingError.message}`);
  }

  await logAudit(supabase, {
    study_id: studyId,
    actor_id: userData.user.id,
    event_type: "upload_completed",
    metadata: { message: "Files verified in storage" },
  });

  const { error: queuedError } = await supabase
    .from("studies")
    .update({ status: "queued" })
    .eq("id", studyId);
  if (queuedError) {
    throw new Error(`Failed to queue study: ${queuedError.message}`);
  }

  const startTime = new Date().toISOString();

  await logAudit(supabase, {
    study_id: studyId,
    actor_id: userData.user.id,
    event_type: "inference_started",
    metadata: { message: "Inference requested" },
  });

  try {
    const aiResponse = await callInference({
      study_id: studyId,
      age_years: study.age_years,
      sex: study.sex,
      images: inferenceImages,
    });

    if (!aiResponse.success) {
      throw new Error(aiResponse.message || "Inference failed");
    }

    const res = aiResponse.data;
    const aiResultId = crypto.randomUUID();
    const completedTime = new Date().toISOString();

    const { error: aiResultError } = await supabase.from("ai_results").insert({
      id: aiResultId,
      study_id: studyId,
      model_version: res.model_version,
      status: "success",
      triage_score: res.triage_score,
      priority_percentile: res.priority_percentile,
      age_band: res.age_band,
      inference_time_ms: res.inference_time_ms,
      started_at: startTime,
      completed_at: completedTime,
    });
    if (aiResultError) {
      throw new Error(`Failed to save AI result: ${aiResultError.message}`);
    }

    const aiImageResults = res.images.map((ir) => ({
      id: crypto.randomUUID(),
      ai_result_id: aiResultId,
      image_id: ir.image_id,
      triage_score: ir.triage_score,
      implicit_age: ir.implicit_age,
      implicit_age_gap: ir.implicit_age_gap,
      surprise_map: ir.surprise_map,
      implicit_age_map: ir.implicit_age_map,
    }));

    const { error: aiImageError } = await supabase
      .from("ai_image_results")
      .insert(aiImageResults);
    if (aiImageError) {
      throw new Error(
        `Failed to save AI image results: ${aiImageError.message}`,
      );
    }

    const { error: readyError } = await supabase
      .from("studies")
      .update({ status: "ready" })
      .eq("id", studyId);
    if (readyError) {
      throw new Error(`Failed to finalize study: ${readyError.message}`);
    }

    await logAudit(supabase, {
      study_id: studyId,
      actor_id: userData.user.id,
      event_type: "inference_completed",
      metadata: { message: "Inference completed successfully" },
    });

    return { success: true, studyId, status: "ready" };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const { error: failureError } = await supabase.from("ai_results").insert({
      id: crypto.randomUUID(),
      study_id: studyId,
      model_version: "OsteoJEPA-v1",
      status: "failed",
      error_message: errorMessage,
      started_at: startTime,
      completed_at: new Date().toISOString(),
    });
    if (failureError) {
      console.error("Failed to record AI failure", failureError);
    }

    const { error: failedError } = await supabase
      .from("studies")
      .update({ status: "ai_failed" })
      .eq("id", studyId);
    if (failedError) {
      console.error("Failed to mark study as ai_failed", failedError);
    }

    await logAudit(supabase, {
      study_id: studyId,
      actor_id: userData.user.id,
      event_type: "inference_failed",
      metadata: { message: errorMessage },
    });

    return { success: false, studyId, status: "ai_failed" };
  }
}
