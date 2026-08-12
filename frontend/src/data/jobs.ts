export type JobStatus = "Open" | "Closed" | "Draft";

export type Job = {
  id: string;
  title: string;
  department: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Seasonal";
  schedule: string;
  salaryMin: number;
  salaryMax: number;
  vacancies: number;
  filled: number;
  posted: string;
  status: JobStatus;
  active: boolean;
  experience: "No Experience" | "1-2 Years" | "3-5 Years" | "5+ Years";
  education: "High School Graduate" | "Vocational / TESDA" | "College Level" | "Bachelor's Degree";
  summary: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  benefits: string[];
  applicants: number;
  platforms: string[];
};

export const jobs: Job[] = [
  {
    id: "front-desk-receptionist",
    title: "Front Desk Receptionist",
    department: "Front Office",
    employmentType: "Full-time",
    schedule: "Shifting Schedule",
    salaryMin: 18000,
    salaryMax: 22000,
    vacancies: 3,
    filled: 1,
    posted: "2026-05-22",
    status: "Open",
    active: true,
    experience: "1-2 Years",
    education: "Bachelor's Degree",
    summary:
      "Welcome guests, manage reservations, answer inquiries, and provide excellent customer service.",
    description:
      "We are looking for a friendly and professional Front Desk Receptionist to welcome guests, manage reservations, answer inquiries, and provide excellent customer service. The ideal candidate should have strong communication skills and be able to work in a fast-paced environment.",
    responsibilities: [
      "Welcome and assist hotel guests.",
      "Process check-in and check-out procedures.",
      "Manage room reservations.",
      "Handle guest inquiries and complaints professionally.",
      "Coordinate with housekeeping and other departments.",
      "Answer phone calls and emails.",
    ],
    qualifications: [
      "Bachelor's degree or College level in Hospitality Management or related field.",
      "Excellent communication and interpersonal skills.",
      "Basic computer skills.",
      "Customer service experience is an advantage.",
      "Willing to work shifts, weekends, and holidays.",
    ],
    skills: [
      "Customer Service",
      "Communication",
      "Hotel Operations",
      "Problem Solving",
      "Time Management",
    ],
    benefits: ["HMO", "Service Charge", "Paid Leave", "Meal Allowance", "Career Growth"],
    applicants: 42,
    platforms: ["Company Website", "Facebook", "Indeed"],
  },
  {
    id: "line-cook",
    title: "Line Cook",
    department: "Kitchen / Culinary",
    employmentType: "Full-time",
    schedule: "Shifting Schedule",
    salaryMin: 16000,
    salaryMax: 20000,
    vacancies: 4,
    filled: 2,
    posted: "2026-05-18",
    status: "Open",
    active: true,
    experience: "1-2 Years",
    education: "Vocational / TESDA",
    summary:
      "Prepare and cook menu items to standard, maintain station cleanliness and food safety compliance.",
    description:
      "The Line Cook prepares and plates dishes according to Oxford Suites Makati recipes and standards, maintains a clean and organized station, and observes HACCP food-safety practices at all times.",
    responsibilities: [
      "Prepare mise en place before each service.",
      "Cook and plate dishes to recipe standards.",
      "Maintain sanitation and food-safety compliance.",
      "Monitor inventory levels of station ingredients.",
      "Support banquet and room-service volume peaks.",
    ],
    qualifications: [
      "TESDA NC II in Cookery or equivalent culinary training.",
      "At least 1 year in a hotel or full-service restaurant kitchen.",
      "Valid food handler's certificate.",
      "Able to work under pressure during peak service.",
    ],
    skills: ["Food Safety", "HACCP", "Knife Skills", "Plating", "Teamwork"],
    benefits: ["HMO", "Service Charge", "Meal Allowance", "Uniform", "Training"],
    applicants: 31,
    platforms: ["Company Website", "Indeed"],
  },
  {
    id: "housekeeping-attendant",
    title: "Housekeeping Attendant",
    department: "Housekeeping",
    employmentType: "Full-time",
    schedule: "Shifting Schedule",
    salaryMin: 14000,
    salaryMax: 17000,
    vacancies: 5,
    filled: 3,
    posted: "2026-05-10",
    status: "Open",
    active: true,
    experience: "No Experience",
    education: "High School Graduate",
    summary:
      "Maintain guestroom cleanliness, linen turnover, and public-area presentation to brand standards.",
    description:
      "Housekeeping Attendants keep guestrooms and public areas immaculate, restock amenities, and report maintenance issues. Full training is provided for applicants with no prior hotel experience.",
    responsibilities: [
      "Clean and prepare assigned guestrooms daily.",
      "Replenish linens, towels, and amenities.",
      "Report maintenance and lost-and-found items.",
      "Maintain housekeeping cart and supplies.",
    ],
    qualifications: [
      "High School Graduate.",
      "Physically fit and detail-oriented.",
      "Willing to work shifts including weekends and holidays.",
    ],
    skills: ["Attention to Detail", "Time Management", "Room Turnover", "Safety"],
    benefits: ["HMO", "Service Charge", "Meal Allowance", "Uniform"],
    applicants: 27,
    platforms: ["Company Website", "Facebook"],
  },
  {
    id: "restaurant-server",
    title: "Restaurant Server",
    department: "Food & Beverage",
    employmentType: "Full-time",
    schedule: "Shifting Schedule",
    salaryMin: 15000,
    salaryMax: 18000,
    vacancies: 4,
    filled: 1,
    posted: "2026-05-20",
    status: "Open",
    active: true,
    experience: "No Experience",
    education: "High School Graduate",
    summary: "Deliver warm, accurate table service across the dining room and banquet operations.",
    description:
      "Restaurant Servers take orders, serve food and beverages, and ensure every guest leaves with a memorable dining experience at our all-day dining outlet.",
    responsibilities: [
      "Greet and seat guests warmly.",
      "Take and relay orders accurately to the kitchen.",
      "Serve food and beverages following service sequence.",
      "Handle billing and guest feedback.",
    ],
    qualifications: [
      "High School Graduate; hospitality training an advantage.",
      "Good communication skills in English and Filipino.",
      "Pleasant personality and grooming.",
    ],
    skills: ["Guest Service", "Upselling", "POS Systems", "Communication"],
    benefits: ["HMO", "Service Charge", "Meal Allowance", "Tips"],
    applicants: 24,
    platforms: ["Company Website", "Facebook", "Instagram"],
  },
  {
    id: "bartender",
    title: "Bartender",
    department: "Food & Beverage",
    employmentType: "Part-time",
    schedule: "Night Shift",
    salaryMin: 16000,
    salaryMax: 19000,
    vacancies: 2,
    filled: 0,
    posted: "2026-05-15",
    status: "Open",
    active: true,
    experience: "3-5 Years",
    education: "Vocational / TESDA",
    summary: "Craft classic and signature cocktails for the lobby lounge and rooftop bar.",
    description:
      "The Bartender prepares beverages to recipe, manages bar inventory, and creates a lively yet refined guest experience at the lounge.",
    responsibilities: [
      "Prepare cocktails and beverages to standard.",
      "Maintain bar cleanliness and inventory.",
      "Engage guests and recommend pairings.",
      "Observe responsible alcohol service.",
    ],
    qualifications: [
      "TESDA Bartending NC II or equivalent.",
      "At least 3 years bar experience in hotels or restaurants.",
      "Knowledge of classic and modern mixology.",
    ],
    skills: ["Mixology", "Inventory Control", "Guest Engagement", "Cash Handling"],
    benefits: ["HMO", "Service Charge", "Meal Allowance", "Night Differential"],
    applicants: 12,
    platforms: ["Company Website", "Instagram"],
  },
  {
    id: "hr-assistant",
    title: "HR Assistant",
    department: "Administration / HR",
    employmentType: "Full-time",
    schedule: "Day Shift",
    salaryMin: 20000,
    salaryMax: 25000,
    vacancies: 1,
    filled: 0,
    posted: "2026-05-08",
    status: "Open",
    active: false,
    experience: "1-2 Years",
    education: "Bachelor's Degree",
    summary: "Support recruitment, employee records, and HR document processing.",
    description:
      "The HR Assistant supports end-to-end recruitment coordination, 201-file maintenance, and employee request processing for the property.",
    responsibilities: [
      "Coordinate interview schedules with department heads.",
      "Maintain complete and accurate 201 files.",
      "Process COE and employment verification requests.",
      "Assist in new-hire onboarding documentation.",
    ],
    qualifications: [
      "Bachelor's degree in Psychology, HR, or related field.",
      "At least 1 year HR experience.",
      "Strong organizational and documentation skills.",
    ],
    skills: ["Recruitment", "Documentation", "MS Office", "Confidentiality"],
    benefits: ["HMO", "Paid Leave", "Career Growth", "Training"],
    applicants: 18,
    platforms: ["Company Website", "Indeed"],
  },
];

export function getJob(id: string) {
  return jobs.find((j) => j.id === id);
}

export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
