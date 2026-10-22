import { useCallback, useEffect, useState } from "react";
import {
  KeyRound,
  MoreHorizontal,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { authApi, hcmApi, userManagementApi, type ApiSystemUser } from "@/lib/api";

type SystemUserStatus = "Active" | "Suspended" | "Disabled";

interface SystemUser {
  id: string;
  dbId?: number;
  name: string;
  username: string;
  email: string;
  role: string;
  department: string;
  status: SystemUserStatus;
  lastLogin: string;
  ipAddress: string;
}

interface RoleOption {
  role_id: number;
  role_name: string;
  is_protected: boolean;
}

type PermissionMatrix = Record<number, Record<string, string>>;

type UserStats = {
  total: number;
  active: number;
  suspended: number;
  admins: number;
};

type RolePolicy = {
  token_minutes: number;
  idle_minutes: number;
};

const USER_PAGE_SIZE = 25;

const FALLBACK_DEPARTMENTS = [
  "Administration / HR",
  "Front Office",
  "Food & Beverage",
  "Kitchen / Culinary",
  "Housekeeping",
];

const FALLBACK_ROLES: RoleOption[] = [
  { role_id: 1, role_name: "Super Admin", is_protected: true },
  { role_id: 2, role_name: "Admin", is_protected: false },
  { role_id: 3, role_name: "Employee", is_protected: false },
];

const PERMISSION_LEVELS = [
  "None",
  "View",
  "Read",
  "Edit",
  "Write",
  "Approve / Reject Only",
  "Full",
] as const;

const ROLE_LABELS: Record<string, string> = {
  "Super Admin": "Super Admin",
  Admin: "HR Admin",
  Employee: "Employee",
};

const SESSION_ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  employee: "Employee",
};

const EMPTY_META = {
  current_page: 1,
  last_page: 1,
  per_page: USER_PAGE_SIZE,
  total: 0,
};

const EMPTY_STATS: UserStats = { total: 0, active: 0, suspended: 0, admins: 0 };

const roleLabel = (name: string) => ROLE_LABELS[name] ?? name;

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

const statusToApi = (status: SystemUserStatus) => (status === "Disabled" ? "Inactive" : status);

const statusFromApi = (status: ApiSystemUser["status"]): SystemUserStatus =>
  status === "Inactive" ? "Disabled" : status;

const toUiUser = (u: ApiSystemUser): SystemUser => ({
  id: String(u.system_user_id),
  dbId: u.system_user_id,
  name: u.full_name || u.username,
  username: u.username,
  email: u.email,
  role: u.role || "Employee",
  department: u.department_name ?? "",
  status: statusFromApi(u.status),
  lastLogin: formatLastLogin(u.last_login_at),
  ipAddress: u.last_login_ip ?? "—",
});

