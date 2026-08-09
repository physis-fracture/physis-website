"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const OUTCOMES = [
  { key: "fracture", label: "Fracture" },
  { key: "no_fracture", label: "No Fracture" },
  { key: "uncertain", label: "Uncertain" },
] as const;

const chartConfig = {
  count: {
    label: "Reviews",
    theme: { light: "#06b6d4" },
  },
} satisfies ChartConfig;

export function ReviewOutcomesChart({
  outcomes,
}: {
  outcomes: Record<string, number>;
}) {
  const data = OUTCOMES.map(({ key, label }) => ({
    outcome: label,
    count: outcomes[key] ?? 0,
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
          dataKey="outcome"
          width={104}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={({ x, y, payload }) => {
            const row = data.find((d) => d.outcome === payload.value);
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
        <ChartTooltip content={<ChartTooltipContent nameKey="outcome" />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} barSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
