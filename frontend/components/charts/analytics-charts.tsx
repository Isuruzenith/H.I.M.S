"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ABCAnalysisRow, DemandSummary, ExpiryRiskRow } from "@/types/bi";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const TOOLTIP_STYLE = {
  borderRadius: "6px",
  border: "1px solid var(--border)",
  fontSize: "12px",
};

const AXIS_TICK = { fontSize: 12, fill: "var(--muted-foreground)" };

export function DemandSummaryChart({ data }: { data: DemandSummary[] }) {
  const mounted = useChartMounted();
  const chartData = data.slice(0, 8).map((row) => ({
    item: row.ItemName ?? `Item ${row.ItemID}`,
    issued: Number(row.TotalIssuedQuantity ?? 0),
  }));

  if (!mounted) return <div className="h-72 min-h-72 min-w-0" />;

  return (
    <div className="h-72 min-h-72 min-w-0">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="item"
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-20}
            height={70}
            tick={AXIS_TICK}
          />
          <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="issued" fill="var(--chart-1)" radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ABCChart({ data }: { data: ABCAnalysisRow[] }) {
  const mounted = useChartMounted();
  const counts = ["A", "B", "C"].map((category) => ({
    category,
    count: data.filter((row) => row.ABCCategory === category).length,
  }));

  if (!mounted) return <div className="h-72 min-h-72 min-w-0" />;

  return (
    <div className="h-72 min-h-72 min-w-0">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={counts}
            dataKey="count"
            nameKey="category"
            outerRadius={90}
            label={(props) => {
              const entry = props as { category?: string; count?: number };
              return `${entry.category ?? ""}: ${entry.count ?? 0}`;
            }}
            labelLine={false}
          >
            {counts.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpiryRiskChart({ data }: { data: ExpiryRiskRow[] }) {
  const mounted = useChartMounted();
  const chartData = data.map((row) => ({
    risk: row.AlertLevel,
    batches: Number(row.BatchCount ?? 0),
  }));

  if (!mounted) return <div className="h-72 min-h-72 min-w-0" />;

  return (
    <div className="h-72 min-h-72 min-w-0">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="risk" tickLine={false} axisLine={false} tick={AXIS_TICK} />
          <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="batches" fill="var(--chart-4)" radius={[3, 3, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function useChartMounted() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
}
