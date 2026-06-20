"use client";

import { useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { StockTransaction } from "@/types/stock";

const TOOLTIP_STYLE = {
  borderRadius: "6px",
  border: "1px solid var(--border)",
  fontSize: "12px",
};

export function MonthlyIssueChart({ transactions }: { transactions: StockTransaction[] }) {
  const mounted = useIsClient();
  const data = buildMonthlyData(transactions);

  if (!mounted) {
    return <div className="h-72 min-h-72 min-w-0 w-full" />;
  }

  return (
    <div className="h-72 min-h-72 min-w-0 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="quantity" fill="var(--chart-2)" radius={[3, 3, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
}

function buildMonthlyData(transactions: StockTransaction[]) {
  const months = new Map<string, number>();

  transactions
    .filter((row) => row.TransactionType === "DEPARTMENT_ISSUE")
    .forEach((row) => {
      const date = row.TransactionDate ? new Date(row.TransactionDate) : new Date();
      const key = date.toLocaleString("en-US", { month: "short" });
      months.set(key, (months.get(key) ?? 0) + Number(row.Quantity ?? 0));
    });

  return Array.from(months.entries()).map(([month, quantity]) => ({ month, quantity }));
}
