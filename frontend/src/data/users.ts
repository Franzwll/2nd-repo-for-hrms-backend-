export type SystemUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "Super Admin" | "Admin" | "Employee";
  department: string;
  status: "Active" | "Suspended" | "Disabled";
  lastLogin: string;
  ipAddress: string;
};

export const roleLabels: Record<SystemUser["role"], string> = {
  "Super Admin": "Super Admin",
  Admin: "HR Admin",
  Employee: "Employee",
};

export const systemUsers: SystemUser[] = [
  {
    id: "USR-001",
    name: "Bullseur Santiago",
    username: "bullseur",
    email: "bullseur@oxfordsuites.com.ph",
    role: "Super Admin",
    department: "Administration / HR",
    status: "Active",
    lastLogin: "2026-07-26 08:12",
    ipAddress: "192.168.10.4",
  },
  {
    id: "USR-002",
    name: "Juan Dela Cruz",
    username: "jdelacruz",
    email: "juan.delacruz@oxfordsuites.com.ph",
    role: "Admin",
    department: "Administration / HR",
    status: "Active",
    lastLogin: "2026-07-26 07:58",
    ipAddress: "192.168.10.22",
  },
  {
    id: "USR-003",
    name: "Ana Ramos",
    username: "aramos",
    email: "ana.ramos@oxfordsuites.com.ph",
    role: "Admin",
    department: "Front Office",
    status: "Active",
    lastLogin: "2026-07-25 21:04",
    ipAddress: "192.168.10.31",
  },
  {
    id: "USR-004",
    name: "Kevin Dela Cruz",
    username: "kdelacruz",
    email: "kevin.delacruz@oxfordsuites.com.ph",
    role: "Employee",
    department: "Kitchen / Culinary",
    status: "Active",
    lastLogin: "2026-07-25 14:40",
    ipAddress: "10.0.4.88",
  },
  {
    id: "USR-005",
    name: "Marjun Devera",
    username: "mdevera",
    email: "marjun.devera@oxfordsuites.com.ph",
    role: "Employee",
    department: "Food & Beverage",
    status: "Suspended",
    lastLogin: "2026-07-20 19:11",
    ipAddress: "10.0.4.101",
  },
  {
    id: "USR-006",
    name: "Rosa Aquino",
    username: "raquino",
    email: "rosa.aquino@oxfordsuites.com.ph",
    role: "Employee",
    department: "Housekeeping",
    status: "Active",
    lastLogin: "2026-07-26 06:03",
    ipAddress: "10.0.4.57",
  },
];

export const permissionModules = [
  "Dashboard",
  "Applicant Management",
  "Recruitment Management",
  "New Hire Onboarding",
  "Core HCM",
  "Employee Records",
  "ESS Management",
  "User Management",
  "Audit Logs",
  "Settings",
];

export const permissionLevels = [
  "Full",
  "View",
  "Edit",
  "Delete",
  "Approve / Reject Only",
  "None",
] as const;

export type PermissionLevel = (typeof permissionLevels)[number];

export const defaultMatrix: Record<string, Record<string, PermissionLevel>> = {
  "Super Admin": Object.fromEntries(permissionModules.map((m) => [m, "Full" as PermissionLevel])),
  Admin: {
    Dashboard: "View",
    "Applicant Management": "Edit",
    "Recruitment Management": "Edit",
    "New Hire Onboarding": "Edit",
    "Core HCM": "View",
    "Employee Records": "Edit",
    "ESS Management": "Approve / Reject Only",
    "User Management": "None",
    "Audit Logs": "None",
    Settings: "View",
  },
  Employee: {
    Dashboard: "View",
    "Applicant Management": "None",
    "Recruitment Management": "None",
    "New Hire Onboarding": "View",
    "Core HCM": "None",
    "Employee Records": "None",
    "ESS Management": "View",
    "User Management": "None",
    "Audit Logs": "None",
    Settings: "View",
  },
};

