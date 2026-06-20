"use client";

import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import type { Medicine } from "@/types/inventory";

const columns: DataColumn<Medicine>[] = [
  { header: "Medicine", cell: (row) => row.ItemName },
  { header: "Generic", cell: (row) => row.GenericName ?? "-" },
  { header: "Brand", cell: (row) => row.BrandName ?? "-" },
  { header: "Dosage", cell: (row) => row.Dosage ?? "-" },
  { header: "Form", cell: (row) => row.DrugForm ?? "-" },
  { header: "Current", cell: (row) => row.CurrentStock ?? 0 },
];

export default function MedicinesPage() {
  const [rows, setRows] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        setRows((await api.get<Medicine[]>("/medicines")) ?? []);
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
    () => rows.filter((row) => `${row.ItemName} ${row.GenericName ?? ""} ${row.BrandName ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <>
      <PageHeader title="Medicines" description="Pharmacy medicine inventory and stock levels." />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load medicines</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Medicine catalog</CardTitle>
          <CardDescription>Medicine records with dosage, form, and current stock availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </>
  );
}
