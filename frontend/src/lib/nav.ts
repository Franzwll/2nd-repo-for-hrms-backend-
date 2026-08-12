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
  { label: "All Requests", to: `${base}/ess` },
  { label: "Attendance", to: `${base}/ess?category=Attendance` },
  { label: "Payroll", to: `${base}/ess?category=Payroll` },
  { label: "Performance", to: `${base}/ess?category=Performance` },
  { label: "Company Documents", to: `${base}/ess?category=Documents` },
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
      { label: "ESS", to: `${base}/ess`, icon: Headset, children: essChildren(base) },
      { label: "Onboarding", to: `${base}/onboarding`, icon: ClipboardCheck },
      { label: "Settings", to: `${base}/settings`, icon: Settings },
    ];
  }

  const shared: NavItem[] = [
    { label: "Dashboard", to: base, icon: LayoutDashboard },
    {
      label: "Recruitment & Onboarding",
      to: `${base}/applicants`,
      icon: Megaphone,
      children: recruitmentChildren(base),
    },
    {
      label: "Core HCM",
      to: `${base}/org-chart`,
      icon: Building2,
      children: hcmChildren(base),
    },
    { label: "Employee Records", to: `${base}/employees`, icon: FolderOpen },
    { label: "ESS Management", to: `${base}/ess`, icon: Headset },
  ];


  if (role === "superadmin") {
    return [
      ...shared,
      { label: "User Management", to: `${base}/users`, icon: ShieldCheck },
      { label: "Audit Logs", to: `${base}/audit`, icon: ScrollText },
      { label: "Settings", to: `${base}/settings`, icon: Settings },
    ];
  }

  return [...shared, { label: "Settings", to: `${base}/settings`, icon: Settings }];
}

export const iconRegistry = { Users, UserCheck };
