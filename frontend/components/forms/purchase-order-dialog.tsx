"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/components/auth/auth-provider";
import { DEMO_STAFF_ID } from "@/lib/constants";
import { api, getErrorMessage } from "@/lib/api";
import type { Supplier } from "@/types/supplier";

export function PurchaseOrderDialog({
  suppliers,
  onSaved,
}: {
  suppliers: Supplier[];
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localTodayStr = `${year}-${month}-${day}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const expectedDeliveryDate = String(form.get("expected_delivery_date") ?? "");

    if (expectedDeliveryDate) {
      const selectedDate = new Date(expectedDeliveryDate);
      const comparisonToday = new Date();
      comparisonToday.setHours(0, 0, 0, 0);
      if (selectedDate < comparisonToday) {
        setError("Expected delivery date cannot be in the past.");
        setSaving(false);
        return;
      }
    }

    try {
      const response = await api.post<{ PurchaseOrderID: number; Message: string }>("/purchase-orders", {
        supplier_id: Number(supplierId),
        created_by_staff_id: user?.StaffID ?? DEMO_STAFF_ID,
        expected_delivery_date: expectedDeliveryDate || undefined,
      });
      setOpen(false);
      onSaved();
      router.push(`/purchase-orders/${response.PurchaseOrderID}`);
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
        New Order
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create purchase order</DialogTitle>
            <DialogDescription>Start a supplier purchase order for pharmacy stock replenishment.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
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
            <div className="grid gap-2">
              <Label htmlFor="expected_delivery_date">Expected delivery</Label>
              <Input
                id="expected_delivery_date"
                name="expected_delivery_date"
                type="date"
                min={localTodayStr}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={saving || !supplierId} type="submit">
                {saving ? "Saving..." : "Create order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
