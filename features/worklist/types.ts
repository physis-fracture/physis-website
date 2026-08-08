export type WorklistRow = {
  id: string;
  studyCode: string;
  patientRef: string | null;
  ageYears: number;
  sex: string;
  status: string;
  arrivedAt: string;
  createdAt: string;
  updatedAt: string;
  views: string[];
  priorityPercentile: number | null;
  triageScore: number | null;
};

export type PriorityLevel = "critical" | "high" | "standard" | "unscored";

export function getPriorityLevel(percentile: number | null): PriorityLevel {
  if (percentile === null) return "unscored";
  if (percentile >= 95) return "critical";
  if (percentile >= 80) return "high";
  return "standard";
}

export function getPriorityLabel(level: PriorityLevel): string {
  switch (level) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "standard":
      return "Standard";
    case "unscored":
      return "Unscored";
  }
}
