"use client";

import { useEffect, useState } from "react";

import { MonthlyIssueChart } from "@/components/charts/monthly-issue-chart";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import type { ExpiringSoonReportRow, LowStockReportRow } from "@/types/reports";
import type { StockTransaction } from "@/types/stock";

type Summary = Record<string, number>;

const lowStockColumns: DataColumn<LowStockReportRow>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Category", cell: (row) => <StatusBadge value={row.ItemCategory} /> },
  { header: "Current", cell: (row) => row.CurrentStock ?? 0 },
  { header: "Reorder", cell: (row) => row.ReorderLevel ?? 0 },
];

const expiryColumns: DataColumn<ExpiringSoonReportRow>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Batch", cell: (row) => row.BatchNumber },
  { header: "Available", cell: (row) => row.QuantityAvailable ?? 0 },
  { header: "Risk", cell: (row) => <StatusBadge value={row.AlertLevel} /> },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary>({});
  const [lowStock, setLowStock] = useState<LowStockReportRow[]>([]);
  const [expiring, setExpiring] = useState<ExpiringSoonReportRow[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summaryData, lowStockData, expiringData, transactionData] = await Promise.all([
          api.get<Summary>("/dashboard/summary"),
          api.get<LowStockReportRow[]>("/reports/low-stock"),
          api.get<ExpiringSoonReportRow[]>("/reports/expiring-soon"),
          api.get<StockTransaction[]>("/stock/transactions?limit=120"),
        ]);
        setSummary(summaryData ?? {});
        setLowStock(lowStockData ?? []);
        setExpiring(expiringData ?? []);
        setTransactions(transactionData ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
        setSummary({});
        setLowStock([]);
        setExpiring([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const expiredBatches = expiring.filter((row) => row.AlertLevel === "Expired").length;
  const cards = [
    { label: "Total Items", value: summary.total_items ?? 0 },
    { label: "Low Stock", value: summary.low_stock_items ?? lowStock.length },
    { label: "Expiring Soon", value: summary.expiring_batches ?? expiring.length },
    { label: "Expired Batches", value: expiredBatches, alert: expiredBatches > 0 },
    { label: "Pending Orders", value: summary.pending_purchase_orders ?? 0 },
    { label: "Monthly Issued", value: summary.monthly_issued_quantity ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of inventory levels, expiry status, procurement, and stock movement."
      />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Connection error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <Card key={card.label} className={card.alert ? "border-destructive/30" : undefined}>
            <CardContent className="py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <p
                className={`mt-1 text-2xl font-semibold tabular-nums ${card.alert ? "text-destructive" : "text-foreground"}`}
              >
                {loading ? "—" : card.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Items currently below their reorder threshold.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={lowStockColumns} data={lowStock.slice(0, 6)} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expiry Alerts</CardTitle>
            <CardDescription>Batches approaching or past their expiry date.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={expiryColumns} data={expiring.slice(0, 6)} loading={loading} />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly Stock Issues</CardTitle>
          <CardDescription>Quantity issued to departments, grouped by month.</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyIssueChart transactions={transactions} />
        </CardContent>
      </Card>
    </>
  );
}
