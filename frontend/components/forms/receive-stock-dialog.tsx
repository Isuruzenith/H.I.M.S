"use client";

import { useEffect, useState } from "react";
import { Plus, Info } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getErrorMessage } from "@/lib/api";
import type { InventoryItem } from "@/types/inventory";
import type { Supplier } from "@/types/supplier";
import type { PurchaseOrder, PurchaseOrderDetail } from "@/types/stock";

export function ReceiveStockDialog({
  items,
  suppliers,
  onSaved,
}: {
  items: InventoryItem[];
  suppliers: Supplier[];
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Dropdown options
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [poDetails, setPoDetails] = useState<PurchaseOrderDetail[]>([]);

  // Selection states
  const [itemId, setItemId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [selectedPoId, setSelectedPoId] = useState("");
  const [selectedPoDetailId, setSelectedPoDetailId] = useState("");
  const [selectedPoDetail, setSelectedPoDetail] = useState<PurchaseOrderDetail | null>(null);

  // Form inputs
  const [batchNumber, setBatchNumber] = useState("");
  const [quantityReceived, setQuantityReceived] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Load POs when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadPOs() {
      try {
        const allPOs = await api.get<PurchaseOrder[]>("/purchase-orders");
        // Filter POs that can receive items
        const pendingOrOrdered = (allPOs ?? []).filter((po) =>
          ["Approved", "Ordered", "PartiallyReceived"].includes(po.OrderStatus)
        );
        setPos(pendingOrOrdered);
      } catch (err) {
        console.error("Failed to load POs", err);
      }
    }

    void loadPOs();
  }, [open]);

  // Load PO details when PO is selected
  useEffect(() => {
    if (!selectedPoId) {
      setPoDetails([]);
      setSelectedPoDetailId("");
      setSelectedPoDetail(null);
      return;
    }

    async function loadPoDetails() {
      try {
        const poData = await api.get<PurchaseOrder>(`/purchase-orders/${selectedPoId}`);
        setPoDetails(poData.details ?? []);
        // Auto-fill supplier
        setSupplierId(String(poData.SupplierID));
      } catch (err) {
        console.error("Failed to load PO details", err);
      }
    }

    void loadPoDetails();
  }, [selectedPoId]);

  // Update item selection and details when PO item is chosen
  useEffect(() => {
    if (!selectedPoDetailId) {
      setSelectedPoDetail(null);
      return;
    }

    const detail = poDetails.find((d) => String(d.PurchaseOrderDetailID) === selectedPoDetailId);
    if (detail) {
      setSelectedPoDetail(detail);
      setItemId(String(detail.ItemID));
      setUnitCost(String(detail.UnitPrice));
      // Recommend remaining quantity
      const remaining = detail.OrderedQuantity - (detail.ReceivedQuantity ?? 0);
      setQuantityReceived(String(Math.max(0, remaining)));
    } else {
      setSelectedPoDetail(null);
    }
  }, [selectedPoDetailId, poDetails]);

  // Reset helper
  function resetForm() {
    setItemId("");
    setSupplierId("");
    setSelectedPoId("");
    setSelectedPoDetailId("");
    setSelectedPoDetail(null);
    setBatchNumber("");
    setQuantityReceived("");
    setUnitCost("");
    setReceivedDate("");
    setManufactureDate("");
    setExpiryDate("");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const qty = Number(quantityReceived);
    const cost = Number(unitCost);

    if (!itemId || !supplierId || !batchNumber || qty <= 0 || cost < 0) {
      setError("Please complete all required fields with valid values.");
      setSaving(false);
      return;
    }

    // Validation against PO details
    if (selectedPoDetail) {
      const remaining = selectedPoDetail.OrderedQuantity - (selectedPoDetail.ReceivedQuantity ?? 0);
      if (qty > remaining) {
        setError(`Received quantity (${qty}) exceeds remaining ordered quantity (${remaining}).`);
        setSaving(false);
        return;
      }
    }

    try {
      await api.post<number>("/stock/receive", {
        item_id: Number(itemId),
        supplier_id: Number(supplierId),
        purchase_order_detail_id: selectedPoDetailId ? Number(selectedPoDetailId) : undefined,
        batch_number: batchNumber,
        received_date: receivedDate || undefined,
        manufacture_date: manufactureDate || undefined,
        expiry_date: expiryDate || undefined,
        quantity_received: qty,
        unit_cost: cost,
        staff_id: user?.StaffID ?? 1,
      });
      setOpen(false);
      resetForm();
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button onClick={() => { resetForm(); setOpen(true); }} size="sm">
        <Plus className="size-4" aria-hidden="true" />
        Receive Stock
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive stock batch</DialogTitle>
            <DialogDescription>Add a received stock batch linked to a Purchase Order or received directly.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {/* PO Link Section */}
            <div className="grid gap-4 sm:grid-cols-2 border-b pb-4 mb-4">
              <div className="grid gap-2">
                <Label>Link to Purchase Order (Optional)</Label>
                <Select value={selectedPoId} onValueChange={(value) => { setSelectedPoId(value ?? ""); setSelectedPoDetailId(""); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Direct Receive)</SelectItem>
                    {pos.map((po) => (
                      <SelectItem key={po.PurchaseOrderID} value={String(po.PurchaseOrderID)}>
                        PO-{po.PurchaseOrderID} - {po.SupplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>PO Item Line</Label>
                <Select
                  value={selectedPoDetailId}
                  onValueChange={(value) => setSelectedPoDetailId(value ?? "")}
                  disabled={!selectedPoId || selectedPoId === "none"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select PO Item Line" />
                  </SelectTrigger>
                  <SelectContent>
                    {poDetails.map((detail) => (
                      <SelectItem key={detail.PurchaseOrderDetailID} value={String(detail.PurchaseOrderDetailID)}>
                        {detail.ItemName} (Ordered: {detail.OrderedQuantity}, Recvd: {detail.ReceivedQuantity ?? 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPoDetail && (
              <div className="flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <Info className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Linked to Purchase Order PO-{selectedPoId}</p>
                  <p className="mt-1">
                    Remaining Ordered Quantity to receive:{" "}
                    <span className="font-bold">
                      {selectedPoDetail.OrderedQuantity - (selectedPoDetail.ReceivedQuantity ?? 0)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Item</Label>
                <Select
                  value={itemId}
                  onValueChange={(value) => setItemId(value ?? "")}
                  disabled={!!selectedPoDetailId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.ItemID} value={String(item.ItemID)}>
                        {item.ItemName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Supplier</Label>
                <Select
                  value={supplierId}
                  onValueChange={(value) => setSupplierId(value ?? "")}
                  disabled={!!selectedPoDetailId || (!!selectedPoId && selectedPoId !== "none")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.SupplierID} value={String(supplier.SupplierID)}>
                        {supplier.SupplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="batch_number">Batch number</Label>
                <Input
                  id="batch_number"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity_received">Quantity</Label>
                <Input
                  id="quantity_received"
                  min={1}
                  type="number"
                  value={quantityReceived}
                  onChange={(e) => setQuantityReceived(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit_cost">Unit cost (LKR)</Label>
                <Input
                  id="unit_cost"
                  min={0}
                  step="0.01"
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="received_date">Received</Label>
                <Input
                  id="received_date"
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manufacture_date">Manufacture</Label>
                <Input
                  id="manufacture_date"
                  type="date"
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={saving || !itemId || !supplierId} type="submit">
                {saving ? "Saving..." : "Save batch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
