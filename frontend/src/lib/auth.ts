const TOKEN_KEY = "oxford_hrms_token";
const USER_KEY = "oxford_hrms_user";
const LOGIN_AT_KEY = "oxford_hrms_login_at";
const LAST_ACTIVITY_KEY = "oxford_hrms_last_activity";

export interface AuthUser {
  system_user_id: number;
  username: string;
  email: string;
  full_name: string;
  department_name: string | null;
  employee_id: number | null;
  status: string;
  role_id: number;
  role: string;
  otp_enabled?: boolean;
  permissions: Record<string, string>;
  last_login_at: string | null;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LOGIN_AT_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    }
  } catch {
    // storage unavailable
  }
}

/** Minutes since sign-in, or null when unknown. */
export function getSessionAgeMinutes(): number | null {
  try {
    const raw = localStorage.getItem(LOGIN_AT_KEY);
    if (!raw) return null;
    return (Date.now() - Number(raw)) / 60000;
  } catch {
    return null;
  }
}

/** True when the absolute token lifetime (minutes) has been exceeded. */
export function isSessionExpired(maxMinutes: number): boolean {
  const age = getSessionAgeMinutes();
  if (age == null) return false;
  return age >= maxMinutes;
}

export function touchActivity(): void {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function getIdleMinutes(): number | null {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return null;
    return (Date.now() - Number(raw)) / 60000;
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // storage unavailable
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LOGIN_AT_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // storage unavailable
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
