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

export function InventoryItemDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Medicine");
  const [status, setStatus] = useState("Active");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await api.post<number>("/items", {
        item_name: String(form.get("item_name") ?? ""),
        item_category: category,
        unit_of_measure: String(form.get("unit_of_measure") ?? ""),
        reorder_level: Number(form.get("reorder_level") || 0),
        maximum_stock_level: Number(form.get("maximum_stock_level") || 0),
        item_status: status,
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
        Add Item
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add inventory item</DialogTitle>
            <DialogDescription>Create common inventory master data used by stock operations.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="item_name">Item name</Label>
              <Input id="item_name" name="item_name" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value ?? "Medicine")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit_of_measure">Unit</Label>
                <Input id="unit_of_measure" name="unit_of_measure" placeholder="Tablets, boxes, units" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="reorder_level">Reorder</Label>
                <Input id="reorder_level" name="reorder_level" min={0} type="number" defaultValue={0} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maximum_stock_level">Maximum</Label>
                <Input id="maximum_stock_level" name="maximum_stock_level" min={0} type="number" defaultValue={0} />
              </div>
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
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={saving} type="submit">
                {saving ? "Saving..." : "Save item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
