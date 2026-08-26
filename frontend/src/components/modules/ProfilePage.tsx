import { useRef, useState } from "react";
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
  const [profile, setProfile] = useState<ProfileState>(seedByRole[role]);
  const [draft, setDraft] = useState<ProfileState>(seedByRole[role]);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Identity card � gradient header with overlapping avatar */}
        <Card className="overflow-hidden border-border/70">
          <div className="relative h-28 bg-gradient-to-br from-primary via-primary to-primary/70">
            <span className="absolute right-6 top-6 h-2 w-2 rounded-full bg-primary-foreground/70" />
          </div>
          <CardContent className="-mt-16 flex flex-col items-center px-6 pb-6 text-center">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-card shadow-sm">
                {photo ? <AvatarImage src={photo} alt={value.fullName} /> : null}
                <AvatarFallback className="bg-muted font-display text-3xl text-primary">
                  {initialsOf(value.fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                aria-label="Change profile photo"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-4 font-display text-xl font-semibold">{value.fullName}</h2>
            <p className="text-sm text-primary">{value.position}</p>
            <Badge variant="outline" className="mt-2 border-success/30 bg-success/15 text-success">
              {value.status}
            </Badge>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={onPickPhoto}
            />
            <Button className="mt-4 w-full cursor-pointer" onClick={() => fileRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG (Max. 2MB)</p>

            <div className="mt-5 w-full space-y-3 border-t border-border/60 pt-5 text-left">
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
                  <span className="grid h-9 w-9 shrink-0 place-items-center text-primary">
                    <row.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="truncate text-sm font-medium">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {role !== "superadmin" ? (
              <Button variant="outline" className="mt-5 w-full cursor-pointer" asChild>
                <Link to={settingsPath as never} hash="change-password">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="border-border/70">
          <CardContent className="p-6">
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile" className="cursor-pointer">
                  <User className="mr-1.5 h-4 w-4" /> Profile Information
                </TabsTrigger>
                <TabsTrigger value="account" className="cursor-pointer">
                  <Lock className="mr-1.5 h-4 w-4" /> Account Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <div className="rounded-lg border border-border/70 p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center text-primary">
                      <User className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-xl font-semibold">Profile Information</h3>
                  </div>

                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Personal Details
                  </p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p-name">Full Name</Label>
                      <Input
                        id="p-name"
                        value={value.fullName}
                        disabled={!editing}
                        onChange={(e) => set("fullName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-position">Position</Label>
                      <Select
                        value={value.position}
                        disabled={!editing}
                        onValueChange={(v) => set("position", v)}
                      >
                        <SelectTrigger id="p-position">
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
                          <SelectTrigger id="p-dept">
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
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    {editing ? (
                      <>
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => {
                            setDraft(profile);
                            setEditing(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="cursor-pointer"
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
                        className="cursor-pointer"
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
              </TabsContent>

              <TabsContent value="account" className="mt-6">
                <div className="rounded-lg border border-border/70 p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center text-primary">
                      <Lock className="h-4 w-4" />
                    </span>
                    <h3 className="font-display text-xl font-semibold">Account Details</h3>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p-id">Employee ID</Label>
                      <Input id="p-id" value={value.employeeId} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-login">Last Login</Label>
                      <Input id="p-login" value={value.lastLogin} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p-created">Date Created</Label>
                      <Input id="p-created" value={value.dateCreated} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <div className="flex h-9 items-center">
                        <Badge
                          className="border-success/30 bg-success/15 text-success"
                          variant="outline"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          {value.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {role !== "superadmin" ? (
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 p-4">
                      <div>
                        <p className="text-sm font-medium">Password &amp; Security</p>
                        <p className="text-xs text-muted-foreground">
                          Update your password regularly to keep your account secure.
                        </p>
                      </div>
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <Link to={settingsPath as never} hash="change-password">
                          <KeyRound className="mr-2 h-4 w-4" />
                          Change Password
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
