/**
 * Configuration for the employee "My Request" workspace.
 *
 * Each module owns a landing card, its own history page, and a request dialog.
 * `categories` maps a module to the ESS request categories returned by
 * `essApi.myRequests()` so each module only shows its own filings.
 */
export type MyRequestModuleId = "payroll" | "attendance" | "promotion" | "documents";

export interface MyRequestModuleConfig {
  id: MyRequestModuleId;
  label: string;
  /** Short label used inside the request dialog title. */
  noun: string;
  description: string;
  submitLabel: string;
  categories: string[];
  emptyMessage: string;
}

export const MY_REQUEST_MODULES: Record<MyRequestModuleId, MyRequestModuleConfig> = {
  payroll: {
    id: "payroll",
    label: "Payroll",
    noun: "Payroll Request",
    description: "Payroll clarifications, overtime claims, payslip copies, and account updates.",
    submitLabel: "Submit Payroll Request",
    categories: ["Payroll"],
    emptyMessage: "No payroll requests filed yet.",
  },
  attendance: {
    id: "attendance",
    label: "Attendance",
    noun: "Attendance Request",
    description: "File a leave application or arrange a shift swap with a teammate.",
    submitLabel: "Submit Attendance Request",
    categories: ["Leave", "Shift Schedule", "Attendance"],
    emptyMessage: "No attendance requests filed yet.",
  },
  promotion: {
    id: "promotion",
    label: "Promotion",
    noun: "Promotion Request",
    description: "Promotions, lateral transfers, reclassification, and salary grade reviews.",
    submitLabel: "Submit Promotion Request",
    categories: ["Career & Position"],
    emptyMessage: "No promotion or career requests filed yet.",
  },
  documents: {
    id: "documents",
    label: "Documents",
    noun: "Document Request",
    description: "Request certificates, government forms, and official company records.",
    submitLabel: "Submit Document Request",
    categories: ["HR Document"],
    emptyMessage: "No document requests filed yet.",
  },
};

export const MY_REQUEST_MODULE_LIST: MyRequestModuleConfig[] = [
  MY_REQUEST_MODULES.payroll,
  MY_REQUEST_MODULES.attendance,
  MY_REQUEST_MODULES.promotion,
  MY_REQUEST_MODULES.documents,
];

export function parseMyRequestModule(value: string | undefined): MyRequestModuleId | null {
  if (
    value === "payroll" ||
    value === "attendance" ||
    value === "promotion" ||
    value === "documents"
  ) {
    return value;
  }
  return null;
}
