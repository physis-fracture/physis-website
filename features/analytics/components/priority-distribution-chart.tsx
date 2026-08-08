"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type PriorityDistribution = {
  critical: number;
  high: number;
  standard: number;
  unscored: number;
};

// Domain-severity palette, consistent with priority-badge.tsx:
// Critical = red, High = amber, Standard = neutral, Unscored = muted.
const chartConfig = {
  critical: {
    label: "Critical",
    theme: { light: "#dc2626", dark: "#ef4444" },
  },
  high: {
    label: "High",
    theme: { light: "#d97706", dark: "#f59e0b" },
  },
  standard: {
    label: "Standard",
    theme: { light: "#64748b", dark: "#94a3b8" },
  },
  unscored: {
    label: "Unscored",
    theme: { light: "#a1a1aa", dark: "#71717a" },
  },
} satisfies ChartConfig;

const ORDER = ["critical", "high", "standard", "unscored"] as const;

export function PriorityDistributionChart({
  distribution,
}: {
  distribution: PriorityDistribution;
}) {
  const data = ORDER.map((key) => ({
    level: chartConfig[key].label,
    count: distribution[key],
    fill: `var(--color-${key})`,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 32 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="level"
          width={88}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={({ x, y, payload }) => {
            const row = data.find((d) => d.level === payload.value);
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="end"
                  className="fill-muted-foreground"
                >
                  {payload.value}
                  <tspan dx={8} className="fill-foreground font-medium tabular-nums">
                    {row?.count ?? 0}
                  </tspan>
                </text>
              </g>
            );
          }}
        />
        <ChartTooltip content={<ChartTooltipContent nameKey="level" />} />
        <Bar dataKey="count" radius={4} barSize={24}>
          {data.map((row) => (
            <Cell key={row.level} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