// Compact, role-based permission summary grouped by functional area — used for
// the easy-to-scan Permission Matrix (rows = roles, columns = permission groups).
export const permissionGroups = [
  "Recruitment & Onboarding",
  "Core HCM & Records",
  "ESS Management",
  "User & System Admin",
] as const;

export type PermissionGroup = (typeof permissionGroups)[number];

export const roleGroupMatrix: Record<
  SystemUser["role"],
  Record<PermissionGroup, PermissionLevel>
> = {
  "Super Admin": {
    "Recruitment & Onboarding": "Full",
    "Core HCM & Records": "Full",
    "ESS Management": "Full",
    "User & System Admin": "Full",
  },
  Admin: {
    "Recruitment & Onboarding": "Edit",
    "Core HCM & Records": "Edit",
    "ESS Management": "Approve / Reject Only",
    "User & System Admin": "None",
  },
  Employee: {
    "Recruitment & Onboarding": "View",
    "Core HCM & Records": "None",
    "ESS Management": "View",
    "User & System Admin": "None",
  },
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  ipAddress: string;
  severity: "Info" | "Warning" | "Critical";
  department: string;
  device: string;
};

export const auditLogs: AuditEntry[] = [
  {
    id: "LOG-9001",
    timestamp: "2026-07-26 08:14",
    user: "bullseur",
    role: "Super Admin",
    action: "Updated permission matrix for role Admin",
    module: "User Management",
    ipAddress: "192.168.10.4",
    severity: "Critical",
    department: "Administration / HR",
    device: "Chrome on Windows",
  },
  {
    id: "LOG-9000",
    timestamp: "2026-07-26 08:02",
    user: "jdelacruz",
    role: "Admin",
    action: "Approved leave request LR-2231",
    module: "ESS Management",
    ipAddress: "192.168.10.22",
    severity: "Info",
    department: "Administration / HR",
    device: "Edge on Windows",
  },
  {
    id: "LOG-8999",
    timestamp: "2026-07-25 23:20",
    user: "aramos",
    role: "Admin",
    action: "Scheduled interview for APP-1041",
    module: "Applicant Management",
    ipAddress: "192.168.10.31",
    severity: "Info",
    department: "Front Office",
    device: "Safari on macOS",
  },
  {
    id: "LOG-8998",
    timestamp: "2026-07-25 22:58",
    user: "system",
    role: "System",
    action: "Resume screening batch completed (14 resumes, NER model v2.3)",
    module: "Applicant Management",
    ipAddress: "127.0.0.1",
    severity: "Info",
    department: "System",
    device: "Server process",
  },
  {
    id: "LOG-8997",
    timestamp: "2026-07-25 20:41",
    user: "mdevera",
    role: "Employee",
    action: "Failed login attempt (3rd) — account suspended",
    module: "Authentication",
    ipAddress: "10.0.4.101",
    severity: "Warning",
    department: "Food & Beverage",
    device: "Chrome on Android",
  },
  {
    id: "LOG-8996",
    timestamp: "2026-07-25 17:09",
    user: "bullseur",
    role: "Super Admin",
    action: "Deleted job position POS-011 (Seasonal Banquet Server)",
    module: "Core HCM",
    ipAddress: "192.168.10.4",
    severity: "Critical",
    department: "Administration / HR",
    device: "Chrome on Windows",
  },
  {
    id: "LOG-8995",
    timestamp: "2026-07-25 11:22",
    user: "jdelacruz",
    role: "Admin",
    action: "Published job post 'Line Cook' to Indeed and Facebook",
    module: "Recruitment Management",
    ipAddress: "192.168.10.22",
    severity: "Info",
    department: "Administration / HR",
    device: "Edge on Windows",
  },
  {
    id: "LOG-8994",
    timestamp: "2026-07-25 09:15",
    user: "bullseur",
    role: "Super Admin",
    action: "Modified password policy to require strong credentials",
    module: "User Management",
    ipAddress: "192.168.10.4",
    severity: "Warning",
    department: "Administration / HR",
    device: "Chrome on Windows",
  },
  {
    id: "LOG-8993",
    timestamp: "2026-07-24 16:45",
    user: "aramos",
    role: "Admin",
    action: "Created new employee record for Camille Ortega",
    module: "Core HCM",
    ipAddress: "192.168.10.31",
    severity: "Info",
    department: "Front Office",
    device: "Safari on macOS",
  },
  {
    id: "LOG-8992",
    timestamp: "2026-07-24 14:10",
    user: "jdelacruz",
    role: "Admin",
    action: "Exported monthly HR headcount report to PDF",
    module: "Employee Records",
    ipAddress: "192.168.10.22",
    severity: "Info",
    department: "Administration / HR",
    device: "Edge on Windows",
  },
  {
    id: "LOG-8991",
    timestamp: "2026-07-24 10:05",
    user: "kdelacruz",
    role: "Employee",
    action: "Submitted shift swap request with Marco Santos",
    module: "ESS Management",
    ipAddress: "10.0.4.88",
    severity: "Info",
    department: "Kitchen / Culinary",
    device: "Chrome on Android",
  },
  {
    id: "LOG-8990",
    timestamp: "2026-07-23 18:30",
    user: "bullseur",
    role: "Super Admin",
    action: "Revoked active session for user mdevera",
    module: "User Management",
    ipAddress: "192.168.10.4",
    severity: "Critical",
    department: "Administration / HR",
    device: "Chrome on Windows",
  },
  {
    id: "LOG-8989",
    timestamp: "2026-07-23 15:12",
    user: "aramos",
    role: "Admin",
    action: "Updated room attendant onboarding checklist",
    module: "New Hire Onboarding",
    ipAddress: "192.168.10.31",
    severity: "Info",
    department: "Housekeeping",
    device: "Safari on macOS",
  },
  {
    id: "LOG-8988",
    timestamp: "2026-07-23 11:00",
    user: "jdelacruz",
    role: "Admin",
    action: "Approved overtime request for Front Office team",
    module: "ESS Management",
    ipAddress: "192.168.10.22",
    severity: "Info",
    department: "Administration / HR",
    device: "Edge on Windows",
  },
];

