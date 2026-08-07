"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
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

export type StudyUploadPlanImage = {
  imageId: string;
  objectKey: string;
  uploadUrl: string;
};

export type StudyUploadPlan = {
  studyId: string;
  images: StudyUploadPlanImage[];
};

export async function createStudy(data: NewStudyInput): Promise<StudyUploadPlan> {
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

  const { data: existing, error: existingError } = await supabase
    .from("studies")
    .select("id")
    .eq("study_code", validData.study_code)
    .maybeSingle();
  if (existingError) {
    throw new Error(`Failed to check study code: ${existingError.message}`);
  }
  if (existing) {
    throw new Error(
      `Study code "${validData.study_code}" already exists. Use a different code.`,
    );
  }

  const studyId = crypto.randomUUID();
  const images: StudyUploadPlanImage[] = [];

  for (let i = 0; i < validData.images.length; i++) {
    const img = validData.images[i];
    const imageId = crypto.randomUUID();
    const objectKey = buildObjectKey(studyId, imageId, img.fileType);
    const uploadUrl = await generateUploadUrl(objectKey, img.fileType);

    images.push({ imageId, objectKey, uploadUrl });
  }

  return { studyId, images };
}

export async function finalizeStudy(
  studyPayload: NewStudyInput,
  plan: StudyUploadPlan,
) {
  const result = newStudySchema.safeParse(studyPayload);
  if (!result.success) {
    throw new Error("Validation failed: " + result.error.message);
  }
  const validData = result.data;
  const { studyId, images: planImages } = plan;

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();
  const inferenceImages = [];

  for (let i = 0; i < planImages.length; i++) {
    const img = planImages[i];
    const meta = validData.images[i];

    let head;
    try {
      head = await headObject(img.objectKey);
    } catch (error) {
      throw new Error(
        `File missing in R2 for key: ${img.objectKey}`,
        { cause: error },
      );
    }

    if (
      head.ContentLength !== undefined &&
      meta.fileSize !== null &&
      head.ContentLength !== meta.fileSize
    ) {
      throw new Error(
        `File size mismatch for image ${img.imageId}: expected ${meta.fileSize}, got ${head.ContentLength}`,
      );
    }

    if (head.ContentType && head.ContentType !== meta.fileType) {
      throw new Error(
        `Content type mismatch for image ${img.imageId}: expected ${meta.fileType}, got ${head.ContentType}`,
      );
    }

    const viewUrl = await generateViewUrl(img.objectKey);

    inferenceImages.push({
      image_id: img.imageId,
      image_url: viewUrl,
      view: meta.view,
      laterality: meta.laterality,
    });
  }

  const { error: studyError } = await supabase.from("studies").insert({
    id: studyId,
    study_code: validData.study_code,
    age_years: validData.age_years,
    sex: validData.sex,
    notes: validData.notes || null,
    status: "uploading",
    created_by: userData.user.id,
  });
  if (studyError) {
    if (studyError.code === "23505") {
      throw new Error(
        `Study code "${validData.study_code}" already exists. Use a different code.`,
      );
    }
    throw new Error(`Failed to create study: ${studyError.message}`);
  }

  const imageRows = planImages.map((img, i) => {
    const meta = validData.images[i];
    return {
      id: img.imageId,
      study_id: studyId,
      object_key: img.objectKey,
      original_filename: meta.fileName,
      mime_type: meta.fileType,
      byte_size: meta.fileSize,
      view: meta.view,
      laterality: meta.laterality,
      sort_order: i + 1,
      storage_status: "verified" as const,
      uploaded_at: new Date().toISOString(),
    };
  });

  const { error: imagesError } = await supabase.from("images").insert(imageRows);
  if (imagesError) throw new Error(`Failed to create images: ${imagesError.message}`);

  await logAudit(supabase, {
    study_id: studyId,
    actor_id: userData.user.id,
    event_type: "study_created",
    metadata: { message: "Study created after verified upload" },
  });

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
      age_years: validData.age_years,
      sex: validData.sex,
      images: inferenceImages,
    });

    if (!aiResponse.success) {
      throw new Error(aiResponse.message || "Inference failed");
    }

    const res = aiResponse.data;
    const aiResultId = crypto.randomUUID();
    const completedTime = new Date().toISOString();

    const { error: aiResultError } = await admin.from("ai_results").insert({
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

    const { error: aiImageError } = await admin
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
    const { error: failureError } = await admin.from("ai_results").insert({
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
