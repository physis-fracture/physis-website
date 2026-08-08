import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { predictStudy, getInferenceHealth, type PredictRequest } from "./client";

const REQUEST: PredictRequest = {
  study_id: "study-1",
  age_years: 10,
  sex: "female",
  images: [
    {
      image_id: "img-1",
      image_url: "https://example.com/img.png",
      view: "PA",
      laterality: "left",
    },
  ],
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const SUCCESS_DATA = {
  success: true,
  message: "ok",
  data: {
    study_id: "study-1",
    triage_score: 0.85,
    priority_percentile: 92.5,
    age_band: "10-14",
    images: [
      {
        image_id: "img-1",
        triage_score: 0.85,
        valid_patch_fraction: 0.9,
        boxes: [[10, 20, 100, 200, 0.8]],
      },
    ],
    inference_time_ms: 1234,
    model_version: "v2",
  },
};

beforeEach(() => {
  process.env.PHYSIS_INFERENCE_BASE_URL = "https://inference.example.com";
  process.env.PHYSIS_INFERENCE_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.PHYSIS_INFERENCE_BASE_URL;
  delete process.env.PHYSIS_INFERENCE_API_KEY;
  vi.unstubAllGlobals();
});

describe("predictStudy", () => {
  it("parses a valid 200 response and sends bearer auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SUCCESS_DATA));
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await predictStudy(REQUEST);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://inference.example.com/v1/predict");
    expect(init.headers.Authorization).toBe("Bearer test-key");
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.data.data.priority_percentile).toBe(92.5);
      expect(outcome.data.data.triage_score).toBe(0.85);
      expect(outcome.data.data.images[0].boxes).toEqual([
        [10, 20, 100, 200, 0.8],
      ]);
    }
  });

  it("normalizes a 422 error from the envelope", async () => {
    const payload = {
      success: false,
      message: "age out of range",
      error_code: "VALIDATION_ERROR",
      errors: [{ field: "age_years", message: "must be between 0.2 and 19" }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(payload, 422)),
    );

    const outcome = await predictStudy(REQUEST);

    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.code).toBe("VALIDATION_ERROR");
      expect(outcome.message).toBe("age out of range");
      expect(outcome.errors?.[0].field).toBe("age_years");
    }
  });

  it("maps 401 to a readable message", async () => {
    const payload = {
      success: false,
      message: "invalid token",
      error_code: "UNAUTHORIZED",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(payload, 401)),
    );

    const outcome = await predictStudy(REQUEST);

    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.code).toBe("UNAUTHORIZED");
      expect(outcome.message).toBe("invalid token");
    }
  });

  it("handles non-JSON error bodies defensively", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Internal Server Error", { status: 500 })),
    );

    const outcome = await predictStudy(REQUEST);

    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.code).toBe("HTTP_500");
      expect(outcome.message).toContain("unexpected error");
    }
  });

  it("rejects a malformed success contract", async () => {
    const payload = { success: true, message: "ok", data: { study_id: "study-1" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));

    const outcome = await predictStudy(REQUEST);

    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.code).toBe("INVALID_RESPONSE");
    }
  });

  it("preserves boxes=[] and boxes=null", async () => {
    const payload = {
      success: true,
      message: "ok",
      data: {
        study_id: "study-1",
        triage_score: 0.5,
        priority_percentile: 50,
        age_band: "5-9",
        images: [
          { image_id: "a", triage_score: 0.5, valid_patch_fraction: 1, boxes: [] },
          { image_id: "b", triage_score: 0.5, valid_patch_fraction: 1, boxes: null },
        ],
        inference_time_ms: 1,
        model_version: "v2",
      },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(payload)));

    const outcome = await predictStudy(REQUEST);

    expect(outcome.success).toBe(true);
    if (outcome.success) {
      const images = outcome.data.data.images;
      expect(images[0].boxes).toEqual([]);
      expect(images[1].boxes).toBeNull();
    }
  });

  it("normalizes a timeout", async () => {
    const fetchMock = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await predictStudy(REQUEST, 50);

    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.code).toBe("INFERENCE_TIMEOUT");
    }
  });

  it("normalizes the base URL trailing slash", async () => {
    process.env.PHYSIS_INFERENCE_BASE_URL = "https://inference.example.com/";
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(SUCCESS_DATA));
    vi.stubGlobal("fetch", fetchMock);

    await predictStudy(REQUEST);

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://inference.example.com/v1/predict",
    );
  });

  it("sanitizes URLs in error messages", async () => {
    const payload = {
      success: false,
      message:
        "could not fetch https://presigned.example.com/x?X-Amz-Signature=abc",
      error_code: "FETCH_ERROR",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(payload, 404)),
    );

    const outcome = await predictStudy(REQUEST);

    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.message).not.toContain("X-Amz-Signature");
      expect(outcome.message).toContain("[redacted-url]");
    }
  });
});

describe("getInferenceHealth", () => {
  it("returns ok for a healthy service", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ status: "ok", contract_version: "v1" }),
      ),
    );

    await expect(getInferenceHealth()).resolves.toBe("ok");
  });

  it("returns model_unavailable when no model is loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ status: "model_unavailable", contract_version: "v1" }),
      ),
    );

    await expect(getInferenceHealth()).resolves.toBe("model_unavailable");
  });

  it("returns unreachable for a malformed payload", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ nope: 1 })));

    await expect(getInferenceHealth()).resolves.toBe("unreachable");
  });

  it("returns unreachable on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    );

    await expect(getInferenceHealth()).resolves.toBe("unreachable");
  });

  it("returns unreachable when the base URL is not configured", async () => {
    delete process.env.PHYSIS_INFERENCE_BASE_URL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getInferenceHealth()).resolves.toBe("unreachable");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
