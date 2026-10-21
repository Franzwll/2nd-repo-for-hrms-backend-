import { useState, useEffect } from "react";
import { mySettingsApi, settingsApi, chatbotFaqApi, type ApiChatbotFaq, type ApiChatbotAnalytics } from "@/lib/api";
import { applyTheme, getStoredTheme, type ThemeChoice } from "@/lib/theme";
import { myProfile } from "@/data/ess";
import { getUser } from "@/lib/auth";
import { isValidEmail, isValidPhone, sanitizeName, sanitizePhone } from "@/lib/validation";
import {
  ArrowRight,
  Bot,
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
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";

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

/** Compact Chatbot FAQ manager sized for a single settings grid card.
 *  Lives in the slot previously occupied by Notifications. */
function ChatbotFaqSettingsCard() {
  const [faqs, setFaqs] = useState<ApiChatbotFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiChatbotFaq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<ApiChatbotAnalytics | null>(null);

  const load = () => {
    setLoading(true);
    chatbotFaqApi
      .list()
      .then((res) => setFaqs(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    chatbotFaqApi
      .analytics()
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null));
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = faqs.filter((f) => f.enabled).length;
  const aiTotal = (analytics?.gemini_messages_30d ?? 0) + (analytics?.fallback_messages_30d ?? 0);
  const aiShare = aiTotal > 0 ? Math.round(((analytics?.gemini_messages_30d ?? 0) / aiTotal) * 100) : 0;

  const openCreate = () => {
    setEditing(null);
    setQuestion("");
    setAnswer("");
    setKeywords("");
    setDialogOpen(true);
  };

  const openEdit = (faq: ApiChatbotFaq) => {
    setEditing(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setKeywords(faq.keywords ?? "");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!question.trim()) {
      toast.error("Question is required.");
      return;
    }
    if (!answer.trim()) {
      toast.error("Answer is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
        keywords: keywords.trim() || null,
        enabled: editing?.enabled ?? true,
        sort_order: editing?.sort_order ?? 0,
      };
      const res =
        editing === null
          ? await chatbotFaqApi.create(payload)
          : await chatbotFaqApi.update(editing.faq_id, payload);
      toast.success(res.message);
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (faq: ApiChatbotFaq) => {
    try {
      const res = await chatbotFaqApi.update(faq.faq_id, { enabled: !faq.enabled });
      toast.success(res.message);
      setFaqs((prev) =>
        prev.map((f) => (f.faq_id === faq.faq_id ? { ...f, enabled: !f.enabled } : f)),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the FAQ.");
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await chatbotFaqApi.remove(deleteId);
      toast.success(res.message);
      setDeleteId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the FAQ.");
    }
  };

  return (
    <SettingsCard
      icon={<Bot className="h-5 w-5" />}
      title="Chatbot FAQ"
      action={
        <Button size="sm" variant="outline" onClick={openCreate} title="Add FAQ">
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            {faqs.length} total
          </Badge>
          <Badge variant="outline" className="border-success/30 bg-success/15 text-success">
            {activeCount} active
          </Badge>
        </div>

        {/* Insights — compact usage summary mirroring the full manager */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 p-2.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Conversations today
            </p>
            <p className="font-display text-xl font-semibold text-primary">
              {analytics?.conversations_today ?? 0}
            </p>
            <p className="text-[0.65rem] text-muted-foreground">
              {analytics?.messages_today ?? 0} messages
            </p>
          </div>
          <div className="rounded-lg border border-border/70 p-2.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              AI vs fallback (30d)
            </p>
            <p className="font-display text-xl font-semibold">{aiShare}%</p>
            <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${aiShare}%` }} />
              <div className="h-full bg-gold" style={{ width: `${100 - aiShare}%` }} />
            </div>
          </div>
          <div className="rounded-lg border border-border/70 p-2.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Answer feedback
            </p>
            <p className="flex items-center gap-2 font-display text-xl font-semibold">
              <span className="flex items-center gap-1 text-success">
                <ThumbsUp className="h-3.5 w-3.5" /> {analytics?.feedback_up ?? 0}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <ThumbsDown className="h-3.5 w-3.5" /> {analytics?.feedback_down ?? 0}
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-border/70 p-2.5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Tokens this month
            </p>
            <p className="font-display text-xl font-semibold">
              {(analytics?.gemini_tokens_month ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-3 max-h-[190px] min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto pr-1">
          {loading && (
            <div className="space-y-2 py-2" aria-busy="true" aria-label="Loading FAQs">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {!loading && faqs.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No FAQs yet. Click Add to create one.
            </p>
          )}
          {faqs.map((f) => (
            <div key={f.faq_id} className="flex items-center justify-between gap-2 py-2">
              <p className="min-w-0 flex-1 truncate text-sm" title={f.question}>
                {f.question}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <Switch
                  aria-label={`Enable ${f.question}`}
                  checked={f.enabled}
                  onCheckedChange={() => toggleEnabled(f)}
                />
                <Button size="icon" variant="ghost" title="Edit FAQ" onClick={() => openEdit(f)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Delete FAQ"
                  className="hover:text-destructive"
                  onClick={() => setDeleteId(f.faq_id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing === null ? "Add FAQ" : "Edit FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editing === null
                ? "Create a new question-and-answer entry for the careers assistant."
                : "Update this entry. Changes take effect immediately on the landing page."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="settings-faq-question">Question</Label>
              <Input
                id="settings-faq-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What should I wear to the interview?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-faq-answer">Answer</Label>
              <Textarea
                id="settings-faq-answer"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write the assistant's reply…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-faq-keywords">Keywords (comma-separated)</Label>
              <Input
                id="settings-faq-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="dress code, wear, attire, outfit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing === null ? "Create FAQ" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This entry will be removed from the careers assistant immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsCard>
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
      security: typeof security;
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
        if (mine?.preferences && Object.keys(mine.preferences).length > 0) {
          // Same as above: populate the form but never touch the live theme.
          const { theme: _savedTheme, ...savedPrefs } = mine.preferences as Record<
            string,
            string
          >;
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
      <PageHeader
        title="Settings"
        description={
          role === "employee"
            ? "Notifications, portal preferences, account security, personal contact details, and work information."
            : "Account security, default password and notification preferences."
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Chatbot FAQ — compact manager in the former Notifications slot (admins only) */}
        {(isSuperAdmin || role === "admin") && (
          <ChatbotFaqSettingsCard />
        )}

        {/* Preferences — edited inline on the card */}
        <SettingsCard
          icon={<SlidersHorizontal className="h-5 w-5" />}
          title="Preferences"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Theme</span>
              <Select
                value={preferences.theme}
                onValueChange={(v) => {
                  // Staged only — the live theme applies when the user clicks
                  // Save changes, so picking a value never flips the page by itself.
                  setPreferences((p) => ({ ...p, theme: v }));
                }}
              >
                <SelectTrigger className="h-8 w-40">
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
              <span className="text-sm text-muted-foreground">Language</span>
              <Select
                value={preferences.language}
                onValueChange={(v) => setPreferences((p) => ({ ...p, language: v }))}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Filipino">Filipino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Date format</span>
              <Select
                value={preferences.dateFormat}
                onValueChange={(v) => setPreferences((p) => ({ ...p, dateFormat: v }))}
              >
                <SelectTrigger className="h-8 w-40">
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
              <span className="text-sm text-muted-foreground">Time format</span>
              <Select
                value={preferences.timeFormat}
                onValueChange={(v) => setPreferences((p) => ({ ...p, timeFormat: v }))}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12-hour">12-hour</SelectItem>
                  <SelectItem value="24-hour">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Time zone</span>
              <Select
                value={preferences.timeZone}
                onValueChange={(v) => setPreferences((p) => ({ ...p, timeZone: v }))}
              >
                <SelectTrigger className="h-8 w-40">
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
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            {prefsDirty && (
              <span className="mr-auto text-xs font-medium text-caution">Unsaved changes</span>
            )}
            <Button size="sm" disabled={!prefsDirty} onClick={savePreferences}>
              Save changes
            </Button>
          </div>
        </SettingsCard>

        {/* Login Security — system-wide policy (superadmin only) */}
        {isSuperAdmin && (
          <SettingsCard
            icon={<Shield className="h-5 w-5" />}
            title="Login Security"
          >
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Editable security controls — kept inside a bounded scroll area
                  so the card height never changes regardless of content. */}
              <div className="max-h-[300px] min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between gap-4">
                  <Label>Two-factor authentication</Label>
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={(v) => setSecurity((p) => ({ ...p, twoFactor: v }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-min-length">Minimum password length</Label>
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
                        checked={security[key] ?? false}
                        onCheckedChange={(v) => setSecurity((p) => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Session timeout</Label>
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
                  <Label>Max login attempts</Label>
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

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                {securityDirty && (
                  <span className="mr-auto text-xs font-medium text-caution">Unsaved changes</span>
                )}
                <Button size="sm" disabled={!securityDirty} onClick={saveSecurity}>
                  Save changes
                </Button>
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
            </div>
          </SettingsCard>
        )}

        {/* Security — password + personal OTP toggle — every logged-in account */}
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
                <h2 className="font-display text-xl font-semibold">Security</h2>
              </div>
            </div>

            {/* Personal OTP requirement */}
            <div className="flex items-center justify-between gap-4 rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">OTP verification at login</p>
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

            {/* Authenticator-app MFA — emailed codes vs TOTP app */}
            <MfaSettings />

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="cur-pw">Current password</Label>
                <div className="relative">
                  <Input
                    id="cur-pw"
                    type={showPw.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                    aria-label={showPw.current ? "Hide current password" : "Show current password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPw.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pw">New password</Label>
                <div className="relative">
                  <Input
                    id="new-pw"
                    type={showPw.next ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
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
              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Confirm new password</Label>
                <div className="relative">
                  <Input
                    id="confirm-pw"
                    type={showPw.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                    aria-label={
                      showPw.confirm ? "Hide confirmed password" : "Show confirmed password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPw.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <AlertDialog open={pwConfirmOpen} onOpenChange={setPwConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button className="mt-auto self-end" disabled={!currentPassword || !newPassword}>
                  <KeyRound className="mr-2 h-4 w-4" /> Update password
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

        {/* Company (superadmin only) */}
        {isSuperAdmin && (
          <SettingsCard
            icon={<Building2 className="h-5 w-5" />}
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

        {/* Backup & Restore (superadmin only) */}
        {isSuperAdmin && (
          <Card className="flex h-full flex-col rounded-xl border-border/70 shadow-sm">
            <CardContent className="flex flex-1 flex-col space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
                    <Database className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Backup & Restore</h2>
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
                    {loadingBackups && <TableRowsSkeleton cols={5} rows={5} />}
                    {!loadingBackups && backups.map((b) => (
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
                              onClick={() => settingsApi.downloadBackup(b.id)}
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
        )}
      </div>
    </div>
  );
}
