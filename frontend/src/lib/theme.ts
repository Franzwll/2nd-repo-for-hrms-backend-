import { useEffect } from "react";

export type ThemeChoice = "Light" | "Dark" | "System";

const STORAGE_KEY = "osm-theme";

let systemMq: MediaQueryList | null = null;
let systemListener: ((e: MediaQueryListEvent) => void) | null = null;

function resolveDark(choice: ThemeChoice): boolean {
  if (choice === "Dark") return true;
  if (choice === "Light") return false;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") return "System";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "Light" || raw === "Dark" || raw === "System") return raw;
  } catch {
    /* ignore */
  }
  return "System";
}

export function applyTheme(choice: ThemeChoice): void {
  if (typeof document === "undefined") return;
  const dark = resolveDark(choice);
  document.documentElement.classList.toggle("dark", dark);
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }

  // Follow OS changes while in System mode.
  if (systemMq && systemListener) {
    try {
      systemMq.removeEventListener("change", systemListener);
    } catch {
      /* ignore */
    }
    systemMq = null;
    systemListener = null;
  }
  if (choice === "System" && typeof window.matchMedia === "function") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    systemListener = () => {
      document.documentElement.classList.toggle("dark", mq.matches);
    };
    systemMq = mq;
    try {
      mq.addEventListener("change", systemListener);
    } catch {
      /* older browsers */
    }
  }
}

/** Apply persisted theme ASAP on boot (before first paint where possible). */
export function applyInitialTheme(): void {
  applyTheme(getStoredTheme());
}

/**
 * Force the light theme while a public-only surface (landing site, login,
 * forgot/otp/reset) is mounted. Restores the stored portal theme on unmount
 * so the authenticated portals keep following the user's preference.
 */
export function useLightOnly(): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const hadDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");
    return () => {
      if (hadDark) applyTheme(getStoredTheme());
    };
  }, []);
}
