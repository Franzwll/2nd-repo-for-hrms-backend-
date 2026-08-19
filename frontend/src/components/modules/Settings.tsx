import { useState, useEffect } from "react";
import { mySettingsApi, settingsApi } from "@/lib/api";
import { myProfile } from "@/data/ess";
import {
  ArrowRight,
  Bell,
  Building2,
  Database,
  Download,
  KeyRound,
  Plus,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

import { toast } from "sonner";

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

export { AuditLogs } from "./AuditLogs";

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
  subtitle: string;
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
            <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
              {icon}
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
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
  /** The portal's current user key — each user keeps per-user designated
   *  Notifications / Preferences / Change Password values in the database. */
  const currentUser =
    role === "employee"
      ? myProfile.email
      : role === "admin"
        ? "juan.delacruz@oxfordsuites.com.ph"
        : "bullseur@oxfordsuites.com.ph";

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreTarget, setRestoreTarget] = useState<BackupEntry | null>(null);
  const [notify, setNotify] = useState<Record<string, boolean>>({});

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications dialog
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifDraft, setNotifDraft] = useState(notify);

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: "",
    language: "",
    dateFormat: "",
    timeFormat: "",
    timeZone: "",
  });
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsDraft, setPrefsDraft] = useState(preferences);

  // Login security (password policy + session rules, saved to "security")
  const [security, setSecurity] = useState({
    twoFactor: false,
    minLength: 0,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSymbol: false,
    sessionTimeout: "",
    maxLoginAttempts: "",
  });
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityDraft, setSecurityDraft] = useState(security);

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

  useEffect(() => {
    settingsApi.getAll().then((res) => {
      if (res?.map) {
        if (res.map["company"]) {
          setCompany(res.map["company"]);
          setCompanyDraft(res.map["company"]);
        }
        if (res.map["preferences"]) {
          setPreferences(res.map["preferences"]);
          setPrefsDraft(res.map["preferences"]);
        }
        if (res.map["security"]) {
          setSecurity(res.map["security"]);
          setSecurityDraft(res.map["security"]);
        }
        if (res.map["notifications"]) {
          setNotify(res.map["notifications"]);
          setNotifDraft(res.map["notifications"]);
        }
        if (res.map["backups"]) {
          setBackups(Array.isArray(res.map["backups"]) ? res.map["backups"] : []);
        }
        if (res.map["backup"]) {
          const b = res.map["backup"];
          if (typeof b?.enabled === "boolean") setAutoBackupEnabled(b.enabled);
          if (b?.schedule) setBackupSchedule(b.schedule);
        }
      }
    }).catch((err) => {
      console.warn("Could not fetch settings from database:", err);
    });

    // Per-user designated values — this user's own notifications/preferences
    // (merged over the system defaults above).
    mySettingsApi.get(currentUser)
      .then((mine) => {
        if (mine?.notifications && Object.keys(mine.notifications).length > 0) {
          setNotify((prev) => ({ ...prev, ...mine.notifications }));
          setNotifDraft((prev) => ({ ...prev, ...mine.notifications }));
        }
        if (mine?.preferences && Object.keys(mine.preferences).length > 0) {
          setPreferences((prev) => ({ ...prev, ...mine.preferences }));
          setPrefsDraft((prev) => ({ ...prev, ...mine.preferences }));
        }
      })
      .catch((err) => {
        console.warn("Could not fetch per-user settings from database:", err);
      });
  }, [currentUser]);

  const createBackup = () => {
    if (backupInProgress) return;
    setBackupInProgress(true);
    setBackupProgress(0);
    const timer = setInterval(() => {
      setBackupProgress((p) => {
        const next = p + 20;
        if (next >= 100) {
          clearInterval(timer);
          setBackupInProgress(false);
          setBackups((prev) => {
            const created = [
              {
                id: `BKP-${105 + prev.length}`,
                timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                size: "483 MB",
                type: "Manual",
              },
              ...prev,
            ];
            settingsApi
              .upsert("backups", created)
              .catch((e) => console.warn("Could not save backups to database:", e));
            return created;
          });
          toast.success("Backup created successfully");
          return 0;
        }
        return next;
      });
    }, 300);
  };

  const persistAutoBackup = (enabled: boolean, schedule: string) => {
    settingsApi
      .upsert("backup", { enabled, schedule })
      .catch((e) => console.warn("Could not save backup settings to database:", e));
  };

  const restoreBackup = () => {
    if (!restoreTarget) return;
    toast.success(`System restored from ${restoreTarget.id} (${restoreTarget.timestamp})`);
    setRestoreTarget(null);
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
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Employee"}
        title="Settings"
        description="Notifications, preferences and system data management."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Notifications */}
        <SettingsCard
          icon={<Bell className="h-5 w-5" />}
          title="Notifications"
          subtitle="Choose how you receive alerts and updates"
          footer={{
            label: "Manage notifications",
            onClick: () => {
              setNotifDraft(notify);
              setNotifOpen(true);
            },
          }}
        >
          <div className="divide-y divide-border/60">
            {(
              ["Email notifications", "Browser notifications", "System announcements"] as const
            ).map((label) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Switch
                  aria-label={label}
                  checked={notify[label] ?? false}
                  onCheckedChange={(v) => {
                    setNotify((prev) => {
                      const next = { ...prev, [label]: v };
                      mySettingsApi
                        .save("notifications", currentUser, next)
                        .catch((e) => console.warn("Could not save notification settings:", e));
                      return next;
                    });
                    toast.success(`${label} ${v ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
            ))}
          </div>
        </SettingsCard>

        <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Manage notifications</DialogTitle>
            </DialogHeader>
            <div className="divide-y divide-border/60">
              {(
                ["Email notifications", "Browser notifications", "System announcements"] as const
              ).map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Switch
                    aria-label={label}
                    checked={notifDraft[label] ?? false}
                    onCheckedChange={(v) => setNotifDraft((prev) => ({ ...prev, [label]: v }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotifOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setNotify(notifDraft);
                  setNotifOpen(false);
                  try {
                    await mySettingsApi.save("notifications", currentUser, notifDraft);
                    toast.success("Notification settings saved to database");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Could not save notification settings");
                  }
                }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preferences */}
        <SettingsCard
          icon={<SlidersHorizontal className="h-5 w-5" />}
          title="Preferences"
          subtitle="Personalize how the portal looks and formats data"
          footer={{
            label: "Edit preferences",
            onClick: () => {
              setPrefsDraft(preferences);
              setPrefsOpen(true);
            },
          }}
        >
          <div className="divide-y divide-border/60">
            <InfoRow label="Theme" value={preferences.theme} />
            <InfoRow label="Language" value={preferences.language} />
            <InfoRow label="Date format" value={preferences.dateFormat} />
            <InfoRow label="Time format" value={preferences.timeFormat} />
            <InfoRow label="Time zone" value={preferences.timeZone} />
          </div>
        </SettingsCard>

        <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Edit preferences</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={prefsDraft.theme} onValueChange={(v) => setPrefsDraft((p) => ({ ...p, theme: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={prefsDraft.language}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, language: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Filipino">Filipino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date format</Label>
                <Select
                  value={prefsDraft.dateFormat}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, dateFormat: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time format</Label>
                <Select
                  value={prefsDraft.timeFormat}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, timeFormat: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12-hour">12-hour</SelectItem>
                    <SelectItem value="24-hour">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time zone</Label>
                <Select
                  value={prefsDraft.timeZone}
                  onValueChange={(v) => setPrefsDraft((p) => ({ ...p, timeZone: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Manila (GMT+8)">Asia/Manila (GMT+8)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/Los_Angeles (GMT-8)">America/Los_Angeles (GMT-8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPrefsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setPreferences(prefsDraft);
                  setPrefsOpen(false);
                  try {
                    await mySettingsApi.save("preferences", currentUser, prefsDraft);
                    toast.success("Preferences saved to database");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Could not save preferences");
                  }
                }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Login Security (superadmin) or Change Password (admin/employee) */}
        {isSuperAdmin ? (
          <SettingsCard
            icon={<Shield className="h-5 w-5" />}
            title="Login Security"
            subtitle="System-wide login security policy for all portals"
            footer={{
              label: "Manage security",
              onClick: () => {
                setSecurityDraft(security);
                setSecurityOpen(true);
              },
            }}
          >
            <div className="divide-y divide-border/60">
              <InfoRow label="Two-factor authentication"
                value={security.twoFactor ? "Enabled" : "Disabled"}
                tone={security.twoFactor ? "success" : "default"}
              />
              <InfoRow
                label="Password policy"
                value={`Min ${security.minLength ?? 8} characters, uppercase${
                  security.requireUppercase ? "" : " not required"
                }, lowercase${security.requireLowercase ? "" : " not required"}, number${
                  security.requireNumber ? "" : " not required"
                }${security.requireSymbol ? ", symbol" : ""}`}
              />
              <InfoRow label="Session timeout" value={security.sessionTimeout} />
              <InfoRow label="Max login attempts" value={security.maxLoginAttempts} />
            </div>
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={() => {
                setResetPw("");
                setResetPwConfirm("");
                setResetPwOpen(true);
              }}
            >
              <KeyRound className="mr-1.5 h-4 w-4" /> Change default password of all users
            </Button>
          </SettingsCard>
        ) : (
          <Card id="change-password" className="flex h-full flex-col scroll-mt-20 rounded-xl border-border/70 shadow-sm">
            <CardContent className="flex flex-1 flex-col space-y-4 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Change Password</h2>
                  <p className="text-xs text-muted-foreground">Update your account password.</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cur-pw">Current password</Label>
                  <Input
                    id="cur-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pw">New password</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">Confirm new password</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="mt-auto flex justify-end pt-1">
                <Button onClick={changeOwnPassword}>
                  <KeyRound className="mr-2 h-4 w-4" /> Update password
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isSuperAdmin && (
          <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Manage security</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Label>Two-factor authentication</Label>
                  <Switch
                    checked={securityDraft.twoFactor}
                    onCheckedChange={(v) => setSecurityDraft((p) => ({ ...p, twoFactor: v }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-min-length">Minimum password length</Label>
                  <Input
                    id="pw-min-length"
                    type="number"
                    min={6}
                    max={32}
                    value={securityDraft.minLength ?? 8}
                    onChange={(e) =>
                      setSecurityDraft((p) => ({
                        ...p,
                        minLength: Math.max(6, Math.min(32, Number(e.target.value) || 8)),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Password requirements</Label>
                  {(
                    [
                      ["requireUppercase", "Require at least one uppercase letter (A–Z)"],
                      ["requireLowercase", "Require at least one lowercase letter (a–z)"],
                      ["requireNumber", "Require at least one number (0–9)"],
                      ["requireSymbol", "Require at least one symbol (!@#$%…)"] as const,
                    ] as const
                  ).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-md border border-border/70 bg-muted/30 px-3 py-2"
                    >
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <Switch
                        checked={securityDraft[key] ?? false}
                        onCheckedChange={(v) => setSecurityDraft((p) => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Session timeout</Label>
                  <Select
                    value={securityDraft.sessionTimeout}
                    onValueChange={(v) => setSecurityDraft((p) => ({ ...p, sessionTimeout: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="60 minutes">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max login attempts</Label>
                  <Select
                    value={securityDraft.maxLoginAttempts}
                    onValueChange={(v) => setSecurityDraft((p) => ({ ...p, maxLoginAttempts: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 attempts">3 attempts</SelectItem>
                      <SelectItem value="5 attempts">5 attempts</SelectItem>
                      <SelectItem value="10 attempts">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSecurityOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setSecurity(securityDraft);
                    setSecurityOpen(false);
                    try {
                      await settingsApi.upsert('security', securityDraft);
                      toast.success("System-wide login security policy saved to database");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Could not save security policy");
                    }
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Change default password of ALL active system users (superadmin) —
            also saved to system_settings.default_password in the database */}
        {isSuperAdmin && (
          <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  Change default password of all users
                </DialogTitle>
                <DialogDescription>
                  Sets the same default password for every active system user account, and saves
                  it to the database so new user accounts are created with it. Users will need to
                  log in with the new password.
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
        {isSuperAdmin && (
          <SettingsCard
            icon={<Building2 className="h-5 w-5" />}
            title="Company"
            subtitle="Default used in documents, job post and portals"
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
                    value={companyDraft.contact}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, contact: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-hours">Business hours</Label>
                  <Input
                    id="co-hours"
                    value={companyDraft.businessHours}
                    onChange={(e) => setCompanyDraft((p) => ({ ...p, businessHours: e.target.value }))}
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
                    setCompany(companyDraft);
                    setCompanyOpen(false);
                    try {
                      await settingsApi.upsert('company', companyDraft);
                      toast.success("Company information saved to database");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Could not save company information");
                    }
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Backup & Restore (superadmin only) */}
        {isSuperAdmin && (
          <Card className="rounded-xl border-border/70 shadow-sm xl:col-span-2">
            <CardContent className="flex flex-1 flex-col space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
                    <Database className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Backup & Restore</h2>
                    <p className="text-xs text-muted-foreground">
                      Manage system backups and restore points
                    </p>
                  </div>
                </div>
                <Button onClick={createBackup} disabled={backupInProgress}>
                  {backupInProgress ? "Creating backup…" : "Create backup"}
                </Button>
              </div>

              {backupInProgress && (
                <div className="space-y-1">
                  <Progress value={backupProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Backing up system data… {backupProgress}%
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-caution/30 bg-caution/10 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Automatic backups</p>
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
                      <TableHead>Backup id</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm font-medium">{b.id}</TableCell>
                        <TableCell className="text-xs">{b.timestamp}</TableCell>
                        <TableCell className="text-xs">{b.size}</TableCell>
                        <TableCell className="text-xs">{b.type}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Download backup"
                              onClick={() => toast.success(`Downloading ${b.id}`)}
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
                                  Restore
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore from {b.id}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will roll back system data to the {b.timestamp} snapshot.
                                    Any changes made after this backup will be lost.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={restoreBackup}>
                                    Restore
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
              <p className="text-xs text-muted-foreground">
                Showing {backups.length > 0 ? 1 : 0}-{backups.length} of {backups.length} backups
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}