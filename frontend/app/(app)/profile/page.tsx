"use client";

import { useState } from "react";
import { LogOut, Mail, Phone, ShieldCheck, UserCircle, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api, getErrorMessage } from "@/lib/api";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  
  // Password change states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/admin/staff/${user?.StaffID}`, {
        // Required payload fields (relaxed endpoint checks let us pass empty/stale fields that backend overrides)
        department_id: user?.DepartmentID ?? 1,
        full_name: user?.FullName ?? "",
        role: user?.Role ?? "",
        email: user?.Email ?? "",
        username: user?.Username ?? "",
        phone: user?.Phone ?? "",
        password: password,
      });
      setSuccess("Your password was updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your account details and assigned permissions."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void logout().then(() => {
                window.location.href = "/login";
              })
            }
          >
            <LogOut className="size-4" aria-hidden="true" />
            Logout
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="size-5 text-muted-foreground" aria-hidden="true" />
              {user?.FullName}
            </CardTitle>
            <CardDescription>{user?.Username}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ProfileField label="Role" value={<StatusBadge value={user?.Role} />} icon={ShieldCheck} />
            <ProfileField label="Department" value={user?.DepartmentName ?? `Department ${user?.DepartmentID ?? "-"}`} />
            <ProfileField label="Email" value={user?.Email ?? "-"} icon={Mail} />
            <ProfileField label="Phone" value={user?.Phone ?? "-"} icon={Phone} />
            <ProfileField label="Status" value={<StatusBadge value={user?.Status} />} />
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-muted-foreground" aria-hidden="true" />
              Change Password
            </CardTitle>
            <CardDescription>Update your system login credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {success && (
                <Alert className="border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
        {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}
