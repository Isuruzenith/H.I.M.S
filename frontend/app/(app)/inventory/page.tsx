"use client";

import { useEffect, useMemo, useState } from "react";

import { InventoryItemDialog } from "@/components/forms/inventory-item-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import type { InventoryItem } from "@/types/inventory";

const columns: DataColumn<InventoryItem>[] = [
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Category", cell: (row) => <StatusBadge value={row.ItemCategory} /> },
  { header: "Unit", cell: (row) => row.UnitOfMeasure },
  { header: "Current", cell: (row) => row.CurrentStock ?? 0 },
  { header: "Reorder", cell: (row) => row.ReorderLevel ?? 0 },
  { header: "Status", cell: (row) => <StatusBadge value={row.ItemStatus} /> },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems((await api.get<InventoryItem[]>("/items")) ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  const filtered = useMemo(
    () => items.filter((item) => item.ItemName.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  return (
    <>
      <PageHeader title="Inventory" description="Manage all inventory items across medicines, equipment, and consumables." action={<InventoryItemDialog onSaved={load} />} />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load inventory</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Inventory items</CardTitle>
          <CardDescription>Search and review current stock levels for all registered items.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </>
  );
}
