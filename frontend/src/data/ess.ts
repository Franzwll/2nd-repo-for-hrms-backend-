import { useEffect, useState } from "react";

export type ESSRequest = {
  id: string;
  employee: string;
  employeeId: string;
  department: string;
  category: string;
  type: string;
  filed: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Completed";
  assignedTo: string;
  details: string;
};

export const essRequests: ESSRequest[] = [
  {
    id: "REQ-4410",
    employee: "Kevin Dela Cruz",
    employeeId: "EMP-0005",
    department: "Kitchen / Culinary",
    category: "Leave",
    type: "Sick Leave",
    filed: "2026-07-25",
    status: "Pending",
    assignedTo: "Juan Dela Cruz",
    details: "1 day sick leave with medical certificate attached.",
  },
  {
    id: "REQ-4409",
    employee: "Marjun Devera",
    employeeId: "EMP-0006",
    department: "Food & Beverage",
    category: "HR Document",
    type: "Certificate of Employment",
    filed: "2026-07-24",
    status: "Under Review",
    assignedTo: "Maria Lim",
    details: "COE for bank loan application, needs salary details.",
  },
  {
    id: "REQ-4408",
    employee: "Rosa Aquino",
    employeeId: "EMP-0008",
    department: "Housekeeping",
    category: "Attendance",
    type: "Attendance Correction",
    filed: "2026-07-24",
    status: "Approved",
    assignedTo: "Juan Dela Cruz",
    details: "Missing time-out on 2026-07-22, verified with floor logbook.",
  },
  {
    id: "REQ-4407",
    employee: "Camille Ortega",
    employeeId: "EMP-0004",
    department: "Front Office",
    category: "Payroll",
    type: "Payslip Request",
    filed: "2026-07-23",
    status: "Completed",
    assignedTo: "Paolo Cruz",
    details: "Payslip copies for June 2026 cut-offs.",
  },
  {
    id: "REQ-4406",
    employee: "Kevin Dela Cruz",
    employeeId: "EMP-0005",
    department: "Kitchen / Culinary",
    category: "Reimbursement",
    type: "Transportation",
    filed: "2026-07-21",
    status: "Rejected",
    assignedTo: "Paolo Cruz",
    details: "Missing official receipt for claimed amount.",
  },
  {
    id: "REQ-4405",
    employee: "Ana Ramos",
    employeeId: "EMP-0001",
    department: "Front Office",
    category: "Loan",
    type: "Company Loan",
    filed: "2026-07-20",
    status: "Under Review",
    assignedTo: "Paolo Cruz",
    details: "₱50,000 company loan payable in 12 months.",
  },
  {
    id: "REQ-4404",
    employee: "Rosa Aquino",
    employeeId: "EMP-0008",
    department: "Housekeeping",
    category: "Personal Info",
    type: "Contact Number Update",
    filed: "2026-07-19",
    status: "Completed",
    assignedTo: "Maria Lim",
    details: "Updated mobile number and emergency contact.",
  },
];

export const requestCategories = [
  { name: "Leave", types: ["Vacation", "Sick", "Emergency", "Maternity", "Paternity", "Solo Parent", "Bereavement"] },
  { name: "Attendance", types: ["Correction", "Missing Time In", "Missing Time Out", "Overtime", "Shift Change", "Rest Day Work"] },
  { name: "Payroll", types: ["Payslip Request", "Payroll Inquiry", "Discrepancy Report", "Salary Certificate", "BIR 2316"] },
  { name: "Payroll Update", types: ["Bank Account Update", "Payment Method", "Voluntary Deduction"] },
  { name: "Loan", types: ["Company Loan", "Salary Loan", "Cash Advance", "Emergency Loan"] },
  { name: "Reimbursement", types: ["Transportation", "Travel", "Meal Allowance", "Hotel Expense", "Communication"] },
  { name: "HR Document", types: ["Certificate of Employment", "Service Record", "Employment Verification", "Certificate of Compensation"] },
  { name: "Personal Info", types: ["Address", "Contact Number", "Email", "Civil Status", "Emergency Contact", "Government ID"] },
  { name: "Account", types: ["Password Reset", "Unlock Account", "System Access", "Login Problem"] },
];

export type EssCategory = {
  name: string;
  description: string;
  types: string[];
  /** Closed categories are hidden from employees when filing a new request. Defaults to open. */
  open?: boolean;
  /** Custom categories added by admin */
  custom?: boolean;
};

