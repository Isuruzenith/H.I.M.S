"use client";

import { useEffect, useState } from "react";

import { ABCChart, DemandSummaryChart, ExpiryRiskChart } from "@/components/charts/analytics-charts";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
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

const supplierColumns: DataColumn<SupplierPerformanceRow>[] = [
  { header: "Supplier", cell: (row) => row.SupplierName },
  { header: "Orders", cell: (row) => row.TotalOrders ?? 0 },
  { header: "Completed", cell: (row) => row.CompletedOrders ?? 0 },
  { header: "Cancelled", cell: (row) => row.CancelledOrders ?? 0 },
  { header: "Delayed", cell: (row) => row.DelayedOrders ?? 0 },
  { header: "Lead Time", cell: (row) => `${row.AverageLeadTimeDays ?? 0} days` },
];

export default function AnalyticsPage() {
  const [demand, setDemand] = useState<DemandSummary[]>([]);
  const [abc, setAbc] = useState<ABCAnalysisRow[]>([]);
  const [expiry, setExpiry] = useState<ExpiryRiskRow[]>([]);
  const [reorder, setReorder] = useState<ReorderRecommendation[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    load();
  }, []);

  return (
    <>
      <PageHeader title="Analytics" description="Demand analysis, stock classification, expiry risk, and supplier performance." />
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
          <CardHeader>
            <CardTitle>Reorder recommendations</CardTitle>
            <CardDescription>Recommended reorder quantities based on demand patterns.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={reorderColumns} data={reorder} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supplier performance</CardTitle>
            <CardDescription>Supplier delivery and order fulfillment metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={supplierColumns} data={suppliers} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
