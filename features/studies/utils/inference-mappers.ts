import {
  type PredictImageResult,
  type PredictRequest,
} from "@/lib/inference/client";

export function mapSex(sex: string | null): "male" | "female" | "unknown" {
  if (sex === "male" || sex === "female") return sex;
  return "unknown";
}

export function mapView(
  view: string | null,
): "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN" {
  if (view === "PA" || view === "AP" || view === "LATERAL" || view === "OTHER") {
    return view;
  }
  return "UNKNOWN";
}

export function mapLaterality(
  laterality: string | null,
): "left" | "right" | "unknown" {
  if (laterality === "left" || laterality === "right") return laterality;
  return "unknown";
}

export type PredictImageInput = {
  image_id: string;
  image_url: string;
  view: string | null;
  laterality: string | null;
};

export function toPredictRequest(input: {
  studyId: string;
  ageYears: number;
  sex: string | null;
  images: PredictImageInput[];
}): PredictRequest {
  return {
    study_id: input.studyId,
    age_years: input.ageYears,
    sex: mapSex(input.sex),
    images: input.images.map((img) => ({
      image_id: img.image_id,
      image_url: img.image_url,
      view: mapView(img.view),
      laterality: mapLaterality(img.laterality),
    })),
  };
}

/** Stable per-image fields persisted from the prediction response. */
export function mapPredictImageToDb(image: PredictImageResult): {
  image_id: string;
  triage_score: number;
  valid_patch_fraction: number;
  boxes: number[][] | null;
} {
  return {
    image_id: image.image_id,
    triage_score: image.triage_score,
    valid_patch_fraction: image.valid_patch_fraction,
    boxes: image.boxes === undefined ? null : image.boxes,
  };
}
