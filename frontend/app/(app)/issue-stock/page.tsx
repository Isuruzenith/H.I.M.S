"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PackageCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_STAFF_ID, FALLBACK_DEPARTMENTS } from "@/lib/constants";
import { api, getErrorMessage, toBackendIssuePayload } from "@/lib/api";
import type { InventoryItem } from "@/types/inventory";
import type { Department, StockBatch, StockTransaction } from "@/types/stock";

const transactionColumns: DataColumn<StockTransaction>[] = [
  { header: "Transaction", cell: (row) => `TX-${row.TransactionID}` },
  { header: "Item", cell: (row) => row.ItemName },
  { header: "Batch", cell: (row) => row.BatchNumber ?? "-" },
  { header: "Type", cell: (row) => <StatusBadge value={row.TransactionType} /> },
  { header: "Quantity", cell: (row) => row.Quantity },
  { header: "Date", cell: (row) => formatDateTime(row.TransactionDate) },
  { header: "Staff", cell: (row) => row.StaffName ?? "-" },
];

export default function IssueStockPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadInitial() {
    setLoading(true);
    setError("");
    try {
      const [departmentData, itemData, transactionData] = await Promise.all([
        api.get<Department[]>("/departments"),
        api.get<InventoryItem[]>("/items"),
        api.get<StockTransaction[]>("/stock/transactions?limit=20"),
      ]);
      setDepartments(departmentData ?? []);
      setItems(itemData ?? []);
      setTransactions(transactionData ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      // Demo fallback is only used when the Flask API is temporarily unavailable.
      setDepartments(FALLBACK_DEPARTMENTS);
      setItems([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  async function refreshItemBatches(selectedItemId: string) {
    if (!selectedItemId) {
      setBatches([]);
      return;
    }

    try {
      setBatches((await api.get<StockBatch[]>(`/stock/batches?item_id=${selectedItemId}`)) ?? []);
    } catch {
      setBatches([]);
    }
  }

  async function refreshTransactions() {
    try {
      setTransactions((await api.get<StockTransaction[]>("/stock/transactions?limit=20")) ?? []);
    } catch {
      setTransactions([]);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadInitial);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => refreshItemBatches(itemId));
  }, [itemId]);

  const selectedItem = useMemo(
    () => items.find((item) => String(item.ItemID) === itemId),
    [items, itemId]
  );
  const currentStock = selectedItem?.CurrentStock ?? batches.reduce((total, batch) => total + Number(batch.QuantityAvailable ?? 0), 0);
  const activeItems = items.filter((item) => item.ItemStatus !== "Inactive");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const requestedQuantity = Number(quantity);
    if (!departmentId || !itemId || !Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      setError("Select a department, select an item, and enter a positive quantity.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/stock/issue", toBackendIssuePayload({
        departmentId: Number(departmentId),
        requestedByStaffId: DEMO_STAFF_ID,
        itemId: Number(itemId),
        quantity: requestedQuantity,
      }));
      setSuccess("Stock issued successfully. The backend stored procedure updated batches and inserted the stock transaction.");
      await Promise.all([refreshItemBatches(itemId), refreshTransactions()]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Issue Stock"
        description="Issue stock from pharmacy inventory to hospital departments."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,460px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="size-5" aria-hidden="true" />
              Issue to department
            </CardTitle>
            <CardDescription>Select an item, batch, and department to issue stock. FEFO logic applies automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              {success ? (
                <Alert>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  <AlertTitle>Issue completed</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              ) : null}
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Issue failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={(value) => setDepartmentId(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.DepartmentID} value={String(department.DepartmentID)}>
                        {department.DepartmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Item</Label>
                <Select value={itemId} onValueChange={(value) => setItemId(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select stock item" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeItems.map((item) => (
                      <SelectItem key={item.ItemID} value={String(item.ItemID)}>
                        {item.ItemName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  min={1}
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                />
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Current stock</p>
                <p className="mt-1 text-3xl font-semibold">{loading ? "..." : currentStock}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedItem ? `${selectedItem.ItemName} across available batches` : "Select an item to view available stock"}
                </p>
              </div>
              <Button className="w-full" disabled={submitting || loading} type="submit">
                {submitting ? "Issuing..." : "Issue stock"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent stock transactions</CardTitle>
            <CardDescription>Recent stock issue transactions for this session.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={transactionColumns} data={transactions} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function formatDateTime(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}
