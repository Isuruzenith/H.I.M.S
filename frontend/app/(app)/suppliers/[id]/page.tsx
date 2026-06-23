"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Plus, Truck, DollarSign, Star } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, getErrorMessage } from "@/lib/api";
import type { Supplier } from "@/types/supplier";
import type { InventoryItem } from "@/types/inventory";

interface SupplierItemRow {
  ItemID: number;
  ItemName: string;
  ItemCategory: string;
  SupplierUnitPrice: number;
  PreferredSupplierStatus: boolean;
}

const columns: DataColumn<SupplierItemRow>[] = [
  { header: "Item Name", cell: (row) => row.ItemName },
  { header: "Category", cell: (row) => <StatusBadge value={row.ItemCategory} /> },
  {
    header: "Supplier Price",
    cell: (row) => `LKR ${Number(row.SupplierUnitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    header: "Preferred",
    cell: (row) =>
      row.PreferredSupplierStatus ? (
        <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
          <Star className="size-3 fill-amber-500" /> Yes
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">No</span>
      ),
  },
];

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const supplierId = Number(resolvedParams.id);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierItems, setSupplierItems] = useState<SupplierItemRow[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [itemId, setItemId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [preferred, setPreferred] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [supplierData, itemsData, allItemsData] = await Promise.all([
        api.get<Supplier>(`/suppliers/${supplierId}`),
        api.get<SupplierItemRow[]>(`/suppliers/${supplierId}/items`),
        api.get<InventoryItem[]>("/items"),
      ]);
      setSupplier(supplierData);
      setSupplierItems(itemsData ?? []);
      setAllItems(allItemsData ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [supplierId]);

  async function handleLinkItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");

    const price = Number(unitPrice);
    if (!itemId || price < 0) {
      setError("Please select an item and enter a valid unit price.");
      setActionLoading(false);
      return;
    }

    try {
      await api.post(`/suppliers/${supplierId}/items`, {
        item_id: Number(itemId),
        supplier_unit_price: price,
        preferred_supplier_status: preferred,
      });
      setSuccess("Item catalog linkage completed successfully.");
      setItemId("");
      setUnitPrice("");
      setPreferred(false);
      // Reload supplier items
      const updatedItems = await api.get<SupplierItemRow[]>(`/suppliers/${supplierId}/items`);
      setSupplierItems(updatedItems ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading supplier details...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Supplier was not found.</AlertDescription>
        </Alert>
        <Link href="/suppliers" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to Suppliers
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/suppliers" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to Suppliers
        </Link>
      </div>

      <PageHeader
        title={supplier.SupplierName}
        description={`Manage the supplier catalog and item pricing index for ${supplier.SupplierName}.`}
      />

      {success && (
        <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Supplier details card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Supplier Information</CardTitle>
              <CardDescription>Contact info and performance parameters</CardDescription>
            </div>
            <StatusBadge value={supplier.Status} />
          </CardHeader>
          <CardContent className="grid gap-4 mt-4 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Contact Person</span>
              <p className="text-sm font-medium">{supplier.ContactPerson ?? "-"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Phone</span>
              <p className="text-sm font-medium">{supplier.Phone ?? "-"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Email</span>
              <p className="text-sm font-medium">{supplier.Email ?? "-"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Lead Time</span>
              <p className="text-sm font-medium">{supplier.LeadTimeDays ?? 0} days</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Address</span>
              <p className="text-sm font-medium">{supplier.Address ?? "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Link Item Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              Link Catalog Item
            </CardTitle>
            <CardDescription>Add an inventory item to this supplier's catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLinkItem} className="space-y-4">
              <div className="grid gap-2">
                <Label>Inventory Item</Label>
                <Select value={itemId} onValueChange={(value) => setItemId(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {allItems
                      .filter((i) => i.ItemStatus !== "Inactive")
                      .map((item) => (
                        <SelectItem key={item.ItemID} value={String(item.ItemID)}>
                          {item.ItemName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unitPrice">Supplier Unit Price (LKR)</Label>
                <Input
                  id="unitPrice"
                  min={0}
                  step="0.01"
                  type="number"
                  value={unitPrice}
                  placeholder="0.00"
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="preferred"
                  checked={preferred}
                  onChange={(e) => setPreferred(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background accent-primary text-primary focus:ring-2 focus:ring-primary/20"
                />
                <label
                  htmlFor="preferred"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                >
                  Preferred Supplier status for this item
                </label>
              </div>

              <Button className="w-full flex items-center justify-center gap-2" disabled={actionLoading} type="submit">
                <DollarSign className="size-4" />
                {actionLoading ? "Saving..." : "Save Catalog Price"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Supplier Catalog Catalog Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Linked Catalog Items</CardTitle>
            <CardDescription>Directory of all products supplied by this vendor with active pricing index</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={supplierItems} emptyMessage="No catalog items linked yet." />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
