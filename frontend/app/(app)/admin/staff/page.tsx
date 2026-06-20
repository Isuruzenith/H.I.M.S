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
import { STAFF_ROLES } from "@/types/auth";
import type { Department, Staff } from "@/types/stock";

export default function StaffAdminPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [staffData, departmentData] = await Promise.all([
        api.get<Staff[]>("/admin/staff"),
        api.get<Department[]>("/admin/departments"),
      ]);
      setStaff(staffData ?? []);
      setDepartments(departmentData ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setStaff([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  async function updateStatus(row: Staff) {
    const nextStatus = row.Status === "Active" ? "Inactive" : "Active";
    try {
      await api.patch(`/admin/staff/${row.StaffID}/status`, { status: nextStatus });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const filtered = useMemo(() => {
    const token = search.toLowerCase();
    return staff.filter((row) =>
      [row.FullName, row.Username, row.Email, row.DepartmentName, row.Role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(token))
    );
  }, [search, staff]);

  const columns: DataColumn<Staff>[] = [
    { header: "Name", cell: (row) => row.FullName },
    { header: "Username", cell: (row) => row.Username ?? "-" },
    { header: "Role", cell: (row) => <StatusBadge value={row.Role} /> },
    { header: "Department", cell: (row) => row.DepartmentName ?? "-" },
    { header: "Email", cell: (row) => row.Email ?? "-" },
    { header: "Status", cell: (row) => <StatusBadge value={row.Status} /> },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <StaffDialog staff={row} departments={departments} onSaved={load} />
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
        title="Staff Admin"
        description="Manage staff accounts, roles, departments, and account status."
        action={<StaffDialog departments={departments} onSaved={load} />}
      />
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Staff admin error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Staff accounts</CardTitle>
          <CardDescription>Staff accounts with assigned roles, departments, and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} loading={loading} search={search} onSearch={setSearch} />
        </CardContent>
      </Card>
    </AccessGate>
  );
}

function StaffDialog({
  staff,
  departments,
  onSaved,
}: {
  staff?: Staff;
  departments: Department[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState(staff?.Role ?? "Pharmacist");
  const [status, setStatus] = useState(staff?.Status ?? "Active");
  const [departmentId, setDepartmentId] = useState(String(staff?.DepartmentID ?? departments[0]?.DepartmentID ?? ""));
  const isEdit = Boolean(staff);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const payload = {
      department_id: Number(departmentId || departments[0]?.DepartmentID),
      full_name: String(form.get("full_name") ?? ""),
      role,
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      username: String(form.get("username") ?? ""),
      password: String(form.get("password") ?? ""),
      status,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/staff/${staff?.StaffID}`, payload);
      } else {
        await api.post("/admin/staff", payload);
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
        {isEdit ? "Edit" : "Add Staff"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit staff member" : "Add staff member"}</DialogTitle>
            <DialogDescription>Assign the staff account to a department and system role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`full_name_${staff?.StaffID ?? "new"}`}>Full name</Label>
                <Input id={`full_name_${staff?.StaffID ?? "new"}`} name="full_name" defaultValue={staff?.FullName} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`username_${staff?.StaffID ?? "new"}`}>Username</Label>
                <Input id={`username_${staff?.StaffID ?? "new"}`} name="username" defaultValue={staff?.Username} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={(value) => setDepartmentId(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.DepartmentID} value={String(department.DepartmentID)}>
                        {department.DepartmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value ?? "Pharmacist")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLES.map((staffRole) => (
                      <SelectItem key={staffRole} value={staffRole}>
                        {staffRole}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`email_${staff?.StaffID ?? "new"}`}>Email</Label>
                <Input id={`email_${staff?.StaffID ?? "new"}`} name="email" type="email" defaultValue={staff?.Email} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`phone_${staff?.StaffID ?? "new"}`}>Phone</Label>
                <Input id={`phone_${staff?.StaffID ?? "new"}`} name="phone" defaultValue={staff?.Phone} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`password_${staff?.StaffID ?? "new"}`}>Password</Label>
                <Input id={`password_${staff?.StaffID ?? "new"}`} name="password" type="password" placeholder={isEdit ? "Leave blank to keep current" : "Optional, defaults to username"} />
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
              <Button disabled={saving || departments.length === 0} type="submit">
                {saving ? "Saving..." : isEdit ? "Save changes" : "Create staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
