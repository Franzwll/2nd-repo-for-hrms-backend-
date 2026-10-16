import { Badge } from "@/components/ui/badge";

export function EssStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Pending":
    case "Under Review":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium">
          {status}
        </Badge>
      );
    case "Approved":
    case "Completed":
    case "Present":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium">
          {status}
        </Badge>
      );
    case "Available":
    case "Released":
    case "Assigned":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 font-medium">
          {status}
        </Badge>
      );
    case "Submitted":
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 font-medium">
          {status}
        </Badge>
      );
    case "Pending Verification":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium">
          {status}
        </Badge>
      );
    case "Missing":
    case "Rejected":
    case "Absent":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 font-medium">
          {status}
        </Badge>
      );
    case "Returned for Clarification":
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 font-medium">
          Returned
        </Badge>
      );
    case "Late":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-medium">
          Late
        </Badge>
      );
    case "In Progress":
      return (
        <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/30 font-medium">
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
    return { tile: "bg-blue-500/10 border-blue-500/20", icon: "text-blue-500" };
  if (/(med|health|hmo)/.test(c))
    return { tile: "bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-500" };
  if (/(clear|nbi)/.test(c))
    return { tile: "bg-amber-500/10 border-amber-500/20", icon: "text-amber-500" };
  if (/(sss|philhealth|hdmf|pag-ibig|pagibig|statutory|government)/.test(c))
    return { tile: "bg-violet-500/10 border-violet-500/20", icon: "text-violet-500" };
  return { tile: "bg-white border-black/10", icon: "text-red-500" };
}
