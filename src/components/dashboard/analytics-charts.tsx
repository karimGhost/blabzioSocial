'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { month: 'January', engagement: 186 },
  { month: 'February', engagement: 305 },
  { month: 'March', engagement: 237 },
  { month: 'April', engagement: 273 },
  { month: 'May', engagement: 209 },
  { month: 'June', engagement: 214 },
];

const chartConfig = {
  engagement: {
    label: 'Engagement',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function AnalyticsCharts() {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="engagement" fill="var(--color-engagement)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
