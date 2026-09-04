import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

import {
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  IdCard,
  KeyRound,
  Lock,
  PencilLine,
  Shield,
  User,
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
  };

  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [draft, setDraft] = useState<ProfileState>(initialProfile);
  const [editing, setEditing] = useState(false);
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
        description="Manage your account details, contact information and security."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Identity card — Crimson & Ivory theme */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          {/* Luxe header: deep crimson → sidebar dark with gold accent */}
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary via-primary to-sidebar">
            {/* soft highlight orbs */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.08] blur-2xl" />
            <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-gold/20 blur-xl" />
            {/* subtle gold sheen line */}
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
                  label: "Date Created",
                  value: value.dateCreated,
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
          {/* thin luxe top bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-gold to-primary opacity-90" />
          <CardContent className="p-6">
            <Tabs defaultValue="profile">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="profile" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="mr-1.5 h-4 w-4" /> Profile Information
                </TabsTrigger>
                <TabsTrigger value="account" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Lock className="mr-1.5 h-4 w-4" /> Account Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
                  <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-6 py-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-none">Profile Information</h3>
                      <p className="text-xs text-muted-foreground mt-1">Update your personal details</p>
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
                        <Label htmlFor="p-email">Email Address</Label>
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
                        <Label htmlFor="p-phone">Contact Number</Label>
                        <Input
                          id="p-phone"
                          value={value.phone}
                          disabled={!editing}
                          onChange={(e) => set("phone", e.target.value)}
                          className="disabled:bg-muted/40 disabled:text-foreground/80"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-border/40 pt-6">
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
                              toast.success("Profile updated");
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
              </TabsContent>

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
