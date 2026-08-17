export type Department = {
  code: string;
  name: string;
  description: string;
  head: string;
  staff: number;
  openRequisitions: number;
  budget: number;
  /** Numeric id in the backend `departments` table (Core HCM). */
  dbId?: number;
};

export const departments: Department[] = [
  {
    code: "DEP-FO",
    name: "Front Office",
    description: "Front Desk, Concierge, Reservations, Guest Services",
    head: "Ana Ramos",
    staff: 14,
    openRequisitions: 3,
    budget: 2800000,
    dbId: 1,
  },
  {
    code: "DEP-FB",
    name: "Food & Beverage",
    description: "Dining Room, Bar Operations, Room Service",
    head: "Chef Gabriel Mendoza",
    staff: 22,
    openRequisitions: 6,
    budget: 3500000,
    dbId: 2,
  },
  {
    code: "DEP-KC",
    name: "Kitchen / Culinary",
    description: "Main Hotel Kitchen, Banquet Catering, Pastry",
    head: "Executive Chef Marco",
    staff: 19,
    openRequisitions: 4,
    budget: 4200000,
    dbId: 3,
  },
  {
    code: "DEP-HK",
    name: "Housekeeping",
    description: "Guestroom Operations, Linen & Laundry, Public Areas",
    head: "Lourdes Bautista",
    staff: 25,
    openRequisitions: 5,
    budget: 2400000,
    dbId: 4,
  },
  {
    code: "DEP-HR",
    name: "Administration / HR",
    description: "Human Resources, Accounting, General Maintenance",
    head: "Juan Dela Cruz",
    staff: 9,
    openRequisitions: 1,
    budget: 3100000,
    dbId: 5,
  },
];

export type Position = {
  id: string;
  title: string;
  department: string;
  level: "Rank & File" | "Supervisory" | "Managerial" | "Executive";
  headcount: number;
  filled: number;
  salaryBand: string;
  /** Numeric id in the backend `positions` table (Core HCM). */
  dbId?: number;
};

export const positions: Position[] = [
  {
    id: "POS-001",
    title: "Front Desk Receptionist",
    department: "Front Office",
    level: "Rank & File",
    headcount: 8,
    filled: 5,
    salaryBand: "₱18,000 – ₱22,000",
    dbId: 1,
  },
  {
    id: "POS-002",
    title: "Guest Relations Officer",
    department: "Front Office",
    level: "Supervisory",
    headcount: 3,
    filled: 3,
    salaryBand: "₱25,000 – ₱30,000",
    dbId: 2,
  },
  {
    id: "POS-003",
    title: "Restaurant Server",
    department: "Food & Beverage",
    level: "Rank & File",
    headcount: 12,
    filled: 8,
    salaryBand: "₱15,000 – ₱18,000",
    dbId: 3,
  },
  {
    id: "POS-004",
    title: "Bartender",
    department: "Food & Beverage",
    level: "Rank & File",
    headcount: 4,
    filled: 2,
    salaryBand: "₱16,000 – ₱19,000",
    dbId: 4,
  },
  {
    id: "POS-005",
    title: "Line Cook",
    department: "Kitchen / Culinary",
    level: "Rank & File",
    headcount: 10,
    filled: 6,
    salaryBand: "₱16,000 – ₱20,000",
    dbId: 5,
  },
  {
    id: "POS-006",
    title: "Pastry Chef",
    department: "Kitchen / Culinary",
    level: "Supervisory",
    headcount: 2,
    filled: 2,
    salaryBand: "₱32,000 – ₱38,000",
    dbId: 6,
  },
  {
    id: "POS-007",
    title: "Housekeeping Attendant",
    department: "Housekeeping",
    level: "Rank & File",
    headcount: 18,
    filled: 13,
    salaryBand: "₱14,000 – ₱17,000",
    dbId: 7,
  },
  {
    id: "POS-008",
    title: "HR Assistant",
    department: "Administration / HR",
    level: "Rank & File",
    headcount: 3,
    filled: 2,
    salaryBand: "₱20,000 – ₱25,000",
    dbId: 8,
  },
];

export type OrgNode = {
  name: string;
  title: string;
  children?: OrgNode[];
};

