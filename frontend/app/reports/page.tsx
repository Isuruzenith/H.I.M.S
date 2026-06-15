"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, getErrorMessage } from "@/lib/api";
import type {
  DepartmentConsumptionRow,
  ExpiringSoonReportRow,
  LowStockReportRow,
} from "@/types/reports";
import type { StockTransaction } from "@/types/stock";

const lowColumns: DataColumn<LowStockReportRow>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Category", cell: (row) => <StatusBadge value={row.ItemCategory} /> },
  { header: "Current", cell: (row) => row.CurrentStock ?? 0 },
  { header: "Reorder", cell: (row) => row.ReorderLevel ?? 0 },
  { header: "Recommended", cell: (row) => row.RecommendedReorderQuantity ?? 0 },
  { header: "Status", cell: (row) => <StatusBadge value={row.StockStatus} /> },
];

const expiringColumns: DataColumn<ExpiringSoonReportRow>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Batch", cell: (row) => row.BatchNumber },
  { header: "Available", cell: (row) => row.QuantityAvailable },
  { header: "Expiry", cell: (row) => formatDate(row.ExpiryDate) },
  { header: "Days", cell: (row) => row.DaysToExpiry ?? "-" },
  { header: "Alert", cell: (row) => <StatusBadge value={row.AlertLevel} /> },
];

const departmentColumns: DataColumn<DepartmentConsumptionRow>[] = [
  { header: "Department", cell: (row) => row.DepartmentName },
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Month", cell: (row) => `${row.UsageMonth ?? "-"} / ${row.UsageYear ?? "-"}` },
  { header: "Issued", cell: (row) => row.TotalIssuedQuantity },
];

const transactionColumns: DataColumn<StockTransaction>[] = [
  { header: "Transaction", cell: (row) => `TX-${row.TransactionID}` },
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Batch", cell: (row) => row.BatchNumber ?? "-" },
  { header: "Type", cell: (row) => <StatusBadge value={row.TransactionType} /> },
  { header: "Quantity", cell: (row) => row.Quantity },
  { header: "Date", cell: (row) => formatDate(row.TransactionDate) },
  { header: "Staff", cell: (row) => row.StaffName ?? "-" },
];

export default function ReportsPage() {
  const [lowStock, setLowStock] = useState<LowStockReportRow[]>([]);
  const [expiring, setExpiring] = useState<ExpiringSoonReportRow[]>([]);
  const [department, setDepartment] = useState<DepartmentConsumptionRow[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [low, exp, dept, tx] = await Promise.all([
          api.get<LowStockReportRow[]>("/reports/low-stock"),
          api.get<ExpiringSoonReportRow[]>("/reports/expiring-soon"),
          api.get<DepartmentConsumptionRow[]>("/reports/department-consumption"),
          api.get<StockTransaction[]>("/reports/stock-transactions"),
        ]);
        setLowStock(low ?? []);
        setExpiring(exp ?? []);
        setDepartment(dept ?? []);
        setTransactions(tx ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell>
      <PageHeader title="Reports" description="Operational reports backed by SQL Server views and transaction history." />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load reports</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Tabs defaultValue="low-stock">
        <TabsList className="mb-4 flex w-full flex-wrap justify-start sm:w-fit">
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="department">Department Consumption</TabsTrigger>
          <TabsTrigger value="transactions">Stock Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="low-stock">
          <ReportCard title="Low stock" description="Items below reorder level.">
            <DataTable columns={lowColumns} data={lowStock} loading={loading} />
          </ReportCard>
        </TabsContent>
        <TabsContent value="expiring">
          <ReportCard title="Expiring soon" description="Batches grouped by expiry alert level.">
            <DataTable columns={expiringColumns} data={expiring} loading={loading} />
          </ReportCard>
        </TabsContent>
        <TabsContent value="department">
          <ReportCard title="Department consumption" description="Department-wise issued stock totals.">
            <DataTable columns={departmentColumns} data={department} loading={loading} />
          </ReportCard>
        </TabsContent>
        <TabsContent value="transactions">
          <ReportCard title="Stock transactions" description="Full movement audit trail.">
            <DataTable columns={transactionColumns} data={transactions} loading={loading} />
          </ReportCard>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ReportCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "-";
}
