export type DayStatus = "present" | "late" | "absent" | "leave" | "rest";

export const STATUS_LABEL: Record<DayStatus, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  leave: "Leave",
  rest: "Off",
};

export const LEGEND: { status: DayStatus; label: string }[] = [
  { status: "present", label: "Present" },
  { status: "late", label: "Late" },
  { status: "absent", label: "Absent" },
  { status: "leave", label: "Leave" },
  { status: "rest", label: "Off" },
];

/**
 * Normalizes a DTR row into a single attendance verdict. Rows often store the
 * process state in `status` ("Completed") and the actual verdict in `remark`
 * ("Present", "Late 7 mins", ...).
 */
export function statusOf(h: any): DayStatus | null {
  const status = String(h?.status ?? "").toLowerCase();
  const remark = String(h?.remark ?? h?.remarks ?? "").toLowerCase();
  const text = `${status} ${remark}`;

  if (/absent|awol|no[-\s]?show/.test(text)) return "absent";
  if (/late|tardy/.test(text)) return "late";
  if (/rest|off[-\s]?duty|day[-\s]?off/.test(text)) return "rest";
  if (/leave|sick|vacation|maternity|paternity|bereavement/.test(text)) return "leave";
  if (/present|on[-\s]?time|completed|regular/.test(text)) return "present";
  if (Number(h?.lateMinutes ?? h?.late_minutes ?? 0) > 0) return "late";
  if (Number(h?.workedHours ?? h?.hours_worked ?? 0) > 0) return "present";
  return null;
}

export function attendanceLabel(h: any): string {
  const status = statusOf(h);
  if (status) return STATUS_LABEL[status];
  return h?.remark || h?.remarks || h?.status || "—";
}

/** Status wording used by the attendance records table. */
export function attendanceTableStatus(h: any): string {
  switch (statusOf(h)) {
    case "present":
      return "Present";
    case "late":
      return "Late";
    case "absent":
      return "Absent";
    case "leave":
      return "On leave";
    case "rest":
      return "Rest day";
    default:
      return h?.remark || h?.remarks || h?.status || "—";
  }
}
