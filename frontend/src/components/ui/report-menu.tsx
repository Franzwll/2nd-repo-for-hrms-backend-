import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportReport, type ReportData, type ReportFormat } from "@/lib/report-export";
import { cn } from "@/lib/utils";

/**
 * Standard "Generate Report" control for every module.
 *
 * Always render it OUTSIDE data cards — in the PageHeader `actions` slot
 * (like Recruitment & Onboarding) or in a toolbar row above the card —
 * never inside a CardHeader next to filters.
 *
 *   <PageHeader … actions={<ReportMenu report={myReport} recordCount={rows.length} />} />
 */
export function ReportMenu({
  report,
  recordCount,
  label = "Generate Report",
  buttonClassName,
  size = "default",
}: {
  report: ReportData | (() => ReportData);
  recordCount?: number;
  label?: string;
  buttonClassName?: string;
  size?: "default" | "sm" | "icon";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={cn("gap-2", buttonClassName)}>
          <Download className="h-4 w-4" /> {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["pdf", "docx", "excel"] as ReportFormat[]).map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => {
              const data = typeof report === "function" ? report() : report;
              exportReport(data, format);
              toast.success(
                `${data.title} exported as ${format.toUpperCase()}` +
                  (recordCount !== undefined ? ` (${recordCount} records).` : "."),
              );
            }}
          >
            <FileText className="mr-2 h-4 w-4" /> Export as {format.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
