"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit2, Eye } from "lucide-react";

import { SupplierDialog } from "@/components/forms/supplier-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import type { Supplier } from "@/types/supplier";

export default function SuppliersPage() {
  const [rows, setRows] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows((await api.get<Supplier[]>("/suppliers")) ?? []);
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

  const columns = useMemo<DataColumn<Supplier>[]>(
    () => [
      {
        header: "Supplier",
        cell: (row) => (
          <Link href={`/suppliers/${row.SupplierID}`} className="font-semibold text-primary hover:underline">
            {row.SupplierName}
          </Link>
        ),
      },
      { header: "Contact", cell: (row) => row.ContactPerson ?? "-" },
      { header: "Phone", cell: (row) => row.Phone ?? "-" },
      { header: "Email", cell: (row) => row.Email ?? "-" },
      { header: "Lead Time", cell: (row) => `${row.LeadTimeDays ?? 0} days` },
      { header: "Status", cell: (row) => <StatusBadge value={row.Status} /> },
      {
        header: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/suppliers/${row.SupplierID}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Eye className="size-3.5 mr-1" /> Catalog
            </Link>
            <SupplierDialog
              supplier={row}
              onSaved={load}
              trigger={
                <Button variant="ghost" size="icon-sm" title="Edit Supplier">
                  <Edit2 className="size-3.5" />
                </Button>
              }
            />
          </div>
        ),
      },
    ],
    []
  );

  const filtered = useMemo(
    () => rows.filter((row) => `${row.SupplierName} ${row.ContactPerson ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <>
      <PageHeader title="Suppliers" description="Supplier records used by purchase orders and stock receiving." action={<SupplierDialog onSaved={load} />} />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load suppliers</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Supplier directory</CardTitle>
          <CardDescription>Vendor contact and lead time data for procurement planning.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </>
  );
}