export const orgChart: OrgNode = {
  name: "Ricardo Villanueva",
  title: "General Manager",
  children: [
    {
      name: "Juan Dela Cruz",
      title: "HR & Administration Manager",
      children: [
        { name: "Maria Lim", title: "HR Officer" },
        { name: "Paolo Cruz", title: "Accounting Supervisor" },
      ],
    },
    {
      name: "Ana Ramos",
      title: "Front Office Manager",
      children: [
        { name: "Camille Ortega", title: "Guest Relations Officer" },
        { name: "Bianca Soriano", title: "Front Desk Receptionist" },
      ],
    },
    {
      name: "Chef Gabriel Mendoza",
      title: "F&B Director",
      children: [
        { name: "Executive Chef Marco", title: "Executive Chef" },
        { name: "Kevin Dela Cruz", title: "Line Cook" },
      ],
    },
    {
      name: "Lourdes Bautista",
      title: "Executive Housekeeper",
      children: [{ name: "Rosa Aquino", title: "Floor Supervisor" }],
    },
  ],
};

export type NewHire = {
  id: string;
  dbId?: number;
  name: string;
  position: string;
  department: string;
  stage: "Pre-onboarding" | "Probationary" | "Regular";
  startDate: string;
  initials: string;
  checklist: {
    item: string;
    done: boolean;
    /** Database onboarding item id — used to persist toggles via the API. */
    dbId?: number;
    /** Which stage's checklist template the item belongs to. */
    phase?: "Pre-onboarding" | "Probationary";
  }[];
  email: string;
  phone: string;
};

/** Checklist request raised for a probationary hire's evaluation cycle. */
export type ChecklistRequest = {
  id: string;
  employee: string;
  position: string;
  department: string;
  requestedAt: string;
  notes: string;
  items: string[];
  status: "Open" | "Checklist created";
};

export const checklistRequests: ChecklistRequest[] = [
  {
    id: "CR-001",
    employee: "Miguel Torres",
    position: "Front Desk Receptionist",
    department: "Front Office",
    requestedAt: "2026-08-04",
    notes:
      "Please include guest-handling scenarios and PMS proficiency checks before the 3rd month review. Supervisor sign-off required for each item.",
    items: [],
    status: "Open",
  },
  {
    id: "CR-002",
    employee: "Andrea Lim",
    position: "Housekeeping Attendant",
    department: "Housekeeping",
    requestedAt: "2026-08-06",
    notes:
      "Add room-turnover timing and chemical-handling safety items. Needed for the 5th month evaluation window.",
    items: [],
    status: "Open",
  },
];

