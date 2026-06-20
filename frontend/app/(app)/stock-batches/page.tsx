"use client";

import { useEffect, useMemo, useState } from "react";

import { ReceiveStockDialog } from "@/components/forms/receive-stock-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import type { InventoryItem } from "@/types/inventory";
import type { Supplier } from "@/types/supplier";
import type { StockBatch } from "@/types/stock";

const columns: DataColumn<StockBatch>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Batch", cell: (row) => row.BatchNumber },
  { header: "Supplier", cell: (row) => row.SupplierName ?? "-" },
  { header: "Available", cell: (row) => row.QuantityAvailable ?? 0 },
  { header: "Expiry", cell: (row) => formatDate(row.ExpiryDate) },
  { header: "Risk", cell: (row) => <StatusBadge value={riskLabel(row.DaysToExpiry)} /> },
];

export default function StockBatchesPage() {
  const [rows, setRows] = useState<StockBatch[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [batchData, itemData, supplierData] = await Promise.all([
        api.get<StockBatch[]>("/stock/batches"),
        api.get<InventoryItem[]>("/items"),
        api.get<Supplier[]>("/suppliers"),
      ]);
      setRows(batchData ?? []);
      setItems(itemData ?? []);
      setSuppliers(supplierData ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  const filtered = useMemo(
    () => rows.filter((row) => `${row.ItemName} ${row.BatchNumber} ${row.SupplierName ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <>
      <PageHeader title="Stock Batches" description="Batch-level tracking with expiry dates and available quantities." action={<ReceiveStockDialog items={items} suppliers={suppliers} onSaved={load} />} />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load stock batches</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Stock batches</CardTitle>
          <CardDescription>Batch records with supplier, quantity, and expiry status.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "No expiry";
}

function riskLabel(days?: number) {
  if (days === undefined || days === null) return "No Expiry";
  if (days < 0) return "Expired";
  if (days <= 30) return "Critical";
  if (days <= 60) return "Warning";
  return "Safe";
}
