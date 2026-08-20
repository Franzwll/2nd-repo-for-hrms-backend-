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
