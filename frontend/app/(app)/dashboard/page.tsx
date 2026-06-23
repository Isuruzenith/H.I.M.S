"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { MonthlyIssueChart } from "@/components/charts/monthly-issue-chart";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import type { LowStockReportRow } from "@/types/reports";
import type { StockTransaction } from "@/types/stock";

type Summary = Record<string, number>;

interface ExpiryAlertRow {
  AlertID: number;
  BatchID: number;
  ItemID: number;
  ItemName: string;
  BatchNumber: string;
  AlertDate: string;
  ExpiryDate: string;
  AlertType: string;
  AlertStatus: string;
}

const lowStockColumns: DataColumn<LowStockReportRow>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Category", cell: (row) => <StatusBadge value={row.ItemCategory} /> },
  { header: "Current", cell: (row) => row.CurrentStock ?? 0 },
  { header: "Reorder", cell: (row) => row.ReorderLevel ?? 0 },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary>({});
  const [lowStock, setLowStock] = useState<LowStockReportRow[]>([]);
  const [alerts, setAlerts] = useState<ExpiryAlertRow[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryData, lowStockData, alertsData, transactionData] = await Promise.all([
        api.get<Summary>("/dashboard/summary"),
        api.get<LowStockReportRow[]>("/reports/low-stock"),
        api.get<ExpiryAlertRow[]>("/expiry-alerts?status=Open"),
        api.get<StockTransaction[]>("/stock/transactions?limit=120"),
      ]);
      setSummary(summaryData ?? {});
      setLowStock(lowStockData ?? []);
      setAlerts(alertsData ?? []);
      setTransactions(transactionData ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setSummary({});
      setLowStock([]);
      setAlerts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleResolveAlert = async (alertId: number) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/expiry-alerts/${alertId}/resolve`);
      setSuccess("Expiry alert resolved successfully and batch cleared.");
      // Reload dashboard data
      const alertsData = await api.get<ExpiryAlertRow[]>("/expiry-alerts?status=Open");
      setAlerts(alertsData ?? []);
      const summaryData = await api.get<Summary>("/dashboard/summary");
      setSummary(summaryData ?? {});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const expiryColumns = useMemo<DataColumn<ExpiryAlertRow>[]>(
    () => [
      { header: "Item", cell: (row) => row.ItemName },
      { header: "Batch", cell: (row) => row.BatchNumber },
      {
        header: "Expiry Date",
        cell: (row) => (row.ExpiryDate ? new Date(row.ExpiryDate).toLocaleDateString() : "-"),
      },
      { header: "Risk Level", cell: (row) => <StatusBadge value={row.AlertType} /> },
      {
        header: "Actions",
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs flex items-center gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            disabled={actionLoading}
            onClick={() => void handleResolveAlert(row.AlertID)}
          >
            <CheckCircle2 className="size-3" /> Resolve
          </Button>
        ),
      },
    ],
    [actionLoading]
  );

  const expiredCount = alerts.filter((row) => row.AlertType === "Expired").length;
  const expiringSoonCount = alerts.filter((row) => ["Critical", "Warning"].includes(row.AlertType)).length;

  const cards = [
    { label: "Total Items", value: summary.total_items ?? 0 },
    { label: "Low Stock", value: summary.low_stock_items ?? lowStock.length },
    { label: "Expiring Soon", value: expiringSoonCount, alert: expiringSoonCount > 0 },
    { label: "Expired Batches", value: expiredCount, alert: expiredCount > 0 },
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
      {success ? (
        <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <AlertTitle>Action Completed</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <Card key={card.label} className={card.alert ? "border-destructive/30 bg-destructive/5" : undefined}>
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
            <CardDescription>Active alerts for batches approaching or past their expiry date.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={expiryColumns} data={alerts.slice(0, 6)} loading={loading} />
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
