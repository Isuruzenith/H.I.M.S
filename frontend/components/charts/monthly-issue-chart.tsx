"use client";

import { useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { StockTransaction } from "@/types/stock";

export function MonthlyIssueChart({ transactions }: { transactions: StockTransaction[] }) {
  const mounted = useIsClient();
  const data = buildMonthlyData(transactions);

  if (!mounted) {
    return <div className="h-72 min-h-72 min-w-0 w-full" />;
  }

  return (
    <div className="h-72 min-h-72 min-w-0 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="quantity" fill="var(--primary)" radius={[6, 6, 0, 0]} />
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
