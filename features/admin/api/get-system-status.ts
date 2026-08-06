import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export interface SystemStatus {
  lastInference: {
    modelVersion: string | null;
    completedAt: string | null;
    inferenceTimeMs: number | null;
  };
  performance: {
    totalRuns: number;
    successCount: number;
    failureCount: number;
    avgInferenceTimeMs: number;
  };
}

interface SystemStatusPayload {
  lastInference?: {
    modelVersion?: Json;
    completedAt?: Json;
    inferenceTimeMs?: Json;
  } | null;
  performance?: {
    totalRuns?: Json;
    successCount?: Json;
    failureCount?: Json;
    avgInferenceTimeMs?: Json;
  } | null;
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_system_status");

  if (error) {
    throw new Error(`Failed to load system status: ${error.message}`);
  }

  const payload = (data ?? {}) as SystemStatusPayload;
  const lastInference = payload.lastInference ?? {};
  const performance = payload.performance ?? {};

  return {
    lastInference: {
      modelVersion:
        typeof lastInference.modelVersion === "string"
          ? lastInference.modelVersion
          : null,
      completedAt:
        typeof lastInference.completedAt === "string"
          ? lastInference.completedAt
          : null,
      inferenceTimeMs:
        typeof lastInference.inferenceTimeMs === "number"
          ? lastInference.inferenceTimeMs
          : null,
    },
    performance: {
      totalRuns:
        typeof performance.totalRuns === "number" ? performance.totalRuns : 0,
      successCount:
        typeof performance.successCount === "number"
          ? performance.successCount
          : 0,
      failureCount:
        typeof performance.failureCount === "number"
          ? performance.failureCount
          : 0,
      avgInferenceTimeMs:
        typeof performance.avgInferenceTimeMs === "number"
          ? performance.avgInferenceTimeMs
          : 0,
    },
  };
}
