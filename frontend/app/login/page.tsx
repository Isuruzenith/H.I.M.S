"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hospital } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await login(String(form.get("username") ?? ""), String(form.get("password") ?? ""));
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      <section className="hidden w-[42%] flex-col justify-between bg-sidebar p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Hospital className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide text-sidebar-foreground">{APP_NAME}</p>
            <p className="text-xs text-sidebar-foreground/60">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold leading-snug text-sidebar-foreground">
            Hospital inventory,<br />managed with precision.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-sidebar-foreground/65">
            Track medicines, equipment, stock batches, and procurement — all in one
            centralized system for your healthcare facility.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/40">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Hospital className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">{APP_NAME}</p>
                <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your staff credentials to access the system.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Unable to sign in</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="e.g. anjali.admin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button className="w-full" size="lg" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