export const newHires: NewHire[] = [
  {
    id: "NH-01",
    name: "Camille Ortega",
    position: "Guest Relations Officer",
    department: "Front Office",
    stage: "Pre-onboarding",
    startDate: "2026-08-04",
    initials: "CO",
    email: "camille.ortega@email.com",
    phone: "0917 664 2219",
    checklist: [
      { item: "Signed employment contract", done: true },
      { item: "NBI / Police clearance", done: true },
      { item: "Pre-employment medical exam", done: false },
      { item: "SSS / PhilHealth / Pag-IBIG / TIN", done: false },
      { item: "Birth certificate (PSA)", done: false },
      { item: "Company orientation attended", done: false },
      { item: "Uniform & ID issued", done: false },
      { item: "Department on-the-job training", done: false },
    ],
  },
  {
    id: "NH-02",
    name: "Bianca Soriano",
    position: "Front Desk Receptionist",
    department: "Front Office",
    stage: "Pre-onboarding",
    startDate: "2026-08-04",
    initials: "BS",
    email: "bianca.soriano@email.com",
    phone: "0912 345 6789",
    checklist: [
      { item: "Signed employment contract", done: true },
      { item: "NBI / Police clearance", done: true },
      { item: "Pre-employment medical exam", done: true },
      { item: "SSS / PhilHealth / Pag-IBIG / TIN", done: true },
      { item: "Birth certificate (PSA)", done: true },
      { item: "Company orientation attended", done: false },
      { item: "Uniform & ID issued", done: false },
      { item: "Department on-the-job training", done: false },
    ],
  },
  {
    id: "NH-03",
    name: "Kevin Dela Cruz",
    position: "Line Cook",
    department: "Kitchen / Culinary",
    stage: "Probationary",
    startDate: "2026-04-15",
    initials: "KDC",
    email: "kevin.delacruz@email.com",
    phone: "0921 774 9903",
    checklist: [
      { item: "Signed employment contract", done: true },
      { item: "NBI / Police clearance", done: true },
      { item: "Pre-employment medical exam", done: true },
      { item: "SSS / PhilHealth / Pag-IBIG / TIN", done: true },
      { item: "Birth certificate (PSA)", done: true },
      { item: "Company orientation attended", done: true },
      { item: "Uniform & ID issued", done: true },
      { item: "Department on-the-job training", done: false },
    ],
  },
  {
    id: "NH-04",
    name: "Jompaks Berdugo",
    position: "Bartender",
    department: "Food & Beverage",
    stage: "Probationary",
    startDate: "2026-03-01",
    initials: "JB",
    email: "jompaks.berdugo@email.com",
    phone: "0933 552 1180",
    checklist: [
      { item: "Signed employment contract", done: true },
      { item: "NBI / Police clearance", done: true },
      { item: "Pre-employment medical exam", done: true },
      { item: "SSS / PhilHealth / Pag-IBIG / TIN", done: true },
      { item: "Birth certificate (PSA)", done: true },
      { item: "Company orientation attended", done: true },
      { item: "Uniform & ID issued", done: true },
      { item: "Department on-the-job training", done: true },
    ],
  },
  {
    id: "NH-05",
    name: "Marjun Devera",
    position: "Restaurant Server",
    department: "Food & Beverage",
    stage: "Regular",
    startDate: "2025-09-16",
    initials: "MD",
    email: "marjun.devera@email.com",
    phone: "0917 664 2219",
    checklist: [
      { item: "Signed employment contract", done: true },
      { item: "NBI / Police clearance", done: true },
      { item: "Pre-employment medical exam", done: true },
      { item: "SSS / PhilHealth / Pag-IBIG / TIN", done: true },
      { item: "Birth certificate (PSA)", done: true },
      { item: "Company orientation attended", done: true },
      { item: "Uniform & ID issued", done: true },
      { item: "Regularization evaluation passed", done: true },
    ],
  },
  {
    id: "NH-06",
    name: "Angelo Torres",
    position: "Front Desk Receptionist",
    department: "Front Office",
    stage: "Probationary",
    startDate: "2026-05-11",
    initials: "AT",
    email: "angelo.torres@email.com",
    phone: "0917 220 5541",
    checklist: [
      { item: "Department orientation completed", done: true },
      { item: "Job description acknowledged", done: true },
      { item: "1st month performance evaluation", done: true },
      { item: "3rd month performance evaluation", done: false },
      { item: "5th month performance evaluation", done: false },
      { item: "Training hours completed", done: false },
    ],
  },
  {
    id: "NH-07",
    name: "Ligaya Santos",
    position: "Housekeeping Attendant",
    department: "Housekeeping",
    stage: "Probationary",
    startDate: "2026-02-20",
    initials: "LS",
    email: "ligaya.santos@email.com",
    phone: "0918 663 2201",
    checklist: [
      { item: "Department orientation completed", done: true },
      { item: "Job description acknowledged", done: true },
      { item: "1st month performance evaluation", done: true },
      { item: "3rd month performance evaluation", done: true },
      { item: "5th month performance evaluation", done: false },
      { item: "Training hours completed", done: false },
    ],
  },
  {
    id: "NH-08",
    name: "Michael Reyes",
    position: "HR Assistant",
    department: "Administration / HR",
    stage: "Probationary",
    startDate: "2026-06-01",
    initials: "MR",
    email: "michael.reyes@email.com",
    phone: "0920 441 8873",
    checklist: [
      { item: "Department orientation completed", done: true },
      { item: "Job description acknowledged", done: false },
      { item: "1st month performance evaluation", done: false },
      { item: "3rd month performance evaluation", done: false },
      { item: "5th month performance evaluation", done: false },
      { item: "Training hours completed", done: false },
    ],
  },
  {
    id: "NH-09",
    name: "Patricia Gomez",
    position: "Pastry Chef",
    department: "Kitchen / Culinary",
    stage: "Regular",
    startDate: "2025-06-02",
    initials: "PG",
    email: "patricia.gomez@email.com",
    phone: "0917 903 2245",
    checklist: [
      { item: "Regularization contract signed", done: true },
      { item: "HMO enrollment submitted", done: true },
      { item: "Leave credits activated", done: true },
      { item: "Performance goals set", done: true },
    ],
  },
  {
    id: "NH-10",
    name: "Ernesto Villar",
    position: "Housekeeping Attendant",
    department: "Housekeeping",
    stage: "Regular",
    startDate: "2025-03-19",
    initials: "EV",
    email: "ernesto.villar@email.com",
    phone: "0921 556 7743",
    checklist: [
      { item: "Regularization contract signed", done: true },
      { item: "HMO enrollment submitted", done: true },
      { item: "Leave credits activated", done: true },
      { item: "Performance goals set", done: true },
    ],
  },
  {
    id: "NH-11",
    name: "Grace Panganiban",
    position: "Guest Relations Officer",
    department: "Front Office",
    stage: "Regular",
    startDate: "2025-11-10",
    initials: "GP",
    email: "grace.panganiban@email.com",
    phone: "0917 332 8890",
    checklist: [
      { item: "Regularization contract signed", done: true },
      { item: "HMO enrollment submitted", done: true },
      { item: "Leave credits activated", done: true },
      { item: "Performance goals set", done: false },
    ],
  },
  {
    id: "NH-12",
    name: "Noel Fajardo",
    position: "HR Assistant",
    department: "Administration / HR",
    stage: "Regular",
    startDate: "2025-01-27",
    initials: "NF",
    email: "noel.fajardo@email.com",
    phone: "0918 774 3320",
    checklist: [
      { item: "Regularization contract signed", done: true },
      { item: "HMO enrollment submitted", done: true },
      { item: "Leave credits activated", done: true },
      { item: "Performance goals set", done: true },
    ],
  },
];

