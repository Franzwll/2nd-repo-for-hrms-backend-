import { useSyncExternalStore } from "react";

import { newHires as seedHires, type Employee, type NewHire } from "@/data/hr";

/** Draft handed over from Applicant Management when an assessment is accepted. */
export type PendingHire = {
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
};

/**
 * A master checklist template built from Performance's checklist requests.
 * Every checklist created here applies to *all* employees entering
 * Probationary — their starting checklist is the combined items of every
 * template below.
 */
export type MasterChecklistTemplate = {
  id: string;
  title: string;
  items: string[];
  /** Stage the checklist applies to. */
  phase?: "Pre-onboarding" | "Probationary";
  /** "all" positions, or the specific position titles it applies to. */
  positions?: string[] | "all";
  status?: "Active" | "Closed";
};

let hires: NewHire[] = [...seedHires];
/** Employees created from hires — merged into Employee Records. */
let hireEmployees: Employee[] = [];
let pendingHire: PendingHire | null = null;

let masterChecklists: MasterChecklistTemplate[] = [
  {
    id: "MC-001",
    title: "Standard Probationary Checklist",
    items: [
      "Department orientation completed",
      "Job description acknowledged",
      "1st month performance evaluation",
      "3rd month performance evaluation",
      "5th month performance evaluation",
      "Training hours completed",
    ],
    phase: "Probationary",
    positions: "all",
    status: "Active",
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const DEFAULT_ACCOUNT_PASSWORD = "Oxford@2026";

export const hireStore = {
  subscribe,
  getHires: () => hires,
  getEmployees: () => hireEmployees,
  getPending: () => pendingHire,
  getMasterChecklists: () => masterChecklists,
  setHires: (updater: (prev: NewHire[]) => NewHire[]) => {
    hires = updater(hires);
    emit();
  },
  /** Adds a hire and mirrors them into Employee Records straight away. */
  add: (hire: NewHire) => {
    hires = [hire, ...hires];
    hireEmployees = [
      {
        id: `EMP-${String(9000 + hireEmployees.length + 1)}`,
        name: hire.name,
        position: hire.position,
        department: hire.department,
        employmentType: "Probationary",
        dateHired: hire.startDate,
        email: hire.email,
        phone: hire.phone,
        supervisor: "—",
        status: "Active",
      },
      ...hireEmployees,
    ];
    emit();
  },
  setPending: (p: PendingHire | null) => {
    pendingHire = p;
    emit();
  },
  /** Atomically takes the pending hire (returns null if already consumed). */
  consumePending: () => {
    const p = pendingHire;
    pendingHire = null;
    if (p) emit();
    return p;
  },
  /** True when a hire with the same name + position already exists. */
  exists: (name: string, position: string) =>
    hires.some((h) => h.name === name && h.position === position),
  /** All items across every master checklist template — the starting
   *  requirements checklist for a hire entering Probationary. */
  combinedProbationaryItems: () =>
    masterChecklists
      .filter((c) => (c.phase ?? "Probationary") === "Probationary" && (c.status ?? "Active") === "Active")
      .flatMap((c) => c.items),
  addMasterChecklist: (
    title: string,
    items: string[],
    meta?: Pick<MasterChecklistTemplate, "phase" | "positions" | "status">,
  ) => {
    masterChecklists = [
      ...masterChecklists,
      {
        id: `MC-${String(masterChecklists.length + 1).padStart(3, "0")}-${Date.now()}`,
        title,
        items,
        phase: meta?.phase ?? "Probationary",
        positions: meta?.positions ?? "all",
        status: meta?.status ?? "Active",
      },
    ];
    emit();
  },
  updateMasterChecklist: (
    id: string,
    patch: Partial<Pick<MasterChecklistTemplate, "title" | "items" | "phase" | "positions" | "status">>,
  ) => {
    masterChecklists = masterChecklists.map((c) => (c.id === id ? { ...c, ...patch } : c));
    emit();
  },
  deleteMasterChecklist: (id: string) => {
    masterChecklists = masterChecklists.filter((c) => c.id !== id);
    emit();
  },
};

export function useHires() {
  return useSyncExternalStore(subscribe, hireStore.getHires, hireStore.getHires);
}

export function useHireEmployees() {
  return useSyncExternalStore(subscribe, hireStore.getEmployees, hireStore.getEmployees);
}

export function usePendingHire() {
  return useSyncExternalStore(subscribe, hireStore.getPending, hireStore.getPending);
}

export function useMasterChecklists() {
  return useSyncExternalStore(subscribe, hireStore.getMasterChecklists, hireStore.getMasterChecklists);
}
