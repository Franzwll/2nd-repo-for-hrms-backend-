import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Heart,
  Home,
  IdCard,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  PhoneCall,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/lib/nav";
import { getUser, setUser } from "@/lib/auth";
import { essApi, profileApi } from "@/lib/api";

// Preset profile images — defaults picked by gender, plus the full gallery
// the user can choose from (Choose preset dialog).
import defaultBoy from "@/assets/Preset Profile/Preset Profile/defaultboy.svg";
import defaultGirl from "@/assets/Preset Profile/Preset Profile/default girl.svg";
import franzPreset from "@/assets/Preset Profile/Preset Profile/franz.svg";
import notion1786421526 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786421526.svg";
import notion1786737589719 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737589719.svg";
import notion1786737598454 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737598454.svg";
import notion1786737605510 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737605510.svg";
import notion1786737612237 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737612237.svg";
import notion1786737625328 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737625328.svg";
import notion1786737722250 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737722250.svg";
import notion1786737746289 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737746289.svg";
import notion1786737759718 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737759718.svg";
import notion1786737763565 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737763565.svg";
import notion1786737802586 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737802586.svg";
import notion1786737807726 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737807726.svg";
import notion1786737810585 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737810585.svg";
import notion1786737819473 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737819473.svg";
import notion1786737834554 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737834554.svg";
import notion1786737836300 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737836300.svg";
import notion1786737848298 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737848298.svg";
import notion1786737863293 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737863293.svg";
import notion1786737905991 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786737905991.svg";
import notion1786739096696abc from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786739096696abc.svg";
import notion1786739262001 from "@/assets/Preset Profile/Preset Profile/notion-avatar-1786739262001.svg";

/** Every preset avatar the user can pick as their default profile image. */
export const presetAvatars: { name: string; src: string }[] = [
  { name: "Default Boy", src: defaultBoy },
  { name: "Default Girl", src: defaultGirl },
  { name: "Franz", src: franzPreset },
  { name: "Avatar 1786421526", src: notion1786421526 },
  { name: "Avatar 1786737589719", src: notion1786737589719 },
  { name: "Avatar 1786737598454", src: notion1786737598454 },
  { name: "Avatar 1786737605510", src: notion1786737605510 },
  { name: "Avatar 1786737612237", src: notion1786737612237 },
  { name: "Avatar 1786737625328", src: notion1786737625328 },
  { name: "Avatar 1786737722250", src: notion1786737722250 },
  { name: "Avatar 1786737746289", src: notion1786737746289 },
  { name: "Avatar 1786737759718", src: notion1786737759718 },
  { name: "Avatar 1786737763565", src: notion1786737763565 },
  { name: "Avatar 1786737802586", src: notion1786737802586 },
  { name: "Avatar 1786737807726", src: notion1786737807726 },
  { name: "Avatar 1786737810585", src: notion1786737810585 },
  { name: "Avatar 1786737819473", src: notion1786737819473 },
  { name: "Avatar 1786737834554", src: notion1786737834554 },
  { name: "Avatar 1786737836300", src: notion1786737836300 },
  { name: "Avatar 1786737848298", src: notion1786737848298 },
  { name: "Avatar 1786737863293", src: notion1786737863293 },
  { name: "Avatar 1786737905991", src: notion1786737905991 },
  { name: "Avatar 1786739096696", src: notion1786739096696abc },
  { name: "Avatar 1786739262001", src: notion1786739262001 },
];

/** Storage key so the chosen preset survives reloads (per portal user). */
export const presetStorageKey = (email: string | undefined, role: Role) =>
  `hrms-profile-preset:${role}:${(email || "anonymous").toLowerCase()}`;

import { getStoredPresetAvatar, notifyAvatarChanged } from "@/lib/profile-avatar";

type Dependent = {
  name: string;
  relationship: string;
  birthDate: string;
};

type ProfileState = {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  dateCreated: string;
  lastLogin: string;
  status: string;
  gender?: "Male" | "Female" | "Other" | undefined;

  // 1. Contact Information
  personalEmail: string;
  telephone: string;
  currentAddress: string;
  permanentAddress: string;

  // 2. Family Information
  civilStatus: string;
  spouseName: string;
  spouseOccupation: string;
  spouseEmployer: string;
  fatherName: string;
  motherMaidenName: string;
  dependents: Dependent[];

  // 3. Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyAddress: string;
  emergencySecondaryName: string;
  emergencySecondaryRelationship: string;
  emergencySecondaryPhone: string;

  // 4. Employment Information
  employmentType: string;
  dateHired: string;
  supervisor: string;
  workLocation: string;
  workShift: string;
  salaryGrade: string;
  salaryStep: string;
  sssNumber: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  tinNumber: string;
};

