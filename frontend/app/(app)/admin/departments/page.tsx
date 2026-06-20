"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Plus } from "lucide-react";

import { AccessGate } from "@/components/layout/access-gate";
import { PageHeader } from "@/components/layout/page-header";
import { DataColumn, DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/tables/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, getErrorMessage } from "@/lib/api";
import type { Department } from "@/types/stock";

export default function DepartmentsAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setDepartments((await api.get<Department[]>("/admin/departments")) ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  async function updateStatus(row: Department) {
    const nextStatus = row.Status === "Active" ? "Inactive" : "Active";
    try {
      await api.patch(`/admin/departments/${row.DepartmentID}/status`, { status: nextStatus });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const filtered = useMemo(() => {
    const token = search.toLowerCase();
    return departments.filter((row) =>
      [row.DepartmentName, row.Location, row.ContactNumber, row.Status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(token))
    );
  }, [departments, search]);

  const columns: DataColumn<Department>[] = [
    { header: "Department", cell: (row) => row.DepartmentName },
    { header: "Location", cell: (row) => row.Location ?? "-" },
    { header: "Contact", cell: (row) => row.ContactNumber ?? "-" },
    { header: "Status", cell: (row) => <StatusBadge value={row.Status} /> },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <DepartmentDialog department={row} onSaved={load} />
          <Button variant="outline" size="sm" onClick={() => void updateStatus(row)}>
            {row.Status === "Active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AccessGate allowedRoles={["Admin"]}>
      <PageHeader
        title="Departments"
        description="Manage hospital departments used by staff and issue requests."
        action={<DepartmentDialog onSaved={load} />}
      />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Department admin error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Department records</CardTitle>
          <CardDescription>Hospital departments linked to staff and stock issue requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </AccessGate>
  );
}

function DepartmentDialog({ department, onSaved }: { department?: Department; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(department?.Status ?? "Active");
  const isEdit = Boolean(department);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      department_name: String(form.get("department_name") ?? ""),
      location: String(form.get("location") ?? ""),
      contact_number: String(form.get("contact_number") ?? ""),
      status,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/departments/${department?.DepartmentID}`, payload);
      } else {
        await api.post("/admin/departments", payload);
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
      <Button variant={isEdit ? "outline" : "default"} size="sm" onClick={() => setOpen(true)}>
        {isEdit ? <Edit className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
        {isEdit ? "Edit" : "Add Department"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit department" : "Add department"}</DialogTitle>
            <DialogDescription>Department records are used for staff assignment and stock issue workflows.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor={`department_name_${department?.DepartmentID ?? "new"}`}>Department name</Label>
              <Input id={`department_name_${department?.DepartmentID ?? "new"}`} name="department_name" defaultValue={department?.DepartmentName} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`location_${department?.DepartmentID ?? "new"}`}>Location</Label>
                <Input id={`location_${department?.DepartmentID ?? "new"}`} name="location" defaultValue={department?.Location} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`contact_number_${department?.DepartmentID ?? "new"}`}>Contact number</Label>
                <Input id={`contact_number_${department?.DepartmentID ?? "new"}`} name="contact_number" defaultValue={department?.ContactNumber} />
              </div>
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
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={saving} type="submit">
                {saving ? "Saving..." : isEdit ? "Save changes" : "Create department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
