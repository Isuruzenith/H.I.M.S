"use client";

import { useAuth } from "@/components/auth/auth-provider";

export function AccessGate({
  allowedRoles,
  children,
}: {
  allowedRoles: readonly string[];
  children: React.ReactNode;
}) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return (
      <div className="rounded-md border bg-card p-8 text-center">
        <p className="text-sm font-semibold">Access Restricted</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account does not have permission to view this section.
        </p>
      </div>
    );
  }

  return children;
}
