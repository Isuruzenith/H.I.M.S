"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import type { Equipment } from "@/types/inventory";

const columns: DataColumn<Equipment>[] = [
  { header: "Equipment", cell: (row) => row.ItemName },
  { header: "Type", cell: (row) => row.EquipmentType ?? "-" },
  { header: "Current", cell: (row) => row.CurrentStock ?? 0 },
  { header: "Warranty", cell: (row) => `${row.WarrantyMonths ?? 0} months` },
  { header: "Maintenance", cell: (row) => <StatusBadge value={row.MaintenanceRequired ? "Required" : "Not required"} /> },
  { header: "Service", cell: (row) => `${row.ServiceFrequencyMonths ?? 0} months` },
];

export default function EquipmentPage() {
  const [rows, setRows] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        setRows((await api.get<Equipment[]>("/equipment")) ?? []);
      } catch (err) {
        setError(getErrorMessage(err));
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(
    () => rows.filter((row) => `${row.ItemName} ${row.EquipmentType ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <>
      <PageHeader title="Equipment" description="Medical equipment inventory and availability tracking." />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load equipment</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Equipment list</CardTitle>
          <CardDescription>Equipment details including model, serial number, and stock status.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </>
  );
}
