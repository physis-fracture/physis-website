import { Badge } from "@/components/ui/badge";
import {
  getPriorityLevel,
  getPriorityLabel,
  type PriorityLevel,
} from "@/features/worklist/types";

/**
 * Priority badge with label + percentile.
 * Uses hardcoded domain-semantic colors (PRD Section 25):
 * Critical = red, High = amber, Standard = neutral, Unscored = muted.
 */
export function PriorityBadge({
  percentile,
}: {
  percentile: number | null;
}) {
  const level = getPriorityLevel(percentile);
  const label = getPriorityLabel(level);

  return (
    <div className="flex flex-col gap-0.5">
      <Badge className={priorityClassName[level]}>
        {label}
      </Badge>
      {percentile !== null && (
        <span className="text-xs text-muted-foreground font-mono">
          {percentile.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// Domain-semantic colors: hardcoded intentionally per design-tokens.md allowed exception
const priorityClassName: Record<PriorityLevel, string> = {
  critical:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100",
  high: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100",
  standard:
    "bg-secondary text-secondary-foreground hover:bg-secondary",
  unscored:
    "bg-muted text-muted-foreground hover:bg-muted",
};
