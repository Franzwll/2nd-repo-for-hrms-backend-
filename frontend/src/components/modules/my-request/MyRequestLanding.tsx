import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeftRight,
  FileCheck,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/portal/PageHeader";
import { MY_REQUEST_MODULE_LIST, type MyRequestModuleId } from "./myRequestModules";

const MODULE_ICONS: Record<MyRequestModuleId, LucideIcon> = {
  payroll: Wallet,
  attendance: ArrowLeftRight,
  promotion: TrendingUp,
  documents: FileCheck,
};

export function MyRequestLanding() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee Self-Service"
        title="My Request"
        description="File and track your requests. Every submission routes directly to the right HR team."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {MY_REQUEST_MODULE_LIST.map((m) => {
          const Icon = MODULE_ICONS[m.id];
          return (
            <Link
              key={m.id}
              to="/employee/my-requests/$module"
              params={{ module: m.id }}
              className="group block focus-visible:outline-none"
            >
              <Card className="h-full border-border/70 shadow-xs transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-semibold">{m.label}</h2>
                    <p className="text-xs leading-relaxed text-muted-foreground">{m.description}</p>
                  </div>
                  <p className="mt-auto text-[11px] font-semibold uppercase tracking-wide text-primary">
                    View & submit requests
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