export type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  employmentType: "Regular" | "Probationary" | "Contractual";
  dateHired: string;
  email: string;
  phone: string;
  supervisor: string;
  status: "Active" | "Probationary" | "Regular" | "Promoted" | "Resigned" | "Retired" | "Terminated" | "Inactive";
  salaryGrade?: string;
  promotionHistory?: Array<{
    date: string;
    oldPosition: string;
    newPosition: string;
    oldSalaryGrade: string;
    newSalaryGrade: string;
    notes: string;
  }>;
  exitDetails?: {
    exitType: "Resigned" | "Retired" | "Terminated";
    exitDate: string;
    clearanceStatus: "Pending" | "Cleared";
    coeStatus: "Pending" | "Issued";
    notes: string;
  };
};

export const employees: Employee[] = [
  {
    id: "EMP-0001",
    name: "Ana Ramos",
    position: "Front Office Manager",
    department: "Front Office",
    employmentType: "Regular",
    dateHired: "2019-02-11",
    email: "ana.ramos@oxfordsuites.com.ph",
    phone: "0917 100 1001",
    supervisor: "Ricardo Villanueva",
    status: "Active",
  },
  {
    id: "EMP-0002",
    name: "Chef Gabriel Mendoza",
    position: "F&B Director",
    department: "Food & Beverage",
    employmentType: "Regular",
    dateHired: "2018-06-04",
    email: "gabriel.mendoza@oxfordsuites.com.ph",
    phone: "0917 100 1002",
    supervisor: "Ricardo Villanueva",
    status: "Active",
  },
  {
    id: "EMP-0003",
    name: "Lourdes Bautista",
    position: "Executive Housekeeper",
    department: "Housekeeping",
    employmentType: "Regular",
    dateHired: "2017-11-20",
    email: "lourdes.bautista@oxfordsuites.com.ph",
    phone: "0917 100 1003",
    supervisor: "Ricardo Villanueva",
    status: "Active",
  },
  {
    id: "EMP-0004",
    name: "Camille Ortega",
    position: "Guest Relations Officer",
    department: "Front Office",
    employmentType: "Probationary",
    dateHired: "2026-08-04",
    email: "camille.ortega@oxfordsuites.com.ph",
    phone: "0917 664 2219",
    supervisor: "Ana Ramos",
    status: "Active",
  },
  {
    id: "EMP-0005",
    name: "Kevin Dela Cruz",
    position: "Line Cook",
    department: "Kitchen / Culinary",
    employmentType: "Probationary",
    dateHired: "2026-04-15",
    email: "kevin.delacruz@oxfordsuites.com.ph",
    phone: "0921 774 9903",
    supervisor: "Executive Chef Marco",
    status: "Active",
  },
  {
    id: "EMP-0006",
    name: "Marjun Devera",
    position: "Restaurant Server",
    department: "Food & Beverage",
    employmentType: "Regular",
    dateHired: "2025-09-16",
    email: "marjun.devera@oxfordsuites.com.ph",
    phone: "0917 664 2219",
    supervisor: "Chef Gabriel Mendoza",
    status: "Active",
  },
  {
    id: "EMP-0007",
    name: "Juan Dela Cruz",
    position: "HR & Administration Manager",
    department: "Administration / HR",
    employmentType: "Regular",
    dateHired: "2016-01-18",
    email: "juan.delacruz@oxfordsuites.com.ph",
    phone: "0917 100 1007",
    supervisor: "Ricardo Villanueva",
    status: "Active",
  },
  {
    id: "EMP-0008",
    name: "Rosa Aquino",
    position: "Floor Supervisor",
    department: "Housekeeping",
    employmentType: "Regular",
    dateHired: "2021-05-03",
    email: "rosa.aquino@oxfordsuites.com.ph",
    phone: "0917 100 1008",
    supervisor: "Lourdes Bautista",
    status: "Active",
  },
];

