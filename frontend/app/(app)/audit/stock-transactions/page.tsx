"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { AccessGate } from "@/components/layout/access-gate";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, getErrorMessage } from "@/lib/api";
import type { StockTransaction } from "@/types/stock";

const transactionTypes = [
  "PURCHASE_RECEIVE",
  "DEPARTMENT_ISSUE",
  "RETURN",
  "ADJUSTMENT",
  "EXPIRED_REMOVAL",
  "DAMAGED_REMOVAL",
];

const columns: DataColumn<StockTransaction>[] = [
  { header: "Transaction", cell: (row) => `TX-${row.TransactionID}` },
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Batch", cell: (row) => row.BatchNumber ?? "-" },
  { header: "Type", cell: (row) => <StatusBadge value={row.TransactionType} /> },
  { header: "Quantity", cell: (row) => row.Quantity },
  { header: "Date", cell: (row) => formatDate(row.TransactionDate) },
  { header: "Reference", cell: (row) => formatReference(row) },
  { header: "Staff", cell: (row) => row.StaffName ?? "-" },
  { header: "Notes", cell: (row) => row.Notes ?? "-" },
];

export default function AuditStockTransactionsPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ limit: "150" });
    if (search) {
      params.set("search", search);
    }
    if (transactionType !== "ALL") {
      params.set("transaction_type", transactionType);
    }

    try {
      setTransactions((await api.get<StockTransaction[]>(`/audit/stock-transactions?${params.toString()}`)) ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [search, transactionType]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  return (
    <AccessGate allowedRoles={["Admin", "InventoryManager", "HospitalAdministrator"]}>
      <PageHeader
        title="Audit Trail"
        description="Complete history of stock movements across the facility."
        action={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Could not load audit trail</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Stock transactions</CardTitle>
          <CardDescription>Filter by type or search across items, batches, staff, and references.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={transactionType} onValueChange={(value) => setTransactionType(value ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All transaction types</SelectItem>
                {transactionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => void load()}>
              Apply Filter
            </Button>
          </div>
          <DataTable columns={columns} data={transactions} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </AccessGate>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}

function formatReference(row: StockTransaction) {
  if (!row.ReferenceType && !row.ReferenceID) {
    return "-";
  }
  return [row.ReferenceType, row.ReferenceID].filter(Boolean).join(" ");
}
