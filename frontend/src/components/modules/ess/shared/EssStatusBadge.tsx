import { Badge } from "@/components/ui/badge";

export function EssStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Pending":
    case "Under Review":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20"
        >
          {status}
        </Badge>
      );
    case "Approved":
    case "Completed":
    case "Present":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20"
        >
          {status}
        </Badge>
      );
    case "For Dispatch":
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-600 border-sky-500/30 font-medium dark:bg-sky-400/10 dark:text-sky-400 dark:border-sky-400/20"
        >
          For Dispatch
        </Badge>
      );
    case "With Module":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 font-medium dark:bg-indigo-400/10 dark:text-indigo-400 dark:border-indigo-400/20"
        >
          With Module
        </Badge>
      );
    case "For Release":
      return (
        <Badge
          variant="outline"
          className="bg-teal-500/10 text-teal-600 border-teal-500/30 font-medium dark:bg-teal-400/10 dark:text-teal-400 dark:border-teal-400/20"
        >
          For Release
        </Badge>
      );
    case "For Fulfillment":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 font-medium dark:bg-indigo-400/10 dark:text-indigo-400 dark:border-indigo-400/20"
        >
          With Module
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-600 border-slate-500/30 font-medium dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/20"
        >
          Cancelled
        </Badge>
      );
    case "Available":
    case "Released":
    case "Assigned":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-600 border-blue-500/30 font-medium dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20"
        >
          {status}
        </Badge>
      );
    case "Verified":
    case "Verified & Active":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20"
        >
          {status}
        </Badge>
      );
    case "Submitted":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium dark:bg-purple-400/10 dark:text-purple-400 dark:border-purple-400/20"
        >
          {status}
        </Badge>
      );
    case "Pending Verification":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20"
        >
          {status}
        </Badge>
      );
    case "Missing":
    case "Rejected":
    case "Absent":
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-600 border-rose-500/30 font-medium dark:bg-rose-400/10 dark:text-rose-400 dark:border-rose-400/20"
        >
          {status}
        </Badge>
      );
    case "Returned for Clarification":
      return (
        <Badge
          variant="outline"
          className="bg-orange-500/10 text-orange-600 border-orange-500/30 font-medium dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20"
        >
          Returned
        </Badge>
      );
    case "Late":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20"
        >
          Late
        </Badge>
      );
    case "Off":
    case "Rest Day":
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-600 border-slate-500/30 font-medium dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/20"
        >
          {status}
        </Badge>
      );
    case "Leave":
    case "Sick Leave":
    case "Vacation Leave":
      return (
        <Badge
          variant="outline"
          className="bg-violet-500/10 text-violet-600 border-violet-500/30 font-medium dark:bg-violet-400/10 dark:text-violet-400 dark:border-violet-400/20"
        >
          {status}
        </Badge>
      );
    case "In Progress":
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-600 border-sky-500/30 font-medium dark:bg-sky-400/10 dark:text-sky-400 dark:border-sky-400/20"
        >
          In Progress
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

/** Per-category tint for document icon tiles (tax blue, medical green, clearance amber, statutory violet). */
export function docCategoryTint(category: string) {
  const c = String(category ?? "").toLowerCase();
  if (/(tax|bir)/.test(c))
    return {
      tile: "bg-gradient-to-br from-blue-500/25 to-blue-500/5 border-blue-500/25 dark:from-blue-400/20 dark:to-blue-400/5 dark:border-blue-400/20",
      icon: "text-blue-500 dark:text-blue-400",
    };
  if (/(med|health|hmo)/.test(c))
    return {
      tile: "bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 border-emerald-500/25 dark:from-emerald-400/20 dark:to-emerald-400/5 dark:border-emerald-400/20",
      icon: "text-emerald-500 dark:text-emerald-400",
    };
  if (/(clear|nbi)/.test(c))
    return {
      tile: "bg-gradient-to-br from-amber-500/25 to-amber-500/5 border-amber-500/25 dark:from-amber-400/20 dark:to-amber-400/5 dark:border-amber-400/20",
      icon: "text-amber-500 dark:text-amber-400",
    };
  if (/(sss|philhealth|hdmf|pag-ibig|pagibig|statutory|government)/.test(c))
    return {
      tile: "bg-gradient-to-br from-violet-500/25 to-violet-500/5 border-violet-500/25 dark:from-violet-400/20 dark:to-violet-400/5 dark:border-violet-400/20",
      icon: "text-violet-500 dark:text-violet-400",
    };
  return {
    tile: "bg-gradient-to-br from-red-500/15 to-red-500/5 border-red-500/20 dark:from-red-400/10 dark:to-red-400/5 dark:border-red-400/20",
    icon: "text-red-500 dark:text-red-400",
  };
}

/** Statuses that mean the document is on file (drives the metric count). */
export const ON_FILE_STATUSES = [
  "Submitted",
  "Available",
  "Released",
  "Verified",
  "Verified & Active",
  "Active",
];
