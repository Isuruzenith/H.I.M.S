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
import { api, getErrorMessage } from "@/lib/api";

export function SupplierDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await api.post<number>("/suppliers", {
        supplier_name: String(form.get("supplier_name") ?? ""),
        contact_person: String(form.get("contact_person") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        address: String(form.get("address") ?? ""),
        lead_time_days: Number(form.get("lead_time_days") || 7),
        status: "Active",
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
        Add Supplier
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add supplier</DialogTitle>
            <DialogDescription>Register a pharmacy or medical supply vendor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="supplier_name">Supplier name</Label>
              <Input id="supplier_name" name="supplier_name" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contact_person">Contact person</Label>
                <Input id="contact_person" name="contact_person" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lead_time_days">Lead time days</Label>
                <Input id="lead_time_days" name="lead_time_days" min={0} type="number" defaultValue={7} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={saving} type="submit">
                {saving ? "Saving..." : "Save supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
