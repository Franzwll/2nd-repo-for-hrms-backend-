import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { mySettingsApi } from "@/lib/api";
import { getUser } from "@/lib/auth";

export type Language = "English" | "Filipino";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type TimeFormat = "12-hour" | "24-hour";
export type TimeZone = "Asia/Manila (GMT+8)" | "UTC" | "America/Los_Angeles (GMT-8)";

export interface UserPreferences {
  theme: string;
  language: Language;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: TimeZone;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "System",
  language: "English",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12-hour",
  timeZone: "Asia/Manila (GMT+8)",
};

const CACHE_KEY = "oxford_hrms_preferences";
const CHANGE_EVENT = "hrms-preferences-changed";

const FILIPINO: Record<string, string> = {
  Dashboard: "Dashboard",
  "Recruitment & Onboarding": "Recruitment at Onboarding",
  "Core HCM": "Pangunahing HCM",
  "Employee Records": "Mga Tala ng Empleyado",
  "ESS Management": "Pamamahala ng ESS",
  "User Management": "Pamamahala ng User",
  "Audit Logs": "Mga Audit Log",
  Settings: "Mga Setting",
  "Applicant Management": "Pamamahala ng Aplikante",
  "Recruitment Management": "Pamamahala ng Recruitment",
  "New Hire Onboarding": "Onboarding ng Bagong Hire",
  "My Attendance": "Aking Attendance",
  "My Payroll": "Aking Payroll",
  "My Performance": "Aking Performance",
  "My Documents": "Aking mga Dokumento",
  "My Request": "Aking Kahilingan",
  "My Feed": "Aking Feed",
  "HR AI Concierge": "HR AI Concierge",
  "Organizational Chart": "Organizational Chart",
  "Department & Position": "Departamento at Posisyon",
  Onboarding: "Onboarding",
  "My Profile": "Aking Profile",
  Logout: "Mag-logout",
  Announcements: "Mga Anunsyo",
  Notifications: "Mga Abiso",
  "Mark all as read": "Markahan lahat bilang nabasa",
  "Mark all announcements as read": "Markahan lahat ng anunsyo bilang nabasa",
  "New announcement": "Bagong anunsyo",
  "Add announcement": "Magdagdag ng anunsyo",
  "No notifications": "Walang abiso",
  "No announcements yet.": "Wala pang anunsyo.",
  Welcome: "Maligayang pagdating",
  "View Profile": "Tingnan ang Profile",
  "Dark mode": "Dark mode",
  "Light mode": "Light mode",
  "Toggle dark mode": "I-toggle ang dark mode",
  "Open navigation menu": "Buksan ang menu",
  "Toggle sidebar": "I-toggle ang sidebar",
  "Super Admin Portal": "Super Admin Portal",
  "Admin Portal": "Admin Portal",
  "Employee Portal": "Employee Portal",
  Preferences: "Mga Kagustuhan",
  Security: "Seguridad",
  "Backup & Restore": "Backup at Restore",
  Theme: "Tema",
  Light: "Maliwanag",
  Dark: "Madilim",
  System: "System",
  Language: "Wika",
  English: "Ingles",
  Filipino: "Filipino",
  "Date format": "Format ng petsa",
  "Time format": "Format ng oras",
  "Time zone": "Time zone",
  "Save changes": "I-save ang mga pagbabago",
  "Unsaved changes": "May hindi pa naka-save",
  "Minimum password length": "Minimum na haba ng password",
  "Password requirements": "Mga kinakailangan sa password",
  "Session timeout": "Session timeout",
  "Max login attempts": "Max na pagtatangka sa login",
  "Change default password of all users": "Palitan ang default password ng lahat ng user",
  "OTP verification at login": "OTP verification sa pag-login",
  "Current password": "Kasalukuyang password",
  "New password": "Bagong password",
  "Confirm new password": "Kumpirmahin ang bagong password",
  "Update password": "I-update ang password",
  "Create backup": "Gumawa ng backup",
  "Creating backup...": "Gumagawa ng backup...",
  "Backing up system data...": "Nilo-back up ang datos ng system...",
  "Restoring...": "Nagre-restore...",
  "Automatic backups": "Awtomatikong backup",
  "Backup id": "Backup ID",
  Timestamp: "Oras at petsa",
  Size: "Laki",
  Type: "Uri",
  Actions: "Mga aksyon",
  "Download backup": "I-download ang backup",
  Restore: "I-restore",
  "Notifications, portal preferences, account security, personal contact details, and work information.":
    "Mga abiso, kagustuhan sa portal, seguridad ng account, personal na contact details, at impormasyon sa trabaho.",
  "System security policy, account preferences, and database backups.":
    "System security policy, mga kagustuhan sa account, at database backups.",
  "Account security and portal preferences.": "Seguridad ng account at mga kagustuhan sa portal.",
  "Account security, default password and notification preferences.":
    "Seguridad ng account, default password, at mga kagustuhan sa notification.",
  "Please enter a valid company email address.": "Maglagay ng valid na company email.",
  "Please enter a valid contact phone number.": "Maglagay ng valid na contact number.",
  "New password must be at least 8 characters": "Dapat hindi bababa sa 8 character ang bagong password",
  "New password and confirmation must match": "Dapat magtugma ang bagong password at kumpirmasyon",
  "Preferences saved to database": "Na-save ang mga kagustuhan sa database",
  "System-wide login security policy saved to database":
    "Na-save ang system-wide login security policy sa database",
  "Could not save preferences": "Hindi ma-save ang mga kagustuhan",
  "Could not update the password": "Hindi ma-update ang password",
};

