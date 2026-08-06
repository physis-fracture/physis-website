/** Modal/FastAPI inference client. PRD Section 14. */

export type InferenceImageInput = {
  image_id: string;
  image_url: string;
  view: "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN";
  laterality: "left" | "right" | "unknown";
};

export type InferenceRequest = {
  study_id: string;
  age_years: number;
  sex: "male" | "female" | "unknown";
  images: InferenceImageInput[];
};

export type InferenceImageResult = {
  image_id: string;
  triage_score: number;
  implicit_age: number;
  implicit_age_gap: number;
  surprise_map: { width: number; height: number; values: number[] };
  implicit_age_map: { width: number; height: number; values: number[] };
};

export type InferenceSuccessResponse = {
  success: true;
  message: string;
  data: {
    study_id: string;
    triage_score: number;
    priority_percentile: number;
    age_band: string;
    images: InferenceImageResult[];
    inference_time_ms: number;
    model_version: string;
  };
};

export type InferenceErrorResponse = {
  success: false;
  message: string;
  error_code: string;
  errors?: { field: string; message: string }[];
};

export type InferenceResponse =
  | InferenceSuccessResponse
  | InferenceErrorResponse;

const INFERENCE_TIMEOUT_MS = 120_000;

export async function callInference(
  request: InferenceRequest,
): Promise<InferenceResponse> {
  const baseUrl = process.env.PHYSIS_INFERENCE_BASE_URL;
  const apiKey = process.env.PHYSIS_INFERENCE_API_KEY;

  if (!baseUrl) {
    return {
      success: false,
      message: "Inference service not configured",
      error_code: "SERVICE_UNAVAILABLE",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    INFERENCE_TIMEOUT_MS,
  );

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}/v1/predict`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const body = await response.json();
    return body as InferenceResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        success: false,
        message: "Inference request timed out",
        error_code: "INFERENCE_TIMEOUT",
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Inference request failed",
      error_code: "INTERNAL_ERROR",
    };
  } finally {
    clearTimeout(timeout);
  }
}