export function addAuditLog(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const newLog: AuditEntry = {
    id: `LOG-${Math.floor(8992 + Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    ...entry,
  };
  auditLogs.unshift(newLog);
}

export function createProbationaryUserAccount(emp: {
  id: string;
  name: string;
  email: string;
  department: string;
}): SystemUser {
  const existing = systemUsers.find(
    (u) =>
      u.email.toLowerCase() === emp.email.toLowerCase() ||
      u.name.toLowerCase() === emp.name.toLowerCase(),
  );
  if (existing) {
    existing.status = "Active";
    return existing;
  }
  const username = emp.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const newUser: SystemUser = {
    id: `USR-${String(systemUsers.length + 1).padStart(3, "0")}`,
    name: emp.name,
    username,
    email: emp.email,
    role: "Employee",
    department: emp.department,
    status: "Active",
    lastLogin: "Never",
    ipAddress: "—",
  };
  systemUsers.push(newUser);
  addAuditLog({
    user: "HR Admin (System)",
    role: "Admin",
    action: `Created user account (${newUser.username}) for Probationary employee ${emp.name}`,
    module: "User Management",
    ipAddress: "127.0.0.1",
    severity: "Info",
    department: emp.department,
    device: "System Process",
  });
  return newUser;
}

export function deactivateUserAccount(empEmailOrName: string, reason: string) {
  const user = systemUsers.find(
    (u) =>
      u.email.toLowerCase() === empEmailOrName.toLowerCase() ||
      u.name.toLowerCase() === empEmailOrName.toLowerCase(),
  );
  if (user) {
    user.status = "Disabled";
    addAuditLog({
      user: "HR Admin (System)",
      role: "Admin",
      action: `Deactivated account for ${user.name} (${reason})`,
      module: "User Management",
      ipAddress: "127.0.0.1",
      severity: "Warning",
      department: user.department,
      device: "System Process",
    });
  }
}
