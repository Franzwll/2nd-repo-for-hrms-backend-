import { useEffect, useState } from "react";

export type ESSRequest = {
  id: string;
  employee: string;
  employeeId: string;
  department: string;
  category: string;
  type: string;
  filed: string;
  status:
    | "Pending"
    | "Under Review"
    | "For Dispatch"
    | "With Module"
    | "For Release"
    | "Approved"
    | "For Fulfillment"
    | "Rejected"
    | "Completed"
    | "Cancelled"
    | "Returned for Clarification";
  assignedTo: string;
  details: string;
  returnedCount?: number | undefined;
  note?: string | undefined;
};

/**
 * ESS request *configuration* (not employee activity). Employee request rows
 * always come from the API.
 */
export const requestCategories = [
  {
    name: "Leave",
    types: [
      "Vacation",
      "Sick",
      "Emergency",
      "Maternity",
      "Paternity",
      "Solo Parent",
      "Bereavement",
    ],
  },
  {
    name: "Attendance",
    types: [
      "Correction",
      "Missing Time In",
      "Missing Time Out",
      "Overtime",
      "Shift Change",
      "Rest Day Work",
    ],
  },
  {
    name: "Payroll",
    types: [
      "Payslip Request",
      "Payroll Inquiry",
      "Discrepancy Report",
      "Salary Certificate",
      "BIR 2316",
    ],
  },
  {
    name: "Payroll Update",
    types: ["Bank Account Update", "Payment Method", "Voluntary Deduction"],
  },
  { name: "Loan", types: ["Company Loan", "Salary Loan", "Cash Advance", "Emergency Loan"] },
  {
    name: "Reimbursement",
    types: ["Transportation", "Travel", "Meal Allowance", "Hotel Expense", "Communication"],
  },
  {
    name: "HR Document",
    types: [
      "Certificate of Employment",
      "Service Record",
      "Employment Verification",
      "Certificate of Compensation",
    ],
  },
  {
    name: "Personal Info",
    types: [
      "Address",
      "Contact Number",
      "Email",
      "Civil Status",
      "Emergency Contact",
      "Government ID",
    ],
  },
  {
    name: "Account",
    types: ["Password Reset", "Unlock Account", "System Access", "Login Problem"],
  },
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
