import { useEffect, useSyncExternalStore } from "react";
import type { Employee } from "@/data/hr";
import { hcmApi, type ApiDepartment, type ApiEmployee, type ApiPosition } from "./api";
import { onHcmChanged, notifyHcmChanged } from "./hcm-sync";

type RosterState = {
  employees: ApiEmployee[];
  departments: ApiDepartment[];
  positions: ApiPosition[];
  loaded: boolean;
};

let state: RosterState = { employees: [], departments: [], positions: [], loaded: false };
let fetched = false;

const detailCache = new Map<string, ApiEmployee>();
const detailLoading = new Set<string>();

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function loadRoster() {
  if (fetched) return;
  fetched = true;
  try {
    const [empRes, depRes, posRes] = await Promise.allSettled([
      hcmApi.employees.list({ per_page: 500 }),
      hcmApi.departments.list({ per_page: 500 }),
      hcmApi.positions.list({ per_page: 500 }),
    ]);
    const employees = empRes.status === "fulfilled" ? (empRes.value.data ?? []) : [];
    const departments = depRes.status === "fulfilled" ? (depRes.value.data ?? []) : [];
    const positions = posRes.status === "fulfilled" ? (posRes.value.data ?? []) : [];
    state = { employees, departments, positions, loaded: true };
  } catch (err) {
    console.warn("Could not load employee records from API.", err);
    state = { ...state, loaded: true };
  }
  emit();
}

async function loadDetail(employeeCode: string) {
  if (detailCache.has(employeeCode) || detailLoading.has(employeeCode)) return;
  const api = state.employees.find((e) => e.employee_code === employeeCode);
  if (!api) return;
  detailLoading.add(employeeCode);
  try {
    const res = await hcmApi.employees.get(api.employee_id);
    detailCache.set(employeeCode, res.data);
  } catch (err) {
    console.warn(`Could not load 201 file for ${employeeCode}.`, err);
  } finally {
    detailLoading.delete(employeeCode);
    emit();
  }
}

/** Loads and caches an employee's full 201 record (used by Core HCM too). */
export function loadRecordDetail(employeeCode: string) {
  return loadDetail(employeeCode);
}

/* Keep the Employee Records store in sync when Core HCM (or anything else)
   mutates shared employee data. */
if (typeof window !== "undefined") {
  onHcmChanged(() => {
    fetched = false;
    detailCache.clear();
    loadRoster();
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!fetched) loadRoster();
  return () => listeners.delete(listener);
};

const getSnapshot = (): RosterState => state;

if (typeof window !== "undefined") loadRoster();

/** Roster + department options, loaded once from the API. */
export function useRoster(): RosterState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Lazy-loads and subscribes to a single employee's full 201 record. */
export function useRecordDetail(employeeCode: string | null): ApiEmployee | undefined {
  const detail = useSyncExternalStore(
    subscribe,
    () => (employeeCode ? detailCache.get(employeeCode) : undefined),
    () => (employeeCode ? detailCache.get(employeeCode) : undefined),
  );
  useEffect(() => {
    if (employeeCode) loadDetail(employeeCode);
  }, [employeeCode]);
  return detail;
}

export function getEmployeeByCode(code: string): ApiEmployee | undefined {
  return state.employees.find((e) => e.employee_code === code);
}

/** Re-fetches the roster + department + position options from the API. */
export function refreshRoster() {
  fetched = false;
  detailCache.clear();
  notifyHcmChanged();
  return loadRoster();
}

/** Synchronous best-effort lookup of a loaded 201 record (used by buildProfile). */
export function getRecordDetail(code: string): ApiEmployee | undefined {
  return detailCache.get(code);
}

export function toUiEmployee(e: ApiEmployee): Employee {
  const supervisor = e.supervisor_employee_id
    ? state.employees.find((x) => x.employee_id === e.supervisor_employee_id)
    : undefined;
  const status = e.status === "On Leave" ? "Active" : (e.status as Employee["status"]) || "Active";
  return {
    id: e.employee_code,
    name: e.full_name,
    position: e.position_title,
    department: e.department_name,
    employmentType: e.employment_type === "Contractual" ? "Contractual" : e.employment_type,
    dateHired: e.date_hired || "",
    email: e.email,
    phone: e.phone || "",
    supervisor: supervisor?.full_name ?? "",
    status,
  };
}
