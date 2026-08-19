/**
 * Lightweight change bus so the Core HCM and Employee Records stores stay in
 * sync: any mutation (profile edit, lifecycle action, create/delete) notifies
 * every registered store to refetch from the backend.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

/** Register a store to refetch when employee/HCM data changes. */
export function onHcmChanged(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Notify every store that shared HCM data changed. */
export function notifyHcmChanged() {
  listeners.forEach((fn) => fn());
}