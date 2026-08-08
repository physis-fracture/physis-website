import "server-only";

import { z } from "zod";

/**
 * Modal/FastAPI inference client. Server-only.
 *
 * Calls POST {PHYSIS_INFERENCE_BASE_URL}/v1/predict with Bearer auth.
 * The API key never leaves the server.
 */

export type PredictImage = {
  image_id: string;
  image_url: string;
  view?: "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN";
  laterality?: "left" | "right" | "unknown";
};

export type PredictRequest = {
  study_id: string;
  age_years: number;
  sex?: "male" | "female" | "unknown";
  images: PredictImage[];
};

export type PredictImageResult = {
  image_id: string;
  triage_score: number;
  valid_patch_fraction: number;
  boxes?: number[][] | null;
};

export type PredictResponse = {
  success: true;
  message: string;
  data: {
    study_id: string;
    triage_score: number;
    priority_percentile: number;
    age_band: string;
    images: PredictImageResult[];
    inference_time_ms: number;
    model_version: string;
  };
};

export type PredictErrorDetail = {
  field?: string | null;
  image_id?: string | null;
  message: string;
};

export type PredictErrorResponse = {
  success: false;
  message: string;
  error_code: string;
  errors?: PredictErrorDetail[];
};

export type PredictOutcome =
  | { success: true; data: PredictResponse }
  | {
      success: false;
      code: string;
      message: string;
      errors?: PredictErrorDetail[];
    };

const predictImageResultSchema = z.object({
  image_id: z.string(),
  triage_score: z.number(),
  valid_patch_fraction: z.number(),
  boxes: z.array(z.array(z.number())).nullable().optional(),
});

const predictResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    study_id: z.string(),
    triage_score: z.number(),
    priority_percentile: z.number(),
    age_band: z.string(),
    images: z.array(predictImageResultSchema),
    inference_time_ms: z.number(),
    model_version: z.string(),
  }),
});

const predictErrorDetailSchema = z.object({
  field: z.string().nullable().optional(),
  image_id: z.string().nullable().optional(),
  message: z.string(),
});

const predictErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error_code: z.string(),
  errors: z.array(predictErrorDetailSchema).optional(),
});

const INFERENCE_TIMEOUT_MS = 120_000;

const STATUS_MESSAGES: Record<number, string> = {
  401: "Inference service rejected the request credentials",
  404: "An image could not be fetched by the inference service",
  413: "An image exceeds the inference service size ceiling",
  415: "An image could not be decoded by the inference service",
  422: "The inference request was invalid",
  429: "The inference service is at capacity, try again later",
  500: "The inference service hit an unexpected error",
  503: "The inference service has no model loaded",
  504: "Inference exceeded the deadline",
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Strip anything that looks like a URL before logging/surfacing errors. */
function sanitizeMessage(message: string): string {
  return message.replace(/https?:\/\/\S+/g, "[redacted-url]");
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeFailure(status: number, payload: unknown): PredictOutcome {
  const parsed = predictErrorSchema.safeParse(payload);
  if (parsed.success) {
    return {
      success: false,
      code: parsed.data.error_code,
      message: sanitizeMessage(parsed.data.message),
      errors: parsed.data.errors,
    };
  }
  return {
    success: false,
    code: `HTTP_${status}`,
    message: STATUS_MESSAGES[status] ?? "The inference service returned an unexpected error",
  };
}

/**
 * Call the Physis inference service.
 *
 * No automatic retry: retrying may duplicate expensive GPU inference.
 * Timeout is configurable to survive Modal cold start + download + inference.
 */
export async function predictStudy(
  request: PredictRequest,
  timeoutMs: number = INFERENCE_TIMEOUT_MS,
): Promise<PredictOutcome> {
  const baseUrl = getEnv("PHYSIS_INFERENCE_BASE_URL").replace(/\/+$/, "");
  const apiKey = getEnv("PHYSIS_INFERENCE_API_KEY");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/v1/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const text = await response.text();
    const payload = parseJson(text);

    if (!response.ok) {
      return normalizeFailure(response.status, payload);
    }

    const parsed = predictResponseSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        code: "INVALID_RESPONSE",
        message: "The inference service returned an unexpected response format",
      };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        success: false,
        code: "INFERENCE_TIMEOUT",
        message: "Inference request timed out",
      };
    }
    return {
      success: false,
      code: "INTERNAL_ERROR",
      message: "Inference request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}
