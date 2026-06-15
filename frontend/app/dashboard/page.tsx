"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, Package, PackageMinus, Timer, Truck } from "lucide-react";

import { MonthlyIssueChart } from "@/components/charts/monthly-issue-chart";
import { AppShell } from "@/components/layout/app-shell";
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
    { label: "Total Items", value: summary.total_items ?? 0, icon: Package },
    { label: "Low Stock Items", value: summary.low_stock_items ?? lowStock.length, icon: PackageMinus },
    { label: "Expiring Soon Batches", value: summary.expiring_batches ?? expiring.length, icon: Timer },
    { label: "Expired Batches", value: expiredBatches, icon: AlertTriangle },
    { label: "Pending Purchase Orders", value: summary.pending_purchase_orders ?? 0, icon: Truck },
    { label: "Monthly Issued Quantity", value: summary.monthly_issued_quantity ?? 0, icon: ClipboardList },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Database-driven overview of pharmacy stock levels, expiry exposure, purchase orders, and monthly issue activity."
      />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>API unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl">{loading ? "..." : card.value}</CardTitle>
                </div>
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock preview</CardTitle>
            <CardDescription>Items below reorder levels from the SQL low-stock view.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={lowStockColumns} data={lowStock.slice(0, 6)} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expiring stock preview</CardTitle>
            <CardDescription>Near-expiry and expired batches from the expiry report view.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={expiryColumns} data={expiring.slice(0, 6)} loading={loading} />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly issue activity</CardTitle>
          <CardDescription>Recent department issue transactions grouped by month.</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyIssueChart transactions={transactions} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
