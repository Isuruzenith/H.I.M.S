"use client";

import { useEffect, useMemo, useState } from "react";

import { PurchaseOrderDialog } from "@/components/forms/purchase-order-dialog";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import type { Supplier } from "@/types/supplier";
import type { PurchaseOrder } from "@/types/stock";

const columns: DataColumn<PurchaseOrder>[] = [
  { header: "PO ID", cell: (row) => `PO-${row.PurchaseOrderID}` },
  { header: "Supplier", cell: (row) => row.SupplierName },
  { header: "Created By", cell: (row) => row.CreatedBy ?? "-" },
  { header: "Order Date", cell: (row) => formatDate(row.OrderDate) },
  { header: "Expected", cell: (row) => formatDate(row.ExpectedDeliveryDate) },
  { header: "Status", cell: (row) => <StatusBadge value={row.OrderStatus} /> },
];

export default function PurchaseOrdersPage() {
  const [rows, setRows] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [ordersData, supplierData] = await Promise.all([
        api.get<PurchaseOrder[]>("/purchase-orders"),
        api.get<Supplier[]>("/suppliers"),
      ]);
      setRows(ordersData ?? []);
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
    () => rows.filter((row) => `${row.PurchaseOrderID} ${row.SupplierName} ${row.OrderStatus}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <AppShell>
      <PageHeader title="Purchase Orders" description="Procurement orders for replenishing hospital inventory stock." action={<PurchaseOrderDialog suppliers={suppliers} onSaved={load} />} />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load purchase orders</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Purchase order list</CardTitle>
          <CardDescription>Purchase order headers loaded from the Flask API.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </AppShell>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "-";
}