const essCategoryDescriptions: Record<string, string> = {
  Leave: "Vacation, sick, emergency and other leave filings.",
  Attendance: "Time in/out corrections, overtime and shift changes.",
  Payroll: "Payslips, payroll inquiries and salary certificates.",
  "Payroll Update": "Bank account, payment method and deduction updates.",
  Loan: "Company loans, salary loans and cash advances.",
  Reimbursement: "Transportation, travel and other expense claims.",
  "HR Document": "Certificates, service records and employment verification.",
  "Personal Info": "Address, contact, civil status and government ID updates.",
  Account: "Password resets and ESS account access issues.",
};

let essCategoryStore: EssCategory[] = requestCategories.map((c) => ({
  name: c.name,
  description: essCategoryDescriptions[c.name] ?? "",
  types: [...c.types],
  open: true,
}));

type EssCategoryListener = () => void;
const essCategoryListeners = new Set<EssCategoryListener>();

function notifyEssCategoryListeners() {
  essCategoryListeners.forEach((listener) => listener());
}

/** Live-updating list of ESS request categories, kept in sync across all components using it. */
export function useEssCategories(): EssCategory[] {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    essCategoryListeners.add(listener);
    return () => {
      essCategoryListeners.delete(listener);
    };
  }, []);

  return essCategoryStore;
}

export function addCategoryEntry(entry: { name: string; description: string; types: string[] }) {
  essCategoryStore = [...essCategoryStore, { ...entry, open: true, custom: true }];
  notifyEssCategoryListeners();
}

export function updateCategoryEntry(
  originalName: string,
  updates: { name: string; description: string; types: string[] },
) {
  essCategoryStore = essCategoryStore.map((c) =>
    c.name === originalName ? { ...c, ...updates } : c,
  );
  notifyEssCategoryListeners();
}

export function removeCategoryEntry(name: string) {
  essCategoryStore = essCategoryStore.filter((c) => c.name !== name);
  notifyEssCategoryListeners();
}

export function setCategoryOpen(name: string, open: boolean) {
  essCategoryStore = essCategoryStore.map((c) => (c.name === name ? { ...c, open } : c));
  notifyEssCategoryListeners();
}

export const myProfile = {
  employeeId: "OSM-2026-0142",
  name: "Kevin Santos",
  initials: "KS",
  position: "Line Cook",
  department: "Kitchen / Culinary",
  branch: "Oxford Suites Makati",
  supervisor: "Executive Chef Marco",
  dateHired: "2026-04-15",
  employmentType: "Probationary",
  status: "Active",
  email: "kevin.santos@oxfordsuites.com.ph",
  phone: "0921 774 9903",
  address: "14 Kalayaan Ave, Makati City",
  emergencyContact: "Liza Santos — 0918 222 4410 (Spouse)",
  onboardingComplete: false,
};

export const myAttendance = {
  today: {
    timeIn: "07:52 AM",
    timeOut: "—",
    breakIn: "12:00 PM",
    breakOut: "12:58 PM",
    hours: "6.2",
    late: "0",
    undertime: "0",
    overtime: "0",
  },
  monthly: { present: 21, late: 2, absent: 0, leave: 1, overtimeHours: 12.5 },
  history: [
    { date: "2026-07-25", in: "07:48 AM", out: "04:32 PM", hours: 8.2, remark: "Present" },
    { date: "2026-07-24", in: "08:07 AM", out: "05:10 PM", hours: 8.5, remark: "Late 7 mins" },
    { date: "2026-07-23", in: "07:55 AM", out: "06:40 PM", hours: 10.2, remark: "Overtime 2h" },
    { date: "2026-07-22", in: "—", out: "—", hours: 0, remark: "Sick Leave" },
    { date: "2026-07-21", in: "07:50 AM", out: "04:30 PM", hours: 8.1, remark: "Present" },
  ],
};

