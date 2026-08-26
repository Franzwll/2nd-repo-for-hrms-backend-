import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { type Employee, type NewHire } from "@/data/hr";
import {
  newHiresApi,
  checklistTemplatesApi,
  onboardingItemsApi,
  type ApiNewHire,
  type ApiChecklistTemplate,
} from "@/lib/api";

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

export type MasterChecklistItem = {
  item_text: string;
  instructions?: string;
  requires_upload?: boolean;
  upload_placeholder?: string;
};

/**
 * A master checklist template built from Performance's checklist requests.
 */
export type MasterChecklistTemplate = {
  id: string;
  dbId?: number;
  title: string;
  items: string[];
  richItems?: MasterChecklistItem[];
  /** Stage the checklist applies to. */
  phase?: "Pre-onboarding" | "Probationary";
  /** "all" positions, or the specific position titles it applies to. */
  positions?: string[] | "all";
  status?: "Active" | "Closed";
};

function transformApiNewHire(h: ApiNewHire): NewHire {
  const parts = h.name.split(" ");
  const initials = parts
    .map((p) => p[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return {
    id: h.new_hire_code || `NH-${h.new_hire_id}`,
    dbId: h.new_hire_id,
    name: h.name,
    initials,
    position: h.position || "Staff",
    department: h.department || "General",
    positionId: h.position_id ?? null,
    departmentId: h.department_id ?? null,
    email: h.email || "",
    phone: h.phone || "",
    stage: h.stage as "Pre-onboarding" | "Probationary",
    startDate: h.start_date || new Date().toISOString().slice(0, 10),
    checklist: (h.onboarding_items || []).map((i) => ({
      item: i.item_text,
      done: i.done,
      ...(i.employee_onboarding_item_id != null ? { dbId: i.employee_onboarding_item_id } : {}),
      ...(i.template_item_id != null ? { templateItemId: i.template_item_id } : {}),
      ...(i.phase === "Probationary" || i.phase === "Pre-onboarding" ? { phase: i.phase } : {}),
    })),
  };
}

function transformApiTemplate(t: ApiChecklistTemplate): MasterChecklistTemplate {
  const scope = t.position_scope ?? [];
  const richItems: MasterChecklistItem[] = (t.items || []).map((i) => ({
    item_text: i.item_text,
    requires_upload: i.requires_upload ?? true,
    ...(i.instructions ? { instructions: i.instructions } : {}),
    ...(i.upload_placeholder ? { upload_placeholder: i.upload_placeholder } : {}),
  }));
  return {
    id: t.template_code || `OCT-${t.template_id}`,
    dbId: t.template_id,
    title: t.title,
    items: richItems.map((i) => i.item_text),
    richItems,
    phase: (t.phase === "Pre-onboarding" ? "Pre-onboarding" : "Probationary") as
      "Pre-onboarding" | "Probationary",
    positions: scope.length === 0 || scope.includes("all") ? "all" : scope,
    status: t.status === "Active" ? "Active" : "Closed",
  };
}

let hires: NewHire[] = [];
let hireEmployees: Employee[] = [];
let pendingHire: PendingHire | null = null;

let masterChecklists: MasterChecklistTemplate[] = [];

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
  await syncFromApi();
}

/** How often to silently refetch so checklist toggles made on one screen
 *  (admin, employee portal, checklist builder) appear everywhere. */
const SYNC_INTERVAL_MS = 15000;
let syncing = false;

/** Refetches new hires + checklist templates from the API and replaces local
 *  data. Safe to call repeatedly — API rows win over local cache. */
async function syncFromApi() {
  if (syncing) return;
  syncing = true;
  try {
    const [hiresRes, tmplRes] = await Promise.allSettled([
      newHiresApi.list({ per_page: 100 }),
      checklistTemplatesApi.list({ per_page: 100 }),
    ]);

    if (hiresRes.status === "fulfilled") {
      // Always replace the hire list — even when the database is empty —
      // so the onboarding pipeline never shows mock data again.
      hires = (hiresRes.value?.data ?? []).map(transformApiNewHire);
    }
    if (tmplRes.status === "fulfilled" && tmplRes.value?.data) {
      // Always replace the template list — even when the database is empty —
      // so the checklist builder never shows mock data again.
      masterChecklists = tmplRes.value.data.map(transformApiTemplate);
    }
    emit();
  } catch (err) {
    console.warn("Could not fetch new hires from backend API, using cached data.", err);
  } finally {
    syncing = false;
  }
}

if (typeof window !== "undefined") {
  fetchHiresFromApi();
  setInterval(() => {
    if (document.visibilityState === "visible") syncFromApi();
  }, SYNC_INTERVAL_MS);
  window.addEventListener("focus", syncFromApi);
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
      const created = await newHiresApi.create({
        applicant_id: applicantId ?? null,
        name: hire.name,
        email: hire.email,
        phone: hire.phone,
        position_id: hire.positionId ?? null,
        department_id: hire.departmentId ?? null,
        stage: hire.stage,
        start_date: hire.startDate,
      });
      // Replace the optimistic row with the DB row, which already carries
      // the checklists auto-applied from matching Active templates.
      hires = hires.map((h) => (h.id === hire.id ? transformApiNewHire(created) : h));
      emit();
      return true;
    } catch (e) {
      console.warn("API new hire create error:", e);
      // Roll the optimistic row back so the pipeline never shows a hire
      // that does not exist in the database.
      hires = hires.filter((h) => h.id !== hire.id);
      hireEmployees = hireEmployees.filter(
        (x) => x.name !== hire.name || x.position !== hire.position,
      );
      emit();
      toast.error(
        `"${hire.name}" could not be saved to the database. Fix any validation issues and add the hire again.`,
      );
      return false;
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
  /** All items across every active master checklist template that applies
   *  to the given position (or to every position when none is given) — the
   *  starting requirements checklist for a hire entering Probationary. */
  combinedProbationaryItems: (position?: string) =>
    masterChecklists
      .filter(
        (c) =>
          (c.phase ?? "Probationary") === "Probationary" && (c.status ?? "Active") === "Active",
      )
      .filter((c) => {
        if (!position) return true;
        return (
          c.positions === "all" || !c.positions || (c.positions as string[]).includes(position)
        );
      })
      .flatMap((c) => c.items),
  addMasterChecklist: async (
    title: string,
    items: string[],
    meta?: Pick<MasterChecklistTemplate, "phase" | "positions" | "status" | "richItems">,
  ) => {
    const richItems: MasterChecklistItem[] =
      meta?.richItems ?? items.map((t) => ({ item_text: t, requires_upload: true }));
    const newTemplate: MasterChecklistTemplate = {
      id: `MC-${String(masterChecklists.length + 1).padStart(3, "0")}-${Date.now()}`,
      title,
      items: richItems.map((r) => r.item_text),
      richItems,
      phase: meta?.phase ?? "Probationary",
      positions: meta?.positions ?? "all",
      status: meta?.status ?? "Active",
    };
    masterChecklists = [...masterChecklists, newTemplate];
    emit();

    try {
      const created = await checklistTemplatesApi.create({
        title,
        phase: meta?.phase ?? "Probationary",
        status: meta?.status ?? "Active",
        position_scope_json: meta?.positions === "all" || !meta?.positions ? [] : meta.positions,
        items: richItems.map((r, sort_order) => ({
          item_text: r.item_text,
          instructions: r.instructions ?? null,
          requires_upload: r.requires_upload ?? true,
          upload_placeholder: r.upload_placeholder ?? null,
          sort_order,
        })),
      });
      // Remember the database id so later edits persist too
      masterChecklists = masterChecklists.map((c) =>
        c.id === newTemplate.id
          ? {
              ...c,
              dbId: created.template_id,
              id: created.template_code || c.id,
            }
          : c,
      );
      emit();
      // Re-sync hires + templates so a newly-created Active template starts
      // appearing on the matching hires' checklists right away.
      await syncFromApi();
    } catch (e) {
      console.warn("API checklist template create error:", e);
      toast.error("The checklist template could not be saved to the database.");
    }
  },
  updateMasterChecklist: async (
    id: string,
    patch: Partial<
      Pick<
        MasterChecklistTemplate,
        "title" | "items" | "richItems" | "phase" | "positions" | "status"
      >
    >,
  ) => {
    const target = masterChecklists.find((c) => c.id === id);
    const richItems: MasterChecklistItem[] =
      patch.richItems ??
      (patch.items
        ? patch.items.map((text) => {
            const existing = target?.richItems?.find((r) => r.item_text === text);
            return existing ?? { item_text: text, requires_upload: true };
          })
        : (target?.richItems ?? []));

    const updatedPatch: Partial<MasterChecklistTemplate> = {
      ...patch,
      items:
        richItems.length > 0
          ? richItems.map((r) => r.item_text)
          : (patch.items ?? target?.items ?? []),
      richItems,
    };

    masterChecklists = masterChecklists.map((c) => (c.id === id ? { ...c, ...updatedPatch } : c));
    emit();

    try {
      const resolvedPositions = patch.positions ?? target?.positions;
      const payload = {
        title: patch.title ?? target?.title,
        phase: patch.phase ?? target?.phase,
        status: patch.status ?? target?.status,
        position_scope_json: resolvedPositions === "all" ? [] : (resolvedPositions as string[]),
        items: richItems.map((r, sort_order) => ({
          item_text: r.item_text,
          instructions: r.instructions ?? null,
          requires_upload: r.requires_upload ?? true,
          upload_placeholder: r.upload_placeholder ?? null,
          sort_order,
        })),
      };
      if (target?.dbId) {
        await checklistTemplatesApi.update(target.dbId, payload);
      } else {
        // Template never reached the database (e.g. mock seed) — create it
        // now so the edit persists after a refresh.
        const created = await checklistTemplatesApi.create(payload);
        masterChecklists = masterChecklists.map((c) =>
          c.id === id ? { ...c, dbId: created.template_id, id: created.template_code || c.id } : c,
        );
        emit();
      }
      // Re-sync so opening/closing a template immediately adds/removes its
      // items on every hire's checklist (read-time visibility union).
      await syncFromApi();
    } catch (e) {
      console.warn("API checklist template update error:", e);
      toast.error("The checklist template could not be updated in the database.");
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
      toast.error("The checklist template could not be removed from the database.");
    }
  },
  /** Updates a hire's details on the database API. */
  updateHire: async (
    id: string,
    patch: Partial<
      Pick<NewHire, "name" | "email" | "phone" | "position" | "department" | "startDate">
    >,
  ) => {
    const target = hires.find((h) => h.id === id);
    if (!target?.dbId) return;
    try {
      const payload: Record<string, any> = {
        name: patch.name ?? target.name,
        email: patch.email ?? target.email,
        phone: patch.phone ?? target.phone,
        start_date: patch.startDate ?? target.startDate,
      };
      // Position/department ids are only sent when the caller actually
      // selected a new position/department in the modal.
      if (patch.position !== undefined) payload["position_id"] = target.positionId ?? null;
      if (patch.department !== undefined) payload["department_id"] = target.departmentId ?? null;
      await newHiresApi.update(target.dbId, payload);
    } catch (e) {
      console.warn("API new hire update error:", e);
      toast.error(`"${target.name}"'s record could not be updated in the database.`);
      await syncFromApi();
    }
  },
  /** Promotes a hire to the next stage (Pre-onboarding → Probationary → Regular). */
  promoteHire: async (id: string) => {
    const target = hires.find((h) => h.id === id);
    if (!target?.dbId) return;
    try {
      const updated = await newHiresApi.promoteStage(target.dbId);
      // The promoted hire comes back with checklists auto-applied from
      // matching Active templates for the new stage.
      hires = hires.map((h) => (h.id === id ? transformApiNewHire(updated) : h));
      emit();
    } catch (e) {
      console.warn("API new hire promote error:", e);
      toast.error(
        `"${target.name}" could not be advanced in the database — latest state reloaded.`,
      );
      await syncFromApi();
    }
  },
  /** Toggles one checklist item locally, then persists it to the database
   *  so the employee portal and other screens pick it up in real time.
   *  Virtual template items (no row yet) are materialized on first toggle. */
  toggleItem: async (hireId: string, itemIndex: number, done: boolean) => {
    const target = hires.find((h) => h.id === hireId);
    const item = target?.checklist[itemIndex];
    hires = hires.map((h) =>
      h.id === hireId
        ? {
            ...h,
            checklist: h.checklist.map((c, i) => (i === itemIndex ? { ...c, done } : c)),
          }
        : h,
    );
    emit();

    if (!target?.dbId) return;
    try {
      let itemId = item?.dbId;
      // Not materialized yet — create the row from its template item first.
      if (!itemId && item?.templateItemId) {
        const created = await onboardingItemsApi.materialize(target.dbId, item.templateItemId);
        itemId = created.employee_onboarding_item_id;
        hires = hires.map((h) =>
          h.id === hireId
            ? {
                ...h,
                checklist: h.checklist.map((c, i) =>
                  i === itemIndex ? { ...c, ...(itemId ? { dbId: itemId } : {}) } : c,
                ),
              }
            : h,
        );
        emit();
      }
      if (itemId) await onboardingItemsApi.toggle(itemId, { done });
    } catch (e) {
      console.warn("API onboarding item toggle error:", e);
    }
  },
  /** Persists the whole hire's checklist (used by "Mark all done"). */
  setAllItemsDone: async (hireId: string, done: boolean) => {
    const target = hires.find((h) => h.id === hireId);
    if (!target) return;
    hires = hires.map((h) =>
      h.id === hireId ? { ...h, checklist: h.checklist.map((c) => ({ ...c, done })) } : h,
    );
    emit();

    if (!target.dbId) return;
    await Promise.all(
      (target.checklist || []).map(async (c) => {
        try {
          let itemId = c.dbId;
          if (!itemId && c.templateItemId) {
            const created = await onboardingItemsApi.materialize(
              target.dbId as number,
              c.templateItemId,
            );
            itemId = created.employee_onboarding_item_id;
          }
          if (itemId) await onboardingItemsApi.toggle(itemId as number, { done });
        } catch (e) {
          console.warn("API onboarding item bulk toggle error:", e);
        }
      }),
    );
  },
  refresh: () => {
    hasFetched = false;
    return syncFromApi();
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
  return useSyncExternalStore(
    subscribe,
    hireStore.getMasterChecklists,
    hireStore.getMasterChecklists,
  );
}
