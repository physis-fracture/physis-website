export type WorklistQuery = {
  q?: string;
  status?: string[];
  priority?: string[];
  sex?: string[];
  minAge?: number;
  maxAge?: number;
  view?: string[];
  from?: string;
  to?: string;
  sort?: "priority_desc" | "waiting_desc" | "newest" | "oldest";
  page?: number;
};

const VALID_SORTS = ["priority_desc", "waiting_desc", "newest", "oldest"];
const VALID_STATUSES = [
  "draft",
  "uploading",
  "queued",
  "processing",
  "ready",
  "ai_failed",
  "reviewed",
];
const VALID_PRIORITIES = ["critical", "high", "standard", "unscored"];

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(",").filter(Boolean);
}

export function parseWorklistQuery(
  params: Record<string, string | string[] | undefined>
): WorklistQuery {
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = toArray(params.status).filter((s) =>
    VALID_STATUSES.includes(s)
  );
  const priority = toArray(params.priority).filter((p) =>
    VALID_PRIORITIES.includes(p)
  );
  const sex = toArray(params.sex);
  const view = toArray(params.view);
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  const rawSort = typeof params.sort === "string" ? params.sort : undefined;
  const sort = VALID_SORTS.includes(rawSort ?? "")
    ? (rawSort as WorklistQuery["sort"])
    : "priority_desc";

  const rawPage = typeof params.page === "string" ? parseInt(params.page) : 1;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawMinAge =
    typeof params.minAge === "string" ? parseFloat(params.minAge) : undefined;
  const minAge =
    rawMinAge !== undefined && Number.isFinite(rawMinAge)
      ? rawMinAge
      : undefined;

  const rawMaxAge =
    typeof params.maxAge === "string" ? parseFloat(params.maxAge) : undefined;
  const maxAge =
    rawMaxAge !== undefined && Number.isFinite(rawMaxAge)
      ? rawMaxAge
      : undefined;

  return { q, status, priority, sex, view, from, to, sort, page, minAge, maxAge };
}