const positionOptions = [
  "Super Administrator",
  "HR Administrator",
  "HR Officer",
  "Front Office Manager",
  "F&B Director",
  "Executive Housekeeper",
  "Line Cook",
  "Restaurant Server",
];

const departmentOptions = [
  "Human Resources",
  "Front Office",
  "Food & Beverage",
  "Kitchen / Culinary",
  "Housekeeping",
  "Administration / HR",
];

const civilStatusOptions = ["Single", "Married", "Widowed", "Separated", "Divorced"];

/** Profiles are never populated from demo rows — only from the authenticated
 *  account and, when linked, the employee record returned by the ESS API. */
const emptyProfile: ProfileState = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  employeeId: "",
  dateCreated: "",
  lastLogin: "",
  status: "",
  gender: undefined,
  personalEmail: "",
  telephone: "",
  currentAddress: "",
  permanentAddress: "",
  civilStatus: "",
  spouseName: "",
  spouseOccupation: "",
  spouseEmployer: "",
  fatherName: "",
  motherMaidenName: "",
  dependents: [],
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  emergencyAddress: "",
  emergencySecondaryName: "",
  emergencySecondaryRelationship: "",
  emergencySecondaryPhone: "",
  employmentType: "",
  dateHired: "",
  supervisor: "",
  workLocation: "",
  workShift: "",
  salaryGrade: "",
  salaryStep: "",
  sssNumber: "",
  philHealthNumber: "",
  pagIbigNumber: "",
  tinNumber: "",
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatProfileDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function ProfilePage({ role }: { role: Role }) {
  const user = getUser();

  const initialProfile: ProfileState = {
    ...emptyProfile,
    fullName: user?.full_name || "",
    email: user?.email || "",
    position:
      role === "superadmin"
        ? "Super Administrator"
        : role === "admin"
          ? "Administrator"
          : "",
    department: user?.department_name || "",
    lastLogin: user?.last_login_at
      ? new Date(user.last_login_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    status: user?.status || "",
    gender: user?.gender || undefined,
  };

  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [draft, setDraft] = useState<ProfileState>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  // Start from the saved server URL so the uploaded JPG survives reloads
  // (null = no photo yet, show the chosen preset instead).
  const [photo, setPhoto] = useState<string | null>(() => user?.profile_photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const value = editing ? draft : profile;
  const settingsPath =
    role === "employee" ? "/employee/settings" : role === "superadmin" ? "/superadmin/settings" : "/admin/settings";

  // Get preset image based on gender
  const getPresetImage = (gender?: string) => {
    switch (gender) {
      case "Male":
        return defaultBoy;
      case "Female":
        return defaultGirl;
      default:
        return defaultBoy; // fallback
    }
  };

  // Chosen preset avatar — persisted per user so the default survives reloads.
  // An uploaded photo always wins; the preset shows when no photo is set.
  const [presetSrc, setPresetSrc] = useState<string>(() => {
    try {
      const saved = window.localStorage.getItem(presetStorageKey(user?.email, role));
      if (saved && presetAvatars.some((p) => p.src === saved)) return saved;
    } catch {
      /* private mode — fall through to gender default */
    }
    return getPresetImage(initialProfile.gender);
  });
  const [presetOpen, setPresetOpen] = useState(false);

  const presetImage = presetSrc;

  const choosePreset = (src: string) => {
    setPresetSrc(src);
    try {
      window.localStorage.setItem(presetStorageKey(user?.email, role), src);
    } catch {
      /* storage unavailable — keep in-memory choice */
    }
    notifyAvatarChanged();
    setPresetOpen(false);
    toast.success("Preset avatar updated");
  };

  useEffect(() => {
    try {
      const saved = getUser()?.profile_photo_url ?? null;
      if (saved) setPhoto(saved);
    } catch {
      /* ignore */
    }
    essApi
      .overview()
        .then((ov) => {
          if (!ov?.employee) return;
          const employee = ov.employee;
          const emergency = employee.emergency_contacts ?? [];
          const primary = emergency[0];
          const secondary = emergency[1];
          const lastLogin = user?.last_login_at
            ? new Date(user.last_login_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const applyLiveProfile = (prev: ProfileState): ProfileState => ({
            ...prev,
            fullName: employee.name || user?.full_name || "",
            email: employee.email || user?.email || "",
            phone: employee.phone || "",
            personalEmail: employee.personal_email || "",
            position: employee.position || "",
            department: employee.department || user?.department_name || "",
            employeeId: employee.code || "",
            dateCreated: formatProfileDate(employee.date_hired),
            dateHired: formatProfileDate(employee.date_hired),
            lastLogin,
            status: employee.status || user?.status || "",
            gender: (employee.gender as ProfileState["gender"]) || undefined,
            currentAddress: employee.address || "",
            permanentAddress: "",
            civilStatus: employee.civil_status || "",
            // Family details are not part of the employee master record yet.
            spouseName: "",
            spouseOccupation: "",
            spouseEmployer: "",
            fatherName: "",
            motherMaidenName: "",
            dependents: [],
            emergencyName: primary?.name || "",
            emergencyRelationship: primary?.relationship || "",
            emergencyPhone: primary?.phone || "",
            emergencyAddress: primary?.address || "",
            emergencySecondaryName: secondary?.name || "",
            emergencySecondaryRelationship: secondary?.relationship || "",
            emergencySecondaryPhone: secondary?.phone || "",
            employmentType: employee.employment_type || "",
            supervisor: employee.supervisor || "",
            workLocation: "",
            workShift: "",
            salaryGrade: employee.salary_grade || "",
            salaryStep: employee.salary_step || "",
            sssNumber: employee.sss_number || "",
            philHealthNumber: employee.philhealth_number || "",
            pagIbigNumber: employee.pagibig_number || "",
            tinNumber: employee.tin_number || "",
          });

          setProfile(applyLiveProfile);
          setDraft(applyLiveProfile);
        })
        .catch(() => {});
  }, [role, user?.full_name, user?.email, user?.department_name, user?.last_login_at, user?.status]);

  function set<K extends keyof ProfileState>(key: K, v: ProfileState[K]) {
    setDraft((d) => ({ ...d, [key]: v }));
  }

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be 2MB or smaller");
      return;
    }
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    setPhoto(localUrl);
    try {
      const res = await profileApi.uploadPhoto(file);
      // Persist the server URL so the photo (and the header avatar) survives reloads.
      if (res?.url) {
        setPhoto(res.url);
        const current = getUser();
        if (current) setUser({ ...current, profile_photo_url: res.url });
      }
      notifyAvatarChanged();
      toast.success("Profile photo uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo");
      setPhoto(null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    setUploading(true);
    try {
      await profileApi.removePhoto();
      setPhoto(null);
      const current = getUser();
      if (current) setUser({ ...current, profile_photo_url: null });
      notifyAvatarChanged();
      toast.success("Profile photo removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove photo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your 201 records, contact details, family background, emergency contacts, and account security."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Identity card — Crimson & Ivory theme */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          {/* Luxe header: deep crimson → sidebar dark with gold accent */}
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary via-primary to-sidebar">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.08] blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-gold/20 blur-xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <span className="absolute right-5 top-5 h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_var(--color-gold)] opacity-80" />
            <span className="absolute right-8 top-5 h-2 w-2 rounded-full bg-white/20" />
          </div>
          <CardContent className="-mt-16 flex flex-col items-center px-6 pb-6 text-center">
            <div className="relative">
              <Avatar className="h-28 w-28 overflow-hidden border-4 border-card bg-gradient-to-br from-primary via-primary to-sidebar shadow-md">
                {photo ? (
                  <AvatarImage src={photo} alt={value.fullName} className="bg-card" />
                ) : (
                  <AvatarImage src={presetImage} alt={value.fullName} />
                )}
                <AvatarFallback className="bg-gold-soft font-display text-3xl font-semibold text-primary border border-gold/15 dark:bg-gold/15 dark:text-gold">
                  {initialsOf(value.fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                aria-label="Change profile photo"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md ring-1 ring-gold/20 transition-all hover:bg-primary/90 hover:scale-105"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{value.fullName}</h2>
            <p className="text-sm font-medium text-primary dark:text-primary">{value.position}</p>
            <Badge className="mt-2 border-success/20 bg-success/10 text-success hover:bg-success/15 px-2.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 inline-block" />
              {value.status}
            </Badge>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={onPickPhoto}
              disabled={uploading}
            />
            <div className="mt-4 space-y-2">
              <Button className="w-full shadow-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Camera className="mr-2 h-4 w-4" />
                {uploading ? "Uploading…" : photo ? "Change Photo" : "Upload Photo"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setPresetOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Choose preset
              </Button>
              {photo && (
                <Button variant="outline" className="w-full" onClick={removePhoto} disabled={uploading}>
                  <Camera className="mr-2 h-4 w-4" />
                  Remove Photo
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG (Max. 2MB)</p>

            <div className="mt-5 w-full space-y-3 border-t border-border/50 pt-5 text-left">
              {[
                { icon: IdCard, label: "Employee ID", value: value.employeeId },
                {
                  icon: Building2,
                  label: "Department",
                  value: value.department,
                },
                {
                  icon: CalendarDays,
                  label: "Date Hired",
                  value: value.dateHired || value.dateCreated,
                },
                { icon: Clock, label: "Last Login", value: value.lastLogin },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] border border-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                    <row.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground">{row.label}</p>
                    <p className="truncate text-sm font-semibold tracking-tight">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {role !== "superadmin" ? (
              <Button variant="outline" className="mt-5 w-full border-primary/15 bg-gold-soft/30 hover:bg-gold-soft/50 text-foreground" asChild>
                <Link to={settingsPath as never} hash="security">
                  <KeyRound className="mr-2 h-4 w-4 text-primary dark:text-primary" />
                  Change Password
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {/* Details — themed panels */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-gold to-primary opacity-90" />
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger
                  value="profile"
                  className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <User className="mr-1.5 h-4 w-4" /> Profile Information
                </TabsTrigger>

                <TabsTrigger
                  value="full-info"
                  className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <IdCard className="mr-1.5 h-4 w-4" /> Full Employee Information
                </TabsTrigger>

                <TabsTrigger
                  value="account"
                  className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Lock className="mr-1.5 h-4 w-4" /> Account Details
                </TabsTrigger>
              </TabsList>

              {/* ------------------------------------------------------------- */}
              {/* TAB 1: Profile Information                                    */}
              {/* ------------------------------------------------------------- */}
              <TabsContent value="profile" className="mt-6">
                <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
                  <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-none">Profile Information</h3>
                      <p className="text-xs text-muted-foreground mt-1">Overview of your basic employee details</p>
                    </div>
                    <span className="ml-auto hidden sm:block h-px w-12 bg-gold/30" />
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/80 dark:text-primary/80">
                      Personal Details
                    </p>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="p-name">Full Name</Label>
                        <Input
                          id="p-name"
                          value={value.fullName}
                          disabled={!editing}
                          onChange={(e) => set("fullName", e.target.value)}
                          className="disabled:bg-muted/40 disabled:text-foreground/80 disabled:opacity-100 dark:disabled:text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-position">Position</Label>
                        <Select
                          value={value.position}
                          disabled={!editing}
                          onValueChange={(v) => set("position", v)}
                        >
                          <SelectTrigger id="p-position" className="disabled:bg-muted/40 disabled:opacity-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {/* The stored position may come from Core HCM and not
                                exist in the static list — always offer it so the
                                field never renders empty. */}
                            {!positionOptions.includes(value.position) && value.position ? (
                              <SelectItem key={value.position} value={value.position}>
                                {value.position}
                              </SelectItem>
                            ) : null}
                            {positionOptions.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-email">Work Email</Label>
                        <Input
                          id="p-email"
                          type="email"
                          value={value.email}
                          disabled={!editing}
                          onChange={(e) => set("email", e.target.value)}
                          className="disabled:bg-muted/40 disabled:text-foreground/80 disabled:opacity-100 dark:disabled:text-foreground"
                        />
                      </div>
                      {role !== "superadmin" && (
                        <div className="space-y-2">
                          <Label htmlFor="p-dept">Department</Label>
                          <Select
                            value={value.department}
                            disabled={!editing}
                            onValueChange={(v) => set("department", v)}
                          >
                            <SelectTrigger id="p-dept" className="disabled:bg-muted/40 disabled:opacity-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {!departmentOptions.includes(value.department) && value.department ? (
                                <SelectItem key={value.department} value={value.department}>
                                  {value.department}
                                </SelectItem>
                              ) : null}
                              {departmentOptions.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="p-phone">Primary Contact Number</Label>
                        <Input
                          id="p-phone"
                          value={value.phone}
                          disabled={!editing}
                          onChange={(e) => set("phone", e.target.value)}
                          className="disabled:bg-muted/40 disabled:text-foreground/80 disabled:opacity-100 dark:disabled:text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="p-civil">Civil Status</Label>
                        <Select
                          value={value.civilStatus}
                          disabled={!editing}
                          onValueChange={(v) => set("civilStatus", v)}
                        >
                          <SelectTrigger id="p-civil" className="disabled:bg-muted/40 disabled:opacity-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {!civilStatusOptions.includes(value.civilStatus) && value.civilStatus ? (
                              <SelectItem key={value.civilStatus} value={value.civilStatus}>
                                {value.civilStatus}
                              </SelectItem>
                            ) : null}
                            {civilStatusOptions.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer text-xs"
                        onClick={() => setActiveTab("full-info")}
                      >
                        <IdCard className="mr-1.5 h-3.5 w-3.5 text-primary dark:text-primary" /> View Complete 201 Record
                      </Button>

                      <div className="flex gap-2">
                        {editing ? (
                          <>
                            <Button
                              variant="outline"
                              className="cursor-pointer border-border/60 hover:bg-muted"
                              onClick={() => {
                                setDraft(profile);
                                setEditing(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="cursor-pointer shadow-sm bg-primary hover:bg-primary/90"
                              onClick={() => {
                                setProfile(draft);
                                setEditing(false);
                                toast.success("Profile details saved successfully");
                              }}
                            >
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="cursor-pointer shadow-sm bg-primary hover:bg-primary/90"
                            onClick={() => {
                              setDraft(profile);
                              setEditing(true);
                            }}
                          >
                            <PencilLine className="mr-2 h-4 w-4" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: Full Employee Information (The 4 Requested Modules)   */}
              {/* ------------------------------------------------------------- */}
              <TabsContent value="full-info" className="mt-6">
                <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs flex flex-col">
                  {/* Fixed Card Header (identical to Profile Information card) */}
                  <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <IdCard className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-none">Full Employee Information</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Comprehensive 201 records, family background, emergency contacts &amp; employment info
                      </p>
                    </div>
                    <span className="ml-auto hidden sm:block h-px w-12 bg-gold/30" />
                  </div>

                  {/* Scrollable Card Body */}
                  <ScrollArea className="h-[480px] p-6 pr-3.5">
                    <div className="space-y-6 pr-2.5 pb-2">
                      {/* 1. CONTACT INFORMATION */}
                      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
                        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-3.5">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Phone className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm">1. Contact Information</h4>
                            <p className="text-[11px] text-muted-foreground">Digital channels and residential addresses</p>
                          </div>
                        </div>

                        <div className="p-6 grid gap-5 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="c-work-email" className="text-xs text-muted-foreground font-medium">Company / Work Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="c-work-email"
                                value={value.email}
                                disabled={!editing}
                                onChange={(e) => set("email", e.target.value)}
                                className="pl-9 disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="c-personal-email" className="text-xs text-muted-foreground font-medium">Personal Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="c-personal-email"
                                value={value.personalEmail}
                                disabled={!editing}
                                onChange={(e) => set("personalEmail", e.target.value)}
                                className="pl-9 disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="c-mobile" className="text-xs text-muted-foreground font-medium">Mobile Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="c-mobile"
                                value={value.phone}
                                disabled={!editing}
                                onChange={(e) => set("phone", e.target.value)}
                                className="pl-9 disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="c-tel" className="text-xs text-muted-foreground font-medium">Telephone / Landline</Label>
                            <div className="relative">
                              <PhoneCall className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="c-tel"
                                value={value.telephone}
                                disabled={!editing}
                                onChange={(e) => set("telephone", e.target.value)}
                                className="pl-9 disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="c-current-addr" className="text-xs text-muted-foreground font-medium">Current Residential Address</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="c-current-addr"
                                value={value.currentAddress}
                                disabled={!editing}
                                onChange={(e) => set("currentAddress", e.target.value)}
                                className="pl-9 disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2 space-y-1.5">
                            <Label htmlFor="c-perm-addr" className="text-xs text-muted-foreground font-medium">Permanent / Provincial Address</Label>
                            <div className="relative">
                              <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="c-perm-addr"
                                value={value.permanentAddress}
                                disabled={!editing}
                                onChange={(e) => set("permanentAddress", e.target.value)}
                                className="pl-9 disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. FAMILY INFORMATION */}
                      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
                        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-3.5">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm">2. Family Information</h4>
                            <p className="text-[11px] text-muted-foreground">Marital status, spouse background, and registered dependents</p>
                          </div>
                        </div>

                        <div className="p-6 space-y-5">
                          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="f-civil" className="text-xs text-muted-foreground font-medium">Civil Status</Label>
                              <Select
                                value={value.civilStatus}
                                disabled={!editing}
                                onValueChange={(v) => set("civilStatus", v)}
                              >
                                <SelectTrigger id="f-civil" className="disabled:bg-muted/40 disabled:opacity-100">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {!civilStatusOptions.includes(value.civilStatus) && value.civilStatus ? (
                                    <SelectItem key={value.civilStatus} value={value.civilStatus}>
                                      {value.civilStatus}
                                    </SelectItem>
                                  ) : null}
                                  {civilStatusOptions.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="f-spouse" className="text-xs text-muted-foreground font-medium">Spouse Full Name</Label>
                              <Input
                                id="f-spouse"
                                value={value.spouseName}
                                disabled={!editing}
                                placeholder="N/A if Single"
                                onChange={(e) => set("spouseName", e.target.value)}
                                className="disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="f-spouse-occ" className="text-xs text-muted-foreground font-medium">Spouse Occupation / Employer</Label>
                              <Input
                                id="f-spouse-occ"
                                value={value.spouseOccupation ? `${value.spouseOccupation} (${value.spouseEmployer || "N/A"})` : value.spouseOccupation}
                                disabled={!editing}
                                placeholder="e.g. Accountant at XYZ Corp"
                                onChange={(e) => set("spouseOccupation", e.target.value)}
                                className="disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="f-father" className="text-xs text-muted-foreground font-medium">Father's Full Name</Label>
                              <Input
                                id="f-father"
                                value={value.fatherName}
                                disabled={!editing}
                                onChange={(e) => set("fatherName", e.target.value)}
                                className="disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="f-mother" className="text-xs text-muted-foreground font-medium">Mother's Maiden Name</Label>
                              <Input
                                id="f-mother"
                                value={value.motherMaidenName}
                                disabled={!editing}
                                onChange={(e) => set("motherMaidenName", e.target.value)}
                                className="disabled:bg-muted/40 disabled:opacity-100"
                              />
                            </div>
                          </div>

                          {/* Registered Dependents */}
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-primary" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                  Registered Dependents / Children ({value.dependents.length})
                                </span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-border/80">
                                PhilHealth &amp; Tax Qualified
                              </Badge>
                            </div>

                            {value.dependents.length > 0 ? (
                              <div className="grid gap-2.5 sm:grid-cols-2">
                                {value.dependents.map((dep, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-md border border-border/50 bg-card p-3 shadow-2xs"
                                  >
                                    <div>
                                      <p className="text-xs font-semibold">{dep.name}</p>
                                      <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {dep.relationship} • Born {dep.birthDate}
                                      </p>
                                    </div>
                                    <span className="text-xs font-medium text-primary px-2 py-0.5 rounded bg-primary/10 dark:text-primary dark:bg-primary/20">
                                      Dependent #{idx + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground py-2 italic text-center">
                                No registered dependents on file.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. EMERGENCY CONTACT */}
                      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
                        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-3.5">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive">
                            <ShieldAlert className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm">3. Emergency Contact</h4>
                            <p className="text-[11px] text-muted-foreground">Authorized points of contact in case of workplace emergencies</p>
                          </div>
                        </div>

                        <div className="p-6 grid gap-5 sm:grid-cols-2">
                          {/* Primary Contact Card */}
                          <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold text-primary dark:text-primary">Primary Emergency Contact</span>
                              </div>
                              <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                                First Dial
                              </Badge>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="em-name" className="text-xs text-muted-foreground font-medium">Contact Person Name</Label>
                              <Input
                                id="em-name"
                                value={value.emergencyName}
                                disabled={!editing}
                                onChange={(e) => set("emergencyName", e.target.value)}
                                className="disabled:bg-background/80 disabled:opacity-100"
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="em-rel" className="text-xs text-muted-foreground font-medium">Relationship</Label>
                                <Input
                                id="em-rel"
                                value={value.emergencyRelationship}
                                disabled={!editing}
                                onChange={(e) => set("emergencyRelationship", e.target.value)}
                                className="disabled:bg-background/80 disabled:opacity-100"
                              />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="em-phone" className="text-xs text-muted-foreground font-medium">Contact Phone</Label>
                                <Input
                                id="em-phone"
                                value={value.emergencyPhone}
                                disabled={!editing}
                                onChange={(e) => set("emergencyPhone", e.target.value)}
                                className="disabled:bg-background/80 disabled:opacity-100"
                              />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="em-addr" className="text-xs text-muted-foreground font-medium">Contact Address</Label>
                              <Input
                                id="em-addr"
                                value={value.emergencyAddress}
                                disabled={!editing}
                                onChange={(e) => set("emergencyAddress", e.target.value)}
                                className="disabled:bg-background/80 disabled:opacity-100"
                              />
                            </div>
                          </div>

                          {/* Secondary Contact Card */}
                          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-semibold text-foreground/80">Secondary Emergency Contact</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                                Alternate
                              </Badge>
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="em2-name" className="text-xs text-muted-foreground font-medium">Contact Person Name</Label>
                              <Input
                                id="em2-name"
                                value={value.emergencySecondaryName}
                                disabled={!editing}
                                onChange={(e) => set("emergencySecondaryName", e.target.value)}
                                className="disabled:bg-background/80 disabled:opacity-100"
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="em2-rel" className="text-xs text-muted-foreground font-medium">Relationship</Label>
                                <Input
                                id="em2-rel"
                                value={value.emergencySecondaryRelationship}
                                disabled={!editing}
                                onChange={(e) => set("emergencySecondaryRelationship", e.target.value)}
                                className="disabled:bg-background/80 disabled:opacity-100"
                              />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="em2-phone" className="text-xs text-muted-foreground font-medium">Contact Phone</Label>
                                <Input
                                id="em2-phone"
                                value={value.emergencySecondaryPhone}
                                disabled={!editing}
                                onChange={(e) => set("emergencySecondaryPhone", e.target.value)}
                                className="disabled:bg-background/80 disabled:opacity-100"
                              />
                              </div>
                            </div>

                            <div className="mt-4 rounded-lg bg-gold-soft/40 border border-gold/15 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary shrink-0" />
                              <span>Ensuring emergency contacts are updated speeds up assistance during on-duty medical events.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. EMPLOYMENT INFORMATION */}
                      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
                        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-3.5">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Briefcase className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm">4. Employment Information</h4>
                            <p className="text-[11px] text-muted-foreground">Official job appointment, schedule, supervisor, and statutory government IDs</p>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          {/* Core Job Appointment Data */}
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Employee ID Number</span>
                              <p className="text-sm font-semibold tracking-tight">{value.employeeId}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Position / Title</span>
                              <p className="text-sm font-semibold tracking-tight">{value.position}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Department</span>
                              <p className="text-sm font-semibold tracking-tight">{value.department}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Employment Status / Type</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs font-semibold dark:text-primary dark:bg-primary/15">
                                  {value.employmentType}
                                </Badge>
                                <Badge className="border-success/20 bg-success/10 text-success text-xs">
                                  {value.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Date of Hire</span>
                              <p className="text-sm font-semibold tracking-tight">{value.dateHired || value.dateCreated}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Immediate Supervisor</span>
                              <p className="text-sm font-semibold tracking-tight">{value.supervisor}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Work Location / Branch</span>
                              <p className="text-sm font-semibold tracking-tight">{value.workLocation}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Assigned Shift</span>
                              <p className="text-sm font-semibold tracking-tight">{value.workShift}</p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Salary Band</span>
                              <p className="text-sm font-semibold tracking-tight">{value.salaryGrade} ({value.salaryStep})</p>
                            </div>
                          </div>

                          {/* Statutory Government Identifiers */}
                          <div className="border-t border-border/50 pt-5">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                  Statutory Government Numbers (Philippines)
                                </span>
                              </div>
                              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                                Official HR Records
                              </Badge>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {[
                                { label: "Social Security System (SSS)", value: value.sssNumber },
                                { label: "PhilHealth ID Number", value: value.philHealthNumber },
                                { label: "Pag-IBIG / HDMF MID", value: value.pagIbigNumber },
                                { label: "Tax Identification (TIN)", value: value.tinNumber },
                              ].map((gov) => (
                                <div
                                  key={gov.label}
                                  className="rounded-lg border border-border/60 bg-muted/20 p-3"
                                >
                                  <p className="text-[11px] font-medium text-muted-foreground">{gov.label}</p>
                                  <p className="font-mono text-sm font-semibold tracking-wider text-foreground mt-1">
                                    {gov.value || "—"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Fixed Card Footer (identical to Profile Information card footer) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 bg-muted/15 px-6 py-4">
                    {role === "employee" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-primary/20 bg-background hover:bg-muted text-xs"
                        asChild
                      >
                        <Link to="/employee/ess" hash="new-request">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-primary" />
                          Request ESS 201 Update
                        </Link>
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Complete 201 Master Employee Record
                      </div>
                    )}

                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <Button
                            variant="outline"
                            className="cursor-pointer border-border/60 hover:bg-muted"
                            onClick={() => {
                              setDraft(profile);
                              setEditing(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="cursor-pointer shadow-sm bg-primary hover:bg-primary/90"
                            onClick={() => {
                              setProfile(draft);
                              setEditing(false);
                              toast.success("Employee 201 record saved successfully");
                            }}
                          >
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="cursor-pointer shadow-sm bg-primary hover:bg-primary/90"
                          onClick={() => {
                            setDraft(profile);
                            setEditing(true);
                          }}
                        >
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit 201 Info
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ------------------------------------------------------------- */}
              {/* TAB 3: Account Details                                        */}
              {/* ------------------------------------------------------------- */}
              <TabsContent value="account" className="mt-6">
                <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
                  <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <Lock className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-none">Account Details</h3>
                      <p className="text-xs text-muted-foreground mt-1">System account information</p>
                    </div>
                    <span className="ml-auto hidden sm:block h-px w-12 bg-gold/30" />
                  </div>

                  <div className="p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="p-id">Employee ID</Label>
                        <Input id="p-id" value={value.employeeId} disabled className="bg-muted/40 text-foreground/80 disabled:opacity-100 dark:text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-login">Last Login</Label>
                        <Input id="p-login" value={value.lastLogin} disabled className="bg-muted/40 text-foreground/80 disabled:opacity-100 dark:text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-created">Date Created</Label>
                        <Input id="p-created" value={value.dateCreated} disabled className="bg-muted/40 text-foreground/80 disabled:opacity-100 dark:text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Status</Label>
                        <div className="flex h-9 items-center">
                          <Badge
                            className="border-success/20 bg-success/10 text-success px-2.5 py-1"
                            variant="outline"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            {value.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {role !== "superadmin" ? (
                      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/15 bg-gold-soft/40 p-4">
                        <div>
                          <p className="text-sm font-semibold tracking-tight">Password &amp; Security</p>
                          <p className="text-xs text-muted-foreground">
                            Update your password regularly to keep your account secure.
                          </p>
                        </div>
                        <Button variant="outline" className="cursor-pointer border-primary/15 bg-card hover:bg-muted shadow-sm" asChild>
                          <Link to={settingsPath as never} hash="security">
                            <KeyRound className="mr-2 h-4 w-4 text-primary" />
                            Change Password
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* CHOOSE PRESET AVATAR — restores the old preset gallery. The picked
          SVG becomes the default avatar (used whenever no photo is uploaded)
          and is remembered per user. */}
      {presetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPresetOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <h3 className="font-display text-lg font-semibold">Choose preset avatar</h3>
                <p className="text-xs text-muted-foreground">
                  Shown as your default profile image until you upload a photo.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPresetOpen(false)}>
                Close
              </Button>
            </div>
            <div className="grid max-h-[55vh] grid-cols-4 gap-3 overflow-y-auto p-5 sm:grid-cols-6">
              {presetAvatars.map((preset) => {
                const active = preset.src === presetSrc;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    title={preset.name}
                    onClick={() => choosePreset(preset.src)}
                    className={`group grid aspect-square place-items-center overflow-hidden rounded-xl border-2 bg-gradient-to-br from-primary via-primary to-sidebar transition-all hover:scale-105 ${
                      active
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={preset.src}
                      alt={preset.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
            <p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
              Current default: {presetAvatars.find((p) => p.src === presetSrc)?.name ?? "Custom"}.
              Uploading a photo always overrides the preset.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
