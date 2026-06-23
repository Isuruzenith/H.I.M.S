"use client";

import { useState, useEffect } from "react";
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

export function InventoryItemDialog({
  item,
  trigger,
  onSaved,
}: {
  item?: InventoryItem;
  trigger?: React.ReactNode;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(item?.ItemCategory ?? "Medicine");
  const [status, setStatus] = useState(item?.ItemStatus ?? "Active");
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [maintenanceRequired, setMaintenanceRequired] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fullItem, setFullItem] = useState<any>(item);

  useEffect(() => {
    if (!open || !item) {
      if (!open) {
        setFullItem(null);
      }
      return;
    }

    async function loadDetail() {
      setDetailLoading(true);
      setError("");
      try {
        const detail = await api.get<any>(`/items/${item!.ItemID}`);
        setFullItem(detail);
        setCategory(detail.ItemCategory ?? "Medicine");
        setStatus(detail.ItemStatus ?? "Active");
        setPrescriptionRequired(detail.PrescriptionRequired ?? false);
        setMaintenanceRequired(detail.MaintenanceRequired ?? false);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setDetailLoading(false);
      }
    }

    void loadDetail();
  }, [open, item]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const payload: Record<string, any> = {
      item_name: String(form.get("item_name") ?? ""),
      item_category: category,
      unit_of_measure: String(form.get("unit_of_measure") ?? ""),
      reorder_level: Number(form.get("reorder_level") || 0),
      maximum_stock_level: Number(form.get("maximum_stock_level") || 0),
      item_status: status,
    };

    // Subtype dynamic fields payload
    if (category === "Medicine") {
      payload.generic_name = String(form.get("generic_name") ?? "") || payload.item_name;
      payload.brand_name = String(form.get("brand_name") ?? "") || undefined;
      payload.dosage = String(form.get("dosage") ?? "") || "N/A";
      payload.drug_form = String(form.get("drug_form") ?? "") || "N/A";
      payload.storage_condition = String(form.get("storage_condition") ?? "") || undefined;
      payload.prescription_required = prescriptionRequired;
    } else if (category === "Equipment") {
      payload.equipment_type = String(form.get("equipment_type") ?? "") || "General";
      payload.warranty_months = Number(form.get("warranty_months") || 0);
      payload.maintenance_required = maintenanceRequired;
      payload.service_frequency_months =
        Number(form.get("service_frequency_months")) || undefined;
    }

    try {
      if (item) {
        await api.put(`/items/${item.ItemID}`, payload);
      } else {
        await api.post<number>("/items", payload);
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
          Add Item
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item ? "Edit inventory item" : "Add inventory item"}</DialogTitle>
            <DialogDescription>
              {item ? "Update inventory item and specifications." : "Create common inventory master data used by stock operations."}
            </DialogDescription>
          </DialogHeader>
          <form key={fullItem?.ItemID ?? "new"} onSubmit={submit} className="space-y-4">
            {detailLoading ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading item specifications...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="item_name">Item name</Label>
                  <Input id="item_name" name="item_name" defaultValue={fullItem?.ItemName ?? item?.ItemName} required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setCategory(value ?? "Medicine")}
                      disabled={!!item}
                    >
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
                    <Input
                      id="unit_of_measure"
                      name="unit_of_measure"
                      defaultValue={fullItem?.UnitOfMeasure ?? item?.UnitOfMeasure}
                      placeholder="Tablets, boxes, units"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="reorder_level">Reorder</Label>
                    <Input
                      id="reorder_level"
                      name="reorder_level"
                      min={0}
                      type="number"
                      defaultValue={fullItem?.ReorderLevel ?? item?.ReorderLevel ?? 0}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maximum_stock_level">Maximum</Label>
                    <Input
                      id="maximum_stock_level"
                      name="maximum_stock_level"
                      min={0}
                      type="number"
                      defaultValue={fullItem?.MaximumStockLevel ?? item?.MaximumStockLevel ?? 0}
                    />
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

                {/* Dynamic Medicine fields */}
                {category === "Medicine" && (
                  <div className="border-t pt-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Medicine Specifications
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="generic_name">Generic Name</Label>
                        <Input
                          id="generic_name"
                          name="generic_name"
                          defaultValue={fullItem?.GenericName}
                          placeholder="e.g. Paracetamol"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="brand_name">Brand Name (Optional)</Label>
                        <Input
                          id="brand_name"
                          name="brand_name"
                          defaultValue={fullItem?.BrandName}
                          placeholder="e.g. Panadol"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          name="dosage"
                          defaultValue={fullItem?.Dosage}
                          placeholder="e.g. 500mg, 5ml"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="drug_form">Drug Form</Label>
                        <Input
                          id="drug_form"
                          name="drug_form"
                          defaultValue={fullItem?.DrugForm}
                          placeholder="e.g. Tablet, Syrup, Injection"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="storage_condition">Storage Condition (Optional)</Label>
                      <Input
                        id="storage_condition"
                        name="storage_condition"
                        defaultValue={fullItem?.StorageCondition}
                        placeholder="e.g. Store below 25°C"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="prescription_required"
                        checked={prescriptionRequired}
                        onChange={(e) => setPrescriptionRequired(e.target.checked)}
                        className="h-4 w-4 rounded border-border bg-background accent-primary text-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <label
                        htmlFor="prescription_required"
                        className="text-xs font-medium leading-none cursor-pointer select-none"
                      >
                        Prescription Required
                      </label>
                    </div>
                  </div>
                )}

                {/* Dynamic Equipment fields */}
                {category === "Equipment" && (
                  <div className="border-t pt-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Equipment Specifications
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="equipment_type">Equipment Type</Label>
                        <Input
                          id="equipment_type"
                          name="equipment_type"
                          defaultValue={fullItem?.EquipmentType}
                          placeholder="e.g. Diagnostic, Surgical"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="warranty_months">Warranty (Months)</Label>
                        <Input
                          id="warranty_months"
                          name="warranty_months"
                          type="number"
                          min={0}
                          defaultValue={fullItem?.WarrantyMonths ?? 0}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="service_frequency_months">Service Frequency (Months)</Label>
                        <Input
                          id="service_frequency_months"
                          name="service_frequency_months"
                          type="number"
                          min={0}
                          defaultValue={fullItem?.ServiceFrequencyMonths}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="maintenance_required"
                          checked={maintenanceRequired}
                          onChange={(e) => setMaintenanceRequired(e.target.checked)}
                          className="h-4 w-4 rounded border-border bg-background accent-primary text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <label
                          htmlFor="maintenance_required"
                          className="text-xs font-medium leading-none cursor-pointer select-none"
                        >
                          Maintenance Required
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={saving || detailLoading} type="submit">
                {saving ? "Saving..." : item ? "Update item" : "Save item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
