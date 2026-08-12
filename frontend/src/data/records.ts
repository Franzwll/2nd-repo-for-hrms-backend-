/**
 * Records archiving metadata for Employee Records (201 files).
 *
 * Philippine DOLE/BIR retention practice: personnel records may be
 * archived once they have been inactive/unmodified for 10+ years.
 * This is demo, client-side-only fixture data — kept separate from
 * src/data/hr.ts so it can evolve independently.
 */
export type RecordMeta = {
  employeeId: string;
  /** Date the 201 file (or its separation) was last updated, ISO yyyy-mm-dd. */
  lastUpdated: string;
};

export const recordMeta: RecordMeta[] = [
  { employeeId: "EMP-0001", lastUpdated: "2026-01-10" },
  { employeeId: "EMP-0002", lastUpdated: "2025-11-02" },
  { employeeId: "EMP-0003", lastUpdated: "2012-06-15" },
  { employeeId: "EMP-0004", lastUpdated: "2026-01-14" },
  { employeeId: "EMP-0005", lastUpdated: "2026-01-20" },
  { employeeId: "EMP-0006", lastUpdated: "2011-03-30" },
  { employeeId: "EMP-0007", lastUpdated: "2024-08-08" },
  { employeeId: "EMP-0008", lastUpdated: "2025-05-19" },
];

const TEN_YEARS_MS = 10 * 365.25 * 24 * 60 * 60 * 1000;

/** True when a record's last-updated date is 10+ years old and should be archived. */
export function isArchivable(lastUpdated: string, now: Date = new Date()): boolean {
  const t = new Date(lastUpdated).getTime();
  if (Number.isNaN(t)) return false;
  return now.getTime() - t >= TEN_YEARS_MS;
}

export function lastUpdatedFor(employeeId: string): string {
  return recordMeta.find((m) => m.employeeId === employeeId)?.lastUpdated ?? "";
}
