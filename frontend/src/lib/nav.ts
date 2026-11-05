import {
  LayoutDashboard,
  Users,
  Megaphone,
  UserCheck,
  Building2,
  FolderOpen,
  Headset,
  ShieldCheck,
  ScrollText,
  Settings,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

export type Role = "superadmin" | "admin" | "employee";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  children?: { label: string; to: string }[];
};

export const roleMeta: Record<
  Role,
  { label: string; user: string; initials: string; base: string }
> = {
  superadmin: {
    label: "Super Admin",
    user: "Bullseur Santiago",
    initials: "BS",
    base: "/superadmin",
  },
  admin: { label: "Admin", user: "Juan Dela Cruz", initials: "JD", base: "/admin" },
  employee: { label: "Employee", user: "Kevin Dela Cruz", initials: "KD", base: "/employee" },
};

const recruitmentChildren = (base: string) => [
  { label: "Applicant Management", to: `${base}/applicants` },
  { label: "Recruitment Management", to: `${base}/recruitment` },
  { label: "New Hire Onboarding", to: `${base}/onboarding` },
];

const essChildren = (base: string) => [
  { label: "My Attendance", to: `${base}/ess?category=Attendance` },
  { label: "My Payroll", to: `${base}/ess?category=Payroll` },
  { label: "My Performance", to: `${base}/ess?category=Promotion` },
  { label: "My Documents", to: `${base}/ess?category=Documents` },
  { label: "My Request", to: `${base}/my-requests` },
  { label: "My Feed", to: `${base}/ess?category=Recognition` },
  { label: "HR AI Concierge", to: `${base}/ai` },
];

const myEssChildren = (base: string) => [
  { label: "My Attendance", to: `${base}/my-ess?category=Attendance` },
  { label: "My Payroll", to: `${base}/my-ess?category=Payroll` },
  { label: "My Performance", to: `${base}/my-ess?category=Promotion` },
  { label: "My Documents", to: `${base}/my-ess?category=Documents` },
  { label: "My Request", to: `${base}/my-requests` },
  { label: "My Feed", to: `${base}/my-ess?category=Recognition` },
];

const hcmChildren = (base: string) => [
  { label: "Organizational Chart", to: `${base}/org-chart` },
  { label: "Department & Position", to: `${base}/dept-pos` },
];

export function navForRole(role: Role): NavItem[] {
  const base = roleMeta[role].base;

  if (role === "employee") {
    return [
      { label: "Dashboard", to: base, icon: LayoutDashboard },
      {
        label: "Employee Self-Service",
        to: `${base}/ess`,
        icon: Headset,
        children: essChildren(base),
      },
      { label: "Onboarding", to: `${base}/onboarding`, icon: ClipboardCheck },
      { label: "Settings", to: `${base}/settings`, icon: Settings },
    ];
  }

  const myEssItem: NavItem = {
    label: "My ESS",
    to: `${base}/my-ess`,
    icon: UserCheck,
    children: myEssChildren(base),
  };

  const recruitmentItem: NavItem = {
    label: "Recruitment & Onboarding",
    to: `${base}/applicants`,
    icon: Megaphone,
    children: recruitmentChildren(base),
  };

  const coreHcmItem: NavItem = {
    label: "Core HCM",
    to: `${base}/org-chart`,
    icon: Building2,
    children: hcmChildren(base),
  };

  const employeeRecordsItem: NavItem = {
    label: "Employee Records",
    to: `${base}/employees`,
    icon: FolderOpen,
  };

  const essManagementItem: NavItem = {
    label: "ESS Management",
    to: `${base}/ess`,
    icon: Headset,
  };

  if (role === "admin") {
    return [
      { label: "Dashboard", to: base, icon: LayoutDashboard },
      myEssItem,
      recruitmentItem,
      coreHcmItem,
      employeeRecordsItem,
      essManagementItem,
      { label: "Settings", to: `${base}/settings`, icon: Settings },
    ];
  }

  if (role === "superadmin") {
    return [
      { label: "Dashboard", to: base, icon: LayoutDashboard },
      recruitmentItem,
      coreHcmItem,
      employeeRecordsItem,
      essManagementItem,
      { label: "User Management", to: `${base}/users`, icon: ShieldCheck },
      { label: "Audit Logs", to: `${base}/audit`, icon: ScrollText },
      { label: "Settings", to: `${base}/settings`, icon: Settings },
    ];
  }

  return [];
}

export const iconRegistry = { Users, UserCheck };
