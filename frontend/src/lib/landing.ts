import { useEffect, useState } from "react";
import {
  landingApi,
  type ApiAnnouncement,
  type ApiLandingCompany,
  type ApiLandingJob,
} from "./api";
import {
  announcements as companyAnnouncements,
  company,
  facilities as companyFacilities,
  faqs as companyFaqs,
} from "@/data/company";

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
  additional: string[];
  instructions: string;
  about: string;
  benefits: string[];
  picture?: string | null;
}

export function mapJob(j: ApiLandingJob): LandingJob {
  // Backend may leak a JSON-encoded string (or null) for list fields when a
  // row was written without the model's array cast. Coerce everything to a
  // real string[] so the detail/list .map() renders never throw
  // "j.additional.map is not a function" and trip the root error boundary.
  const asList = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map((x) => String(x));
    if (typeof v === "string") {
      try {
        const decoded: unknown = JSON.parse(v);
        if (Array.isArray(decoded)) return decoded.map((x) => String(x));
      } catch {
        // not JSON — fall through
      }
      return v ? [v] : [];
    }
    return [];
  };
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
    responsibilities: asList(j.responsibilities),
    qualifications: asList(j.qualifications),
    skills: asList(j.skills),
    additional: asList(j.additional),
    instructions: j.instructions ?? "",
    about: j.about ?? "",
    benefits: asList(j.benefits),
    picture: j.picture_url ?? j.picture ?? null,
  };
}

export interface LandingFacility {
  name: string;
  body: string;
}

export interface LandingFaq {
  q: string;
  a: string;
  category?: string;
}

export interface LandingAnnouncement {
  id: string;
  title: string;
  body: string;
  date: string;
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
  name: company.name,
  timezone: "Asia/Manila",
  tagline: company.tagline,
  overview: company.overview,
  mission: company.mission,
  vision: company.vision,
  values: company.values.map((value) => value.title),
  address: company.address,
  phone: company.phone,
  email: company.email,
  hours: company.hours,
  facilities: companyFacilities,
  faqs: companyFaqs,
  socials: company.socials,
};

export const FALLBACK_ANNOUNCEMENTS: LandingAnnouncement[] = companyAnnouncements.map(
  (announcement, index) => ({
    id: `static-${index}`,
    title: announcement.title,
    body: announcement.body,
    date: announcement.date,
  }),
);

function mapAnnouncement(announcement: ApiAnnouncement): LandingAnnouncement {
  return {
    id: String(announcement.id ?? announcement.announcement_id),
    title: announcement.title,
    body: announcement.body,
    date: announcement.published_date ?? announcement.created_at ?? "",
  };
}

/** Prefer a non-empty API value, otherwise keep the bundled content. */
function text(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function mapCompany(c: ApiLandingCompany): CompanyInfo {
  return {
    name: text(c.name, FALLBACK_COMPANY.name),
    timezone: text(c.timezone, FALLBACK_COMPANY.timezone),
    tagline: text(c.tagline, FALLBACK_COMPANY.tagline),
    overview: text(c.about, FALLBACK_COMPANY.overview),
    mission: text(c.mission, FALLBACK_COMPANY.mission),
    vision: text(c.vision, FALLBACK_COMPANY.vision),
    values: c.values?.length ? c.values : FALLBACK_COMPANY.values,
    address: text(c.address, FALLBACK_COMPANY.address),
    phone: text(c.phone, FALLBACK_COMPANY.phone),
    email: text(c.email, FALLBACK_COMPANY.email),
    hours: text(c.hours, FALLBACK_COMPANY.hours),
    facilities: c.facilities?.length ? c.facilities : FALLBACK_COMPANY.facilities,
    faqs: c.faqs?.length ? c.faqs : FALLBACK_COMPANY.faqs,
    socials: c.socials?.length ? c.socials : FALLBACK_COMPANY.socials,
  };
}

export function useCompany(): { company: CompanyInfo; loading: boolean } {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(FALLBACK_COMPANY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    landingApi
      .company()
      .then((res) => {
        if (!cancelled) setCompanyInfo(mapCompany(res.data));
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

  return { company: companyInfo, loading };
}

export function useLandingJobs(): { jobs: LandingJob[]; loading: boolean } {
  const [jobs, setJobs] = useState<LandingJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    landingApi
      // Fetch enough rows that the landing count matches the Recruitment
      // postings count (backend paginates; 100 truncated large vacancy lists).
      .jobs({ per_page: 500 })
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

export function useAnnouncements(limit = 3): {
  announcements: LandingAnnouncement[];
  loading: boolean;
} {
  const [announcements, setAnnouncements] = useState<LandingAnnouncement[]>(FALLBACK_ANNOUNCEMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    landingApi
      .announcements({ per_page: limit })
      .then((res) => {
        if (!cancelled && res.data.length > 0) {
          setAnnouncements(res.data.map(mapAnnouncement));
        }
      })
      .catch(() => {
        // keep bundled announcements
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { announcements, loading };
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
  Warmth: "Every guest is welcomed like family, every colleague like a peer.",
  Craft: "Details are never incidental. Standards are practiced, not posted.",
  Growth: "We promote from within and invest in certification and training.",
};

export const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;
