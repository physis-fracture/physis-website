export const MIN_AGE_YEARS = 0.2;
export const MAX_AGE_YEARS = 19.0;

export const SUPPORTED_VIEWS = [
  "PA",
  "AP",
  "LATERAL",
  "OTHER",
  "UNKNOWN",
] as const;

export const SUPPORTED_LATERALITY = ["left", "right", "unknown"] as const;

export const LATERALITY_LABELS: Record<
  (typeof SUPPORTED_LATERALITY)[number],
  string
> = {
  left: "Left",
  right: "Right",
  unknown: "Unknown",
};
