"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { PurchaseOrderDialog } from "@/components/forms/purchase-order-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import type { Supplier } from "@/types/supplier";
import type { PurchaseOrder } from "@/types/stock";

const columns: DataColumn<PurchaseOrder>[] = [
  {
    header: "PO ID",
    cell: (row) => (
      <Link href={`/purchase-orders/${row.PurchaseOrderID}`} className="font-semibold text-primary hover:underline">
        PO-{row.PurchaseOrderID}
      </Link>
    ),
  },
  { header: "Supplier", cell: (row) => row.SupplierName },
  { header: "Created By", cell: (row) => row.CreatedBy ?? "-" },
  { header: "Order Date", cell: (row) => formatDate(row.OrderDate) },
  { header: "Expected", cell: (row) => formatDate(row.ExpectedDeliveryDate) },
  { header: "Status", cell: (row) => <StatusBadge value={row.OrderStatus} /> },
  {
    header: "Actions",
    cell: (row) => (
      <Link href={`/purchase-orders/${row.PurchaseOrderID}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
        View
      </Link>
    ),
  },
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
    <>
      <PageHeader title="Purchase Orders" description="Create and track procurement orders for inventory replenishment." action={<PurchaseOrderDialog suppliers={suppliers} onSaved={load} />} />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load purchase orders</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Purchase order list</CardTitle>
          <CardDescription>All purchase orders with supplier, status, and order date.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "-";
}
