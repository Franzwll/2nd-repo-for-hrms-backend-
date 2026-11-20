import { useState, useEffect } from "react";
import {
  mySettingsApi,
  settingsApi,
} from "@/lib/api";
import { applyTheme, getStoredTheme, type ThemeChoice } from "@/lib/theme";
import { getUser } from "@/lib/auth";
import { isValidEmail, isValidPhone, sanitizeName, sanitizePhone } from "@/lib/validation";
import {
  ArrowRight,
  Building2,
  Database,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Plus,
  Shield,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import { MfaSettings } from "@/components/modules/MfaSettings";
import { usePreferences, type UserPreferences } from "@/lib/preferences";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type BackupEntry = {
  id: string;
  timestamp: string;
  size: string;
  type: string;
};

function SettingsCard({
  icon,
  title,
  action,
  className,
  children,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: { label: string; onClick?: () => void };
}) {
  return (
    <Card className={cn("flex flex-col rounded-xl border-border/60 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>
      <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <span className="text-primary">{icon}</span>
            {title}
          </h2>
          {action}
        </div>
        <div className="mt-3.5 flex flex-1 flex-col">{children}</div>
        {footer && (
          <button
            type="button"
            onClick={footer.onClick}
            className="mt-3.5 flex items-center gap-1.5 self-start border-t border-border/60 pt-3 text-xs font-medium text-primary transition hover:gap-2"
          >
            {footer.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "default";
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {tone === "success" ? (
        <Badge variant="outline" className="border-success/30 bg-success/15 text-success">
          {value}
        </Badge>
      ) : (
        <span className="text-sm font-medium">{value}</span>
      )}
    </div>
  );
}



export function SettingsPage({ role }: { role: "superadmin" | "admin" | "employee" }) {
  /** The portal's current user key — resolved from the authenticated session
   *  so every logged-in account manages its OWN preferences /
   *  password / OTP values in the database. */
  const currentUser = getUser()?.email ?? "";

  // Portal-wide preferences context — used to broadcast saved language/date/time
  // settings immediately (clock, nav labels, Settings page) instead of waiting
  // for a full page reload.
  const { setPreferences: commitPreferences, t } = usePreferences();

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreTarget, setRestoreTarget] = useState<BackupEntry | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwConfirmOpen, setPwConfirmOpen] = useState(false);

  // Preferences — edited inline on the card; saved when the user clicks save.
  // Theme defaults to the locally stored choice so the select shows the
  // active mode even before the database values arrive.
  const [preferences, setPreferences] = useState({
    theme: getStoredTheme() as string,
    language: "",
    dateFormat: "",
    timeFormat: "",
    timeZone: "",
  });
  const [prefsSavedSnapshot, setPrefsSavedSnapshot] = useState("");

  // Login security (password policy + session rules, saved to "security").
  // The legacy twoFactor switch was removed from the UI — it was never enforced
  // server-side (SecurityPolicy ignores it); MFA is covered by the per-account
  // authenticator-app (TOTP) enrollment.
  const [security, setSecurity] = useState({
    minLength: 0,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSymbol: false,
    sessionTimeout: "",
    maxLoginAttempts: "",
  });
  const [securitySavedSnapshot, setSecuritySavedSnapshot] = useState("");

  // One-time password at login — per ACCOUNT. Each logged-in user toggles
  // their own requirement (system_users.otp_enabled). null = still loading.
  const [otpEnabled, setOtpEnabled] = useState<boolean | null>(null);

  // Change default password of all users (superadmin) — the default password
  // is also stored in the database (system_settings.default_password) and
  // used for new user accounts.
  const [resetPwOpen, setResetPwOpen] = useState(false);
  const [resetPw, setResetPw] = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");

  // Company info
  const [company, setCompany] = useState({
    name: "",
    email: "",
    contact: "",
    businessHours: "",
    address: "",
    tin: "",
  });
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyDraft, setCompanyDraft] = useState(company);

  /** Applies a flat key → value settings map from the backend onto local state. */
  const applySettingsMap = (
    map: Partial<{
      company: typeof company;
      preferences: typeof preferences;
      /** security values coming from the DB can still carry the legacy
       *  twoFactor key — kept optional so we can safely strip it. */
      security: Partial<typeof security> & { twoFactor?: boolean };
      backups: BackupEntry[];
      backup: { enabled?: boolean; schedule?: string };
    }>,
  ) => {
    if (map["company"]) {
      setCompany(map["company"]);
      setCompanyDraft(map["company"]);
    }
    if (map["preferences"]) {
      // Theme is deliberately excluded: the live theme lives in localStorage and
      // must only change via the header toggle or Preferences Save — never as a
      // side effect of loading Settings. Merging a stale saved theme here is what
      // used to flip the page "automatically" on every Settings visit.
      const { theme: _savedTheme, ...savedPrefs } = map["preferences"];
      setPreferences((prev) => ({ ...prev, ...savedPrefs }));
      setPrefsSavedSnapshot(
        JSON.stringify({ ...preferences, ...savedPrefs, theme: getStoredTheme() as string }),
      );
    }
    if (map["security"]) {
      // Drop the legacy twoFactor key if a stored row still carries it — the
      // authenticator-app (TOTP) enrollment replaces that toggle. Missing values
      // fall back to the same defaults the backend SecurityPolicy uses.
      const { twoFactor: _legacyTwoFactor, ...policy } = map["security"];
      const next = {
        minLength: policy.minLength ?? 8,
        requireUppercase: policy.requireUppercase ?? true,
        requireLowercase: policy.requireLowercase ?? true,
        requireNumber: policy.requireNumber ?? true,
        requireSymbol: policy.requireSymbol ?? false,
        sessionTimeout: policy.sessionTimeout ?? "30 minutes",
        maxLoginAttempts: policy.maxLoginAttempts ?? "5 attempts",
      };
      setSecurity(next);
      setSecuritySavedSnapshot(JSON.stringify(next));
    }
    if (map["backups"]) {
      setBackups(Array.isArray(map["backups"]) ? map["backups"] : []);
    }
    if (map["backup"]) {
      const b = map["backup"];
      if (typeof b?.enabled === "boolean") setAutoBackupEnabled(b.enabled);
      if (b?.schedule) setBackupSchedule(b.schedule);
    }
  };

  useEffect(() => {
    settingsApi
      .getAll()
      .then((res) => {
        if (res?.map) {
          applySettingsMap(res.map);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch settings from database:", err);
      })
      .finally(() => setLoadingBackups(false));

    // Per-user designated values — this user's own preferences
    // (merged over the system defaults above) and their personal OTP flag.
    mySettingsApi
      .get(currentUser)
      .then((mine) => {
        if (mine?.preferences && Object.keys(mine.preferences).length > 0) {
          // Same as above: populate the form but never touch the live theme.
          const { theme: _savedTheme, ...savedPrefs } = mine.preferences as Record<string, string>;
          setPreferences((prev) => ({ ...prev, ...savedPrefs }));
          setPrefsSavedSnapshot(
            JSON.stringify({ ...savedPrefs, theme: getStoredTheme() as string }),
          );
        }
        setOtpEnabled(mine?.otp_enabled ?? true);
      })
      .catch((err) => {
        console.warn("Could not fetch per-user settings from database:", err);
      });
  }, [currentUser]);

  const prefsDirty =
    prefsSavedSnapshot !== "" && JSON.stringify(preferences) !== prefsSavedSnapshot;

  /** Persists the inline-edited preferences to the database. */
  const savePreferences = async () => {
    try {
      if (
        preferences.theme === "Light" ||
        preferences.theme === "Dark" ||
        preferences.theme === "System"
      ) {
        applyTheme(preferences.theme as ThemeChoice);
      }
      await mySettingsApi.save("preferences", currentUser, preferences);
      setPrefsSavedSnapshot(JSON.stringify(preferences));
      // Broadcast the saved values through the preferences context so language /
      // date format / time format / time zone apply instantly (theme is applied
      // via applyTheme above and persisted under its own localStorage key).
      // The state values always match the UserPreferences options (the selects
      // only offer valid values), so a direct cast here is safe.
      commitPreferences(preferences as unknown as UserPreferences);
      toast.success("Preferences saved to database");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save preferences");
    }
  };

  /** Creates a real database backup on the server — the dump file is stored
   *  under storage/app/backups and the entry is persisted by the backend. */
  const createBackup = async () => {
    if (backupInProgress) return;
    setBackupInProgress(true);
    setBackupProgress(5);

    // Indeterminate-ish progress while the server dumps the database.
    const timer = setInterval(() => {
      setBackupProgress((p) => Math.min(p + 7, 90));
    }, 250);

    try {
      const res = await settingsApi.createBackup();
      setBackups(Array.isArray(res.data) ? res.data : [res.backup, ...backups]);
      toast.success(res.message || "Backup created successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the backup");
    } finally {
      clearInterval(timer);
      setBackupProgress(100);
      setTimeout(() => setBackupProgress(0), 500);
      setBackupInProgress(false);
    }
  };

  const persistAutoBackup = (enabled: boolean, schedule: string) => {
    settingsApi
      .upsert("backup", { enabled, schedule })
      .catch((e) => console.warn("Could not save backup settings to database:", e));
  };

  /** Toggles whether THIS account must verify an OTP at login
   *  (persisted on the account row via PUT /my/otp). */
  const persistOtpEnabled = (enabled: boolean) => {
    setOtpEnabled(enabled);
    mySettingsApi
      .toggleOtp(currentUser, enabled)
      .then((res) => setOtpEnabled(res.otp_enabled))
      .catch((e) => {
        console.warn("Could not save OTP setting:", e);
        toast.error(e instanceof Error ? e.message : "Could not update your OTP setting");
        setOtpEnabled((prev) => !enabled);
      });
  };

  /** Rolls the whole system back to the selected snapshot on the server,
   *  then refreshes every settings group from the restored database state. */
  const restoreBackup = async () => {
    if (!restoreTarget || restoreInProgress) return;
    setRestoreInProgress(true);
    try {
      const res = await settingsApi.restoreBackup(restoreTarget.id);

      // The restore rewrote system_settings — reload everything.
      const all = await settingsApi.getAll();
      if (all?.map) {
        applySettingsMap(all.map);
      }

      toast.success(res.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not restore from the backup");
    } finally {
      setRestoreTarget(null);
      setRestoreInProgress(false);
    }
  };

  const changeOwnPassword = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation must match");
      return;
    }
    try {
      const res = await mySettingsApi.changePassword(currentUser, currentPassword, newPassword);
      toast.success(res.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      const msg =
        e instanceof Error && e.message.includes("incorrect")
          ? "Current password is incorrect"
          : e instanceof Error
            ? e.message
            : "Could not update the password";
      toast.error(msg);
    }
  };

  const isSuperAdmin = role === "superadmin";

  // Company + Chatbot FAQ cards are intentionally kept OFF the Super Admin
  // Settings page so the view stays a clean two-row layout: Preferences |
  // Security on the top row, and a full-width Backup & Restore below. Flip to
  // true to restore the Company editor card on this page.
  const showCompanyCard = false;

  const securityDirty =
    securitySavedSnapshot !== "" && JSON.stringify(security) !== securitySavedSnapshot;

  /** Persists the inline-edited login security policy to the database. */
  const saveSecurity = async () => {
    try {
      await settingsApi.upsert("security", security);
      setSecuritySavedSnapshot(JSON.stringify(security));
      toast.success("System-wide login security policy saved to database");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save security policy");
    }
  };

  /** Changes the default password of ALL active system users, and persists it
   *  in the database so newly created accounts (new hires) start with it. */
  const resetDefaultPassword = async () => {
    if (!resetPw || resetPw.length < 8) {
      toast.error("Default password must be at least 8 characters");
      return;
    }
    if (resetPw !== resetPwConfirm) {
      toast.error("New password and confirmation must match");
      return;
    }
    try {
      const res = await settingsApi.resetDefaultPassword(resetPw);
      toast.success(res.message);
      setResetPwOpen(false);
      setResetPw("");
      setResetPwConfirm("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the default password");
    }
  };

  return (
    <div>
      <div className="-mx-1 mb-4 space-y-3 px-1 pb-1 pt-1">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center text-primary">
            {/* Solid gear with the hub punched out, matching the filled marks
                on Recruitment and Applicant Management. */}
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-11 w-11 fill-current">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.14 12.94c.04-.31.06-.62.06-.94s-.02-.63-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.3 7.3 0 0 0-1.63-.95l-.36-2.54A.49.49 0 0 0 13.88 2h-3.76a.49.49 0 0 0-.49.42L9.27 4.96c-.59.23-1.14.55-1.63.95l-2.39-.96a.5.5 0 0 0-.61.22L2.72 8.49a.5.5 0 0 0 .12.64l2.03 1.58a6.3 6.3 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96c.49.4 1.04.72 1.63.95l.36 2.54a.49.49 0 0 0 .49.42h3.76a.49.49 0 0 0 .49-.42l.36-2.54c.59-.23 1.14-.55 1.63-.95l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
              />
            </svg>
          </span>
          <div>
            <h1 className="font-display text-[1.8rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
              {t("Settings")}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {role === "employee"
                ? t(
                    "Notifications, portal preferences, account security, personal contact details, and work information.",
                  )
                : isSuperAdmin
                  ? t("System security policy, account preferences, and database backups.")
                  : t("Account security, default password and notification preferences.")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* Preferences — edited inline on the card */}
        <SettingsCard
          className="h-full"
          icon={<SlidersHorizontal className="h-4.5 w-4.5 text-primary" />}
          title={t("Preferences")}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-medium text-foreground">{t("Theme")}</span>
                <span className="text-[11px] text-muted-foreground">Select system appearance</span>
              </div>
              <Select
                value={preferences.theme}
                onValueChange={(v) => {
                  setPreferences((p) => ({ ...p, theme: v }));
                }}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-medium text-foreground">{t("Language")}</span>
                <span className="text-[11px] text-muted-foreground">Display language</span>
              </div>
              <Select
                value={preferences.language}
                onValueChange={(v) => setPreferences((p) => ({ ...p, language: v }))}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Filipino">Filipino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-medium text-foreground">{t("Date format")}</span>
                <span className="text-[11px] text-muted-foreground">Calendar display style</span>
              </div>
              <Select
                value={preferences.dateFormat}
                onValueChange={(v) => setPreferences((p) => ({ ...p, dateFormat: v }))}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-medium text-foreground">{t("Time format")}</span>
                <span className="text-[11px] text-muted-foreground">Clock display format</span>
              </div>
              <Select
                value={preferences.timeFormat}
                onValueChange={(v) => setPreferences((p) => ({ ...p, timeFormat: v }))}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12-hour">12-hour</SelectItem>
                  <SelectItem value="24-hour">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="block text-sm font-medium text-foreground">{t("Time zone")}</span>
                <span className="text-[11px] text-muted-foreground">System time offset</span>
              </div>
              <Select
                value={preferences.timeZone}
                onValueChange={(v) => setPreferences((p) => ({ ...p, timeZone: v }))}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Manila (GMT+8)">Asia/Manila (GMT+8)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/Los_Angeles (GMT-8)">
                    America/Los_Angeles (GMT-8)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            {prefsDirty && (
              <span className="mr-auto text-xs font-medium text-warning-foreground dark:text-warning">
                {t("Unsaved changes")}
              </span>
            )}
            <Button size="sm" disabled={!prefsDirty} onClick={savePreferences}>
              {t("Save changes")}
            </Button>
          </div>
        </SettingsCard>

        {/* Security — system-wide policy + authenticator enrollment (superadmin only) */}
        {isSuperAdmin && (
          <SettingsCard icon={<Shield className="h-4.5 w-4.5 text-primary" />} title={t("Security")}>
            <div className="flex flex-1 flex-col space-y-4">
              {/* Authenticator-app MFA */}
              <MfaSettings />

              <div className="border-t border-border/60 pt-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Label htmlFor="pw-min-length" className="text-sm font-medium">
                    {t("Minimum password length")}
                  </Label>
                  <Input
                    id="pw-min-length"
                    type="number"
                    min={6}
                    max={32}
                    className="h-8 w-24 text-right"
                    value={security.minLength ?? 8}
                    onChange={(e) =>
                      setSecurity((p) => ({
                        ...p,
                        minLength: Math.max(6, Math.min(32, Number(e.target.value) || 8)),
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t("Password complexity requirements")}</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        ["requireUppercase", "Uppercase (A–Z)"],
                        ["requireLowercase", "Lowercase (a–z)"],
                        ["requireNumber", "Numbers (0–9)"],
                        ["requireSymbol", "Symbols (!@#$)"] as const,
                      ] as const
                    ).map(([key, label]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-foreground">{label}</span>
                        <Switch
                          checked={security[key] ?? false}
                          onCheckedChange={(v) => setSecurity((p) => ({ ...p, [key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("Session timeout")}</Label>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(v) => setSecurity((p) => ({ ...p, sessionTimeout: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15 minutes">15 minutes</SelectItem>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="60 minutes">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("Max login attempts")}</Label>
                    <Select
                      value={security.maxLoginAttempts}
                      onValueChange={(v) => setSecurity((p) => ({ ...p, maxLoginAttempts: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select attempts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3 attempts">3 attempts</SelectItem>
                        <SelectItem value="5 attempts">5 attempts</SelectItem>
                        <SelectItem value="10 attempts">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-2 border-t border-border/60 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setResetPw("");
                    setResetPwConfirm("");
                    setResetPwOpen(true);
                  }}
                >
                  <KeyRound className="mr-1.5 h-3.5 w-3.5 text-primary" /> {t("Change default password of all users")}
                </Button>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {securityDirty && (
                    <span className="mr-auto text-xs font-medium text-warning-foreground dark:text-warning">
                      {t("Unsaved changes")}
                    </span>
                  )}
                  <Button size="sm" disabled={!securityDirty} onClick={saveSecurity}>
                    {t("Save changes")}
                  </Button>
                </div>
              </div>
            </div>
          </SettingsCard>
        )}

        {/* Per-account Security — OTP toggle, authenticator, password change (non-superadmin) */}
        {!isSuperAdmin && (
          <Card id="security" className="scroll-mt-20 rounded-xl border-border/60 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <CardContent className="flex flex-col space-y-4 p-4 sm:p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold">
                <Shield className="h-4.5 w-4.5 text-primary" /> {t("Security")}
              </h2>

              {/* Personal OTP requirement */}
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("OTP verification at login")}</p>
                  <p className="text-xs text-muted-foreground">Receive single-use code when signing in</p>
                </div>
                <Switch
                  aria-label="Require OTP at login"
                  checked={otpEnabled ?? true}
                  disabled={otpEnabled === null}
                  onCheckedChange={(v) => {
                    persistOtpEnabled(v);
                    toast.success(
                      v ? "OTP enabled for your account" : "OTP disabled for your account",
                    );
                  }}
                />
              </div>

              {/* Authenticator-app MFA */}
              <MfaSettings />

              <div className="grid gap-3 border-t border-border/60 pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cur-pw" className="text-xs">{t("Current password")}</Label>
                  <div className="relative">
                    <Input
                      id="cur-pw"
                      type={showPw.current ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                      aria-label={
                        showPw.current ? "Hide current password" : "Show current password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPw.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pw" className="text-xs">{t("New password")}</Label>
                    <div className="relative">
                      <Input
                        id="new-pw"
                        type={showPw.next ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                        aria-label={showPw.next ? "Hide new password" : "Show new password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPw.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-pw" className="text-xs">{t("Confirm new password")}</Label>
                    <div className="relative">
                      <Input
                        id="confirm-pw"
                        type={showPw.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="h-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                        aria-label={
                          showPw.confirm ? "Hide confirmed password" : "Show confirmed password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPw.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <AlertDialog open={pwConfirmOpen} onOpenChange={setPwConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" disabled={!currentPassword || !newPassword}>
                      <KeyRound className="mr-1.5 h-3.5 w-3.5" /> {t("Update password")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Update your password?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your account password will be changed and saved to the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          changeOwnPassword().then(() => setPwConfirmOpen(false));
                        }}
                      >
                        Yes, update password
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Change default password of all users
                </DialogTitle>
                <DialogDescription>
                  Sets the default password for active system accounts and newly created users.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-pw">New default password</Label>
                  <Input
                    id="reset-pw"
                    type="password"
                    value={resetPw}
                    onChange={(e) => setResetPw(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-pw-confirm">Confirm new default password</Label>
                  <Input
                    id="reset-pw-confirm"
                    type="password"
                    value={resetPwConfirm}
                    onChange={(e) => setResetPwConfirm(e.target.value)}
                    placeholder="Repeat the new password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResetPwOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={resetDefaultPassword}>Update all users</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Company (superadmin only) */}
        {showCompanyCard && (
          <SettingsCard
            icon={<Building2 className="h-4.5 w-4.5 text-primary" />}
            title="Company"
            footer={{
              label: "Edit company info",
              onClick: () => {
                setCompanyDraft(company);
                setCompanyOpen(true);
              },
            }}
          >
            <div className="divide-y divide-border/60">
              <InfoRow label="Company name" value={company.name} />
              <InfoRow label="Company email" value={company.email} />
              <InfoRow label="Contact number" value={company.contact} />
              <InfoRow label="Business hours" value={company.businessHours} />
              <InfoRow label="Company address" value={company.address} />
              <InfoRow label="TIN" value={company.tin} />
            </div>
          </SettingsCard>
        )}

        {isSuperAdmin && (
          <Dialog open={companyOpen} onOpenChange={setCompanyOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Edit company info</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="co-name">Company name</Label>
                  <Input
                    id="co-name"
                    value={companyDraft.name}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-email">Company email</Label>
                  <Input
                    id="co-email"
                    value={companyDraft.email}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-contact">Contact number</Label>
                  <Input
                    id="co-contact"
                    placeholder="e.g. +63 2 8999 0000"
                    value={companyDraft.contact}
                    onChange={(e) =>
                      setCompanyDraft((p) => ({ ...p, contact: sanitizePhone(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-hours">Business hours</Label>
                  <Input
                    id="co-hours"
                    value={companyDraft.businessHours}
                    onChange={(e) =>
                      setCompanyDraft((p) => ({ ...p, businessHours: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-address">Company address</Label>
                  <Input
                    id="co-address"
                    value={companyDraft.address}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-tin">TIN</Label>
                  <Input
                    id="co-tin"
                    value={companyDraft.tin}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, tin: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCompanyOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (companyDraft.email && !isValidEmail(companyDraft.email)) {
                      toast.error("Please enter a valid company email address.");
                      return;
                    }
                    if (companyDraft.contact && !isValidPhone(companyDraft.contact)) {
                      toast.error("Please enter a valid contact phone number.");
                      return;
                    }
                    setCompany(companyDraft);
                    setCompanyOpen(false);
                    try {
                      await settingsApi.upsert("company", companyDraft);
                      toast.success("Company information saved to database");
                    } catch (e) {
                      toast.error(
                        e instanceof Error ? e.message : "Could not save company information",
                      );
                    }
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Backup & Restore (superadmin only) — full-width second row */}
        {isSuperAdmin && (
          <div className="lg:col-span-2">
            <Card className="rounded-xl border-border/60 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <CardContent className="flex flex-col space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold">
                    <Database className="h-4.5 w-4.5 text-primary" /> {t("Backup & Restore")}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-xs">
                      <span className="font-medium text-foreground">{t("Auto backup")}:</span>
                      {autoBackupEnabled && (
                        <Select
                          value={backupSchedule}
                          onValueChange={(v) => {
                            setBackupSchedule(v);
                            persistAutoBackup(true, v);
                          }}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Switch
                        checked={autoBackupEnabled}
                        onCheckedChange={(v) => {
                          setAutoBackupEnabled(v);
                          persistAutoBackup(v, backupSchedule);
                        }}
                        aria-label="Automatic backups"
                      />
                    </div>

                    <Button size="sm" onClick={createBackup} disabled={backupInProgress} className="h-9">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      {backupInProgress ? "Creating backup…" : t("Create backup")}
                    </Button>
                  </div>
                </div>

                {backupInProgress && (
                  <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-primary">Generating database snapshot…</span>
                      <span className="font-semibold text-primary">{backupProgress}%</span>
                    </div>
                    <Progress value={backupProgress} className="h-1.5" />
                  </div>
                )}

                <div className="max-h-80 overflow-x-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-semibold">Backup id</TableHead>
                        <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                        <TableHead className="text-xs font-semibold">Size</TableHead>
                        <TableHead className="text-xs font-semibold">Type</TableHead>
                        <TableHead className="text-right text-xs font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingBackups && <TableRowsSkeleton cols={5} rows={3} />}
                      {!loadingBackups && backups.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                            No database backups generated yet. Click "Create backup" to create one.
                          </TableCell>
                        </TableRow>
                      )}
                      {!loadingBackups &&
                        backups.map((b) => (
                          <TableRow key={b.id} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="font-mono text-xs font-medium text-foreground">{b.id}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{b.timestamp}</TableCell>
                            <TableCell className="text-xs font-medium">{b.size}</TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="rounded-full text-[0.68rem] font-semibold border-border">
                                {b.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 hover:text-primary"
                                  title="Download backup"
                                  onClick={() => settingsApi.downloadBackup(b.id)}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog
                                  open={restoreTarget?.id === b.id}
                                  onOpenChange={(o) => !o && setRestoreTarget(null)}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs hover:border-warning/40 hover:text-warning-foreground"
                                      onClick={() => setRestoreTarget(b)}
                                    >
                                      Restore
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Restore from {b.id}?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will roll back system data to the {b.timestamp}{" "}
                                        snapshot. Any changes made after this backup will be lost.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        disabled={restoreInProgress}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          restoreBackup();
                                        }}
                                      >
                                        {restoreInProgress ? "Restoring…" : "Restore"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
