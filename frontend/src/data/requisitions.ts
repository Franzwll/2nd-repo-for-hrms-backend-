import { useSyncExternalStore } from "react";

export type Requisition = {
  id: string;
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
  {
    id: "REQ-1006",
    position: "Spa Therapist",
    department: "Wellness",
    count: 1,
    urgency: "Low",
    justification: "Guest demand for spa bookings has grown following the new wellness package launch.",
    status: "Pending",
    requestedAt: "2024-05-14",
  },
  {
    id: "REQ-1007",
    position: "Reservations Agent",
    department: "Front Office",
    count: 2,
    urgency: "Normal",
    justification: "Call volume has outpaced current agent capacity during the booking surge.",
    status: "Converted",
    requestedAt: "2024-03-30",
  },
  {
    id: "REQ-1008",
    position: "Sous Chef",
    department: "Food & Beverage",
    count: 1,
    urgency: "Urgent",
    justification: "Kitchen leadership gap after recent promotion; needs immediate backfill.",
    status: "Pending",
    requestedAt: "2024-05-16",
  },
  {
    id: "REQ-1009",
    position: "Housekeeping Supervisor",
    department: "Housekeeping",
    count: 1,
    urgency: "High",
    justification: "Additional shift supervisor required to oversee the expanded night cleaning crew.",
    status: "Done",
    requestedAt: "2024-04-05",
  },
  {
    id: "REQ-1010",
    position: "Accounting Clerk",
    department: "Finance",
    count: 1,
    urgency: "Normal",
    justification: "Month-end close workload has increased with the new property management system rollout.",
    status: "Pending",
    requestedAt: "2024-05-18",
  },
  {
    id: "REQ-1011",
    position: "Maintenance Technician",
    department: "Engineering",
    count: 2,
    urgency: "High",
    justification: "Preventive maintenance backlog requires two more technicians to stay on schedule.",
    status: "Pending",
    requestedAt: "2024-05-19",
  },
  {
    id: "REQ-1012",
    position: "Guest Relations Officer",
    department: "Front Office",
    count: 1,
    urgency: "Normal",
    justification: "VIP guest volume has increased, requiring dedicated relations coverage.",
    status: "Converted",
    requestedAt: "2024-03-12",
  },
];

let requisitions: Requisition[] = [...seedRequisitions];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const requisitionStore = {
  getSnapshot: () => requisitions,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  add: (r: Requisition) => {
    requisitions = [r, ...requisitions];
    emit();
  },
  update: (id: string, patch: Partial<Requisition>) => {
    requisitions = requisitions.map((r) => (r.id === id ? { ...r, ...patch } : r));
    emit();
  },
};

export function useRequisitions() {
  return useSyncExternalStore(
    requisitionStore.subscribe,
    requisitionStore.getSnapshot,
    requisitionStore.getSnapshot,
  );
}
