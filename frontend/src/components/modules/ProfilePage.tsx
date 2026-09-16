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
import { roleMeta, type Role } from "@/lib/nav";
import { getUser } from "@/lib/auth";
import { essApi } from "@/lib/api";

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

const seedByRole: Record<Role, ProfileState> = {
  superadmin: {
    fullName: "Bullseur Santiago",
    email: "superadmin@oxfordsuites.com.ph",
    phone: "+63 917 100 1000",
    position: "Super Administrator",
    department: "Human Resources",
    employeeId: "SA-00001",
    dateCreated: "January 12, 2024",
    lastLogin: "August 1, 2026 09:24 AM",
    status: "Active",

    personalEmail: "bullseur.santiago@outlook.com",
    telephone: "+63 2 8899 0001",
    currentAddress: "Tower 1, Residences at Greenbelt, Makati City",
    permanentAddress: "128 Acacia Ave, Ayala Alabang, Muntinlupa City",

    civilStatus: "Married",
    spouseName: "Victoria Santiago",
    spouseOccupation: "Hospitality Consultant",
    spouseEmployer: "Self-Employed",
    fatherName: "Eduardo Santiago",
    motherMaidenName: "Corazon Bullseur",
    dependents: [
      { name: "Gabriel Santiago", relationship: "Son", birthDate: "2015-08-20" },
      { name: "Chloe Santiago", relationship: "Daughter", birthDate: "2018-11-04" },
    ],

    emergencyName: "Victoria Santiago",
    emergencyRelationship: "Spouse",
    emergencyPhone: "+63 917 100 2000",
    emergencyAddress: "Residences at Greenbelt, Makati City",
    emergencySecondaryName: "Eduardo Santiago",
    emergencySecondaryRelationship: "Father",
    emergencySecondaryPhone: "+63 917 100 3000",

    employmentType: "Regular",
    dateHired: "January 12, 2024",
    supervisor: "Board of Directors",
    workLocation: "Oxford Suites Makati (Executive Office)",
    workShift: "Flexible Executive Hours",
    salaryGrade: "Executive Grade",
    salaryStep: "Step 5",
    sssNumber: "03-9988112-4",
    philHealthNumber: "12-009988776-1",
    pagIbigNumber: "1210-4499-8811",
    tinNumber: "109-876-543-000",
  },
  admin: {
    fullName: "Juan Dela Cruz",
    email: "admin@oxfordsuites.com.ph",
    phone: "+63 917 123 4567",
    position: "HR Administrator",
    department: "Human Resources",
    employeeId: "AD-00023",
    dateCreated: "February 5, 2024",
    lastLogin: "August 1, 2026 10:10 AM",
    status: "Active",

    personalEmail: "juan.delacruz.ph@gmail.com",
    telephone: "+63 2 8765 4321",
    currentAddress: "Unit 12B, San Lorenzo Tower, Makati City",
    permanentAddress: "45 Magsaysay St, Malolos, Bulacan",

    civilStatus: "Married",
    spouseName: "Maria Dela Cruz",
    spouseOccupation: "Certified Public Accountant",
    spouseEmployer: "SG&V Co.",
    fatherName: "Antonio Dela Cruz",
    motherMaidenName: "Rosa Santos",
    dependents: [
      { name: "Joaquin Dela Cruz", relationship: "Son", birthDate: "2019-03-14" },
    ],

    emergencyName: "Maria Dela Cruz",
    emergencyRelationship: "Spouse",
    emergencyPhone: "+63 918 555 8899",
    emergencyAddress: "Unit 12B, San Lorenzo Tower, Makati City",
    emergencySecondaryName: "Antonio Dela Cruz",
    emergencySecondaryRelationship: "Father",
    emergencySecondaryPhone: "+63 917 222 3344",

    employmentType: "Regular",
    dateHired: "February 5, 2024",
    supervisor: "Bullseur Santiago",
    workLocation: "Oxford Suites Makati (HR Office)",
    workShift: "Standard Office (08:30 AM – 05:30 PM)",
    salaryGrade: "Grade 7",
    salaryStep: "Step 3",
    sssNumber: "33-7654321-9",
    philHealthNumber: "14-554433221-0",
    pagIbigNumber: "1210-7766-5544",
    tinNumber: "223-456-789-000",
  },
  employee: {
    fullName: "Kevin Dela Cruz",
    email: "kevin.delacruz@oxfordsuites.com.ph",
    phone: "+63 921 774 9903",
    position: "Line Cook",
    department: "Kitchen / Culinary",
    employeeId: "EMP-0005",
    dateCreated: "April 15, 2026",
    lastLogin: "August 1, 2026 07:52 AM",
    status: "Active",

    personalEmail: "kevin.delacruz92@gmail.com",
    telephone: "+63 2 8123 4567",
    currentAddress: "14 Kalayaan Ave, Brgy. Bel-Air, Makati City",
    permanentAddress: "Block 12 Lot 4, San Jose, Batangas",

    civilStatus: "Married",
    spouseName: "Liza Santos-Dela Cruz",
    spouseOccupation: "Operations Specialist",
    spouseEmployer: "BPO Solutions Inc.",
    fatherName: "Roberto Dela Cruz",
    motherMaidenName: "Elena Bautista",
    dependents: [
      { name: "Mateo Dela Cruz", relationship: "Son", birthDate: "2021-05-12" },
      { name: "Sofia Dela Cruz", relationship: "Daughter", birthDate: "2023-09-18" },
    ],

    emergencyName: "Liza Santos-Dela Cruz",
    emergencyRelationship: "Spouse",
    emergencyPhone: "+63 918 222 4410",
    emergencyAddress: "14 Kalayaan Ave, Brgy. Bel-Air, Makati City",
    emergencySecondaryName: "Roberto Dela Cruz",
    emergencySecondaryRelationship: "Father",
    emergencySecondaryPhone: "+63 917 888 1234",

    employmentType: "Probationary",
    dateHired: "April 15, 2026",
    supervisor: "Executive Chef Marco",
    workLocation: "Oxford Suites Makati (Main Kitchen)",
    workShift: "Morning Shift (07:00 AM – 04:00 PM)",
    salaryGrade: "Grade 4",
    salaryStep: "Step 2",
    sssNumber: "34-5829104-1",
    philHealthNumber: "12-092847192-3",
    pagIbigNumber: "1210-9847-2291",
    tinNumber: "452-918-301-000",
  },
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfilePage({ role }: { role: Role }) {
  const user = getUser();
  const seed = seedByRole[role];

  const initialProfile: ProfileState = {
    fullName: user?.full_name || seed.fullName,
    email: user?.email || seed.email,
    phone: seed.phone,
    position: (user?.department_name ? `${user.department_name} Staff` : "") || seed.position,
    department: user?.department_name || seed.department,
    employeeId: user?.employee_id ? `EMP-000${user.employee_id}` : seed.employeeId,
    dateCreated: seed.dateCreated,
    lastLogin: user?.last_login_at
      ? new Date(user.last_login_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : seed.lastLogin,
    status: user?.status || seed.status,

    personalEmail: seed.personalEmail,
    telephone: seed.telephone,
    currentAddress: seed.currentAddress,
    permanentAddress: seed.permanentAddress,

    civilStatus: seed.civilStatus,
    spouseName: seed.spouseName,
    spouseOccupation: seed.spouseOccupation,
    spouseEmployer: seed.spouseEmployer,
    fatherName: seed.fatherName,
    motherMaidenName: seed.motherMaidenName,
    dependents: seed.dependents,

    emergencyName: seed.emergencyName,
    emergencyRelationship: seed.emergencyRelationship,
    emergencyPhone: seed.emergencyPhone,
    emergencyAddress: seed.emergencyAddress,
    emergencySecondaryName: seed.emergencySecondaryName,
    emergencySecondaryRelationship: seed.emergencySecondaryRelationship,
    emergencySecondaryPhone: seed.emergencySecondaryPhone,

    employmentType: seed.employmentType,
    dateHired: seed.dateHired,
    supervisor: seed.supervisor,
    workLocation: seed.workLocation,
    workShift: seed.workShift,
    salaryGrade: seed.salaryGrade,
    salaryStep: seed.salaryStep,
    sssNumber: seed.sssNumber,
    philHealthNumber: seed.philHealthNumber,
    pagIbigNumber: seed.pagIbigNumber,
    tinNumber: seed.tinNumber,
  };

  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [draft, setDraft] = useState<ProfileState>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (role === "employee") {
      essApi
        .overview()
        .then((ov) => {
          if (ov?.employee) {
            setProfile((prev) => ({
              ...prev,
              fullName: user?.full_name || ov.employee.name || prev.fullName,
              email: user?.email || ov.employee.email || prev.email,
              position: ov.employee.position || prev.position,
              department: user?.department_name || ov.employee.department || prev.department,
              employeeId: ov.employee.code || prev.employeeId,
              dateCreated: ov.employee.date_hired || prev.dateCreated,
              status: user?.status || prev.status,
              employmentType: ov.employee.employment_type || prev.employmentType,
              supervisor: ov.employee.supervisor || prev.supervisor,
              dateHired: ov.employee.date_hired || prev.dateHired,
            }));
            setDraft((prev) => ({
              ...prev,
              fullName: user?.full_name || ov.employee.name || prev.fullName,
              email: user?.email || ov.employee.email || prev.email,
              position: ov.employee.position || prev.position,
              department: user?.department_name || ov.employee.department || prev.department,
              employeeId: ov.employee.code || prev.employeeId,
              dateCreated: ov.employee.date_hired || prev.dateCreated,
              status: user?.status || prev.status,
              employmentType: ov.employee.employment_type || prev.employmentType,
              supervisor: ov.employee.supervisor || prev.supervisor,
              dateHired: ov.employee.date_hired || prev.dateHired,
            }));
          }
        })
        .catch(() => {});
    }
  }, [role, user?.full_name, user?.email, user?.department_name]);

  const value = editing ? draft : profile;
  const settingsPath = role === "employee" ? "/employee/settings" : "/admin/settings";

  function set<K extends keyof ProfileState>(key: K, v: ProfileState[K]) {
    setDraft((d) => ({ ...d, [key]: v }));
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be 2MB or smaller");
      return;
    }
    setPhoto(URL.createObjectURL(file));
    toast.success("Profile photo updated");
  }

  return (
    <div>
      <PageHeader
        eyebrow={roleMeta[role].label}
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
              <Avatar className="h-28 w-28 border-4 border-card shadow-md">
                {photo ? <AvatarImage src={photo} alt={value.fullName} /> : null}
                <AvatarFallback className="bg-gold-soft font-display text-3xl font-semibold text-primary border border-gold/15">
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
            <p className="text-sm font-medium text-primary">{value.position}</p>
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
            />
            <Button className="mt-4 w-full shadow-sm" onClick={() => fileRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
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
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] border border-primary/10 text-primary">
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
                  <KeyRound className="mr-2 h-4 w-4 text-primary" />
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
              <TabsList className="bg-muted/60 flex flex-wrap h-auto gap-1">
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
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
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
                          className="disabled:bg-muted/40 disabled:text-foreground/80"
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
                          className="disabled:bg-muted/40 disabled:text-foreground/80"
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
                          className="disabled:bg-muted/40 disabled:text-foreground/80"
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
                        <IdCard className="mr-1.5 h-3.5 w-3.5 text-primary" /> View Complete 201 Record
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
                                className="pl-9 disabled:bg-muted/40"
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
                                className="pl-9 disabled:bg-muted/40"
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
                                className="pl-9 disabled:bg-muted/40"
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
                                className="pl-9 disabled:bg-muted/40"
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
                                className="pl-9 disabled:bg-muted/40"
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
                                className="pl-9 disabled:bg-muted/40"
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
                                className="disabled:bg-muted/40"
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
                                className="disabled:bg-muted/40"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="f-father" className="text-xs text-muted-foreground font-medium">Father's Full Name</Label>
                              <Input
                                id="f-father"
                                value={value.fatherName}
                                disabled={!editing}
                                onChange={(e) => set("fatherName", e.target.value)}
                                className="disabled:bg-muted/40"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="f-mother" className="text-xs text-muted-foreground font-medium">Mother's Maiden Name</Label>
                              <Input
                                id="f-mother"
                                value={value.motherMaidenName}
                                disabled={!editing}
                                onChange={(e) => set("motherMaidenName", e.target.value)}
                                className="disabled:bg-muted/40"
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
                                    <span className="text-xs font-medium text-primary px-2 py-0.5 rounded bg-primary/10">
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
                                <span className="text-xs font-bold text-primary">Primary Emergency Contact</span>
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
                                className="disabled:bg-background/80"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="em-rel" className="text-xs text-muted-foreground font-medium">Relationship</Label>
                                <Input
                                id="em-rel"
                                value={value.emergencyRelationship}
                                disabled={!editing}
                                onChange={(e) => set("emergencyRelationship", e.target.value)}
                                className="disabled:bg-background/80"
                              />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="em-phone" className="text-xs text-muted-foreground font-medium">Contact Phone</Label>
                                <Input
                                id="em-phone"
                                value={value.emergencyPhone}
                                disabled={!editing}
                                onChange={(e) => set("emergencyPhone", e.target.value)}
                                className="disabled:bg-background/80"
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
                                className="disabled:bg-background/80"
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
                                className="disabled:bg-background/80"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="em2-rel" className="text-xs text-muted-foreground font-medium">Relationship</Label>
                                <Input
                                id="em2-rel"
                                value={value.emergencySecondaryRelationship}
                                disabled={!editing}
                                onChange={(e) => set("emergencySecondaryRelationship", e.target.value)}
                                className="disabled:bg-background/80"
                              />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="em2-phone" className="text-xs text-muted-foreground font-medium">Contact Phone</Label>
                                <Input
                                id="em2-phone"
                                value={value.emergencySecondaryPhone}
                                disabled={!editing}
                                onChange={(e) => set("emergencySecondaryPhone", e.target.value)}
                                className="disabled:bg-background/80"
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
                                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
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
                        <Input id="p-id" value={value.employeeId} disabled className="bg-muted/40 text-foreground/80" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-login">Last Login</Label>
                        <Input id="p-login" value={value.lastLogin} disabled className="bg-muted/40 text-foreground/80" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-created">Date Created</Label>
                        <Input id="p-created" value={value.dateCreated} disabled className="bg-muted/40 text-foreground/80" />
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
    </div>
  );
}
