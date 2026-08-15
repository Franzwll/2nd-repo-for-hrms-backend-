import { useSyncExternalStore } from "react";
import { requisitionsApi, type ApiRequisition } from "@/lib/api";

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

const seedRequisitions: Requisition[] = [
  {
    id: "REQ-1001",
    position: "Front Desk Receptionist",
    department: "Front Office",
    count: 2,
    urgency: "High",
    justification:
      "Two front desk associates are due to transition to the Guest Relations team next month, and occupancy is trending up for the coming peak season. Backfilling now avoids a coverage gap on the AM/PM shift rotation.",
    status: "Pending",
    requestedAt: "2024-05-02",
  },
  {
    id: "REQ-1002",
    position: "Housekeeping Attendant",
    department: "Housekeeping",
    count: 3,
    urgency: "Urgent",
    justification:
      "Room turnover times have slipped past the 30-minute SLA due to persistent understaffing. Three additional attendants are needed to restore standard turnaround ahead of the group bookings arriving this quarter.",
    status: "Pending",
    requestedAt: "2024-05-05",
  },
  {
    id: "REQ-1003",
    position: "Line Cook",
    department: "Food & Beverage",
    count: 1,
    urgency: "Normal",
    justification:
      "The kitchen brigade is short one station cook following a resignation. A replacement hire keeps the current menu rotation and banquet commitments fully staffed.",
    status: "Pending",
    requestedAt: "2024-05-08",
  },
  {
    id: "REQ-1004",
    position: "Bartender",
    department: "Food & Beverage",
    count: 1,
    urgency: "Normal",
    justification:
      "The lobby bar needs weekend coverage now that the extended happy-hour promotion has launched.",
    status: "Pending",
    requestedAt: "2024-05-11",
  },
  {
    id: "REQ-1005",
    position: "Security Officer",
    department: "Security",
    count: 2,
    urgency: "High",
    justification:
      "Perimeter patrol shifts are currently single-manned; two additional officers restore the standard two-person rotation.",
    status: "Done",
    requestedAt: "2024-04-20",
  },
];

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

let requisitions: Requisition[] = [...seedRequisitions];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

// Fetch live from Laravel MySQL API on load
let hasFetched = false;
async function fetchRequisitionsFromApi() {
  if (hasFetched) return;
  hasFetched = true;
  try {
    const res = await requisitionsApi.list({ per_page: 100 });
    if (res?.data && res.data.length > 0) {
      requisitions = res.data.map(transformApiRequisition);
      emit();
    }
  } catch (err) {
    console.warn("Could not fetch requisitions from backend API, using cached data.", err);
  }
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
    requisitions = [r, ...requisitions];
    emit();
    try {
      await requisitionsApi.create({
        position_title: r.position,
        department_id: 1,
        requested_count: r.count,
        urgency: r.urgency,
        justification: r.justification,
        status: r.status,
        requested_at: r.requestedAt,
      });
    } catch (e) {
      console.warn("API requisition create error:", e);
    }
  },
  update: async (id: string, patch: Partial<Requisition>) => {
    const target = requisitions.find((r) => r.id === id);
    requisitions = requisitions.map((r) => (r.id === id ? { ...r, ...patch } : r));
    emit();
    try {
      if (target?.dbId) {
        await requisitionsApi.update(target.dbId, {
          position_title: patch.position ?? target.position,
          department_id: 1,
          requested_count: patch.count ?? target.count,
          urgency: patch.urgency ?? target.urgency,
          justification: patch.justification ?? target.justification,
          status: patch.status ?? target.status,
          requested_at: patch.requestedAt ?? target.requestedAt,
        });
      }
    } catch (e) {
      console.warn("API requisition update error:", e);
    }
  },
  refresh: () => {
    hasFetched = false;
    return fetchRequisitionsFromApi();
  }
};

export function useRequisitions() {
  return useSyncExternalStore(
    requisitionStore.subscribe,
    requisitionStore.getSnapshot,
    requisitionStore.getSnapshot,
  );
}
