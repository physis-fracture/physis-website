"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { WorklistRow } from "@/features/worklist/types";
import { formatRelativeTime } from "@/features/worklist/utils/relative-time";

export function RecentStudiesTable({ rows }: { rows: WorklistRow[] }) {
  const router = useRouter();

  const openStudy = (studyId: string) => {
    router.push(`/worklist/${studyId}`);
  };

  return (
    <TooltipProvider delayDuration={300}>
      {rows.length === 0 ? (
        <div className="rounded-md border">
          <Empty className="py-12">
            <EmptyContent>
              <EmptyTitle>No studies yet</EmptyTitle>
              <EmptyDescription>
                Create a new study to start triage.
              </EmptyDescription>
              <Button variant="outline" size="sm" asChild>
                <Link href="/studies/new">New Study</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Study</TableHead>
                <TableHead className="w-[60px]">Age</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  aria-label={`Open study ${row.studyCode}`}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  onClick={() => openStudy(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openStudy(row.id);
                    }
                  }}
                >
                  <TableCell className="font-medium">{row.studyCode}</TableCell>
                  <TableCell>{row.ageYears}y</TableCell>
                  <TableCell>
                    <PriorityBadge percentile={row.priorityPercentile} compact />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.triageScore !== null ? row.triageScore.toFixed(2) : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="whitespace-nowrap tabular-nums">
                          {formatRelativeTime(row.createdAt)} ago
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {new Date(row.createdAt).toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </TooltipProvider>
  );
}
