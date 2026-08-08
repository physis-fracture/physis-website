"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { WorklistRow } from "@/features/worklist/types";
import type { WorklistQuery } from "@/features/worklist/schemas/worklist-query";
import { formatRelativeTime } from "@/features/worklist/utils/relative-time";

export function WorklistTable({
  rows,
  totalCount,
  page,
  pageSize,
  query,
}: {
  rows: WorklistRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  query: WorklistQuery;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const hasFilters = Boolean(query.q) || (query.status?.length ?? 0) > 0;

  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      searchTimeout.current = setTimeout(() => {
        updateParams({ q: value || undefined, page: "1" });
      }, 400);
    },
    [updateParams],
  );

  const handleRowSelect = (studyId: string) => {
    router.push(`/worklist/${studyId}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <InputGroup className="max-w-sm">
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            key={query.q ?? ""}
            type="search"
            placeholder="Search study ID or patient ref..."
            defaultValue={query.q ?? ""}
            aria-label="Search studies"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </InputGroup>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/worklist")}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead>Study ID</TableHead>
              <TableHead className="w-[60px]">Age</TableHead>
              <TableHead className="w-[60px]">Sex</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Waiting</TableHead>
              <TableHead className="text-right">Percentile</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Empty className="py-12">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Search />
                      </EmptyMedia>
                      <EmptyTitle>
                        {hasFilters ? "No matching studies" : "No studies yet"}
                      </EmptyTitle>
                      <EmptyDescription>
                        {hasFilters
                          ? "No studies match the current filters."
                          : "No studies have been submitted yet."}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      {hasFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push("/worklist")}
                        >
                          Clear filters
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/studies/new">New Study</Link>
                        </Button>
                      )}
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  aria-label={`Open study ${row.studyCode}`}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  onClick={() => handleRowSelect(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRowSelect(row.id);
                    }
                  }}
                >
                  <TableCell>
                    <PriorityBadge percentile={row.priorityPercentile} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.studyCode}
                  </TableCell>
                  <TableCell>{row.ageYears}y</TableCell>
                  <TableCell className="capitalize">{row.sex}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {row.views.map((v, i) => (
                        <Badge key={`${v}-${i}`} variant="secondary" className="text-xs">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatRelativeTime(row.arrivedAt)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {row.priorityPercentile !== null
                      ? `${row.priorityPercentile.toFixed(1)}%`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {row.triageScore !== null
                      ? row.triageScore.toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalCount)} of {totalCount} studies
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