export const mySchedule = [
  { day: "Monday", shift: "AM Shift", time: "07:00 – 16:00", location: "Main Kitchen" },
  { day: "Tuesday", shift: "AM Shift", time: "07:00 – 16:00", location: "Main Kitchen" },
  { day: "Wednesday", shift: "Mid Shift", time: "11:00 – 20:00", location: "Banquet" },
  { day: "Thursday", shift: "Mid Shift", time: "11:00 – 20:00", location: "Banquet" },
  { day: "Friday", shift: "PM Shift", time: "14:00 – 23:00", location: "Main Kitchen" },
  { day: "Saturday", shift: "Rest Day", time: "—", location: "—" },
  { day: "Sunday", shift: "Rest Day", time: "—", location: "—" },
];

export const myLeaveBalances = [
  { type: "Vacation Leave", total: 15, used: 4 },
  { type: "Sick Leave", total: 15, used: 3 },
  { type: "Emergency Leave", total: 5, used: 1 },
  { type: "Solo Parent Leave", total: 7, used: 0 },
];

export const myPayroll = {
  nextPayout: "2026-08-05",
  gross: 21500,
  net: 18240,
  breakdown: [
    { label: "Basic Pay", amount: 16000 },
    { label: "Overtime Pay", amount: 2100 },
    { label: "Night Differential", amount: 900 },
    { label: "Meal Allowance", amount: 1500 },
    { label: "Service Charge", amount: 1000 },
  ],
  deductions: [
    { label: "SSS", amount: 900 },
    { label: "PhilHealth", amount: 550 },
    { label: "Pag-IBIG", amount: 200 },
    { label: "Withholding Tax", amount: 1160 },
    { label: "Company Loan", amount: 450 },
  ],
  payslips: [
    { period: "2026-07-01 – 07-15", net: 9120, status: "Released" },
    { period: "2026-06-16 – 06-30", net: 9040, status: "Released" },
    { period: "2026-06-01 – 06-15", net: 8975, status: "Released" },
  ],
};

export const myBenefits = [
  { name: "SSS", value: "34-1234567-8", note: "Active contributions" },
  { name: "PhilHealth", value: "12-345678901-2", note: "Active" },
  { name: "Pag-IBIG", value: "1234-5678-9012", note: "Active + MP2" },
  { name: "BIR Tax Status", value: "S — Single", note: "TIN 123-456-789" },
  { name: "HMO", value: "Maxicare Platinum", note: "Effective after regularization" },
  { name: "Insurance", value: "Group Life", note: "₱500,000 coverage" },
];

export type EssActivityLog = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  category: string;
  department: string;
  requestId: string;
};

