import { useSyncExternalStore } from "react";

/**
 * Unrecognized-entity report queue.
 *
 * HR can flag an entity (skill, job role, certification, education or
 * experience) that the NLP service classified as UNRECOGNIZED straight from a
 * Resume Screening Result. Reported entities land in this queue and are
 * processed in Recruitment Management → Screening Setup → Reported Entities,
 * where they can be promoted into the screening reference vocabulary.
 *
 * Backed by localStorage so the queue survives reloads and is shared across
 * tabs on the same browser (the screening reference data itself stays
 * DB-managed through `screeningApi`).
 */

export type ReportedEntityType =
  | "skill"
  | "job_role"
  | "certification"
  | "education"
  | "experience";

export interface ReportedEntity {
  id: string;
  /** The raw entity text as extracted from the resume. */
  value: string;
  /** Best-guess reference-data type based on where it was reported. */
  suggestedType: ReportedEntityType;
  /** Where the report came from (e.g. "Resume Screening Result"). */
  source: string;
  /** Applicant name / id the entity was extracted from, when known. */
  applicant?: string;
  reportedAt: string;
  status: "pending" | "processed" | "dismissed";
}

const STORAGE_KEY = "hrms.reported-entities.v1";

function loadFromStorage(): ReportedEntity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ReportedEntity[]) : [];
  } catch {
    return [];
  }
}

let items: ReportedEntity[] = loadFromStorage();

const listeners = new Set<() => void>();
const emit = () => {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full / private mode — the in-memory queue still works.
    }
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => items;

/** React hook — re-renders the caller whenever the queue changes. */
export const useReportedEntities = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const reportedEntitiesStore = {
  list: () => items,
  /** Adds a report (idempotent: duplicates of a pending entity are skipped). */
  report: (input: {
    value: string;
    suggestedType: ReportedEntityType;
    source?: string;
    applicant?: string;
  }): ReportedEntity => {
    const value = input.value.trim();
    const existing = items.find(
      (r) =>
        r.status === "pending" &&
        r.value.toLowerCase() === value.toLowerCase() &&
        r.suggestedType === input.suggestedType,
    );
    if (existing) return existing;
    const entry: ReportedEntity = {
      id: `RE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      value,
      suggestedType: input.suggestedType,
      source: input.source ?? "Resume Screening Result",
      reportedAt: new Date().toISOString(),
      status: "pending",
      ...(input.applicant ? { applicant: input.applicant } : {}),
    };
    items = [entry, ...items];
    emit();
    return entry;
  },
  markProcessed: (id: string) => {
    items = items.map((r) => (r.id === id ? { ...r, status: "processed" } : r));
    emit();
  },
  dismiss: (id: string) => {
    items = items.map((r) => (r.id === id ? { ...r, status: "dismissed" } : r));
    emit();
  },
  remove: (id: string) => {
    items = items.filter((r) => r.id !== id);
    emit();
  },
  clearProcessed: () => {
    items = items.filter((r) => r.status === "pending");
    emit();
  },
};