const FILIPINO_PATTERNS: Array<[RegExp, string]> = [
  [/^(\d+) new$/, "$1 bago"],
  [/^Welcome, (.+)$/, "Maligayang pagdating, $1"],
];

export function translate(text: string, language: Language): string {
  if (language !== "Filipino") return text;
  const exact = FILIPINO[text];
  if (exact) return exact;
  for (const [pattern, replacement] of FILIPINO_PATTERNS) {
    if (pattern.test(text)) return text.replace(pattern, replacement);
  }
  return text;
}

function normalize(raw: unknown): UserPreferences {
  const value = (raw ?? {}) as Partial<Record<keyof UserPreferences, unknown>>;
  return {
    theme:
      value.theme === "Light" || value.theme === "Dark" || value.theme === "System"
        ? value.theme
        : DEFAULT_PREFERENCES.theme,
    language: value.language === "Filipino" ? "Filipino" : "English",
    dateFormat:
      value.dateFormat === "DD/MM/YYYY" || value.dateFormat === "YYYY-MM-DD"
        ? value.dateFormat
        : "MM/DD/YYYY",
    timeFormat: value.timeFormat === "24-hour" ? "24-hour" : "12-hour",
    timeZone:
      value.timeZone === "UTC" || value.timeZone === "America/Los_Angeles (GMT-8)"
        ? value.timeZone
        : "Asia/Manila (GMT+8)",
  };
}

export function readCachedPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? normalize(JSON.parse(raw)) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function writeCachedPreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(preferences));
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: preferences }));
}

function applyDocumentLanguage(language: Language): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language === "Filipino" ? "fil" : "en";
}

function ianaTimeZone(timeZone: TimeZone): string {
  return timeZone.split(" ")[0] ?? "Asia/Manila";
}

function localeFor(language: Language): string {
  return language === "Filipino" ? "fil-PH" : "en-PH";
}

function parseDate(value: Date | string | number): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 12);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(
  value: Date | string | number | null | undefined,
  preferences: UserPreferences = readCachedPreferences(),
): string {
  if (value == null) return "—";
  const date = parseDate(value);
  if (!date) return "—";
  const timeZone = ianaTimeZone(preferences.timeZone);

  if (preferences.dateFormat === "YYYY-MM-DD") {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat(
    preferences.dateFormat === "DD/MM/YYYY" ? "en-GB" : "en-US",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}

export function formatTime(
  value: Date | string | number | null | undefined,
  preferences: UserPreferences = readCachedPreferences(),
  withSeconds = false,
): string {
  if (value == null) return "—";
  const date = parseDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat(preferences.timeFormat === "24-hour" ? "en-GB" : "en-US", {
    timeZone: ianaTimeZone(preferences.timeZone),
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" as const } : {}),
    hour12: preferences.timeFormat !== "24-hour",
  }).format(date);
}

export function formatDateTime(
  value: Date | string | number | null | undefined,
  preferences: UserPreferences = readCachedPreferences(),
): string {
  if (value == null) return "—";
  return `${formatDate(value, preferences)} ${formatTime(value, preferences)}`;
}

export function formatWeekdayDate(
  value: Date | string | number | null | undefined,
  preferences: UserPreferences = readCachedPreferences(),
): string {
  if (value == null) return "—";
  const date = parseDate(value);
  if (!date) return "—";
  const weekday = new Intl.DateTimeFormat(localeFor(preferences.language), {
    timeZone: ianaTimeZone(preferences.timeZone),
    weekday: "short",
  }).format(date);
  return `${weekday}, ${formatDate(date, preferences)}`;
}

interface PreferencesContextValue {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
  t: (text: string) => string;
  formatDate: (value: Date | string | number | null | undefined) => string;
  formatTime: (value: Date | string | number | null | undefined, withSeconds?: boolean) => string;
  formatDateTime: (value: Date | string | number | null | undefined) => string;
  formatWeekdayDate: (value: Date | string | number | null | undefined) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const cached = readCachedPreferences();
    setPreferencesState(cached);
    applyDocumentLanguage(cached.language);

    const email = getUser()?.email;
    if (email) {
      mySettingsApi
        .get(email)
        .then((mine) => {
          const saved = normalize({
            ...mine.preferences,
            theme: readCachedPreferences().theme,
          });
          setPreferencesState(saved);
          writeCachedPreferences(saved);
          applyDocumentLanguage(saved.language);
        })
        .catch(() => {});
    }

    const onChange = (event: Event) => {
      const next = (event as CustomEvent<UserPreferences>).detail;
      if (!next) return;
      setPreferencesState(next);
      applyDocumentLanguage(next.language);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const setPreferences = useCallback((next: UserPreferences) => {
    const normalized = normalize(next);
    setPreferencesState(normalized);
    writeCachedPreferences(normalized);
    applyDocumentLanguage(normalized.language);
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      setPreferences,
      t: (text) => translate(text, preferences.language),
      formatDate: (date) => formatDate(date, preferences),
      formatTime: (date, withSeconds) => formatTime(date, preferences, withSeconds),
      formatDateTime: (date) => formatDateTime(date, preferences),
      formatWeekdayDate: (date) => formatWeekdayDate(date, preferences),
    }),
    [preferences, setPreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext);
  if (value) return value;
  return {
    preferences: readCachedPreferences(),
    setPreferences: (next) => writeCachedPreferences(normalize(next)),
    t: (text) => text,
    formatDate: (date) => formatDate(date),
    formatTime: (date, withSeconds) => formatTime(date, undefined, withSeconds),
    formatDateTime: (date) => formatDateTime(date),
    formatWeekdayDate: (date) => formatWeekdayDate(date),
  };
}
