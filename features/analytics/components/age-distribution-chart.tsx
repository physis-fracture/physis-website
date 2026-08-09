"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const BANDS = ["0-4", "5-9", "10-14", "15-19"] as const;

const chartConfig = {
  count: {
    label: "Studies",
    theme: { light: "#06b6d4" },
  },
} satisfies ChartConfig;

export function AgeDistributionChart({
  distribution,
}: {
  distribution: Record<string, number>;
}) {
  const data = BANDS.map((band) => ({
    band,
    count: distribution[band] ?? 0,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[190px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 28, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="band"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis hide domain={[0, "dataMax"]} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent nameKey="band" />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4}>
          <LabelList
            dataKey="count"
            position="top"
            offset={8}
            className="fill-muted-foreground"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
