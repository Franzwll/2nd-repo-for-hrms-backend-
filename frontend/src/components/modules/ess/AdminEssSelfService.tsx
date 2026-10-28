import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { essApi } from "@/lib/api";
import { EmployeeEss } from "./EmployeeEss";
import type { EssBasePath } from "./EssPortalContext";

type LinkState =
  | { status: "loading" }
  | { status: "linked" }
  | { status: "unlinked"; message?: string };

export function AdminEssSelfService({ basePath }: { basePath: EssBasePath }) {
  const [state, setState] = useState<LinkState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    essApi
      .myContext()
      .then((res) => {
        if (!cancelled) {
          setState(res.linked ? { status: "linked" } : { status: "unlinked" });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "unlinked",
            message:
              error instanceof Error
                ? error.message
                : "We could not verify your employee link.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Checking employee link">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "unlinked") {
    const userManagementTo =
      basePath === "/superadmin" ? "/superadmin/users" : null;

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-xl border-amber-500/30 bg-amber-500/5 shadow-xs dark:border-amber-400/20 dark:bg-amber-400/10">
          <CardContent className="p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
              No linked employee record
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              This admin account is not linked to an employee record, so personal ESS data
              cannot be shown. Ask a Super Admin to link your account under User Management.
            </p>
            {state.message ? (
              <p className="mt-2 text-xs text-muted-foreground">{state.message}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button asChild variant="outline">
                <a href={basePath}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </a>
              </Button>
              {userManagementTo ? (
                <Button asChild>
                  <a href={userManagementTo}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Open User Management
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EmployeeEss basePath={basePath} viewerRole={basePath === "/superadmin" ? "superadmin" : "admin"} />;
}
