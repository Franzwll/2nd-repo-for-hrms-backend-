import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  clearSession,
  getIdleMinutes,
  getToken,
  getUser,
  isSessionExpired,
  touchActivity,
} from "@/lib/auth";
import { authApi } from "@/lib/api";

export interface RolePolicy {
  token_minutes: number;
  idle_minutes: number;
}

interface SessionPolicy {
  token_expiration_minutes: number;
  idle_timeout_minutes: number;
  roles?: Record<string, RolePolicy>;
  otp_expires_in_seconds: number;
  reset_expires_in_seconds: number;
}

const FALLBACK_ROLES: Record<string, RolePolicy> = {
  superadmin: { token_minutes: 240, idle_minutes: 10 },
  admin: { token_minutes: 480, idle_minutes: 15 },
  employee: { token_minutes: 720, idle_minutes: 30 },
};

let policyCache: { at: number; value: SessionPolicy } | null = null;

export async function getSessionPolicy(): Promise<SessionPolicy> {
  if (policyCache && Date.now() - policyCache.at < 5 * 60 * 1000) {
    return policyCache.value;
  }
  const fallback: SessionPolicy = {
    token_expiration_minutes: 720,
    idle_timeout_minutes: 30,
    roles: FALLBACK_ROLES,
    otp_expires_in_seconds: 300,
    reset_expires_in_seconds: 3600,
  };
  try {
    const res = await authApi.sessionPolicy();
    const value: SessionPolicy = { ...res, roles: res.roles ?? FALLBACK_ROLES };
    policyCache = { at: Date.now(), value };
    return value;
  } catch {
    return fallback;
  }
}

/** Normalize portal role names ("Super Admin" -> "superadmin"). */
export function roleKeyFor(role: string | null | undefined): string {
  const k = String(role ?? "")
    .toLowerCase()
    .replace(/[_\-\s]/g, "");
  if (k === "superadmin") return "superadmin";
  if (k === "admin" || k === "administrator") return "admin";
  return "employee";
}

/** Effective {token, idle} minutes for the currently signed-in user. */
export function policyForCurrentUser(policy: SessionPolicy | null): RolePolicy {
  const roles = policy?.roles ?? FALLBACK_ROLES;
  const key = roleKeyFor(getUser()?.role);
  return (
    roles[key] ??
    FALLBACK_ROLES[key] ?? { token_minutes: 480, idle_minutes: 15 }
  );
}

/**
 * Enforces role-based absolute + idle session timeouts inside the portal.
 * - Super Admin: 4h token / 10m idle
 * - Admin:       8h token / 15m idle
 * - Employee:   12h token / 30m idle
 */
export function useSessionTimeout() {
  const navigate = useNavigate();
  const policyRef = useRef<SessionPolicy | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSessionPolicy().then((p) => {
      if (!cancelled) policyRef.current = p;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onActivity = () => touchActivity();
    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "touchstart",
      "wheel",
    ];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    touchActivity();

    const logout = async (reason: "expired" | "idle") => {
      try {
        await authApi.logout();
      } catch {
        /* token already invalid */
      }
      clearSession();
      const effective = policyForCurrentUser(policyRef.current);
      toast.warning(
        reason === "idle"
          ? `Signed out after ${effective.idle_minutes} minutes of inactivity.`
          : `Session expired after ${effective.token_minutes} minutes. Please sign in again.`,
      );
      navigate({ to: "/login" });
    };

    const tick = () => {
      if (!getToken()) return;
      const effective = policyForCurrentUser(policyRef.current);
      if (isSessionExpired(effective.token_minutes)) {
        void logout("expired");
        return;
      }
      const idle = getIdleMinutes();
      if (idle != null && idle >= effective.idle_minutes) {
        void logout("idle");
      }
    };

    const timer = window.setInterval(tick, 30_000);
    return () => {
      window.clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [navigate]);
}
