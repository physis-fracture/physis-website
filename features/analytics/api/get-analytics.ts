import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export interface AnalyticsData {
  studiesByStatus: Record<string, number>;
  reviewsByOutcome: Record<string, number>;
  inferenceStats: {
    totalRuns: number;
    successCount: number;
    failureCount: number;
    avgInferenceTimeMs: number;
  };
  priorityDistribution: {
    critical: number;
    high: number;
    standard: number;
    unscored: number;
  };
  ageDistribution: {
    "0-4": number;
    "5-9": number;
    "10-14": number;
    "15-19": number;
    "20-25": number;
  };
}

interface AnalyticsPayload {
  studiesByStatus?: Record<string, Json> | null;
  reviewsByOutcome?: Record<string, Json> | null;
  inferenceStats?: {
    totalRuns?: Json;
    successCount?: Json;
    failureCount?: Json;
    avgInferenceTimeMs?: Json;
  } | null;
  priorityDistribution?: {
    critical?: Json;
    high?: Json;
    standard?: Json;
    unscored?: Json;
  } | null;
  ageDistribution?: {
    "0-4"?: Json;
    "5-9"?: Json;
    "10-14"?: Json;
    "15-19"?: Json;
    "20-25"?: Json;
  } | null;
}

const EMPTY_DISTRIBUTION = {
  critical: 0,
  high: 0,
  standard: 0,
  unscored: 0,
};

const EMPTY_AGE_DISTRIBUTION = {
  "0-4": 0,
  "5-9": 0,
  "10-14": 0,
  "15-19": 0,
  "20-25": 0,
};

function toCountRecord(record?: Record<string, Json> | null): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(record ?? {})) {
    if (typeof value === "number") {
      result[key] = value;
    }
  }
  return result;
}

function toCounts(source?: Record<string, Json> | null): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === "number") {
      counts[key] = value;
    }
  }
  return counts;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_analytics");

  if (error) {
    throw new Error(`Failed to load analytics: ${error.message}`);
  }

  const payload = (data ?? {}) as AnalyticsPayload;
  const inferenceStats = payload.inferenceStats ?? {};
  const priorityDistribution = payload.priorityDistribution ?? {};
  const ageDistribution = payload.ageDistribution ?? {};

  return {
    studiesByStatus: toCountRecord(payload.studiesByStatus),
    reviewsByOutcome: toCountRecord(payload.reviewsByOutcome),
    inferenceStats: {
      totalRuns:
        typeof inferenceStats.totalRuns === "number"
          ? inferenceStats.totalRuns
          : 0,
      successCount:
        typeof inferenceStats.successCount === "number"
          ? inferenceStats.successCount
          : 0,
      failureCount:
        typeof inferenceStats.failureCount === "number"
          ? inferenceStats.failureCount
          : 0,
      avgInferenceTimeMs:
        typeof inferenceStats.avgInferenceTimeMs === "number"
          ? inferenceStats.avgInferenceTimeMs
          : 0,
    },
    priorityDistribution: {
      ...EMPTY_DISTRIBUTION,
      ...toCounts(priorityDistribution),
    },
    ageDistribution: {
      ...EMPTY_AGE_DISTRIBUTION,
      ...toCounts(ageDistribution),
    },
  };
}
