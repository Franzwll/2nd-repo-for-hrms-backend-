import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Edit2,
  KeyRound,
  Lock,
  LogOut,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const ListBody = TableBody;
import { TablePagination } from "@/components/ui/table-pagination";
import { usePagination } from "@/hooks/usePagination";
import { hcmApi, userManagementApi, type ApiSystemUser } from "@/lib/api";
import { cn } from "@/lib/utils";

type SystemUserRole = "Super Admin" | "Admin" | "Employee";
type SystemUserStatus = "Active" | "Suspended" | "Disabled";

interface SystemUser {
  id: string;
  dbId?: number;
  name: string;
  username: string;
  email: string;
  role: SystemUserRole;
  department: string;
  status: SystemUserStatus;
  lastLogin: string;
  ipAddress: string;
}

const ROLE_ID_BY_NAME: Record<string, number> = { "Super Admin": 1, Admin: 2, Employee: 3 };

const FALLBACK_DEPARTMENTS = [
  "Administration / HR",
  "Front Office",
  "Food & Beverage",
  "Kitchen / Culinary",
  "Housekeeping",
];

const formatLastLogin = (iso: string | null) => {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const toUiUser = (u: ApiSystemUser): SystemUser => ({
  id: String(u.system_user_id),
  dbId: u.system_user_id,
  name: u.full_name || u.username,
  username: u.username,
  email: u.email,
  role: (u.role as SystemUserRole) ?? "Employee",
  department: u.department_name ?? "",
  status: u.status === "Inactive" ? "Disabled" : (u.status as SystemUserStatus),
  lastLogin: formatLastLogin(u.last_login_at),
  ipAddress: u.last_login_ip ?? "—",
});

const DEFAULT_PASSWORD = "Password123!";

const roleLabels: Record<SystemUser["role"], string> = {
  "Super Admin": "Super Admin",
  Admin: "HR Admin",
  Employee: "Employee",
};

export type PermissionGroup =
  | "Dashboard Analytics"
  | "Employee Records"
  | "Lifecycle Actions"
  | "Request Queue & ESS"
  | "Audit & Compliance"
  | "User Management";

export type PermissionLevel =
  "Full" | "Edit" | "View" | "Delete" | "Approve / Reject Only" | "None";

export const permissionGroups: PermissionGroup[] = [
  "Dashboard Analytics",
  "Employee Records",
  "Lifecycle Actions",
  "Request Queue & ESS",
  "Audit & Compliance",
  "User Management",
];

export const roleGroupMatrix: Record<
  SystemUser["role"],
  Record<PermissionGroup, PermissionLevel>
> = {
  "Super Admin": {
    "Dashboard Analytics": "Full",
    "Employee Records": "Full",
    "Lifecycle Actions": "Full",
    "Request Queue & ESS": "Full",
    "Audit & Compliance": "Full",
    "User Management": "Full",
  },
  Admin: {
    "Dashboard Analytics": "View",
    "Employee Records": "Edit",
    "Lifecycle Actions": "Edit",
    "Request Queue & ESS": "Approve / Reject Only",
    "Audit & Compliance": "View",
    "User Management": "None",
  },
  Employee: {
    "Dashboard Analytics": "None",
    "Employee Records": "View",
    "Lifecycle Actions": "None",
    "Request Queue & ESS": "Edit",
    "Audit & Compliance": "None",
    "User Management": "None",
  },
};

export type ActiveSession = {
  id: string;
  user: string;
  department: string;
  position: string;
  device: string;
  browserOs: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current?: boolean;
};

const activeSessionsSeed: ActiveSession[] = [
  {
    id: "SES-1",
    user: "Bullseur Santiago",
    department: "Administration / HR",
    position: "System Administrator",
    device: "Desktop",
    browserOs: "Chrome 126 on Windows 11",
    location: "Makati, PH",
    ipAddress: "192.168.10.4",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "SES-2",
    user: "Juan Dela Cruz",
    department: "Administration / HR",
    position: "HR Officer",
    device: "Mobile",
    browserOs: "Safari 17 on iOS 17",
    location: "Makati, PH",
    ipAddress: "120.28.44.10",
    lastActive: "12 mins ago",
  },
  {
    id: "SES-3",
    user: "Ana Ramos",
    department: "Front Office",
    position: "Front Office Supervisor",
    device: "Desktop",
    browserOs: "Edge 125 on Windows 10",
    location: "Quezon City, PH",
    ipAddress: "203.177.65.2",
    lastActive: "3 hrs ago",
  },
  {
    id: "SES-4",
    user: "Kevin Dela Cruz",
    department: "Kitchen / Culinary",
    position: "Line Cook",
    device: "Mobile",
    browserOs: "Chrome 126 on Android 14",
    location: "Makati, PH",
    ipAddress: "10.0.4.88",
    lastActive: "26 mins ago",
  },
  {
    id: "SES-5",
    user: "Rosa Aquino",
    department: "Housekeeping",
    position: "Room Attendant",
    device: "Desktop",
    browserOs: "Chrome 125 on Windows 10",
    location: "Pasay, PH",
    ipAddress: "10.0.4.57",
    lastActive: "1 hr ago",
  },
];

const permissionLevelTone: Record<PermissionLevel, string> = {
  Full: "border-success/30 bg-success/15 text-success",
  Edit: "border-primary/30 bg-primary/10 text-primary",
  View: "border-border bg-muted/40 text-foreground",
  Delete: "border-destructive/30 bg-destructive/15 text-destructive",
  "Approve / Reject Only": "border-warning/40 bg-warning/20 text-warning-foreground",
  None: "border-border bg-muted/20 text-muted-foreground",
};

const GROUP_MODULE_MAP: Record<PermissionGroup, string[]> = {
  "Dashboard Analytics": ["Dashboard"],
  "Employee Records": ["Employee Records", "Core HCM"],
  "Lifecycle Actions": ["New Hire Onboarding", "Core HCM"],
  "Request Queue & ESS": ["ESS Management", "Employee Records"],
  "Audit & Compliance": ["Audit Logs"],
  "User Management": ["User Management", "Settings"],
};

const groupToBackendLevel = (level: PermissionLevel): string => {
  if (level === "Full") return "Full";
  if (level === "Edit") return "Write";
  if (level === "View") return "View";
  return "None";
};

const buildMatrixFromBackend = (
  roles: {
    role_id: number;
    role_name: string;
    permissions: { module_name: string; permission_level: string }[];
  }[],
): Record<SystemUserRole, Record<PermissionGroup, PermissionLevel>> => {
  const next: Record<SystemUserRole, Record<PermissionGroup, PermissionLevel>> = JSON.parse(
    JSON.stringify(roleGroupMatrix),
  );
  roles.forEach((r) => {
    const name = r.role_name as SystemUserRole;
    if (!next[name]) return;
    const levels: Record<string, string> = {};
    r.permissions.forEach((p) => {
      levels[p.module_name] = p.permission_level;
    });
    permissionGroups.forEach((g) => {
      let hasFull = false;
      let hasEdit = false;
      let hasView = false;
      GROUP_MODULE_MAP[g].forEach((m) => {
        const lvl = levels[m];
        if (!lvl || lvl === "None") return;
        if (lvl === "Full") hasFull = true;
        else if (["Write", "Edit", "Approve / Reject Only", "Delete"].includes(lvl)) hasEdit = true;
        else if (["View", "Read"].includes(lvl)) hasView = true;
      });
      let level: PermissionLevel = "None";
      if (hasFull) level = "Full";
      else if (hasEdit) level = "Edit";
      else if (hasView) level = "View";
      next[name][g] = level;
    });
  });
  return next;
};

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deptOptions, setDeptOptions] = useState<string[]>(FALLBACK_DEPARTMENTS);
  const [roleIdByName, setRoleIdByName] = useState<Record<string, number>>({});
  const [existingPerms, setExistingPerms] = useState<
    Record<number, { module_name: string; permission_level: string }[]>
  >({});
  const [savingMatrix, setSavingMatrix] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [editDraft, setEditDraft] = useState<SystemUser | null>(null);

  const [resetUser, setResetUser] = useState<SystemUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "Employee",
    department: "",
    password: "",
  });

  const [matrix, setMatrix] =
    useState<Record<SystemUser["role"], Record<PermissionGroup, PermissionLevel>>>(roleGroupMatrix);
  const [matrixDraft, setMatrixDraft] =
    useState<Record<SystemUser["role"], Record<PermissionGroup, PermissionLevel>>>(roleGroupMatrix);
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);

  const [sessions, setSessions] = useState<ActiveSession[]>(activeSessionsSeed);
  const [twoFactor, setTwoFactor] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState("strong");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxAttempts, setMaxAttempts] = useState("3");

  const loadUsers = async () => {
    try {
      const res = await userManagementApi.users.list({ per_page: 100 });
      setUsers(res.data.map(toUiUser));
    } catch (e: any) {
      toast.error(e?.message || "Unable to load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    hcmApi.departments
      .list({ per_page: 100 })
      .then((res) => {
        const names = res.data.map((d) => d.name);
        if (names.length) setDeptOptions(names);
      })
      .catch(() => {});
    userManagementApi.roles
      .list()
      .then(async (rolesRes) => {
        const byName: Record<string, number> = {};
        const perms: Record<number, { module_name: string; permission_level: string }[]> = {};
        for (const r of rolesRes.data) {
          byName[r.role_name] = r.role_id;
          perms[r.role_id] = r.permissions;
        }
        setRoleIdByName(byName);
        setExistingPerms(perms);
        const built = buildMatrixFromBackend(rolesRes.data);
        setMatrix(built);
        setMatrixDraft(built);
      })
      .catch(() => {});
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const usersPage = usePagination(filteredUsers);

  const openEdit = (u: SystemUser) => {
    setEditUser(u);
    setEditDraft({ ...u });
  };
  const saveEdit = async () => {
    if (!editDraft) return;
    try {
      await userManagementApi.users.update(Number(editDraft.id), {
        username: editDraft.username,
        email: editDraft.email,
        full_name: editDraft.name,
        department_name:
          editDraft.role === "Super Admin" ? "Administration / HR" : editDraft.department,
        role_id: ROLE_ID_BY_NAME[editDraft.role],
        status: editDraft.status === "Disabled" ? "Inactive" : editDraft.status,
      });
      toast.success(`${editDraft.username} updated`);
      setEditUser(null);
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update user.");
    }
  };

  const openReset = (u: SystemUser) => {
    setResetUser(u);
    setResetPassword("");
  };
  const submitReset = async () => {
    if (!resetUser) return;
    try {
      await userManagementApi.users.update(Number(resetUser.id), {
        password: resetPassword || DEFAULT_PASSWORD,
      });
      toast.success(`Password reset for ${resetUser.username}`);
      setResetUser(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to reset password.");
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.username) {
      toast.error("Full name and username are required");
      return;
    }
    if (!newUser.email) {
      toast.error("Email is required");
      return;
    }
    try {
      await userManagementApi.users.create({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password || DEFAULT_PASSWORD,
        full_name: newUser.name,
        department_name:
          newUser.role === "Super Admin" ? "Administration / HR" : newUser.department || undefined,
        role_id: ROLE_ID_BY_NAME[newUser.role],
        status: "Active",
      });
      toast.success(`${newUser.name} created`);
      setCreateOpen(false);
      setNewUser({
        name: "",
        username: "",
        email: "",
        phone: "",
        role: "Employee",
        department: "",
        password: "",
      });
      await loadUsers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create user.");
    }
  };

  const saveMatrix = async () => {
    setSavingMatrix(true);
    try {
      for (const roleName of ["Super Admin", "Admin", "Employee"] as const) {
        const roleId = roleIdByName[roleName];
        if (!roleId) continue;
        const merged = new Map<string, string>();
        (existingPerms[roleId] ?? []).forEach((p) => merged.set(p.module_name, p.permission_level));
        for (const group of permissionGroups) {
          const level = matrixDraft[roleName]?.[group] ?? "None";
          const mapped = groupToBackendLevel(level);
          GROUP_MODULE_MAP[group].forEach((m) => merged.set(m, mapped));
        }
        const permissions = Array.from(merged.entries()).map(([module_name, permission_level]) => ({
          module_name,
          permission_level,
        }));
        await userManagementApi.roles.updatePermissions(roleId, permissions);
      }
      setMatrix({ ...matrixDraft });
      setIsEditingMatrix(false);
      toast.success("Permission matrix saved successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save permission matrix.");
    } finally {
      setSavingMatrix(false);
    }
  };

  const revokeSession = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    setSessions((p) => p.filter((x) => x.id !== id));
    if (s) toast(`Session on ${s.device} (${s.browserOs}) revoked`);
  };

  const revokeAllOtherSessions = () => {
    setSessions((p) => p.filter((x) => x.current));
    toast.success("All other sessions were revoked");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Super Admin"
        title="User Management"
        description="System accounts, login activity, and per-module permission matrix."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={users.length}
          tone="primary"
          icon={Users}
          onClick={() => {
            setRoleFilter("all");
            setStatusFilter("all");
          }}
          hint="Click to view all"
        />
        <StatCard
          label="Active"
          value={users.filter((u) => u.status === "Active").length}
          tone="success"
          icon={UserCheck}
          onClick={() => {
            setStatusFilter("Active");
            setRoleFilter("all");
          }}
          hint="Click to filter active"
        />
        <StatCard
          label="Suspended"
          value={users.filter((u) => u.status === "Suspended").length}
          tone="caution"
          icon={UserX}
          onClick={() => {
            setStatusFilter("Suspended");
            setRoleFilter("all");
          }}
          hint="Click to filter suspended"
        />
        <StatCard
          label="Admins"
          value={users.filter((u) => u.role !== "Employee").length}
          tone="gold"
          icon={ShieldCheck}
          onClick={() => {
            setRoleFilter("Admin");
          }}
          hint="Click to filter admins"
        />
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start rounded-xl border border-border/70 bg-muted/70 p-1 shadow-sm">
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
            value="users"
          >
            <Users className="h-3.5 w-3.5" /> User List
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
            value="matrix"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Permission Matrix
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
            value="auth"
          >
            <KeyRound className="h-3.5 w-3.5" /> Authentication &amp; Login Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Users className="h-5 w-5 text-primary" /> User Roster
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="cursor-pointer">
                        <UserPlus className="mr-2 h-4 w-4" /> Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                          Create User Account
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Full name</Label>
                          <Input
                            value={newUser.name}
                            onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Username</Label>
                          <Input
                            value={newUser.username}
                            onChange={(e) =>
                              setNewUser((p) => ({ ...p, username: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone number</Label>
                          <Input
                            value={newUser.phone}
                            onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(v) =>
                              setNewUser((p) => ({
                                ...p,
                                role: v,
                                department:
                                  v === "Super Admin" ? "Administration / HR" : p.department,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(["Super Admin", "Admin", "Employee"] as const).map((r) => (
                                <SelectItem key={r} value={r}>
                                  {roleLabels[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select
                            value={newUser.department}
                            onValueChange={(v) => setNewUser((p) => ({ ...p, department: v }))}
                            disabled={newUser.role === "Super Admin"}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {deptOptions.map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Password</Label>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={newUser.password}
                              onChange={(e) =>
                                setNewUser((p) => ({ ...p, password: e.target.value }))
                              }
                              placeholder="Enter password"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setNewUser((p) => ({ ...p, password: DEFAULT_PASSWORD }))
                              }
                            >
                              Use default password
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={createUser}>Create user</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Search users…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {(["Super Admin", "Admin", "Employee"] as const).map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {["Active", "Suspended", "Disabled"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersPage.pageItems.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </TableCell>
                        <TableCell className="text-sm">{roleLabels[u.role]}</TableCell>
                        <TableCell className="text-sm">{u.department}</TableCell>
                        <TableCell className="text-xs">{u.lastLogin}</TableCell>
                        <TableCell className="text-xs font-mono">{u.ipAddress}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              u.status === "Active"
                                ? "border-success/30 bg-success/15 text-success"
                                : "border-caution/30 bg-caution/15 text-caution"
                            }
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={`More actions for ${u.name}`}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openReset(u)}>
                                  <KeyRound className="mr-2 h-4 w-4" />
                                  Reset password
                                </DropdownMenuItem>
                                {u.status !== "Active" && (
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        await userManagementApi.users.update(Number(u.id), {
                                          status: "Active",
                                        });
                                        await loadUsers();
                                        toast.success(`${u.username} account recovered`);
                                      } catch (e: any) {
                                        toast.error(e?.message || "Failed to recover account.");
                                      }
                                    }}
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Recover account
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" title="Delete user">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {u.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the user account. This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        await userManagementApi.users.remove(Number(u.id));
                                        await loadUsers();
                                        toast(`${u.username} deleted`);
                                      } catch (e: any) {
                                        toast.error(e?.message || "Failed to delete user.");
                                      }
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {loadingUsers && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          Loading users…
                        </TableCell>
                      </TableRow>
                    )}
                    {!loadingUsers && filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No users match your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                page={usersPage.page}
                pageCount={usersPage.pageCount}
                from={usersPage.from}
                to={usersPage.to}
                total={usersPage.total}
                label="users"
                onPageChange={usersPage.setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Permission Matrix
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Role-based access matrix вЂ” click Edit to modify checkbox permissions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isEditingMatrix ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          setMatrixDraft({ ...matrix });
                          setIsEditingMatrix(true);
                        }}
                      >
                        Edit matrix
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setMatrix(roleGroupMatrix);
                          setMatrixDraft(roleGroupMatrix);
                          toast.success("Permission matrix reset to default settings");
                        }}
                      >
                        Reset to default
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={saveMatrix} disabled={savingMatrix}>
                        {savingMatrix ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingMatrix(false);
                          setMatrixDraft({ ...matrix });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setMatrixDraft(roleGroupMatrix);
                          toast.info("Draft permissions reset to defaults");
                        }}
                      >
                        Reset to default
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Role</TableHead>
                      {permissionGroups.map((g) => (
                        <TableHead key={g} className="min-w-[12rem]">
                          {g}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(["Super Admin", "Admin", "Employee"] as const).map((role) => (
                      <TableRow key={role}>
                        <TableCell className="text-sm font-medium align-top pt-4">
                          {roleLabels[role]}
                        </TableCell>
                        {permissionGroups.map((g) => {
                          const active = isEditingMatrix ? matrixDraft : matrix;
                          const level = active[role]?.[g] ?? "None";
                          const isView =
                            level === "View" ||
                            level === "Edit" ||
                            level === "Full" ||
                            level === "Approve / Reject Only";
                          const isEdit =
                            level === "Edit" ||
                            level === "Full" ||
                            level === "Approve / Reject Only";
                          const isFull = level === "Full";

                          const handleToggle = (
                            type: "View" | "Edit" | "Full",
                            checked: boolean,
                          ) => {
                            let next: PermissionLevel = level;
                            if (type === "View") {
                              next = checked ? (level === "None" ? "View" : level) : "None";
                            } else if (type === "Edit") {
                              next = checked ? (level === "Full" ? "Full" : "Edit") : "View";
                            } else if (type === "Full") {
                              next = checked ? "Full" : "Edit";
                            }
                            setMatrixDraft((prev) => ({
                              ...prev,
                              [role]: { ...prev[role], [g]: next },
                            }));
                          };

                          return (
                            <TableCell key={g} className="align-top py-3">
                              <div
                                className={cn(
                                  "space-y-1.5 rounded-md border border-border bg-card p-2.5 transition-opacity",
                                  !isEditingMatrix && "opacity-85 pointer-events-none bg-muted/30",
                                )}
                              >
                                <div className="flex items-center gap-2 text-xs font-normal select-none">
                                  <Checkbox
                                    id={`view-${role}-${g}`}
                                    checked={isView}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("View", !!c)}
                                  />
                                  <Label className="cursor-pointer" htmlFor={`view-${role}-${g}`}>
                                    View access
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-normal select-none">
                                  <Checkbox
                                    id={`edit-${role}-${g}`}
                                    checked={isEdit}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("Edit", !!c)}
                                  />
                                  <Label className="cursor-pointer" htmlFor={`edit-${role}-${g}`}>
                                    Edit access
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-normal select-none">
                                  <Checkbox
                                    id={`full-${role}-${g}`}
                                    checked={isFull}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("Full", !!c)}
                                  />
                                  <Label className="cursor-pointer" htmlFor={`full-${role}-${g}`}>
                                    Full control
                                  </Label>
                                </div>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {isEditingMatrix
                  ? "Checkboxes active вЂ” click Save when finished editing permissions."
                  : "Click the 'Edit matrix' button above to unlock and modify role permission checkboxes."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Shield className="h-5 w-5 text-primary" /> Login Security Policy
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="text-xs text-muted-foreground">
                      Require an OTP code for all admin logins.
                    </p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
                <div className="space-y-2">
                  <Label>Password policy</Label>
                  <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (min 6 characters)</SelectItem>
                      <SelectItem value="strong">Strong (upper, lower, number, symbol)</SelectItem>
                      <SelectItem value="strict">Strict (12+ chars, no reuse)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Session timeout (minutes)</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["15", "30", "60", "120"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max failed login attempts / lockout</Label>
                  <Select value={maxAttempts} onValueChange={setMaxAttempts}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["3", "5", "10"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v} attempts
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => toast.success("Authentication & login security settings saved")}
                >
                  Save security settings
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                      <Smartphone className="h-5 w-5 text-primary" /> Active Sessions
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Devices currently signed into portal accounts.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={revokeAllOtherSessions}>
                    Revoke all other sessions
                  </Button>
                </div>
                <ul className="mt-4 space-y-3">
                  {sessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{s.user}</p>
                          {s.current && (
                            <Badge variant="outline" className="border-primary/40 text-primary">
                              Current session
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {s.position} В· {s.department}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {s.device} ({s.browserOs}) В· {s.ipAddress} ({s.location})
                        </p>
                      </div>
                      {!s.current && (
                        <Button size="sm" variant="ghost" onClick={() => revokeSession(s.id)}>
                          Revoke
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit User Account</DialogTitle>
          </DialogHeader>
          {editDraft && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Full name</Label>
                <Input
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((p) => (p ? { ...p, name: e.target.value } : p))}
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={editDraft.username}
                  onChange={(e) =>
                    setEditDraft((p) => (p ? { ...p, username: e.target.value } : p))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editDraft.email}
                  onChange={(e) => setEditDraft((p) => (p ? { ...p, email: e.target.value } : p))}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editDraft.role}
                  onValueChange={(v) =>
                    setEditDraft((p) =>
                      p
                        ? {
                            ...p,
                            role: v as SystemUser["role"],
                            department: v === "Super Admin" ? "Administration / HR" : p.department,
                          }
                        : p,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Super Admin", "Admin", "Employee"] as const).map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabels[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={editDraft.department}
                  onValueChange={(v) => setEditDraft((p) => (p ? { ...p, department: v } : p))}
                  disabled={editDraft.role === "Super Admin"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deptOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Account status</Label>
                <Select
                  value={editDraft.status}
                  onValueChange={(v) =>
                    setEditDraft((p) => (p ? { ...p, status: v as SystemUser["status"] } : p))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Active", "Suspended", "Disabled"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Reset login password for{" "}
              <strong className="text-foreground">{resetUser?.username}</strong> ({resetUser?.name}
              ).
            </p>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="text"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetPassword(DEFAULT_PASSWORD)}
            >
              Use default password ({DEFAULT_PASSWORD})
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)}>
              Cancel
            </Button>
            <Button onClick={submitReset}>Save password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
