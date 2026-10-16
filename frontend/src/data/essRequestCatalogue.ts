/**
 * Categorized request template for generated ESS requests.
 *
 * Each category maps to the only sub-items an employee may file — i.e. "just
 * the applicable documents" for the chosen category. This is the single source
 * of truth shared by the All-Requests tracker and the request-generation forms.
 */
export const REQUEST_CATEGORY_SUBTYPES: Record<string, string[]> = {
  Leave: ["Vacation", "Sick", "Emergency", "Maternity", "Paternity", "Solo Parent", "Bereavement"],
  Attendance: [
    "Time In Correction",
    "Missed Time Out",
    "Overtime Claim",
    "Rest Day Duty",
    "Official Business (OB)",
  ],
  "Career & Position": [
    "Promotion Request",
    "Lateral Transfer",
    "Job Reclassification",
    "Salary Grade Review",
  ],
  Payroll: [
    "Payroll Clarification",
    "Overtime Discrepancy",
    "Night Differential Claim",
    "Tax Withholding Clarification",
  ],
  "Payroll Update": ["Bank Account Update", "Tax Exemption Status Update", "Direct Deposit Update"],
  Loan: [
    "SSS Salary Loan",
    "Pag-IBIG Calamity Loan",
    "Company Emergency Loan",
    "Educational Assistance Loan",
  ],
  Reimbursement: [
    "Transportation",
    "Medical Reimbursement",
    "Meal Allowance Claim",
    "Official Expense / Travel",
  ],
  "HR Document": [
    "Certificate of Employment (with Salary)",
    "Certificate of Employment (without Salary)",
    "BIR Form 2316",
    "BIR Form 2316 (Certified Copy)",
    "Certificate of Compensation & Benefits",
    "Service Record",
    "Certificate of No Pending Administrative Case",
    "HMO Coverage Certificate",
    "Employment Contract Copy",
  ],
  "Personal Info": [
    "Address Update",
    "Emergency Contact Update",
    "Civil Status Update",
    "Dependent Registration",
  ],
  Account: ["Portal Password Reset", "Biometric ID Sync", "Email Address Update"],
};

/** All category names in display order. */
export const REQUEST_CATEGORY_NAMES = Object.keys(REQUEST_CATEGORY_SUBTYPES);

/** Applicable sub-items for a category (empty array when unknown). */
export function subtypesFor(category: string): string[] {
  return REQUEST_CATEGORY_SUBTYPES[category] ?? [];
}
