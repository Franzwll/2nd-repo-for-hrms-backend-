import { useState } from "react";
import {
  KeyRound,
  Monitor,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Smartphone,
  Trash2,
  UserPlus,
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
import {
  permissionGroups,
  roleGroupMatrix,
  roleLabels,
  systemUsers,
  type PermissionGroup,
  type PermissionLevel,
  type SystemUser,
} from "@/data/users";
import { TablePagination } from "@/components/ui/table-pagination";
import { ListBody } from "@/components/portal/ListBody";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import { departments } from "@/data/hr";
import { Checkbox } from "@/components/ui/checkbox";

const DEFAULT_PASSWORD = "Oxford@2026";

function generateDefaultPassword() {
  return `Oxford@${Math.floor(1000 + Math.random() * 9000)}`;
}

type ActiveSession = {
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

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>(systemUsers);

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
  const saveEdit = () => {
    if (!editDraft) return;
    setUsers((p) => p.map((x) => (x.id === editDraft.id ? editDraft : x)));
    toast.success(`${editDraft.username} updated`);
    setEditUser(null);
  };

  const openReset = (u: SystemUser) => {
    setResetUser(u);
    setResetPassword("");
  };
  const submitReset = () => {
    if (!resetUser) return;
    toast.success(`Password reset for ${resetUser.username}`, {
      description: resetPassword ? "New password saved." : "No password set.",
    });
    setResetUser(null);
  };

  const createUser = () => {
    if (!newUser.name || !newUser.username) {
      toast.error("Full name and username are required");
      return;
    }
    const id = `USR-${String(users.length + 1).padStart(3, "0")}`;
    setUsers((p) => [
      ...p,
      {
        id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role as SystemUser["role"],
        department:
          newUser.role === "Super Admin"
            ? "Administration / HR"
            : newUser.department || departments[0]?.name || "",
        status: "Active",
        lastLogin: "—",
        ipAddress: "—",
      },
    ]);
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
        <StatCard label="Total Users" value={users.length} tone="primary" />
        <StatCard
          label="Active"
          value={users.filter((u) => u.status === "Active").length}
          tone="success"
        />
        <StatCard
          label="Suspended"
          value={users.filter((u) => u.status === "Suspended").length}
          tone="caution"
        />
        <StatCard
          label="Admins"
          value={users.filter((u) => u.role !== "Employee").length}
          tone="gold"
        />
      </div>

      <Tabs defaultValue="users" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          <TabsTrigger value="auth">Authentication & Login Security</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold">System Users</h2>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" /> Create user
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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
                          onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
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
                              department: v === "Super Admin" ? "" : p.department,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Super Admin", "Admin", "Employee"].map((r) => (
                              <SelectItem key={r} value={r}>
                                {roleLabels[r as SystemUser["role"]]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {newUser.role !== "Super Admin" && (
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select
                            value={newUser.department}
                            onValueChange={(v) => setNewUser((p) => ({ ...p, department: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((d) => (
                                <SelectItem key={d.code} value={d.name}>
                                  {d.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
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
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
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
                    {["Super Admin", "Admin", "Employee"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabels[r as SystemUser["role"]]}
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

              <div className="mt-4 overflow-x-auto">
                <ListBody>
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
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Reset password"
                              onClick={() => openReset(u)}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            {u.status !== "Active" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Recover account"
                                onClick={() => {
                                  setUsers((p) =>
                                    p.map((x) => (x.id === u.id ? { ...x, status: "Active" } : x)),
                                  );
                                  toast.success(`${u.username} account recovered`);
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
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
                                    onClick={() => {
                                      setUsers((p) => p.filter((x) => x.id !== u.id));
                                      toast(`${u.username} deleted`);
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
                    {filteredUsers.length === 0 && (
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
                </ListBody>
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
                  <h2 className="font-display text-2xl font-semibold">Permission Matrix</h2>
                  <p className="text-xs text-muted-foreground">
                    Role-based access matrix — click Edit to modify checkbox permissions.
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
                      <Button
                        size="sm"
                        onClick={() => {
                          setMatrix({ ...matrixDraft });
                          setIsEditingMatrix(false);
                          toast.success("Permission matrix saved successfully");
                        }}
                      >
                        Save
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
                            level === "Edit" || level === "Full" || level === "Approve / Reject Only";
                          const isFull = level === "Full";

                          const handleToggle = (type: "View" | "Edit" | "Full", checked: boolean) => {
                            let next: PermissionLevel = "None";
                            if (type === "Full") {
                              next = checked ? "Full" : "Edit";
                            } else if (type === "Edit") {
                              next = checked ? "Edit" : "View";
                            } else if (type === "View") {
                              next = checked ? "View" : "None";
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
                                <label className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                                  <Checkbox
                                    checked={isView}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("View", !!c)}
                                  />
                                  <span>View Access</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                                  <Checkbox
                                    checked={isEdit}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("Edit", !!c)}
                                  />
                                  <span>Edit Access</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
                                  <Checkbox
                                    checked={isFull}
                                    disabled={!isEditingMatrix}
                                    onCheckedChange={(c) => handleToggle("Full", !!c)}
                                  />
                                  <span>Full Control</span>
                                </label>
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
                  ? "Checkboxes active — click Save when finished editing permissions."
                  : "Click the 'Edit matrix' button above to unlock and modify role permission checkboxes."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70">
              <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                <h2 className="font-display text-2xl font-semibold">Login Security Policy</h2>
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
                  Save security policy
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Active Sessions</h2>
                    <p className="text-xs text-muted-foreground">
                      {sessions.length} user session{sessions.length === 1 ? "" : "s"} currently
                      signed in across all accounts.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sessions.length <= 1}
                    onClick={revokeAllOtherSessions}
                  >
                    <Shield className="mr-2 h-4 w-4" /> Revoke all other sessions
                  </Button>
                </div>
                <div className="space-y-3">
                  {sessions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active sessions.</p>
                  )}
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {s.device === "Mobile" ? (
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{s.user}</p>
                            {s.current && (
                              <Badge
                                variant="outline"
                                className="border-success/30 bg-success/15 text-[10px] text-success"
                              >
                                This device
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {s.department} · {s.position}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.browserOs} · {s.location} · {s.ipAddress} · {s.lastActive}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={s.current}
                        onClick={() => revokeSession(s.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit User</DialogTitle>
          </DialogHeader>
          {editDraft && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={editDraft.username}
                  onChange={(e) => setEditDraft({ ...editDraft, username: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editDraft.email}
                  onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editDraft.role}
                  onValueChange={(v) =>
                    setEditDraft({ ...editDraft, role: v as SystemUser["role"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Super Admin", "Admin", "Employee"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabels[r as SystemUser["role"]]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editDraft.role !== "Super Admin" && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={editDraft.department}
                    onValueChange={(v) => setEditDraft({ ...editDraft, department: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editDraft.status}
                  onValueChange={(v) =>
                    setEditDraft({ ...editDraft, status: v as SystemUser["status"] })
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
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Reset Password</DialogTitle>
          </DialogHeader>
          {resetUser && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Set a new password for{" "}
                <span className="font-medium text-foreground">{resetUser.username}</span>.
              </p>
              <div className="space-y-2">
                <Label>New password</Label>
                <div className="flex gap-2">
                  <Input
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResetPassword(generateDefaultPassword())}
                  >
                    Generate default password
                  </Button>
                </div>
              </div>
              {resetPassword && (
                <p className="rounded-md border border-border bg-muted/40 p-2 font-mono text-xs">
                  {resetPassword}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={submitReset}>Reset password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}