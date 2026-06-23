"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { ABCChart, DemandSummaryChart, ExpiryRiskChart } from "@/components/charts/analytics-charts";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import { exportToCSV, exportToPDF, cn } from "@/lib/utils";
import type { ABCAnalysisRow, DemandSummary, ExpiryRiskRow, ReorderRecommendation } from "@/types/bi";
import type { SupplierPerformanceRow } from "@/types/reports";

const reorderColumns: DataColumn<ReorderRecommendation>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Category", cell: (row) => <StatusBadge value={row.ItemCategory} /> },
  { header: "Current", cell: (row) => row.CurrentStock ?? 0 },
  { header: "Average Monthly", cell: (row) => row.AverageMonthlyUsage ?? 0 },
  { header: "Lead Time", cell: (row) => `${row.LeadTimeDays ?? 0} days` },
  { header: "Recommended", cell: (row) => row.RecommendedReorderQuantity ?? 0 },
];

const reorderExportColumns = [
  { header: "Item Name", key: "ItemName" as keyof ReorderRecommendation },
  { header: "Category", key: "ItemCategory" as keyof ReorderRecommendation },
  { header: "Current Stock", key: "CurrentStock" as keyof ReorderRecommendation },
  { header: "Average Monthly Usage", key: "AverageMonthlyUsage" as keyof ReorderRecommendation },
  { header: "Lead Time (Days)", key: "LeadTimeDays" as keyof ReorderRecommendation },
  { header: "Recommended Reorder Qty", key: "RecommendedReorderQuantity" as keyof ReorderRecommendation },
];

const supplierColumns: DataColumn<SupplierPerformanceRow>[] = [
  { header: "Supplier", cell: (row) => row.SupplierName },
  { header: "Orders", cell: (row) => row.TotalOrders ?? 0 },
  { header: "Completed", cell: (row) => row.CompletedOrders ?? 0 },
  { header: "Cancelled", cell: (row) => row.CancelledOrders ?? 0 },
  { header: "Delayed", cell: (row) => row.DelayedOrders ?? 0 },
  { header: "Lead Time", cell: (row) => `${row.AverageLeadTimeDays ?? 0} days` },
];

const supplierExportColumns = [
  { header: "Supplier Name", key: "SupplierName" as keyof SupplierPerformanceRow },
  { header: "Total Orders", key: "TotalOrders" as keyof SupplierPerformanceRow },
  { header: "Completed Orders", key: "CompletedOrders" as keyof SupplierPerformanceRow },
  { header: "Cancelled Orders", key: "CancelledOrders" as keyof SupplierPerformanceRow },
  { header: "Delayed Orders", key: "DelayedOrders" as keyof SupplierPerformanceRow },
  { header: "Avg Lead Time (Days)", key: "AverageLeadTimeDays" as keyof SupplierPerformanceRow },
];

export default function AnalyticsPage() {
  const [demand, setDemand] = useState<DemandSummary[]>([]);
  const [abc, setAbc] = useState<ABCAnalysisRow[]>([]);
  const [expiry, setExpiry] = useState<ExpiryRiskRow[]>([]);
  const [reorder, setReorder] = useState<ReorderRecommendation[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recalculating, setRecalculating] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [demandData, abcData, expiryData, reorderData, supplierData] = await Promise.all([
        api.get<DemandSummary[]>("/bi/demand-summary"),
        api.get<ABCAnalysisRow[]>("/bi/abc-analysis"),
        api.get<ExpiryRiskRow[]>("/bi/expiry-risk"),
        api.get<ReorderRecommendation[]>("/bi/reorder-recommendations"),
        api.get<SupplierPerformanceRow[]>("/reports/supplier-performance"),
      ]);
      setDemand(demandData ?? []);
      setAbc(abcData ?? []);
      setExpiry(expiryData ?? []);
      setReorder(reorderData ?? []);
      setSuppliers(supplierData ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRecalculate() {
    setRecalculating(true);
    try {
      await api.post("/bi/refresh", {});
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Demand analysis, stock classification, expiry risk, and supplier performance."
        action={
          <Button variant="outline" onClick={handleRecalculate} disabled={recalculating || loading}>
            <RefreshCw className={cn("mr-1 size-3.5", recalculating && "animate-spin")} />
            {recalculating ? "Recalculating..." : "Recalculate Recommendations"}
          </Button>
        }
      />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load analytics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Demand summary</CardTitle>
            <CardDescription>Highest issued quantities across all inventory items.</CardDescription>
          </CardHeader>
          <CardContent>{loading ? <div className="h-72" /> : <DemandSummaryChart data={demand} />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ABC classification</CardTitle>
            <CardDescription>Inventory items grouped by ABC classification.</CardDescription>
          </CardHeader>
          <CardContent>{loading ? <div className="h-72" /> : <ABCChart data={abc} />}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expiry risk</CardTitle>
            <CardDescription>Number of batches at each expiry risk level.</CardDescription>
          </CardHeader>
          <CardContent>{loading ? <div className="h-72" /> : <ExpiryRiskChart data={expiry} />}</CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle>Reorder recommendations</CardTitle>
              <CardDescription>Recommended reorder quantities based on demand patterns.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => exportToCSV(reorder, reorderExportColumns, "reorder-recommendations.csv")}>
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportToPDF("Reorder Recommendations Report", reorder, reorderExportColumns)}>
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={reorderColumns} data={reorder} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle>Supplier performance</CardTitle>
              <CardDescription>Supplier delivery and order fulfillment metrics.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => exportToCSV(suppliers, supplierExportColumns, "supplier-performance.csv")}>
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportToPDF("Supplier Performance Report", suppliers, supplierExportColumns)}>
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={supplierColumns} data={suppliers} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