export const essActivityLog: EssActivityLog[] = [
  { id: "ELOG-001", timestamp: "2026-07-26 08:14", user: "Juan Dela Cruz", action: "Approved sick leave request", module: "Leave", category: "Leave", department: "Kitchen / Culinary", requestId: "REQ-4410" },
  { id: "ELOG-002", timestamp: "2026-07-26 07:58", user: "Maria Lim", action: "Reviewed COE request", module: "HR Document", category: "HR Document", department: "Food & Beverage", requestId: "REQ-4409" },
  { id: "ELOG-003", timestamp: "2026-07-25 22:41", user: "Rosa Aquino", action: "Filed attendance correction", module: "Attendance", category: "Attendance", department: "Housekeeping", requestId: "REQ-4408" },
  { id: "ELOG-004", timestamp: "2026-07-25 19:12", user: "Paolo Cruz", action: "Released payslip copies", module: "Payroll", category: "Payroll", department: "Front Office", requestId: "REQ-4407" },
  { id: "ELOG-005", timestamp: "2026-07-25 16:30", user: "Paolo Cruz", action: "Rejected transportation reimbursement", module: "Reimbursement", category: "Reimbursement", department: "Kitchen / Culinary", requestId: "REQ-4406" },
  { id: "ELOG-006", timestamp: "2026-07-24 14:05", user: "Ana Ramos", action: "Submitted company loan application", module: "Loan", category: "Loan", department: "Front Office", requestId: "REQ-4405" },
  { id: "ELOG-007", timestamp: "2026-07-24 11:47", user: "Maria Lim", action: "Updated contact number", module: "Personal Info", category: "Personal Info", department: "Housekeeping", requestId: "REQ-4404" },
  { id: "ELOG-008", timestamp: "2026-07-24 09:20", user: "Kevin Dela Cruz", action: "Filed sick leave request", module: "Leave", category: "Leave", department: "Kitchen / Culinary", requestId: "REQ-4410" },
  { id: "ELOG-009", timestamp: "2026-07-23 20:10", user: "Marjun Devera", action: "Requested certificate of employment", module: "HR Document", category: "HR Document", department: "Food & Beverage", requestId: "REQ-4409" },
  { id: "ELOG-010", timestamp: "2026-07-23 18:02", user: "Juan Dela Cruz", action: "Verified floor logbook entry", module: "Attendance", category: "Attendance", department: "Housekeeping", requestId: "REQ-4408" },
  { id: "ELOG-011", timestamp: "2026-07-23 15:33", user: "Camille Ortega", action: "Requested June payslip", module: "Payroll", category: "Payroll", department: "Front Office", requestId: "REQ-4407" },
  { id: "ELOG-012", timestamp: "2026-07-22 13:15", user: "Kevin Dela Cruz", action: "Filed transportation reimbursement", module: "Reimbursement", category: "Reimbursement", department: "Kitchen / Culinary", requestId: "REQ-4406" },
  { id: "ELOG-013", timestamp: "2026-07-22 10:44", user: "Paolo Cruz", action: "Escalated loan application to HR", module: "Loan", category: "Loan", department: "Front Office", requestId: "REQ-4405" },
  { id: "ELOG-014", timestamp: "2026-07-21 21:09", user: "Rosa Aquino", action: "Updated emergency contact", module: "Personal Info", category: "Personal Info", department: "Housekeeping", requestId: "REQ-4404" },
  { id: "ELOG-015", timestamp: "2026-07-21 17:55", user: "Maria Lim", action: "Requested password reset", module: "Account", category: "Account", department: "Food & Beverage", requestId: "REQ-4409" },
  { id: "ELOG-016", timestamp: "2026-07-21 12:38", user: "Juan Dela Cruz", action: "Approved attendance correction", module: "Attendance", category: "Attendance", department: "Housekeeping", requestId: "REQ-4408" },
  { id: "ELOG-017", timestamp: "2026-07-20 22:47", user: "Ana Ramos", action: "Uploaded loan supporting document", module: "Loan", category: "Loan", department: "Front Office", requestId: "REQ-4405" },
  { id: "ELOG-018", timestamp: "2026-07-20 19:26", user: "Kevin Dela Cruz", action: "Checked leave balance", module: "Leave", category: "Leave", department: "Kitchen / Culinary", requestId: "REQ-4410" },
  { id: "ELOG-019", timestamp: "2026-07-20 15:01", user: "Camille Ortega", action: "Downloaded payslip PDF", module: "Payroll", category: "Payroll", department: "Front Office", requestId: "REQ-4407" },
  { id: "ELOG-020", timestamp: "2026-07-19 23:18", user: "Rosa Aquino", action: "Completed contact info update", module: "Personal Info", category: "Personal Info", department: "Housekeeping", requestId: "REQ-4404" },
  { id: "ELOG-021", timestamp: "2026-07-19 20:04", user: "Marjun Devera", action: "Resubmitted COE request", module: "HR Document", category: "HR Document", department: "Food & Beverage", requestId: "REQ-4409" },
  { id: "ELOG-022", timestamp: "2026-07-19 16:52", user: "Paolo Cruz", action: "Denied transportation reimbursement appeal", module: "Reimbursement", category: "Reimbursement", department: "Kitchen / Culinary", requestId: "REQ-4406" },
  { id: "ELOG-023", timestamp: "2026-07-18 14:33", user: "Maria Lim", action: "Unlocked ESS account", module: "Account", category: "Account", department: "Food & Beverage", requestId: "REQ-4409" },
  { id: "ELOG-024", timestamp: "2026-07-18 11:20", user: "Ana Ramos", action: "Signed loan agreement", module: "Loan", category: "Loan", department: "Front Office", requestId: "REQ-4405" },
  { id: "ELOG-025", timestamp: "2026-07-17 09:47", user: "Kevin Dela Cruz", action: "Marked sick leave as completed", module: "Leave", category: "Leave", department: "Kitchen / Culinary", requestId: "REQ-4410" },
];

export const myPerformance = {
  lastReview: "Q2 2026 — Meets Expectations",
  nextReview: "Q3 2026",
  competencyLevel: "Proficient",
  lastAssessed: "Jan 2026",
  lmsCoursesAssigned: 3,
  lmsCoursesCompleted: 2,
  averageScore: "90%",
  salaryGrade: "SG-8",
  salaryStep: "Step 2",
  lastPromotionRequest: {
    position: "Senior Guest Service Associate",
    status: "Pending",
    date: "Jul 15, 2026",
  },
};

