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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, getErrorMessage } from "@/lib/api";
import type { Supplier } from "@/types/supplier";

export function SupplierDialog({
  supplier,
  trigger,
  onSaved,
}: {
  supplier?: Supplier;
  trigger?: React.ReactNode;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(supplier?.Status ?? "Active");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const payload = {
      supplier_name: String(form.get("supplier_name") ?? ""),
      contact_person: String(form.get("contact_person") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      address: String(form.get("address") ?? ""),
      lead_time_days: Number(form.get("lead_time_days") || 7),
      status: status,
    };

    try {
      if (supplier) {
        await api.put(`/suppliers/${supplier.SupplierID}`, payload);
      } else {
        await api.post<number>("/suppliers", payload);
      }
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
      {trigger ? (
        <div onClick={() => setOpen(true)} className="inline-block">
          {trigger}
        </div>
      ) : (
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="size-4" aria-hidden="true" />
          Add Supplier
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{supplier ? "Edit supplier" : "Add supplier"}</DialogTitle>
            <DialogDescription>
              {supplier ? "Update vendor contact and details." : "Register a pharmacy or medical supply vendor."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="supplier_name">Supplier name</Label>
              <Input id="supplier_name" name="supplier_name" defaultValue={supplier?.SupplierName} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contact_person">Contact person</Label>
                <Input id="contact_person" name="contact_person" defaultValue={supplier?.ContactPerson} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead_time_days">Lead time days</Label>
                <Input
                  id="lead_time_days"
                  name="lead_time_days"
                  min={0}
                  type="number"
                  defaultValue={supplier?.LeadTimeDays ?? 7}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={supplier?.Phone} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={supplier?.Email} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" defaultValue={supplier?.Address} />
            </div>
            {supplier && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value ?? "Active")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={saving} type="submit">
                {saving ? "Saving..." : supplier ? "Update supplier" : "Save supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
