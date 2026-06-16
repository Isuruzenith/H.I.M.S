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

const COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];

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
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="item" tickLine={false} axisLine={false} interval={0} angle={-20} height={70} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="issued" fill="var(--primary)" radius={[6, 6, 0, 0]} />
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
          <Pie data={counts} dataKey="count" nameKey="category" outerRadius={90} label>
            {counts.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
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
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="risk" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="batches" fill="var(--primary)" radius={[6, 6, 0, 0]} />
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
