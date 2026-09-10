import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  coreHcmApi,
  requisitionsApi,
  type ApiDepartment,
  type ApiPosition,
  type ApiRequisition,
} from "@/lib/api";

export type Requisition = {
  id: string;
  dbId?: number;
  position: string;
  department: string;
  count: number;
  urgency: string;
  justification: string;
  status: "Pending" | "Done" | "Converted";
  requestedAt: string;
};

function transformApiRequisition(r: ApiRequisition): Requisition {
  return {
    id: r.requisition_code || `REQ-${r.requisition_id}`,
    dbId: r.requisition_id,
    position: r.position_title || "Unknown Position",
    department: r.department || "General",
    count: r.requested_count || 1,
    urgency: r.urgency || "Normal",
    justification: r.justification || "",
    status: r.status,
    requestedAt: r.requested_at || new Date().toISOString().slice(0, 10),
  };
}

let requisitions: Requisition[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

let departmentsCache: ApiDepartment[] = [];
let positionsCache: ApiPosition[] = [];

/** Resolves a department's database id by name — creates it when unknown. */
async function resolveDepartmentId(name: string): Promise<number> {
  const known = departmentsCache.find((d) => d.name === name);
  if (known) return known.department_id;
  const created = await coreHcmApi.createDepartment({ name });
  departmentsCache = [...departmentsCache, created];
  return created.department_id;
}

/** Best-effort position id lookup (null when the position isn't defined yet). */
async function resolvePositionId(title: string): Promise<number | null> {
  const known = positionsCache.find((p) => p.title === title);
  return known ? known.position_id : null;
}

async function refreshLookupCache() {
  try {
    const [deptRes, posRes] = await Promise.allSettled([
      coreHcmApi.departments({ per_page: 100 }),
      coreHcmApi.positions({ per_page: 100 }),
    ]);
    if (deptRes.status === "fulfilled" && deptRes.value?.data?.length > 0) {
      departmentsCache = deptRes.value.data;
    }
    if (posRes.status === "fulfilled" && posRes.value?.data?.length > 0) {
      positionsCache = posRes.value.data;
    }
  } catch {
    // cache stays empty — unknown departments are created via the API
  }
}

// Fetch live from Laravel MySQL API on load
let hasFetched = false;
let fetchInFlight: Promise<void> | null = null;
/** True while a requisition fetch is in flight. Components show skeletons
 *  only when `loading && empty` so background refreshes never flash. */
let reqFetching = true;
function setReqFetching(v: boolean) {
  reqFetching = v;
  emit();
}
async function fetchRequisitionsFromApi() {
  if (fetchInFlight) return fetchInFlight;
  fetchInFlight = (async () => {
    setReqFetching(true);
    try {
      const res = await requisitionsApi.list({ per_page: 100 });
      requisitions = (res?.data ?? []).map(transformApiRequisition);
      emit();
      await refreshLookupCache();
    } catch (err) {
      console.warn("Could not fetch requisitions from backend API, using cached data.", err);
      toast.error("Could not load vacancy requisitions from the database.");
    } finally {
      hasFetched = true;
      fetchInFlight = null;
      setReqFetching(false);
    }
  })();
  return fetchInFlight;
}
if (typeof window !== "undefined") {
  fetchRequisitionsFromApi();
}

export const requisitionStore = {
  getSnapshot: () => requisitions,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    if (!hasFetched) fetchRequisitionsFromApi();
    return () => listeners.delete(listener);
  },
  add: async (r: Requisition) => {
    // Client-side duplicate guard mirrors backend: one active requisition per dept+position.
    const dup = requisitions.find(
      (x) =>
        x.department === r.department &&
        x.position === r.position &&
        x.status !== "Converted",
    );
    if (dup) {
      toast.warning(`Requisition ${dup.id} already covers ${r.position} (${r.department}). Edit it instead.`);
      throw Object.assign(new Error("DUPLICATE_REQUISITION"), { code: "DUPLICATE_REQUISITION" });
    }
    requisitions = [r, ...requisitions];
    emit();
    try {
      const department_id = await resolveDepartmentId(r.department);
      const position_id = await resolvePositionId(r.position);
      const created = await requisitionsApi.create({
        position_id,
        position_title: r.position,
        department_id,
        requested_count: r.count,
        urgency: r.urgency,
        justification: r.justification,
        status: r.status,
        requested_at: r.requestedAt,
      });
      // Swap the optimistic row for the DB row so later edits carry a dbId
      requisitions = requisitions.map((x) =>
        x.id === r.id
          ? { ...x, dbId: created.requisition_id, id: created.requisition_code || x.id }
          : x,
      );
      emit();
    } catch (e: any) {
      if (e?.status === 409 || e?.code === "DUPLICATE_REQUISITION") {
        // Roll back optimistic row; backend is source of truth.
        requisitions = requisitions.filter((x) => x.id !== r.id);
        emit();
        toast.warning(
          e?.payload?.existing_requisition_code
            ? `Duplicate blocked — ${e.payload.existing_requisition_code} already exists. Edit it instead.`
            : "Duplicate requisition blocked — edit the existing one instead.",
        );
        throw e;
      }
      console.warn("API requisition create error:", e);
      toast.error("The requisition could not be saved to the database.");
    }
  },
  update: async (id: string, patch: Partial<Requisition>) => {
    const target = requisitions.find((r) => r.id === id);
    requisitions = requisitions.map((r) => (r.id === id ? { ...r, ...patch } : r));
    emit();
    try {
      const department_id = await resolveDepartmentId(patch.department ?? target?.department ?? "");
      const payload = {
        position_title: patch.position ?? target?.position,
        department_id,
        requested_count: patch.count ?? target?.count,
        urgency: patch.urgency ?? target?.urgency,
        justification: patch.justification ?? target?.justification,
        status: patch.status ?? target?.status,
        requested_at: patch.requestedAt ?? target?.requestedAt,
      };
      if (target?.dbId) {
        await requisitionsApi.update(target.dbId, payload);
      } else {
        // Row never made it to the DB (e.g. seed data) — create it now
        const position_id = await resolvePositionId(payload.position_title ?? "");
        const created = await requisitionsApi.create({ ...payload, position_id });
        requisitions = requisitions.map((x) =>
          x.id === id ? { ...x, dbId: created.requisition_id } : x,
        );
        emit();
      }
    } catch (e) {
      console.warn("API requisition update error:", e);
      toast.error("The requisition could not be updated in the database.");
    }
  },
  /** Marks a requisition Converted on the database (used after a job post is published). */
  markConverted: async (id: string, jobPostId: number) => {
    const target = requisitions.find((r) => r.id === id);
    if (!target) return;
    try {
      await requisitionsApi.convert(target.dbId ?? id, jobPostId);
    } catch (e) {
      console.warn("API requisition convert error:", e);
    }
  },
  /** Deletes a requisition (superadmin only on backend; Converted rows are blocked). */
  remove: async (id: string) => {
    const target = requisitions.find((r) => r.id === id);
    if (!target) return;
    const prev = requisitions;
    requisitions = requisitions.filter((r) => r.id !== id);
    emit();
    try {
      await requisitionsApi.remove(target.dbId ?? id);
      toast.success(`Requisition ${target.id} deleted.`);
    } catch (e: any) {
      requisitions = prev;
      emit();
      console.warn("API requisition delete error:", e);
      toast.error(e?.message || "Could not delete requisition.");
      throw e;
    }
  },
  refresh: () => {
    hasFetched = false;
    return fetchRequisitionsFromApi();
  },
};

export function useRequisitions() {
  return useSyncExternalStore(
    requisitionStore.subscribe,
    requisitionStore.getSnapshot,
    requisitionStore.getSnapshot,
  );
}

/** True while a requisition fetch is in flight. Gate skeletons on
 *  `loading && reqs.length === 0` so background refreshes never flash. */
export function useRequisitionsLoading() {
  return useSyncExternalStore(
    requisitionStore.subscribe,
    () => reqFetching,
    () => reqFetching,
  );
}
