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
 *
 * `compact` renders label + explicit "P<percentile>" on one line, avoiding the
 * ambiguous "Critical 100.0%" label-vs-percentile pairing. The percentile is
 * shown as P<value> (e.g. P100) so it is never read as a probability/confidence.
 */
export function PriorityBadge({
  percentile,
  compact = false,
}: {
  percentile: number | null;
  compact?: boolean;
}) {
  const level = getPriorityLevel(percentile);
  const label = getPriorityLabel(level);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge className={priorityClassName[level]}>{label}</Badge>
        {percentile !== null && (
          <span className="font-mono text-xs text-muted-foreground">
            · P{Math.round(percentile)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Badge className={priorityClassName[level]}>{label}</Badge>
      {percentile !== null && (
        <span className="font-mono text-xs text-muted-foreground">
          · {percentile.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// Domain-semantic colors: hardcoded intentionally per design-tokens.md allowed exception
const priorityClassName: Record<PriorityLevel, string> = {
  critical:
    "bg-red-100 text-red-800 hover:bg-red-100",
  high: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  standard:
    "bg-secondary text-secondary-foreground hover:bg-secondary",
  unscored:
    "bg-muted text-muted-foreground hover:bg-muted",
};