const copyMatrix = (matrix: PermissionMatrix): PermissionMatrix =>
  Object.fromEntries(Object.entries(matrix).map(([roleId, levels]) => [roleId, { ...levels }]));

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [usersMeta, setUsersMeta] = useState(EMPTY_META);
  const [userStats, setUserStats] = useState<UserStats>(EMPTY_STATS);
  const [page, setPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("users");
  const [deptOptions, setDeptOptions] = useState<string[]>(FALLBACK_DEPARTMENTS);
  const [roles, setRoles] = useState<RoleOption[]>(FALLBACK_ROLES);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [roleIdByName, setRoleIdByName] = useState<Record<string, number>>({
    "Super Admin": 1,
    Admin: 2,
    Employee: 3,
  });
  const [permissionModules, setPermissionModules] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [matrixDraft, setMatrixDraft] = useState<PermissionMatrix>({});
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);
  const [sessionPolicy, setSessionPolicy] = useState<Record<string, RolePolicy> | null>(null);

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
    role: "Employee",
    department: "",
    password: "",
    status: "Active" as "Active" | "Suspended",
  });

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await userManagementApi.users.list({
        page,
        per_page: USER_PAGE_SIZE,
        q: search.trim() || undefined,
        role_id: roleFilter !== "all" ? roleIdByName[roleFilter] : undefined,
        status: statusFilter === "all" ? undefined : statusToApi(statusFilter as SystemUserStatus),
      });
      setUsers(res.data.map(toUiUser));
      setUsersMeta(res.meta ?? EMPTY_META);
      setUserStats(
        res.stats ?? {
          total: res.meta?.total ?? 0,
          active: 0,
          suspended: 0,
          admins: 0,
        },
      );
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unable to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, [page, search, roleFilter, statusFilter, roleIdByName]);

  useEffect(() => {
    const timer = setTimeout(() => void loadUsers(), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadUsers, search]);

  useEffect(() => {
    hcmApi.departments
      .list({ per_page: 100 })
      .then((res) => {
        const names = res.data.map((d) => d.name);
        if (names.length) setDeptOptions(names);
      })
      .catch(() => undefined);

    userManagementApi.roles
      .list({ per_page: 100 })
      .then((rolesRes) => {
        const options: RoleOption[] = rolesRes.data.map((r) => ({
          role_id: r.role_id,
          role_name: r.role_name,
          is_protected: !!r.is_protected,
        }));
        const byName: Record<string, number> = {};
        const nextMatrix: PermissionMatrix = {};
        const modules = new Set<string>();

        rolesRes.data.forEach((role) => {
          const levels: Record<string, string> = {};
          byName[role.role_name] = role.role_id;
          role.permissions.forEach((permission) => {
            levels[permission.module_name] = permission.permission_level;
            modules.add(permission.module_name);
          });
          nextMatrix[role.role_id] = levels;
        });

        setRoles(options.length ? options : FALLBACK_ROLES);
        setRoleIdByName(byName);
        setPermissionModules(Array.from(modules).sort((a, b) => a.localeCompare(b)));
        setMatrix(nextMatrix);
        setMatrixDraft(nextMatrix);
        setRolesLoaded(true);
      })
      .catch(() => toast.error("Unable to load roles."));

    authApi
      .sessionPolicy()
      .then((res) => setSessionPolicy(res.roles ?? {}))
      .catch(() => undefined);
  }, []);

  const roleIdFor = (roleName: string) =>
    roleIdByName[roleName] ?? roles.find((role) => role.role_name === roleName)?.role_id ?? 3;

  const userUpdatePayload = (user: SystemUser, status: SystemUserStatus) => ({
    username: user.username,
    email: user.email,
    full_name: user.name,
    role_id: roleIdFor(user.role),
    department_name: user.department || null,
    status: statusToApi(status),
  });

  const openEdit = (u: SystemUser) => {
    setEditUser(u);
    setEditDraft({ ...u });
  };

  const saveEdit = async () => {
    if (!editDraft) return;
    try {
      await userManagementApi.users.update(
        Number(editDraft.id),
        userUpdatePayload(editDraft, editDraft.status),
      );
      await loadUsers();
      setEditUser(null);
      setEditDraft(null);
      toast.success("User updated successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update user.");
    }
  };

  const openReset = (u: SystemUser) => {
    setResetUser(u);
    setResetPassword("");
  };

  const saveReset = async () => {
    if (!resetUser) return;
    if (resetPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      await userManagementApi.users.resetPassword(Number(resetUser.id), resetPassword);
      toast.success(`Password for ${resetUser.username} was reset.`);
      setResetUser(null);
      setResetPassword("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to reset password.");
    }
  };

  const createUser = async () => {
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.email.trim()) {
      toast.error("Name, username, and email are required.");
      return;
    }
    if (newUser.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      await userManagementApi.users.create({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.name,
        role_id: roleIdFor(newUser.role),
        department_name: newUser.department || null,
        status: newUser.status,
      });
      setPage(1);
      await loadUsers();
      setCreateOpen(false);
      setNewUser({
        name: "",
        username: "",
        email: "",
        role: "Employee",
        department: "",
        password: "",
        status: "Active",
      });
      toast.success(`User ${newUser.username} created successfully`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create user.");
    }
  };

  const recoverUser = async (u: SystemUser) => {
    try {
      await userManagementApi.users.update(Number(u.id), userUpdatePayload(u, "Active"));
      await loadUsers();
      toast.success(`${u.username} account recovered`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to recover account.");
    }
  };

  const saveMatrix = async () => {
    if (!rolesLoaded) {
      toast.error("Roles are not available yet.");
      return;
    }

    setSavingMatrix(true);
    try {
      for (const role of roles) {
        if (role.is_protected) continue;

        const current = matrixDraft[role.role_id] ?? matrix[role.role_id] ?? {};
        const permissions = permissionModules.map((module) => ({
          module_name: module,
          permission_level: current[module] ?? "None",
        }));

        await userManagementApi.roles.updatePermissions(role.role_id, permissions);
      }
      const saved = copyMatrix(matrixDraft);
      setMatrix(saved);
      setMatrixDraft(saved);
      setIsEditingMatrix(false);
      toast.success("Permission matrix saved successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save permission matrix.");
    } finally {
      setSavingMatrix(false);
    }
  };

  const totalUsers = userStats.total || usersMeta.total;
  const activeUsers = userStats.active;
  const suspendedUsers = userStats.suspended;
  const adminUsers = userStats.admins;

  const from = usersMeta.total === 0 ? 0 : (usersMeta.current_page - 1) * usersMeta.per_page + 1;
  const to = Math.min(usersMeta.current_page * usersMeta.per_page, usersMeta.total);

  return (
    <div>
      <PageHeader
        title="User Management"
        description="System accounts, login activity, and per-module permission matrix."
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={totalUsers}
          tone="primary"
          icon={Users}
          onClick={() => {
            setRoleFilter("all");
            setStatusFilter("all");
            setPage(1);
            setActiveTab("users");
          }}
        />
        <StatCard
          label="Active"
          value={activeUsers}
          tone="success"
          icon={UserCheck}
          onClick={() => {
            setStatusFilter("Active");
            setRoleFilter("all");
            setPage(1);
            setActiveTab("users");
          }}
        />
        <StatCard
          label="Suspended"
          value={suspendedUsers}
          tone="caution"
          icon={UserX}
          onClick={() => {
            setStatusFilter("Suspended");
            setRoleFilter("all");
            setPage(1);
            setActiveTab("users");
          }}
        />
        <StatCard
          label="Admins"
          value={adminUsers}
          tone="gold"
          icon={ShieldCheck}
          onClick={() => {
            setRoleFilter("Admin");
            setStatusFilter("all");
            setPage(1);
            setActiveTab("users");
          }}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
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
            <KeyRound className="h-3.5 w-3.5" /> Session Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <Users className="h-5 w-5 text-primary" /> User Roster
                </h2>
                <div className="grid w-full grid-cols-2 items-center gap-2 md:flex md:w-auto md:flex-wrap md:justify-end [&_input]:w-full [&_button[role=combobox]]:w-full md:[&_button[role=combobox]]:w-44">
                  <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="order-last col-span-2 cursor-pointer md:order-none"
                      >
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
                              {roles.map((role) => (
                                <SelectItem key={role.role_id} value={role.role_name}>
                                  {roleLabel(role.role_name)}
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
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={newUser.status}
                            onValueChange={(v) =>
                              setNewUser((p) => ({
                                ...p,
                                status: v as "Active" | "Suspended",
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Active", "Suspended"].map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={newUser.password}
                            onChange={(e) =>
                              setNewUser((p) => ({ ...p, password: e.target.value }))
                            }
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={createUser}>Create user</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <div className="relative col-span-2 w-full min-w-0 md:col-span-1 md:w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Search users…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <Select
                    value={roleFilter}
                    onValueChange={(value) => {
                      setRoleFilter(value);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.role_id} value={role.role_name}>
                          {roleLabel(role.role_name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setPage(1);
                    }}
                  >
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
                      <TableHead>User ID</TableHead>
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
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-xs font-mono font-semibold text-primary">
                          USR-{String(u.dbId || u.id).padStart(3, "0")}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </TableCell>
                        <TableCell className="text-sm">{roleLabel(u.role)}</TableCell>
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
                                  <DropdownMenuItem onClick={() => void recoverUser(u)}>
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
                                      } catch (e: unknown) {
                                        toast.error(
                                          e instanceof Error ? e.message : "Failed to delete user.",
                                        );
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
                    {loadingUsers && <TableRowsSkeleton cols={8} rows={6} />}
                    {!loadingUsers && users.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
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
                page={usersMeta.current_page}
                pageCount={Math.max(1, usersMeta.last_page)}
                from={from}
                to={to}
                total={usersMeta.total}
                label="users"
                showRangeLabel={false}
                onPageChange={setPage}
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
                    Per-module permissions. Each module is saved independently, including Read and
                    Approve / Reject Only levels.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isEditingMatrix ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setMatrixDraft(copyMatrix(matrix));
                        setIsEditingMatrix(true);
                      }}
                      disabled={!rolesLoaded}
                    >
                      Edit matrix
                    </Button>
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
                          setMatrixDraft(copyMatrix(matrix));
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[14rem]">Module</TableHead>
                      {roles.map((role) => (
                        <TableHead key={role.role_id} className="min-w-[12rem]">
                          {roleLabel(role.role_name)}
                          {role.is_protected && (
                            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                              System
                            </span>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers && (
                      <TableRowsSkeleton cols={Math.max(2, roles.length + 1)} rows={5} />
                    )}
                    {!loadingUsers &&
                      permissionModules.map((module) => (
                        <TableRow key={module}>
                          <TableCell className="text-sm font-medium">{module}</TableCell>
                          {roles.map((role) => {
                            const activeMatrix = isEditingMatrix ? matrixDraft : matrix;
                            const level = activeMatrix[role.role_id]?.[module] ?? "None";
                            return (
                              <TableCell key={`${role.role_id}-${module}`}>
                                <Select
                                  value={level}
                                  disabled={!isEditingMatrix || role.is_protected}
                                  onValueChange={(value) =>
                                    setMatrixDraft((prev) => ({
                                      ...prev,
                                      [role.role_id]: {
                                        ...(prev[role.role_id] ?? {}),
                                        [module]: value,
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PERMISSION_LEVELS.map((permissionLevel) => (
                                      <SelectItem key={permissionLevel} value={permissionLevel}>
                                        {permissionLevel}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    {!loadingUsers && permissionModules.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={Math.max(2, roles.length + 1)}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          No permission modules are available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <KeyRound className="h-5 w-5 text-primary" /> Effective Session Policy
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Read-only limits enforced by the authentication service. Sessions expire after
                    the role token limit or the idle limit, whichever comes first.
                  </p>
                </div>
                {sessionPolicy && Object.keys(sessionPolicy).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(sessionPolicy).map(([key, policy]) => (
                      <div
                        key={key}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm"
                      >
                        <p className="font-semibold">{SESSION_ROLE_LABELS[key] ?? key}</p>
                        <div className="text-xs text-muted-foreground">
                          Token {policy.token_minutes} min · Idle {policy.idle_minutes} min
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Session policy is currently unavailable.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Password &amp; Lockout
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Current enforced baseline for portal accounts.
                  </p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                    <span>Minimum password length</span>
                    <span className="font-semibold">8 characters</span>
                  </li>
                  <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                    <span>Failed login lockout</span>
                    <span className="font-semibold">5 attempts / 15 minutes</span>
                  </li>
                  <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                    <span>Admin password reset</span>
                    <span className="font-semibold">Revokes active sessions</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Global security settings are not enforced by the authentication service yet, so
                  they are not editable here.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
                            role: v,
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
                    {roles.map((role) => (
                      <SelectItem key={role.role_id} value={role.role_name}>
                        {roleLabel(role.role_name)}
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
                    setEditDraft((p) => (p ? { ...p, status: v as SystemUserStatus } : p))
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

      <Dialog
        open={!!resetUser}
        onOpenChange={(open) => {
          if (!open) {
            setResetUser(null);
            setResetPassword("");
          }
        }}
      >
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
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Existing sessions for this account will be revoked.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUser(null)}>
              Cancel
            </Button>
            <Button onClick={saveReset} disabled={resetPassword.length < 8}>
              Save password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
