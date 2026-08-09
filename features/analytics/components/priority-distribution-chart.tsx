"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
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

const chartConfig = {
  count: {
    label: "Studies",
    theme: { light: "#06b6d4" },
  },
} satisfies ChartConfig;

const ORDER = ["critical", "high", "standard", "unscored"] as const;

const LEVEL_LABELS: Record<keyof PriorityDistribution, string> = {
  critical: "Critical",
  high: "High",
  standard: "Standard",
  unscored: "Unscored",
};

export function PriorityDistributionChart({
  distribution,
}: {
  distribution: PriorityDistribution;
}) {
  const data = ORDER.map((key) => ({
    level: LEVEL_LABELS[key],
    count: distribution[key],
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
        <Bar dataKey="count" fill="var(--color-count)" radius={4} barSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
