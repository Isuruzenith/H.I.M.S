"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, UserCircle } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { APP_ICON, APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: readonly string[];
}) {
  const pathname = usePathname();
  const Icon = APP_ICON;
  const { user, loading, hasRole, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => !("roles" in item) || hasRole(item.roles));
  const isAllowed = !allowedRoles || hasRole(allowedRoles);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [loading, user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:block">
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">Healthcare inventory</p>
          </div>
        </div>
        <Separator />
        <nav className="space-y-1 p-3">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
              >
                <ItemIcon className="size-4" aria-hidden="true" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Button className="lg:hidden" variant="outline" size="icon" aria-label="Navigation">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
              <div>
                <p className="text-sm font-semibold">{currentTitle(pathname)}</p>
                <p className="text-xs text-muted-foreground">
                  Flask API: {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/issue-stock">
                Issue Stock
              </Link>
              <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/profile">
                <UserCircle className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{user.FullName}</span>
              </Link>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Logout"
                onClick={() =>
                  void logout().then(() => {
                    window.location.href = "/login";
                  })
                }
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t px-4 py-2 lg:hidden">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                className={buttonVariants({
                  variant: pathname === item.href ? "secondary" : "ghost",
                  size: "sm",
                  className: "shrink-0",
                })}
                href={item.href}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-4 lg:p-6">
          {isAllowed ? (
            children
          ) : (
            <div className="rounded-lg border bg-background p-6">
              <p className="text-sm font-semibold">Access denied</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your role does not have permission to open this screen.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function currentTitle(pathname: string) {
  return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    ?.title ?? "Dashboard";
}
