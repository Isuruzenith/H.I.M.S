"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Plus, ClipboardList, Send, XCircle } from "lucide-react";

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
import type { PurchaseOrder, PurchaseOrderDetail } from "@/types/stock";
import type { InventoryItem } from "@/types/inventory";

const columns: DataColumn<PurchaseOrderDetail>[] = [
  { header: "Item Name", cell: (row) => row.ItemName },
  { header: "Quantity Ordered", cell: (row) => row.OrderedQuantity },
  { header: "Quantity Received", cell: (row) => row.ReceivedQuantity ?? 0 },
  {
    header: "Unit Price",
    cell: (row) => `LKR ${Number(row.UnitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  {
    header: "Subtotal",
    cell: (row) => `LKR ${(row.OrderedQuantity * row.UnitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
];

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const poId = Number(resolvedParams.id);
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add item form state
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [poData, itemsData] = await Promise.all([
        api.get<PurchaseOrder>(`/purchase-orders/${poId}`),
        api.get<InventoryItem[]>("/items"),
      ]);
      setPo(poData);
      setItems(itemsData ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [poId]);

  async function handleStatusChange(status: string) {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await api.patch<PurchaseOrder>(`/purchase-orders/${poId}/status`, { status });
      setPo(updated);
      setSuccess(`Purchase order status updated to ${status}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setSuccess("");

    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (!itemId || qty <= 0 || price < 0) {
      setError("Please select an item and enter valid quantity/price.");
      setActionLoading(false);
      return;
    }

    try {
      await api.post(`/purchase-orders/${poId}/details`, {
        item_id: Number(itemId),
        ordered_quantity: qty,
        unit_price: price,
      });
      setSuccess("Item added to purchase order successfully.");
      setItemId("");
      setQuantity("1");
      setUnitPrice("");
      // Reload PO details
      const poData = await api.get<PurchaseOrder>(`/purchase-orders/${poId}`);
      setPo(poData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading purchase order details...</p>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Purchase order was not found.</AlertDescription>
        </Alert>
        <Link href="/purchase-orders" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to Purchase Orders
        </Link>
      </div>
    );
  }

  const orderTotal = (po.details ?? []).reduce(
    (sum, detail) => sum + detail.OrderedQuantity * detail.UnitPrice,
    0
  );

  return (
    <>
      <div className="mb-4">
        <Link href="/purchase-orders" className="flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to Purchase Orders
        </Link>
      </div>

      <PageHeader
        title={`Purchase Order PO-${po.PurchaseOrderID}`}
        description={`Manage line items and lifecycle status for PO-${po.PurchaseOrderID}.`}
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
        {/* PO Header Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Header status and supplier information</CardDescription>
            </div>
            <StatusBadge value={po.OrderStatus} />
          </CardHeader>
          <CardContent className="grid gap-4 mt-4 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Supplier</span>
              <p className="text-sm font-medium">{po.SupplierName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Created By</span>
              <p className="text-sm font-medium">{po.CreatedBy ?? "Unknown Staff"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Order Date</span>
              <p className="text-sm font-medium">
                {po.OrderDate ? new Date(po.OrderDate).toLocaleDateString() : "-"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Expected Delivery</span>
              <p className="text-sm font-medium">
                {po.ExpectedDeliveryDate ? new Date(po.ExpectedDeliveryDate).toLocaleDateString() : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PO Action / Status Controls Card */}
        <Card>
          <CardHeader>
            <CardTitle>PO Actions</CardTitle>
            <CardDescription>Transition order status lifecycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {po.OrderStatus === "Pending" && (
              <>
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("Approved")}
                >
                  <CheckCircle2 className="size-4" />
                  Approve Order
                </Button>
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("Cancelled")}
                >
                  <XCircle className="size-4" />
                  Cancel Order
                </Button>
              </>
            )}

            {po.OrderStatus === "Approved" && (
              <>
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("Ordered")}
                >
                  <Send className="size-4" />
                  Mark as Ordered
                </Button>
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange("Cancelled")}
                >
                  <XCircle className="size-4" />
                  Cancel Order
                </Button>
              </>
            )}

            {po.OrderStatus === "Ordered" && (
              <Button
                variant="destructive"
                className="w-full flex items-center justify-center gap-2"
                disabled={actionLoading}
                onClick={() => handleStatusChange("Cancelled")}
              >
                <XCircle className="size-4" />
                Cancel Order
              </Button>
            )}

            {!["Pending", "Approved", "Ordered"].includes(po.OrderStatus) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No further status changes are available for this order.
              </p>
            )}
          </CardContent>
        </Card>

        {/* PO Items Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>Items, quantities, and negotiated unit prices in this purchase order</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={po.details ?? []} emptyMessage="No line items added yet." />
            {po.details && po.details.length > 0 && (
              <div className="mt-4 flex justify-end text-sm font-semibold border-t pt-4">
                <span>Total: LKR {orderTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Item Form (Only when Pending) */}
        {po.OrderStatus === "Pending" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5" />
                Add Item
              </CardTitle>
              <CardDescription>Include an inventory item to this purchase order</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Item</Label>
                  <Select value={itemId} onValueChange={(value) => setItemId(value ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    min={1}
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Unit Price (LKR)</Label>
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
                <Button className="w-full" disabled={actionLoading} type="submit">
                  {actionLoading ? "Adding..." : "Add to Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" />
                PO Details
              </CardTitle>
              <CardDescription>Modification locked</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Items can only be added to purchase orders that are currently in <span className="font-semibold text-amber-600">Pending</span> status.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
