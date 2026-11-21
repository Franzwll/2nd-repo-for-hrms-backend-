import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { essApi, type ApiEssOverview } from "@/lib/api";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatHeaderDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] || fullName;
}

export function EssHeroBanner() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    essApi
      .overview()
      .then((res) => setOverview(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const employeeName = overview?.employee?.name ?? "";
  const position = overview?.employee?.position ?? "";
  const attendanceStatus = overview?.today_attendance?.status ?? "Not Clocked In";
  const timeIn = overview?.today_attendance?.time_in;
  const timeOut = overview?.today_attendance?.time_out;

  // Build the attendance status label
  let clockLabel: string;
  if (attendanceStatus === "Clocked In" && timeIn) {
    clockLabel = `Clock out · in at ${timeIn}`;
  } else if (attendanceStatus === "Clocked Out" && timeOut) {
    clockLabel = `Clocked out at ${timeOut}`;
  } else if (attendanceStatus === "Clocked Out") {
    clockLabel = "Clocked out";
  } else {
    clockLabel = "Not yet clocked in";
  }

  if (loading) {
    return (
      <div className="mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-3 mt-3">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>
        <div className="gold-rule mt-4" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-balance sm:text-3xl md:text-4xl">
            {getGreeting()}, {getFirstName(employeeName)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {position} · {formatHeaderDate()}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {/* Attendance status label */}
            <span className="inline-flex items-center text-sm text-muted-foreground">
              {clockLabel}
            </span>

            {/* Separator dot */}
            <span className="text-border hidden sm:inline">·</span>

            {/* File request button */}
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 shadow-xs"
              onClick={() =>
                navigate({ to: "/employee/my-requests/$module", params: { module: "attendance" } })
              }
            >
              <FileText className="h-4 w-4 text-primary" />
              File request
            </Button>
          </div>
        </div>
      </div>
      <div className="gold-rule mt-4" />
    </div>
  );
}
