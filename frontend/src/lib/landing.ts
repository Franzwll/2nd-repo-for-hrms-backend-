import { useEffect, useState } from "react";
import { landingApi, type ApiLandingCompany, type ApiLandingJob } from "./api";

export interface LandingJob {
  id: string;
  title: string;
  department: string;
  employmentType: string;
  schedule: string;
  salaryMin: number;
  salaryMax: number;
  vacancies: number;
  filled: number;
  experience: string;
  education: string;
  summary: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  benefits: string[];
}

export function mapJob(j: ApiLandingJob): LandingJob {
  return {
    id: String(j.job_post_id),
    title: j.title,
    department: j.department_name ?? "",
    employmentType: j.employment_type ?? "",
    schedule: j.schedule ?? "",
    salaryMin: Number(j.salary_min) || 0,
    salaryMax: Number(j.salary_max) || 0,
    vacancies: j.vacancies ?? 0,
    filled: j.filled_count ?? 0,
    experience: j.experience_level ?? "",
    education: j.education_level ?? "",
    summary: j.summary ?? "",
    description: j.description ?? "",
    responsibilities: (j.responsibilities as any) ?? [],
    qualifications: (j.qualifications as any) ?? [],
    skills: (j.skills as any) ?? [],
    benefits: (j.benefits as any) ?? [],
  };
}

export interface LandingFacility {
  name: string;
  body: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface CompanyInfo {
  name: string;
  timezone: string;
  tagline: string;
  overview: string;
  mission: string;
  vision: string;
  values: string[];
  address: string;
  phone: string;
  email: string;
  hours: string;
  facilities: LandingFacility[];
  faqs: LandingFaq[];
  socials: string[];
}

export const FALLBACK_COMPANY: CompanyInfo = {
  name: "Oxford Suites Makati",
  timezone: "Asia/Manila",
  tagline: "Boutique hospitality, home to passionate people.",
  overview:
    "Oxford Suites Makati is a boutique hotel delivering warm Filipino hospitality in the heart of Makati. We invest in our people because they are the heart of every guest experience.",
  mission:
    "To provide outstanding service and create memorable experiences for every guest, while nurturing a workplace where every employee can grow and thrive.",
  vision:
    "To be the preferred boutique hotel in the Philippines, known for genuine care, consistency, and an engaged, empowered workforce.",
  values: ["Care", "Integrity", "Excellence", "Teamwork", "Hospitality"],
  address: "528 P. Burgos Street, Makati City, Metro Manila, Philippines 1210",
  phone: "+63 2 8888 8688",
  email: "hr@oxfordsuites.com.ph",
  hours: "24 Hours",
  facilities: [],
  faqs: [],
  socials: ["Facebook", "Instagram", "LinkedIn", "Indeed"],
};

function mapCompany(c: ApiLandingCompany): CompanyInfo {
  return {
    name: c.name,
    timezone: c.timezone,
    tagline: c.tagline,
    overview: c.about,
    mission: c.mission,
    vision: c.vision,
    values: c.values,
    address: c.address ?? FALLBACK_COMPANY.address,
    phone: c.phone ?? FALLBACK_COMPANY.phone,
    email: c.email ?? FALLBACK_COMPANY.email,
    hours: c.hours ?? FALLBACK_COMPANY.hours,
    facilities: c.facilities ?? [],
    faqs: c.faqs ?? [],
    socials: c.socials ?? FALLBACK_COMPANY.socials,
  };
}

export function useCompany(): { company: CompanyInfo; loading: boolean } {
  const [company, setCompany] = useState<CompanyInfo>(FALLBACK_COMPANY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    landingApi
      .company()
      .then((res) => {
        if (!cancelled) setCompany(mapCompany(res.data));
      })
      .catch(() => {
        // keep fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { company, loading };
}

export function useLandingJobs(): { jobs: LandingJob[]; loading: boolean } {
  const [jobs, setJobs] = useState<LandingJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    landingApi
      .jobs({ per_page: 100 })
      .then((res) => {
        if (!cancelled) setJobs(res.data.map(mapJob));
      })
      .catch(() => {
        if (!cancelled) setJobs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { jobs, loading };
}

export const VALUE_BODIES: Record<string, string> = {
  Care: "We treat every guest and teammate with genuine warmth and empathy, anticipating needs before they are spoken.",
  Integrity:
    "We act with honesty and accountability in every transaction, decision, and guest interaction.",
  Excellence:
    "We take pride in the details, continually raising the standard of service across the property.",
  Teamwork:
    "We succeed together — every department supports the other to deliver one seamless guest experience.",
  Hospitality:
    "We welcome every guest as family, carrying the Filipino tradition of gracious service.",
};

export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
