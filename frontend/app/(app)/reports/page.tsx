"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import { exportToCSV, exportToPDF } from "@/lib/utils";
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

const lowExportColumns = [
  { header: "Item Name", key: "ItemName" as keyof LowStockReportRow },
  { header: "Category", key: "ItemCategory" as keyof LowStockReportRow },
  { header: "Current Stock", key: "CurrentStock" as keyof LowStockReportRow },
  { header: "Reorder Level", key: "ReorderLevel" as keyof LowStockReportRow },
  { header: "Recommended Reorder Qty", key: "RecommendedReorderQuantity" as keyof LowStockReportRow },
  { header: "Stock Status", key: "StockStatus" as keyof LowStockReportRow }
];

const expiringColumns: DataColumn<ExpiringSoonReportRow>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Batch", cell: (row) => row.BatchNumber },
  { header: "Available", cell: (row) => row.QuantityAvailable },
  { header: "Expiry", cell: (row) => formatDate(row.ExpiryDate) },
  { header: "Days", cell: (row) => row.DaysToExpiry ?? "-" },
  { header: "Alert", cell: (row) => <StatusBadge value={row.AlertLevel} /> },
];

const expiringExportColumns = [
  { header: "Item Name", key: "ItemName" as keyof ExpiringSoonReportRow },
  { header: "Batch Number", key: "BatchNumber" as keyof ExpiringSoonReportRow },
  { header: "Quantity Available", key: "QuantityAvailable" as keyof ExpiringSoonReportRow },
  { header: "Expiry Date", key: (row: ExpiringSoonReportRow) => formatDate(row.ExpiryDate) },
  { header: "Days To Expiry", key: "DaysToExpiry" as keyof ExpiringSoonReportRow },
  { header: "Alert Level", key: "AlertLevel" as keyof ExpiringSoonReportRow }
];

const departmentColumns: DataColumn<DepartmentConsumptionRow>[] = [
  { header: "Department", cell: (row) => row.DepartmentName },
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Month", cell: (row) => `${row.UsageMonth ?? "-"} / ${row.UsageYear ?? "-"}` },
  { header: "Issued", cell: (row) => row.TotalIssuedQuantity },
];

const departmentExportColumns = [
  { header: "Department Name", key: "DepartmentName" as keyof DepartmentConsumptionRow },
  { header: "Item Name", key: "ItemName" as keyof DepartmentConsumptionRow },
  { header: "Month/Year", key: (row: DepartmentConsumptionRow) => `${row.UsageMonth ?? ""}/${row.UsageYear ?? ""}` },
  { header: "Total Issued Qty", key: "TotalIssuedQuantity" as keyof DepartmentConsumptionRow }
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

const transactionExportColumns = [
  { header: "Transaction ID", key: (row: StockTransaction) => `TX-${row.TransactionID}` },
  { header: "Item Name", key: "ItemName" as keyof StockTransaction },
  { header: "Batch Number", key: (row: StockTransaction) => row.BatchNumber ?? "" },
  { header: "Type", key: "TransactionType" as keyof StockTransaction },
  { header: "Quantity", key: "Quantity" as keyof StockTransaction },
  { header: "Transaction Date", key: (row: StockTransaction) => formatDate(row.TransactionDate) },
  { header: "Staff Name", key: "StaffName" as keyof StockTransaction }
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
    <>
      <PageHeader title="Reports" description="Operational reports for stock levels, expiry, consumption, and transactions." />
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
          <ReportCard
            title="Low stock"
            description="Items below reorder level."
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportToCSV(lowStock, lowExportColumns, "low-stock.csv")}>
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportToPDF("Low Stock Report", lowStock, lowExportColumns)}>
                  PDF
                </Button>
              </div>
            }
          >
            <DataTable columns={lowColumns} data={lowStock} loading={loading} />
          </ReportCard>
        </TabsContent>
        <TabsContent value="expiring">
          <ReportCard
            title="Expiring soon"
            description="Batches grouped by expiry alert level."
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportToCSV(expiring, expiringExportColumns, "expiring-soon.csv")}>
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportToPDF("Expiring Soon Report", expiring, expiringExportColumns)}>
                  PDF
                </Button>
              </div>
            }
          >
            <DataTable columns={expiringColumns} data={expiring} loading={loading} />
          </ReportCard>
        </TabsContent>
        <TabsContent value="department">
          <ReportCard
            title="Department consumption"
            description="Department-wise issued stock totals."
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportToCSV(department, departmentExportColumns, "department-consumption.csv")}>
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportToPDF("Department Consumption Report", department, departmentExportColumns)}>
                  PDF
                </Button>
              </div>
            }
          >
            <DataTable columns={departmentColumns} data={department} loading={loading} />
          </ReportCard>
        </TabsContent>
        <TabsContent value="transactions">
          <ReportCard
            title="Stock transactions"
            description="Full movement audit trail."
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportToCSV(transactions, transactionExportColumns, "stock-transactions.csv")}>
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportToPDF("Stock Transactions Report", transactions, transactionExportColumns)}>
                  PDF
                </Button>
              </div>
            }
          >
            <DataTable columns={transactionColumns} data={transactions} loading={loading} />
          </ReportCard>
        </TabsContent>
      </Tabs>
    </>
  );
}

function ReportCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action ? <div className="flex gap-2">{action}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "-";
}
