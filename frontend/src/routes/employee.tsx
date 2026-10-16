import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { PortalShell } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/employee")({
  head: () => ({
    meta: [
      { title: "Employee Portal — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Employee self-service portal for Oxford Suites Makati: payslips, leave requests, schedules, and documents.",
      },
    ],
  }),
  component: EmployeeLayout,
});

function EmployeeLayout() {
  // Full document reload on every in-portal navigation (sidebar modules,
  // ESS category tabs, quick actions, stat cards). Intercepts the anchor
  // TanStack Link renders under the hood in the capture phase — before the
  // router's SPA handler — and hard-navigates instead. Scoped to
  // /employee hrefs so public site + admin/superadmin portals keep SPA nav.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/employee")) return;
      e.preventDefault();
      e.stopPropagation();
      const current = window.location.pathname + window.location.search;
      if (current === href) window.location.reload();
      else window.location.assign(href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <PortalShell role="employee">
      <Outlet />
    </PortalShell>
  );
}