export const myLearningCourses = [
  { id: "LMS-101", title: "Food Safety & Sanitation Level 2", category: "Culinary & Safety", status: "Completed", score: "95%", completedDate: "Jul 10, 2026" },
  { id: "LMS-102", title: "Customer Excellence in Hospitality", category: "Service Quality", status: "Completed", score: "88%", completedDate: "Jun 24, 2026" },
  { id: "LMS-103", title: "Fire Safety & Emergency Response", category: "Compliance", status: "In Progress", score: "—", completedDate: "—" },
];

export const myEmployeeDocuments = [
  { id: "DOC-001", title: "BIR Form 2316 (2025)", category: "Tax Document", status: "Available", date: "Jan 15, 2026", size: "240 KB" },
  { id: "DOC-002", title: "Certificate of Employment (COE)", category: "Employment", status: "Released", date: "Jun 01, 2026", size: "180 KB" },
  { id: "DOC-003", title: "Medical Clearance Certificate", category: "Onboarding", status: "Submitted", date: "Feb 03, 2026", size: "1.2 MB" },
  { id: "DOC-004", title: "Social Security System (SSS) Form E-1", category: "Government ID", status: "Submitted", date: "Feb 02, 2026", size: "310 KB" },
  { id: "DOC-005", title: "Updated NBI Clearance (2026)", category: "Clearance", status: "Missing", date: "—", size: "—" },
];

export const wireframeActivity = [
  { category: "Attendance", type: "Daily Time In (07:52 AM)", date: "Aug 10, 2026", isoDate: "2026-08-10", status: "Completed", statusRank: 1 },
  { category: "Payroll", type: "July 2nd Cut-off Payslip", date: "Aug 05, 2026", isoDate: "2026-08-05", status: "Available", statusRank: 1 },
  { category: "Performance", type: "Food Safety Level 2 Course", date: "Aug 02, 2026", isoDate: "2026-08-02", status: "Completed", statusRank: 1 },
  { category: "Payroll", type: "Overtime Request (4 Hours)", date: "Jul 28, 2026", isoDate: "2026-07-28", status: "Pending", statusRank: 0 },
  { category: "Attendance", type: "Missed Time Out Correction", date: "Jul 20, 2026", isoDate: "2026-07-20", status: "Pending", statusRank: 0 },
  { category: "Performance", type: "Senior Line Cook Promotion Application", date: "Jul 15, 2026", isoDate: "2026-07-15", status: "Pending", statusRank: 0 },
  { category: "Documents", type: "Certificate of Employment Request", date: "Jul 01, 2026", isoDate: "2026-07-01", status: "Released", statusRank: 1 },
  { category: "Payroll", type: "June 2nd Cut-off Payslip", date: "Jun 20, 2026", isoDate: "2026-06-20", status: "Available", statusRank: 1 },
  { category: "Payroll", type: "Overtime Request (2 Hours)", date: "Jun 18, 2026", isoDate: "2026-06-18", status: "Approved", statusRank: 1 },
  { category: "Performance", type: "Customer Excellence Course", date: "Jun 14, 2026", isoDate: "2026-06-14", status: "Completed", statusRank: 1 },
  { category: "Documents", type: "BIR Form 2316 Copy Request", date: "Jun 01, 2026", isoDate: "2026-06-01", status: "Released", statusRank: 1 },
  { category: "Attendance", type: "Time In Correction (Late Override)", date: "May 22, 2026", isoDate: "2026-05-22", status: "Approved", statusRank: 1 },
  { category: "Documents", type: "HMO Card Certification", date: "Feb 03, 2026", isoDate: "2026-02-03", status: "Released", statusRank: 1 },
];

export const myLoginActivity = [
  { device: "Chrome · Windows", location: "Makati City, PH", time: "Jul 31, 2026, 8:12 AM", date: "2026-07-31T08:12" },
  { device: "Mobile App · Android", location: "Makati City, PH", time: "Jul 30, 2026, 6:45 PM", date: "2026-07-30T18:45" },
  { device: "Edge · Windows", location: "Makati City, PH", time: "Jul 25, 2026, 9:30 AM", date: "2026-07-25T09:30" },
];