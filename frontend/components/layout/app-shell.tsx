"use client";

import Link from "next/link";
import { memo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { APP_ICON, APP_NAME, APP_TAGLINE, NAV_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/types/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, hasRole, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-pulse rounded-md bg-muted" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar pathname={pathname} user={user} hasRole={hasRole} />

      <div className="lg:pl-[260px]">
        <AppHeader
          pathname={pathname}
          user={user}
          hasRole={hasRole}
          onLogout={() =>
            void logout().then(() => {
              router.replace("/login");
            })
          }
        />

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

const AppSidebar = memo(function AppSidebar({
  pathname,
  user,
  hasRole,
}: {
  pathname: string;
  user: CurrentUser;
  hasRole: (roles: readonly string[]) => boolean;
}) {
  const Icon = APP_ICON;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex flex-col justify-center py-5 border-b border-sidebar-border px-5 gap-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-wide text-sidebar-foreground leading-tight">
              Jeewaka Hospital
            </p>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase leading-none mt-0.5">
              PADUKKA
            </p>
          </div>
        </div>
        <p className="text-[10.5px] leading-normal text-sidebar-foreground/60 font-medium">
          Smart Healthcare Inventory Management System (H.I.M.S)
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => !item.roles || hasRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <ItemIcon className="size-4 shrink-0 opacity-80" aria-hidden="true" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
            <UserCircle className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-foreground">{user.FullName}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/55">{user.Role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
});

function AppHeader({
  pathname,
  user,
  hasRole,
  onLogout,
}: {
  pathname: string;
  user: CurrentUser;
  hasRole: (roles: readonly string[]) => boolean;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b bg-card shadow-sm">
      <div className="flex h-[60px] items-center justify-between gap-4 px-4 lg:px-6">
        <div>
          <p className="text-sm font-semibold text-foreground">{currentTitle(pathname)}</p>
          <p className="text-xs text-muted-foreground">
            {user.DepartmentName ?? "Hospital"} &middot; {user.Role}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link className={buttonVariants({ variant: "default", size: "sm" })} href="/issue-stock">
            Issue Stock
          </Link>
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/profile">
            Profile
          </Link>
          <Button variant="ghost" size="icon-sm" aria-label="Logout" onClick={onLogout}>
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2 lg:hidden">
        {NAV_GROUPS.flatMap((group) =>
          group.items
            .filter((item) => !item.roles || hasRole(item.roles))
            .map((item) => (
              <Link
                key={item.href}
                className={buttonVariants({
                  variant:
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "secondary"
                      : "ghost",
                  size: "sm",
                  className: "shrink-0 text-xs",
                })}
                href={item.href}
                prefetch
              >
                {item.title}
              </Link>
            ))
        )}
      </nav>
    </header>
  );
}

function currentTitle(pathname: string) {
  for (const group of NAV_GROUPS) {
    const match = group.items.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    if (match) return match.title;
  }
  return "Dashboard";
}