export type SalaryGrade = {
  id: string;
  code: string;
  title: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  level: "Rank & File" | "Supervisory" | "Managerial" | "Executive";
  notes?: string;
};

export const salaryGrades: SalaryGrade[] = [
  {
    id: "SG-01",
    code: "SG-01",
    title: "Entry Rank & File",
    minSalary: 14000,
    maxSalary: 17000,
    currency: "PHP",
    level: "Rank & File",
    notes: "Housekeeping attendants, utility crew",
  },
  {
    id: "SG-05",
    code: "SG-05",
    title: "Standard Rank & File",
    minSalary: 18000,
    maxSalary: 22000,
    currency: "PHP",
    level: "Rank & File",
    notes: "Front desk receptionist, line cooks",
  },
  {
    id: "SG-08",
    code: "SG-08",
    title: "Senior Rank & File",
    minSalary: 22000,
    maxSalary: 26000,
    currency: "PHP",
    level: "Rank & File",
    notes: "HR assistant, senior receptionist",
  },
  {
    id: "SG-10",
    code: "SG-10",
    title: "Junior Supervisory",
    minSalary: 26000,
    maxSalary: 32000,
    currency: "PHP",
    level: "Supervisory",
    notes: "Floor supervisor, guest relations supervisor",
  },
  {
    id: "SG-12",
    code: "SG-12",
    title: "Senior Supervisory",
    minSalary: 32000,
    maxSalary: 40000,
    currency: "PHP",
    level: "Supervisory",
    notes: "Pastry chef supervisor, assistant manager",
  },
  {
    id: "SG-15",
    code: "SG-15",
    title: "Department Manager",
    minSalary: 45000,
    maxSalary: 60000,
    currency: "PHP",
    level: "Managerial",
    notes: "Front office manager, executive housekeeper",
  },
  {
    id: "SG-18",
    code: "SG-18",
    title: "Executive Director",
    minSalary: 65000,
    maxSalary: 90000,
    currency: "PHP",
    level: "Executive",
    notes: "F&B Director, HR Manager, GM",
  },
];

export type HR3Recommendation = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  currentType: "Probationary" | "Regular";
  recommendationType: "Regularization" | "Promotion" | "Performance Review";
  evaluationScore: number;
  evaluator: string;
  dateSubmitted: string;
  status: "Pending HR Action" | "Approved & Processed" | "Deferred";
  suggestedPosition?: string;
  suggestedSalaryGrade?: string;
  comments: string;
};

export const hr3Recommendations: HR3Recommendation[] = [
  {
    id: "HR3-REC-01",
    employeeId: "EMP-0004",
    employeeName: "Camille Ortega",
    department: "Front Office",
    currentType: "Probationary",
    recommendationType: "Regularization",
    evaluationScore: 94.8,
    evaluator: "Ana Ramos (Front Office Manager)",
    dateSubmitted: "2026-08-01",
    status: "Pending HR Action",
    suggestedPosition: "Guest Relations Officer",
    suggestedSalaryGrade: "SG-10 (₱26,000 – ₱32,000)",
    comments: "Exceeded guest satisfaction metrics during 6-month evaluation window. Highly recommended for full regularization.",
  },
  {
    id: "HR3-REC-02",
    employeeId: "EMP-0005",
    employeeName: "Kevin Dela Cruz",
    department: "Kitchen / Culinary",
    currentType: "Probationary",
    recommendationType: "Regularization",
    evaluationScore: 91.2,
    evaluator: "Chef Gabriel Mendoza (F&B Director)",
    dateSubmitted: "2026-07-28",
    status: "Pending HR Action",
    suggestedPosition: "Line Cook",
    suggestedSalaryGrade: "SG-05 (₱18,000 – ₱22,000)",
    comments: "Punctual, excellent culinary prep speed and kitchen hygiene compliance. Recommended for regularization.",
  },
  {
    id: "HR3-REC-03",
    employeeId: "EMP-0006",
    employeeName: "Marjun Devera",
    department: "Food & Beverage",
    currentType: "Regular",
    recommendationType: "Promotion",
    evaluationScore: 96.5,
    evaluator: "Chef Gabriel Mendoza",
    dateSubmitted: "2026-08-03",
    status: "Pending HR Action",
    suggestedPosition: "F&B Captain / Service Supervisor",
    suggestedSalaryGrade: "SG-10 (₱26,000 – ₱32,000)",
    comments: "Demonstrated strong leadership during banquet events. Passed succession planning assessment with distinction.",
  },
];

