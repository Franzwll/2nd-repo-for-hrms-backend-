import { useSyncExternalStore } from "react";
import { newHires as seedHires, type Employee, type NewHire } from "@/data/hr";
import { newHiresApi, checklistTemplatesApi, type ApiNewHire, type ApiChecklistTemplate } from "@/lib/api";

/** Draft handed over from Applicant Management when an assessment is accepted. */
export type PendingHire = {
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  /** Database applicant id — lets the backend derive position/department. */
  applicantId?: number;
};

/**
 * A master checklist template built from Performance's checklist requests.
 */
export type MasterChecklistTemplate = {
  id: string;
  dbId?: number;
  title: string;
  items: string[];
  /** Stage the checklist applies to. */
  phase?: "Pre-onboarding" | "Probationary";
  /** "all" positions, or the specific position titles it applies to. */
  positions?: string[] | "all";
  status?: "Active" | "Closed";
};

function transformApiNewHire(h: ApiNewHire): NewHire {
  const parts = h.name.split(" ");
  const initials = parts.map((p) => p[0]).slice(0, 3).join("").toUpperCase();
  return {
    id: h.new_hire_code || `NH-${h.new_hire_id}`,
    dbId: h.new_hire_id,
    name: h.name,
    initials,
    position: h.position || "Staff",
    department: h.department || "General",
    email: h.email || "",
    phone: h.phone || "",
    stage: h.stage as "Pre-onboarding" | "Probationary",
    startDate: h.start_date || new Date().toISOString().slice(0, 10),
    checklist: (h.onboarding_items || []).map((i) => ({
      item: i.item_text,
      done: i.done,
    })),
  };
}

function transformApiTemplate(t: ApiChecklistTemplate): MasterChecklistTemplate {
  return {
    id: t.template_code || `OCT-${t.template_id}`,
    dbId: t.template_id,
    title: t.title,
    items: (t.items || []).map((i) => i.item_text),
    phase: (t.phase === "Pre-onboarding" ? "Pre-onboarding" : "Probationary") as any,
    positions: "all",
    status: t.status === "Active" ? "Active" : "Closed",
  };
}

let hires: NewHire[] = [...seedHires];
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
  if (!hasFetched) fetchHiresFromApi();
  return () => listeners.delete(listener);
};

let hasFetched = false;
async function fetchHiresFromApi() {
  if (hasFetched) return;
  hasFetched = true;
  try {
    const [hiresRes, tmplRes] = await Promise.allSettled([
      newHiresApi.list({ per_page: 100 }),
      checklistTemplatesApi.list({ per_page: 100 }),
    ]);

    if (hiresRes.status === "fulfilled" && hiresRes.value?.data?.length > 0) {
      hires = hiresRes.value.data.map(transformApiNewHire);
    }
    if (tmplRes.status === "fulfilled" && tmplRes.value?.data?.length > 0) {
      masterChecklists = tmplRes.value.data.map(transformApiTemplate);
    }
    emit();
  } catch (err) {
    console.warn("Could not fetch new hires from backend API, using cached data.", err);
  }
}

if (typeof window !== "undefined") {
  fetchHiresFromApi();
}

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
  add: async (hire: NewHire, applicantId?: number) => {
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

    try {
      // applicant_id lets the backend fill position_id/department_id from
      // the applicant's job post, so the hire never shows Staff/General.
      await newHiresApi.create({
        applicant_id: applicantId ?? null,
        name: hire.name,
        email: hire.email,
        phone: hire.phone,
        stage: hire.stage,
        start_date: hire.startDate,
      });
    } catch (e) {
      console.warn("API new hire create error:", e);
    }
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
  addMasterChecklist: async (
    title: string,
    items: string[],
    meta?: Pick<MasterChecklistTemplate, "phase" | "positions" | "status">,
  ) => {
    const newTemplate: MasterChecklistTemplate = {
      id: `MC-${String(masterChecklists.length + 1).padStart(3, "0")}-${Date.now()}`,
      title,
      items,
      phase: meta?.phase ?? "Probationary",
      positions: meta?.positions ?? "all",
      status: meta?.status ?? "Active",
    };
    masterChecklists = [...masterChecklists, newTemplate];
    emit();

    try {
      await checklistTemplatesApi.create({
        title,
        phase: meta?.phase ?? "Probationary",
        status: meta?.status ?? "Active",
        items: items.map((item_text, sort_order) => ({ item_text, sort_order })),
      });
    } catch (e) {
      console.warn("API checklist template create error:", e);
    }
  },
  updateMasterChecklist: async (
    id: string,
    patch: Partial<Pick<MasterChecklistTemplate, "title" | "items" | "phase" | "positions" | "status">>,
  ) => {
    const target = masterChecklists.find((c) => c.id === id);
    masterChecklists = masterChecklists.map((c) => (c.id === id ? { ...c, ...patch } : c));
    emit();

    try {
      if (target?.dbId) {
        await checklistTemplatesApi.update(target.dbId, {
          title: patch.title ?? target.title,
          phase: patch.phase ?? target.phase,
          status: patch.status ?? target.status,
          items: (patch.items ?? target.items).map((item_text, sort_order) => ({
            item_text,
            sort_order,
          })),
        });
      }
    } catch (e) {
      console.warn("API checklist template update error:", e);
    }
  },
  deleteMasterChecklist: (id: string) => {
    const target = masterChecklists.find((c) => c.id === id);
    masterChecklists = masterChecklists.filter((c) => c.id !== id);
    emit();

    try {
      if (target?.dbId) checklistTemplatesApi.delete(target.dbId);
    } catch (e) {
      console.warn("API checklist template delete error:", e);
    }
  },
  /** Updates a hire's details on the database API. */
  updateHire: async (id: string, patch: Partial<Pick<NewHire, "name" | "email" | "phone" | "position" | "department" | "startDate">>) => {
    const target = hires.find((h) => h.id === id);
    if (!target?.dbId) return;
    try {
      await newHiresApi.update(target.dbId, {
        name: patch.name ?? target.name,
        email: patch.email ?? target.email,
        phone: patch.phone ?? target.phone,
        start_date: patch.startDate ?? target.startDate,
      });
    } catch (e) {
      console.warn("API new hire update error:", e);
    }
  },
  /** Promotes a hire to the next stage (Pre-onboarding → Probationary → Regular). */
  promoteHire: async (id: string) => {
    const target = hires.find((h) => h.id === id);
    if (!target?.dbId) return;
    try {
      await newHiresApi.promoteStage(target.dbId);
    } catch (e) {
      console.warn("API new hire promote error:", e);
    }
  },
  refresh: () => {
    hasFetched = false;
    return fetchHiresFromApi();
  }
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
