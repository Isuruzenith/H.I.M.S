"use client";

import { LogOut, Mail, Phone, ShieldCheck, UserCircle } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/tables/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user, logout } = useAuth();

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
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="size-5 text-muted-foreground" aria-hidden="true" />
            {user?.FullName}
          </CardTitle>
          <CardDescription>{user?.Username}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ProfileField label="Role" value={<StatusBadge value={user?.Role} />} icon={ShieldCheck} />
          <ProfileField label="Department" value={user?.DepartmentName ?? `Department ${user?.DepartmentID ?? "-"}`} />
          <ProfileField label="Email" value={user?.Email ?? "-"} icon={Mail} />
          <ProfileField label="Phone" value={user?.Phone ?? "-"} icon={Phone} />
          <ProfileField label="Status" value={<StatusBadge value={user?.Status} />} />
        </CardContent>
      </Card>
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
