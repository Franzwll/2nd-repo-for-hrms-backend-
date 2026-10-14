import type { Role } from "@/lib/nav";

/** Storage key so the chosen preset survives reloads (per portal user). */
export const presetStorageKey = (email: string | undefined, role: Role) =>
  `hrms-profile-preset:${role}:${(email || "anonymous").toLowerCase()}`;

/** Reads the user's chosen preset avatar (or null when none was picked). */
export function getStoredPresetAvatar(email?: string | null): string | null {
  if (typeof window === "undefined") return null;
  try {
    const roles: Role[] = ["superadmin", "admin", "employee"];
    for (const r of roles) {
      const saved = window.localStorage.getItem(presetStorageKey(email ?? undefined, r));
      if (saved) return saved;
    }
    // Fallback: scan any hrms-profile-preset key for this email.
    const suffix = `:${(email || "anonymous").toLowerCase()}`;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("hrms-profile-preset:") && key.endsWith(suffix)) {
        const saved = window.localStorage.getItem(key);
        if (saved) return saved;
      }
    }
  } catch {
    /* storage unavailable */
  }
  return null;
}

/** Emits an event so the portal header refreshes its avatar immediately. */
export function notifyAvatarChanged() {
  try {
    window.dispatchEvent(new CustomEvent("hrms-avatar-changed"));
  } catch {
    /* noop */
  }
}
