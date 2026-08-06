import { createClient } from "@/lib/supabase/server";
import { generateViewUrl } from "@/lib/r2/client";
import type { Database } from "@/lib/supabase/database.types";

type DB = Database["public"]["Tables"];
type Study = DB["studies"]["Row"];
type ImageView = DB["images"]["Row"]["view"];
type ImageLaterality = DB["images"]["Row"]["laterality"];
type ImageStorageStatus = DB["images"]["Row"]["storage_status"];

export type StudyImage = {
  id: string;
  object_key: string;
  original_filename: string | null;
  view: ImageView;
  laterality: ImageLaterality;
  sort_order: number;
  storage_status: ImageStorageStatus;
  viewUrl: string | null;
};

export type StudyAiImageResult = {
  id: string;
  image_id: string;
  triage_score: number;
  implicit_age: number | null;
  implicit_age_gap: number | null;
  surprise_map: Database["public"]["Tables"]["ai_image_results"]["Row"]["surprise_map"];
  implicit_age_map: Database["public"]["Tables"]["ai_image_results"]["Row"]["implicit_age_map"];
};

export type StudyAiResult = {
  id: string;
  triage_score: number | null;
  priority_percentile: number | null;
  age_band: string | null;
  inference_time_ms: number | null;
  model_version: string | null;
  status: Database["public"]["Enums"]["ai_run_status"];
  completed_at: string | null;
  imageResults: StudyAiImageResult[];
};

export type StudyReview = {
  id: string;
  outcome: Database["public"]["Enums"]["review_outcome"];
  notes: string | null;
  reviewed_at: string;
  reviewer_id: string | null;
};

export type StudyDetail = {
  id: string;
  study_code: string;
  patient_ref: string | null;
  age_years: number;
  sex: Study["sex"];
  status: Study["status"];
  arrived_at: string;
  created_at: string;
  notes: string | null;
  images: StudyImage[];
  aiResult: StudyAiResult | null;
  review: StudyReview | null;
};

export async function getStudyDetail(
  studyId: string,
): Promise<StudyDetail | null> {
  const supabase = await createClient();

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select(
      "id, study_code, patient_ref, age_years, sex, status, arrived_at, created_at, notes",
    )
    .eq("id", studyId)
    .single();

  if (studyError) {
    if (studyError.code === "PGRST116") {
      // Row not found.
      return null;
    }
    throw new Error(`Failed to load study: ${studyError.message}`);
  }

  const [
    { data: images, error: imagesError },
    { data: aiResults, error: aiResultsError },
    { data: reviews, error: reviewsError },
  ] = await Promise.all([
    supabase
      .from("images")
      .select(
        "id, object_key, original_filename, view, laterality, sort_order, storage_status",
      )
      .eq("study_id", studyId)
      .order("sort_order"),
    supabase
      .from("ai_results")
      .select(
        "id, triage_score, priority_percentile, age_band, inference_time_ms, model_version, status, completed_at",
      )
      .eq("study_id", studyId)
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("reviews")
      .select("id, outcome, notes, reviewed_at, reviewer_id")
      .eq("study_id", studyId)
      .order("reviewed_at", { ascending: false })
      .limit(1),
  ]);

  if (imagesError || aiResultsError || reviewsError) {
    throw new Error(
      `Failed to load study detail: ${
        imagesError?.message ?? aiResultsError?.message ?? reviewsError?.message
      }`,
    );
  }

  const aiResult = aiResults?.[0] ?? null;

  let imageResults: StudyAiImageResult[] = [];
  if (aiResult) {
    const { data, error: imageResultsError } = await supabase
      .from("ai_image_results")
      .select(
        "id, image_id, triage_score, implicit_age, implicit_age_gap, surprise_map, implicit_age_map",
      )
      .eq("ai_result_id", aiResult.id);

    if (imageResultsError) {
      throw new Error(
        `Failed to load AI image results: ${imageResultsError.message}`,
      );
    }
    imageResults = (data ?? []) as StudyAiImageResult[];
  }

  const imagesWithUrls = (images ?? []).map((img) => ({
    ...img,
    viewUrl: null as string | null,
  }));

  const resolvedImages = await Promise.all(
    imagesWithUrls.map(async (img) => {
      if (img.storage_status !== "verified") {
        return img;
      }
      try {
        const viewUrl = await generateViewUrl(img.object_key);
        return { ...img, viewUrl };
      } catch (e) {
        console.error("Failed to generate view URL for image", img.id, e);
        return img;
      }
    }),
  );

  return {
    ...study,
    images: resolvedImages,
    aiResult: aiResult ? { ...aiResult, imageResults } : null,
    review: reviews?.[0] ?? null,
  };
}
