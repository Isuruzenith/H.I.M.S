"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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

export function ReceiveStockDialog({
  items,
  suppliers,
  onSaved,
}: {
  items: InventoryItem[];
  suppliers: Supplier[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [itemId, setItemId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await api.post<number>("/stock/receive", {
        item_id: Number(itemId),
        supplier_id: Number(supplierId),
        batch_number: String(form.get("batch_number") ?? ""),
        received_date: String(form.get("received_date") ?? "") || undefined,
        manufacture_date: String(form.get("manufacture_date") ?? "") || undefined,
        expiry_date: String(form.get("expiry_date") ?? "") || undefined,
        quantity_received: Number(form.get("quantity_received") || 0),
        unit_cost: Number(form.get("unit_cost") || 0),
        staff_id: 1,
      });
      setOpen(false);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="size-4" aria-hidden="true" />
        Receive Stock
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive stock batch</DialogTitle>
            <DialogDescription>Add a received stock batch through the Flask stock API.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Item</Label>
                <Select value={itemId} onValueChange={(value) => setItemId(value ?? "")}>
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
                <Select value={supplierId} onValueChange={(value) => setSupplierId(value ?? "")}>
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
                <Input id="batch_number" name="batch_number" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity_received">Quantity</Label>
                <Input id="quantity_received" name="quantity_received" min={1} type="number" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit_cost">Unit cost</Label>
                <Input id="unit_cost" name="unit_cost" min={0} step="0.01" type="number" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="received_date">Received</Label>
                <Input id="received_date" name="received_date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manufacture_date">Manufacture</Label>
                <Input id="manufacture_date" name="manufacture_date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry</Label>
                <Input id="expiry_date" name="expiry_date" type="date" />
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
