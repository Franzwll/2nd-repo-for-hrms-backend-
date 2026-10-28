import { useState, useEffect } from "react";
import { mySettingsApi, settingsApi } from "@/lib/api";
import { applyTheme, type ThemeChoice } from "@/lib/theme";
import { myProfile } from "@/data/ess";
import { getUser } from "@/lib/auth";
import { usePreferences, type UserPreferences } from "@/lib/preferences";
import { ArrowRight, Database, Download, KeyRound, Shield, SlidersHorizontal } from "lucide-react";

import { toast } from "sonner";

import { MfaSettings } from "@/components/modules/MfaSettings";
import { PageHeader } from "@/components/portal/PageHeader";
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
  subtitle,
  action,
  className,
  children,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: { label: string; onClick?: () => void };
}) {
  return (
    <Card className={cn("flex h-full flex-col rounded-xl border-border/70 shadow-sm", className)}>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">{icon}</span>
            <div>
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
        <div className="mt-4 flex-1">{children}</div>
        {footer && (
          <button
            type="button"
            onClick={footer.onClick}
            className="mt-4 flex items-center gap-1.5 self-start border-t border-border/60 pt-4 text-sm font-medium text-primary transition hover:gap-2.5"
          >
            {footer.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}


export function SettingsPage({ role }: { role: "superadmin" | "admin" | "employee" }) {
  /** The portal's current user key — resolved from the authenticated session
   *  so every logged-in account manages its OWN preferences /
   *  password / OTP values in the database. */
  const currentUser =
    getUser()?.email ??
    (role === "employee"
      ? myProfile.email
      : role === "admin"
        ? "juan.delacruz@oxfordsuites.com.ph"
        : "bullseur@oxfordsuites.com.ph");

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
  const [pwConfirmOpen, setPwConfirmOpen] = useState(false);

  // Preferences — edited inline on the card; saved when the user clicks save.
  // Theme defaults to the locally stored choice so the select shows the
  // active mode even before the database values arrive.
  const {
    preferences: savedPreferences,
    setPreferences: applyPreferences,
    t,
    formatDateTime,
  } = usePreferences();

  const [preferences, setPreferences] = useState<UserPreferences>(savedPreferences);
  const [prefsSavedSnapshot, setPrefsSavedSnapshot] = useState(
    JSON.stringify(savedPreferences),
  );

  // Login security (password policy + session rules, saved to "security")
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

  /** Applies a flat key/value settings map from the backend onto local state. */
  const applySettingsMap = (
    map: Partial<{
      security: typeof security;
      backups: BackupEntry[];
      backup: { enabled?: boolean; schedule?: string };
    }>,
  ) => {
    if (map["security"]) {
      setSecurity(map["security"]);
      setSecuritySavedSnapshot(JSON.stringify(map["security"]));
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
        setOtpEnabled(mine?.otp_enabled ?? true);
      })
      .catch((err) => {
        console.warn("Could not fetch per-user settings from database:", err);
      });
  }, [currentUser]);

  useEffect(() => {
    setPreferences(savedPreferences);
    setPrefsSavedSnapshot(JSON.stringify(savedPreferences));
  }, [savedPreferences]);

  const prefsDirty = JSON.stringify(preferences) !== prefsSavedSnapshot;

  /** Persists the inline-edited preferences to the database. */
  const savePreferences = async () => {
    try {
      await mySettingsApi.save("preferences", currentUser, preferences);
      if (
        preferences.theme === "Light" ||
        preferences.theme === "Dark" ||
        preferences.theme === "System"
      ) {
        applyTheme(preferences.theme as ThemeChoice);
      }
      applyPreferences(preferences);
      setPrefsSavedSnapshot(JSON.stringify(preferences));
      toast.success(t("Preferences saved to database"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("Could not save preferences"));
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

  const passwordRuleError = (value: string) => {
    const minLength = security.minLength || 8;
    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters`;
    }
    if (security.requireUppercase && !/[A-Z]/.test(value)) {
      return "Password must contain an uppercase letter";
    }
    if (security.requireLowercase && !/[a-z]/.test(value)) {
      return "Password must contain a lowercase letter";
    }
    if (security.requireNumber && !/[0-9]/.test(value)) {
      return "Password must contain a number";
    }
    if (security.requireSymbol && !/[^A-Za-z0-9]/.test(value)) {
      return "Password must contain a symbol";
    }
    return null;
  };

  const changeOwnPassword = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }
    const ruleError = passwordRuleError(newPassword);
    if (ruleError) {
      toast.error(ruleError);
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
    const ruleError = passwordRuleError(resetPw);
    if (ruleError) {
      toast.error(ruleError);
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
      <PageHeader
        title={t("Settings")}
        description={
          role === "employee"
            ? t("Notifications, portal preferences, account security, personal contact details, and work information.")
            : role === "superadmin"
              ? t("System security policy, account preferences, and database backups.")
              : t("Account security and portal preferences.")
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Preferences — edited inline on the card */}
        <SettingsCard
          icon={<SlidersHorizontal className="h-5 w-5" />}
          title={t("Preferences")}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("Theme")}</span>
              <Select
                value={preferences.theme}
                onValueChange={(v) => {
                  // Staged only — the live theme applies when the user clicks
                  // Save changes, so picking a value never flips the page by itself.
                  setPreferences((p) => ({ ...p, theme: v }));
                }}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder={t("Theme")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("Language")}</span>
              <Select
                value={preferences.language}
                onValueChange={(v) => setPreferences((p) => ({ ...p, language: v as UserPreferences["language"] }))}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder={t("Language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Filipino">Filipino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("Date format")}</span>
              <Select
                value={preferences.dateFormat}
                onValueChange={(v) => setPreferences((p) => ({ ...p, dateFormat: v as UserPreferences["dateFormat"] }))}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder={t("Date format")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("Time format")}</span>
              <Select
                value={preferences.timeFormat}
                onValueChange={(v) => setPreferences((p) => ({ ...p, timeFormat: v as UserPreferences["timeFormat"] }))}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder={t("Date format")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12-hour">12-hour</SelectItem>
                  <SelectItem value="24-hour">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t("Time zone")}</span>
              <Select
                value={preferences.timeZone}
                onValueChange={(v) => setPreferences((p) => ({ ...p, timeZone: v as UserPreferences["timeZone"] }))}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder={t("Time zone")} />
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
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            {prefsDirty && (
              <span className="mr-auto text-xs font-medium text-caution">{t("Unsaved changes")}</span>
            )}
            <Button size="sm" disabled={!prefsDirty} onClick={savePreferences}>
              {t("Save changes")}
            </Button>
          </div>
        </SettingsCard>

        <Card
          id="security"
          className="flex h-full flex-col scroll-mt-20 rounded-xl border-border/70 shadow-sm"
        >
          <CardContent className="flex flex-1 flex-col space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
                <Shield className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold">{t("Security")}</h2>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="pw-min-length">{t("Minimum password length")}</Label>
                  <Input
                    id="pw-min-length"
                    type="number"
                    min={6}
                    max={32}
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
                  <Label>{t("Password requirements")}</Label>
                  {(
                    [
                      ["requireUppercase", "At least one uppercase letter (A-Z)"],
                      ["requireLowercase", "At least one lowercase letter (a-z)"],
                      ["requireNumber", "At least one number (0-9)"],
                      ["requireSymbol", "At least one symbol (!@#$%)"],
                    ] as const
                  ).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-md border border-border/70 bg-muted/30 px-3 py-2"
                    >
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <Switch
                        checked={security[key] ?? false}
                        onCheckedChange={(v) => setSecurity((p) => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("Session timeout")}</Label>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(v) => setSecurity((p) => ({ ...p, sessionTimeout: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15 minutes">15 minutes</SelectItem>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="60 minutes">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Max login attempts")}</Label>
                    <Select
                      value={security.maxLoginAttempts}
                      onValueChange={(v) => setSecurity((p) => ({ ...p, maxLoginAttempts: v }))}
                    >
                      <SelectTrigger>
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
                <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                  {securityDirty && (
                    <span className="mr-auto text-xs font-medium text-caution">
                      {t("Unsaved changes")}
                    </span>
                  )}
                  <Button size="sm" disabled={!securityDirty} onClick={saveSecurity}>
                    {t("Save changes")}
                  </Button>
                </div>
              </div>
            )}

            {!isSuperAdmin && (
              <div className="flex items-center justify-between gap-4 rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("OTP verification at login")}</p>
                </div>
                <Switch
                  aria-label={t("OTP verification at login")}
                  checked={otpEnabled ?? true}
                  disabled={otpEnabled === null}
                  onCheckedChange={(v) => persistOtpEnabled(v)}
                />
              </div>
            )}

            <MfaSettings />

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="cur-pw">{t("Current password")}</Label>
                <Input
                  id="cur-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pw">{t("New password")}</Label>
                <Input
                  id="new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">{t("Confirm new password")}</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <AlertDialog open={pwConfirmOpen} onOpenChange={setPwConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button className="mt-auto self-end" disabled={!currentPassword || !newPassword}>
                  <KeyRound className="mr-2 h-4 w-4" /> {t("Update password")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Update your password?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your account password will be changed and saved to the database. Use the new
                    password the next time you sign in.
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

            {isSuperAdmin && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResetPw("");
                  setResetPwConfirm("");
                  setResetPwOpen(true);
                }}
              >
                <KeyRound className="mr-1.5 h-4 w-4" /> {t("Change default password of all users")}
              </Button>
            )}
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Change default password of all users
                </DialogTitle>
                <DialogDescription>
                  Sets the same default password for every active system user account, and saves it
                  to the database so new user accounts are created with it. Users will need to log
                  in with the new password.
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

        {/* Backup & Restore (superadmin only) */}
        {isSuperAdmin && (
          <Card className="flex h-full flex-col rounded-xl border-border/70 shadow-sm lg:col-span-2">
            <CardContent className="flex flex-1 flex-col space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
                    <Database className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">{t("Backup & Restore")}</h2>
                  </div>
                </div>
                <Button onClick={createBackup} disabled={backupInProgress}>
                  {backupInProgress ? t("Creating backup...") : t("Create backup")}
                </Button>
              </div>

              {backupInProgress && (
                <div className="space-y-1">
                  <Progress value={backupProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {t("Backing up system data...")} {backupProgress}%
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-caution/30 bg-caution/10 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("Automatic backups")}</p>
                  <p className="text-xs text-muted-foreground">
                    Run scheduled backups without manual action
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {autoBackupEnabled && (
                    <Select
                      value={backupSchedule}
                      onValueChange={(v) => {
                        setBackupSchedule(v);
                        persistAutoBackup(true, v);
                      }}
                    >
                      <SelectTrigger className="h-9 w-36">
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
              </div>

              <div className="max-h-80 overflow-y-auto rounded-lg border border-border/70">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                      <TableHead>{t("Backup id")}</TableHead>
                      <TableHead>{t("Timestamp")}</TableHead>
                      <TableHead>{t("Size")}</TableHead>
                      <TableHead>{t("Type")}</TableHead>
                      <TableHead className="text-right">{t("Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBackups && <TableRowsSkeleton cols={5} rows={5} />}
                    {!loadingBackups && backups.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm font-medium">{b.id}</TableCell>
                        <TableCell className="text-xs">{formatDateTime(b.timestamp)}</TableCell>
                        <TableCell className="text-xs">{b.size}</TableCell>
                        <TableCell className="text-xs">{b.type}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              title={t("Download backup")}
                              onClick={() =>
                                settingsApi.downloadBackup(b.id).catch((e) =>
                                  toast.error(
                                    e instanceof Error
                                      ? e.message
                                      : "Could not download the backup",
                                  ),
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={restoreTarget?.id === b.id}
                              onOpenChange={(o) => !o && setRestoreTarget(null)}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setRestoreTarget(b)}
                                >
                                  {t("Restore")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore from {b.id}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will roll back system data to the {formatDateTime(b.timestamp)} snapshot.
                                    Any changes made after this backup will be lost.
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
                                    {restoreInProgress ? t("Restoring...") : t("Restore")}
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
        )}
      </div>
    </div>
  );
}
