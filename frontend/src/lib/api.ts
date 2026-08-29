/**
 * Centralized API client connecting the React frontend to the Laravel Backend API.
 */

import { clearSession, getToken } from "./auth";

const BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string) || "http://127.0.0.1:8000/api/v1";
export const API_BASE_URL = BASE_URL;

/* Lightweight GET cache: dedupes in-flight requests and caches responses for
   a short TTL so overlapping module fetches don't hit the server repeatedly. */
const GET_CACHE_TTL_MS = 15_000;
const getCache = new Map<string, { expiresAt: number; promise: Promise<any> }>();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (typeof window !== "undefined") {
    headers["X-Current-Url"] = window.location.href;
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const doFetch = async (): Promise<T> => {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        clearSession();
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/otp")
        ) {
          window.location.href = "/login";
        }
      }
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        // response wasn't JSON
      }
      const message =
        errorData?.message ||
        `Request failed with status ${response.status}: ${response.statusText}`;
      const error = new Error(message) as Error & {
        status?: number;
        errors?: Record<string, string[]>;
      };
      error.status = response.status;
      if (errorData?.errors) {
        error.errors = errorData.errors;
      }
      throw error;
    }

    // If 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  };

  const isGet = !options.method || options.method.toUpperCase() === "GET";
  if (!isGet) {
    // Any successful write invalidates the cached GET responses so read-after-write
    // in the same session reflects the new data immediately.
    const result = await doFetch();
    getCache.clear();
    return result;
  }

  const cached = getCache.get(url);
  if (cached) {
    if (cached.expiresAt > Date.now()) return cached.promise;
    getCache.delete(url);
  }

  const promise = doFetch().catch((err) => {
    getCache.delete(url);
    throw err;
  });
  getCache.set(url, { expiresAt: Date.now() + GET_CACHE_TTL_MS, promise });
  return promise;
}

/* ========================================================================= */
/* 1. APPLICANT MANAGEMENT                                                   */
/* ========================================================================= */

export interface ApiApplicant {
  applicant_id: number;
  applicant_code: string;
  job_post_id: number;
  name: string;
  email: string;
  phone: string | null;
  applied_at: string | null;
  fit_score: number | null;
  status: "fit" | "other-role" | "credential" | "not-fit";
  stage: "Screened" | "Interview Scheduled" | "Assessed" | "Offer" | "Hired" | "Rejected" | "Accepted";
  source: string | null;
  summary: string | null;
  flags_json: string[];
  resume_url: string | null;
  job_post?: {
    job_post_id: number;
    title: string;
    department?: string;
  };
  screening_entities?: { entity_id: number; label: string; value: string }[];
  screening_scores?: { score_id: number; criterion: string; score: number }[];
  latest_screening?: ApiScreening | null;
  interviews?: ApiInterview[];
  assessment?: ApiAssessment;
}

export interface ApiScreening {
  screening_id?: number;
  success?: boolean;
  processing_status: "PROCESSED" | "PARTIALLY_PROCESSED" | "FAILED" | "PENDING" | "PROCESSING";
  screening_result: "fit" | "other-role" | "credential" | "not-fit" | null;
  match_score: number | null;
  screening_status?: string;
  mandatory_requirements_met?: boolean;
  matched_summary?: string | null;
  entities?: { label: string; value: string; source?: string }[];
  sections_detected?: string[];
  requirements_applied?: Record<string, unknown>;
  text_extraction?: {
    method?: string;
    pages?: number | null;
    extension?: string;
    character_count?: number;
    warnings?: string[];
  };
  score_breakdown?: Record<
    string,
    {
      weight: number;
      earned: number;
      max: number;
      matched_required?: string[];
      missing_required?: string[];
      matched_preferred?: string[];
      missing_preferred?: string[];
      estimated_years?: number;
      min_years_required?: number;
      requirement_met?: boolean;
      required_level?: string;
      applicant_highest_level?: string[];
      matched?: string[];
      missing?: string[];
      no_requirements?: boolean;
    }
  >;
  profile?: {
    personal_information?: { name?: string | null; email?: string | null; phone?: string | null };
    education?: string[];
    work_experience?: { job_title?: string; period?: string | null; recognized_role?: boolean }[];
    skills?: string[];
    certifications?: string[];
    estimated_years_experience?: number;
    job_roles?: { recognized?: string[]; unrecognized?: string[] };
  };
  missing_information?: string[];
  validation?: {
    invalid_format?: string[];
    skill_analysis?: { recognized?: string[]; unrecognized?: string[] };
    job_role_analysis?: { recognized?: string[]; unrecognized?: string[] };
    credential_analysis?: Record<string, unknown>[];
    credential_issues?: { type: string; detail: string; note?: string }[];
    review_flags?: Record<string, unknown>[];
  };
  alternative_job?: {
    job_post_id?: number;
    title?: string;
    alternative_match_score?: number;
    applied_job_score?: number;
    matched_skills?: string[];
    reason?: string;
  } | null;
  reasons?: string[];
  model_info?: { base_model?: string; custom_ner_loaded?: boolean } | null;
  error_message?: string | null;
  processed_at?: string | null;
}

export interface ApiScreeningPreview extends ApiScreening {
  success: boolean;
}

export interface ApiInterview {
  interview_id: number;
  interview_code: string;
  applicant_id: number;
  scheduled_date: string;
  scheduled_time: string;
  mode: "On-site" | "Virtual";
  interviewer_employee_id: number | null;
  interviewer_name: string | null;
  status: "Scheduled" | "Completed" | "No Show";
  applicant?: {
    applicant_id: number;
    applicant_code: string;
    name: string;
    email?: string;
    phone?: string;
    position?: string;
    department?: string;
    stage?: string;
    fit_score?: number | null;
  } | null;
}

export interface ApiAssessment {
  assessment_id: number;
  applicant_id: number;
  assessor_user_id: number | null;
  assessment_date: string;
  scores_json: Record<string, number>;
  total_score: number | null;
  outcome: "Recommended" | "Hold" | "Not Recommended";
  remarks: string | null;
  applicant?: {
    applicant_id: number;
    applicant_code: string;
    name: string;
    position?: string;
    department?: string;
    stage?: string;
  } | null;
}

export function resolveStorageUrl(value: string | null): string | null {
  if (!value) return null;
  const origin = new URL(BASE_URL).origin;
  try {
    const normalized = value.replace(/\\/g, "/").replace(/^\.\//, "");
    const u = new URL(normalized, origin);
    return `${origin}${u.pathname}${u.search}`;
  } catch {
    return value.replace(/\\/g, "/");
  }
}

export const applicantsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiApplicant[]; meta: any }>(`/applicants${qs ? `?${qs}` : ""}`);
  },
  get: (id: number | string) => request<ApiApplicant>(`/applicants/${id}`),
  create: (formData: FormData | Record<string, any>) => {
    const isForm = formData instanceof FormData;
    return request<ApiApplicant>("/applicants", {
      method: "POST",
      body: isForm ? formData : JSON.stringify(formData),
    });
  },
  update: (id: number | string, data: FormData | Record<string, any>) => {
    const isForm = data instanceof FormData;
    if (isForm) {
      // PHP never populates $_POST for raw multipart PUT bodies, so Laravel
      // sees an empty request. Send POST with a _method=PUT override field —
      // the standard Laravel pattern for multipart updates.
      data.append('_method', 'PUT');
    }
    return request<ApiApplicant>(`/applicants/${id}`, {
      method: isForm ? "POST" : "PUT",
      body: isForm ? data : JSON.stringify(data),
    });
  },
  delete: (id: number | string) => request<{ message: string }>(`/applicants/${id}`, { method: 'DELETE' }),
  hire: (id: number | string) => request<ApiApplicant>(`/applicants/${id}/hire`, { method: 'POST' }),
  stats: () => request<any>('/applicants/stats'),
  extractResume: (formData: FormData) =>
    request<{
      success: boolean;
      processing_status?: string | null;
      personal_information?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
      };
      error_message?: string;
    }>('/applicants/extract-resume', {
      method: 'POST',
      body: formData,
    }),
  screenResume: (formData: FormData) =>
    request<ApiScreeningPreview>('/applicants/screen-resume', {
      method: 'POST',
      body: formData,
    }),
  getScreening: (id: number | string) =>
    request<{ data: ApiScreening }>(`/applicants/${id}/screening`),
  createAssessment: (applicantId: number | string, data: Record<string, any>) =>
    request<ApiAssessment>(`/applicants/${applicantId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const assessmentsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiAssessment[]; meta: any }>(`/assessments${qs ? `?${qs}` : ''}`);
  },
};

export interface ApiScreeningReference {
  ref_id: number;
  data_type: "skill" | "job_role" | "certification";
  canonical_value: string;
  aliases_json: string[] | null;
  active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ScreeningReferencePayload = {
  data_type: ApiScreeningReference["data_type"];
  canonical_value: string;
  aliases_json?: string[];
  active?: boolean;
};

/** DB-managed spaCy screening vocabulary (skills / job roles / certifications + aliases). */
export const screeningApi = {
  referenceData: {
    /** Grouped {skills, job_roles, certifications} mapping actually sent to the NLP service. */
    mapping: () =>
      request<{
        success: boolean;
        data: Record<"skills" | "job_roles" | "certifications", Record<string, string[]>>;
        meta: { counts: Record<string, number> };
      }>("/screening/reference-data"),
    list: (params?: { data_type?: string; search?: string }) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ success: boolean; data: ApiScreeningReference[]; meta: any }>(
        `/screening/reference-data/list${qs ? `?${qs}` : ""}`,
      );
    },
    create: (payload: ScreeningReferencePayload) =>
      request<{ success: boolean; data: ApiScreeningReference; message: string }>(
        "/screening/reference-data",
        { method: "POST", body: JSON.stringify(payload) },
      ),
    update: (id: number, payload: ScreeningReferencePayload) =>
      request<{ success: boolean; data: ApiScreeningReference; message: string }>(
        `/screening/reference-data/${id}`,
        { method: "PUT", body: JSON.stringify(payload) },
      ),
    remove: (id: number) =>
      request<{ success: boolean; message: string }>(`/screening/reference-data/${id}`, {
        method: "DELETE",
      }),
    toggleActive: (id: number) =>
      request<{ success: boolean; data: ApiScreeningReference }>(
        `/screening/reference-data/${id}/toggle`,
        { method: "PATCH" },
      ),
  },
};

export const interviewsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiInterview[]; meta: any }>(`/interviews${qs ? `?${qs}` : ""}`);
  },
  create: (data: Record<string, any>) =>
    request<ApiInterview>("/interviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiInterview>(`/interviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/interviews/${id}`, { method: "DELETE" }),
};

/* ========================================================================= */
/* 2. RECRUITMENT MANAGEMENT                                                 */
/* ========================================================================= */

export interface ApiJobPost {
  job_post_id: number;
  slug: string;
  title: string;
  department_id: number;
  department?: string;
  position_id: number | null;
  employment_type: "Full-time" | "Part-time" | "Contract" | "Seasonal";
  schedule: string | null;
  salary_min: number | null;
  salary_max: number | null;
  vacancies: number;
  filled_count: number;
  posted_date: string | null;
  status: "Open" | "Closed" | "Draft";
  active: boolean;
  experience_level: string | null;
  education_level: string | null;
  summary: string | null;
  description: string | null;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  platforms?: string[];
  picture: string | null;
  picture_url: string | null;
  applicants_count?: number;
}

export interface ApiRequisition {
  requisition_id: number;
  requisition_code: string;
  position_id: number | null;
  position_title: string | null;
  department_id: number;
  department?: string;
  requested_by_user_id: number | null;
  requested_count: number;
  urgency: "Normal" | "High" | "Urgent" | "Low";
  justification: string;
  status: "Pending" | "Done" | "Converted";
  requested_at: string;
  converted_job_post_id: number | null;
}

export const jobPostsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiJobPost[]; meta: any }>(`/job-posts${qs ? `?${qs}` : ""}`);
  },
  get: (id: number | string) => request<ApiJobPost>(`/job-posts/${id}`),
  create: (data: FormData | Record<string, any>) => {
    const isForm = data instanceof FormData;
    return request<ApiJobPost>('/job-posts', {
      method: 'POST',
      body: isForm ? data : JSON.stringify(data),
    });
  },
  update: (id: number | string, data: FormData | Record<string, any>) => {
    const isForm = data instanceof FormData;
    if (isForm) {
      // PHP never populates $_POST for raw multipart PUT bodies, so Laravel
      // sees an empty request. Send POST with a _method=PUT override field —
      // the standard Laravel pattern for multipart updates.
      data.append('_method', 'PUT');
    }
    return request<ApiJobPost>(`/job-posts/${id}`, {
      method: isForm ? 'POST' : 'PUT',
      body: isForm ? data : JSON.stringify(data),
    });
  },
  delete: (id: number | string) =>
    request<{ message: string }>(`/job-posts/${id}`, { method: "DELETE" }),
  toggle: (id: number | string) =>
    request<ApiJobPost>(`/job-posts/${id}/toggle`, { method: "PATCH" }),
  publish: (id: number | string, platforms: string[]) =>
    request<ApiJobPost>(`/job-posts/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ platforms }),
    }),
  stats: () => request<any>("/job-posts/stats"),
};

export const requisitionsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiRequisition[]; meta: any }>(`/requisitions${qs ? `?${qs}` : ""}`);
  },
  get: (id: number | string) => request<ApiRequisition>(`/requisitions/${id}`),
  create: (data: Record<string, any>) =>
    request<ApiRequisition>("/requisitions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiRequisition>(`/requisitions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  convert: (id: number | string, jobPostId?: number) =>
    request<ApiRequisition>(`/requisitions/${id}/convert`, {
      method: "POST",
      body: JSON.stringify({ job_post_id: jobPostId }),
    }),
};

export interface ApiDepartment {
  department_id: number;
  code: string;
  name: string;
  description: string | null;
  positions_count?: number;
}

export interface ApiPosition {
  position_id: number;
  position_code: string;
  title: string;
  department_id: number;
  department?: string | null;
  level: string;
  headcount: number;
  filled_count: number;
}

/** Core HCM lookups — departments & positions live in the database. */
export const coreHcmApi = {
  departments: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiDepartment[]; meta: any }>(`/departments${qs ? `?${qs}` : ''}`);
  },
  createDepartment: (data: Record<string, any>) =>
    request<ApiDepartment>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  positions: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiPosition[]; meta: any }>(`/positions${qs ? `?${qs}` : ''}`);
  },
  createPosition: (data: Record<string, any>) =>
    request<ApiPosition>('/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/* ========================================================================= */
/* 3. NEW HIRE ONBOARDING                                                    */
/* ========================================================================= */

export interface ApiNewHire {
  new_hire_id: number;
  new_hire_code: string;
  applicant_id: number | null;
  employee_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  position_id: number | null;
  department_id: number | null;
  department?: string;
  position?: string;
  stage: "Pre-onboarding" | "Probationary" | "Regular";
  start_date: string;
  completion_percent?: number;
  onboarding_items?: {
    employee_onboarding_item_id: number | null;
    item_text: string;
    instructions?: string | null;
    requires_upload?: boolean;
    upload_placeholder?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    file_url?: string | null;
    notes?: string | null;
    done: boolean;
    completed_at: string | null;
    template_item_id: number | null;
    phase: string;
  }[];
}

export interface ApiChecklistTemplate {
  template_id: number;
  template_code: string;
  title: string;
  phase: "Pre-onboarding" | "Onboarding" | "Probationary" | "Regular";
  position_scope: string[];
  status: "Active" | "Inactive";
  items_count?: number;
  items?: {
    template_item_id: number;
    item_text: string;
    instructions?: string | null;
    requires_upload?: boolean;
    upload_placeholder?: string | null;
    sort_order: number;
  }[];
}

export interface ApiChecklistRequest {
  checklist_request_id: number;
  request_code: string;
  employee_id: number;
  template_id: number | null;
  template_title?: string;
  phase: string;
  items_json: string[];
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  requested_by_user_id: number | null;
  requested_at: string;
}

export const newHiresApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiNewHire[]; meta: any }>(`/new-hires${qs ? `?${qs}` : ""}`);
  },
  get: (id: number | string) => request<ApiNewHire>(`/new-hires/${id}`),
  create: (data: Record<string, any>) =>
    request<ApiNewHire>("/new-hires", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiNewHire>(`/new-hires/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/new-hires/${id}`, { method: "DELETE" }),
  promoteStage: (id: number | string) =>
    request<ApiNewHire>(`/new-hires/${id}/promote-stage`, { method: "POST" }),
  stats: () => request<any>("/new-hires/stats"),
};

export const checklistTemplatesApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiChecklistTemplate[]; meta: any }>(
      `/checklist-templates${qs ? `?${qs}` : ""}`,
    );
  },
  get: (id: number | string) => request<ApiChecklistTemplate>(`/checklist-templates/${id}`),
  create: (data: Record<string, any>) =>
    request<ApiChecklistTemplate>("/checklist-templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiChecklistTemplate>(`/checklist-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/checklist-templates/${id}`, { method: 'DELETE' }),
  addItem: (templateId: number | string, item: { item_text: string; sort_order: number }) =>
    request<any>(`/checklist-templates/${templateId}/items`, {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updateItem: (
    itemId: number | string,
    item: Partial<{
      item_text: string;
      instructions?: string;
      requires_upload?: boolean;
      upload_placeholder?: string;
      sort_order: number;
    }>,
  ) =>
    request<any>(`/checklist-items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(item),
    }),
  deleteItem: (itemId: number | string) =>
    request<{ message: string }>(`/checklist-items/${itemId}`, { method: "DELETE" }),
};

export const onboardingItemsApi = {
  listForNewHire: (newHireId: number | string) =>
    request<any[]>(`/new-hires/${newHireId}/onboarding-items`),
  bulkCreate: (newHireId: number | string, templateId: number | string) =>
    request<any>(`/new-hires/${newHireId}/onboarding-items/bulk`, {
      method: "POST",
      body: JSON.stringify({ template_id: templateId }),
    }),
  materialize: (newHireId: number | string, templateItemId: number | string) =>
    request<{ employee_onboarding_item_id: number; template_item_id: number; item_text: string; done: boolean; phase: string }>(
      `/new-hires/${newHireId}/onboarding-items`,
      { method: 'POST', body: JSON.stringify({ template_item_id: templateItemId }) }
    ),
  toggle: (itemId: number | string, body?: { done: boolean }) =>
    request<{ employee_onboarding_item_id: number; done: boolean; completed_at: string | null }>(
      `/onboarding-items/${itemId}/toggle`,
      { method: 'PATCH', ...(body ? { body: JSON.stringify(body) } : {}) }
    ),
  upload: (itemId: number | string, formData: FormData) =>
    request<{
      employee_onboarding_item_id: number;
      file_path: string;
      file_name: string;
      file_url: string;
      notes?: string;
      submitted_at: string | null;
      done: boolean;
      completed_at: string | null;
      message: string;
    }>(`/onboarding-items/${itemId}/upload`, { method: "POST", body: formData }),
  /** Streams the employee's uploaded document from the backend — always
   *  accessible, independent of the public/storage symlink. */
  documentUrl: (itemId: number | string) =>
    `${BASE_URL}/onboarding-items/${itemId}/document`,
};

export const checklistRequestsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiChecklistRequest[]; meta: any }>(
      `/checklist-requests${qs ? `?${qs}` : ""}`,
    );
  },
  create: (data: Record<string, any>) =>
    request<ApiChecklistRequest>("/checklist-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  approve: (id: number | string) =>
    request<ApiChecklistRequest>(`/checklist-requests/${id}/approve`, { method: "POST" }),
  reject: (id: number | string) =>
    request<ApiChecklistRequest>(`/checklist-requests/${id}/reject`, { method: "POST" }),
};

/* ========================================================================= */
/* 4. SYSTEM SETTINGS                                                        */
/* ========================================================================= */

export interface ApiSystemSetting {
  setting_id: number;
  setting_key: string;
  setting_value: any;
  updated_by_user_id: number | null;
}

export interface ApiSystemUser {
  system_user_id: number;
  full_name: string;
  username: string;
  department_name: string | null;
}

export const settingsApi = {
  getAll: () => request<{ data: ApiSystemSetting[]; map: Record<string, any> }>("/settings"),
  get: (key: string) => request<ApiSystemSetting>(`/settings/${key}`),
  upsert: (key: string, value: any) =>
    request<ApiSystemSetting>(`/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ setting_value: value }),
    }),
  bulkUpsert: (settings: { key: string; value: any }[]) =>
    request<{ message: string; data: ApiSystemSetting[] }>("/settings/bulk", {
      method: "PATCH",
      body: JSON.stringify({ settings }),
    }),
  delete: (key: string) => request<{ message: string }>(`/settings/${key}`, { method: "DELETE" }),
  listSystemUsers: () => request<{ data: ApiSystemUser[] }>("/system-users"),
  resetDefaultPassword: (password: string) =>
    request<{ message: string; updated: number }>("/reset-default-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  listBackups: () => request<{ data: ApiBackupEntry[] }>("/settings/backups"),
  /** Creates a real database dump on the server and persists the entry. */
  createBackup: () =>
    request<{ message: string; backup: ApiBackupEntry; data: ApiBackupEntry[] }>(
      "/settings/backups",
      { method: "POST" },
    ),
  /** Downloads the .sql dump file for a backup entry. */
  downloadBackup: (id: string) => {
    window.open(
      `${BASE_URL}/settings/backups/${encodeURIComponent(id)}/download`,
      "_blank",
      "noopener",
    );
  },
  /** Rolls the database back to the selected snapshot. */
  restoreBackup: (id: string) =>
    request<{ message: string; data: ApiBackupEntry[] }>(
      `/settings/backups/${encodeURIComponent(id)}/restore`,
      { method: "POST" },
    ),
};

/* ========================================================================= */
/* 5. AUTH                                                                   */
/* ========================================================================= */

export interface ApiLoginResponse {
  message: string;
  login_token: string;
  expires_in: number;
  debug_otp: string;
  /** True when the user's role still requires OTP verification at /otp. */
  otp_required?: boolean;
  /** Present only when OTP is disabled for the account (direct sign-in). */
  token?: string;
  token_type?: string;
  user?: ApiVerifyResponse["user"];
}

export interface ApiVerifyResponse {
  token: string;
  token_type: string;
  user: {
    system_user_id: number;
    username: string;
    email: string;
    full_name: string;
    department_name: string | null;
    employee_id: number | null;
    status: string;
    role_id: number;
    role: string;
    otp_enabled?: boolean;
    permissions: Record<string, string>;
    last_login_at: string | null;
  };
}

export const mySettingsApi = {
  get: (user: string) =>
    request<{ notifications: Record<string, boolean>; preferences: Record<string, string> }>(
      `/my/settings?user=${encodeURIComponent(user)}`,
    ),
  save: (scope: "notifications" | "preferences", user: string, value: any) =>
    request<{ setting_key: string; setting_value: any }>(`/my/settings/${scope}`, {
      method: "PUT",
      body: JSON.stringify({ user, value }),
    }),
  changePassword: (user: string, currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/my/change-password", {
      method: "POST",
      body: JSON.stringify({ user, current_password: currentPassword, new_password: newPassword }),
    }),
};

export const authApi = {
  login: (email: string, password: string) =>
    request<ApiLoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  verifyOtp: (login_token: string, otp: string) =>
    request<ApiVerifyResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ login_token, otp }),
    }),
  resendOtp: (login_token: string) =>
    request<{ message: string; expires_in: number; debug_otp: string }>("/auth/otp/resend", {
      method: "POST",
      body: JSON.stringify({ login_token }),
    }),
  me: () => request<{ user: ApiVerifyResponse["user"] }>("/auth/me"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password, password_confirmation: password }),
    }),
};

/* ========================================================================= */
/* 6. CORE HCM                                                               */
/* ========================================================================= */

export interface ApiEmployee {
  employee_id: number;
  employee_code: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  email: string;
  personal_email: string | null;
  phone: string | null;
  address: string | null;
  birth_date: string | null;
  gender: string | null;
  civil_status: string | null;
  nationality: string | null;
  department_id: number;
  department_name: string;
  position_id: number;
  position_title: string;
  salary_grade_id: number | null;
  supervisor_employee_id: number | null;
  employment_type: "Regular" | "Contractual" | "Probationary";
  status: string;
  date_hired: string;
  onboarding_complete: boolean;
  sss_number: string | null;
  philhealth_number: string | null;
  pagibig_number: string | null;
  tin_number: string | null;
  salary_step: string | null;
  employee_record_last_updated_at: string | null;
  emergency_contacts?: ApiEmergencyContact[];
  documents?: ApiDocument[];
  position_history?: ApiPositionHistory[];
  exit_record?: ApiExitRecord | null;
  created_at: string;
  updated_at: string;
}

export interface ApiEmergencyContact {
  emergency_contact_id: number;
  name: string;
  relationship: string;
  phone: string | null;
  address: string | null;
  is_primary: boolean;
}

export interface ApiDocument {
  document_id: number;
  document_code: string;
  title: string;
  category: string;
  file_path: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  document_status: string;
  document_date: string | null;
  expiry_date: string | null;
}

export interface ApiPositionHistory {
  position_history_id: number;
  effective_date: string | null;
  change_type: string;
  old_position_id: number | null;
  new_position_id: number | null;
  old_salary_grade_id: number | null;
  new_salary_grade_id: number | null;
  notes: string | null;
}

export interface ApiExitRecord {
  exit_record_id: number;
  exit_type: string;
  exit_date: string | null;
  clearance_status: string;
  coe_status: string;
  notes: string | null;
}

export interface ApiHR3Recommendation {
  id: string;
  recommendation_id: number;
  employee_id: number | null;
  employee_code: string | null;
  employee_name: string;
  department: string;
  current_employment_type: string | null;
  recommendation_type: "Regularization" | "Promotion" | "Performance Review";
  evaluation_score: number;
  evaluator: string;
  date_submitted: string | null;
  status: "Pending HR Action" | "Approved & Processed" | "Deferred" | "Acknowledged";
  suggested_position: string | null;
  suggested_salary_grade: string | null;
  comments: string | null;
}

export interface ApiDepartment {
  department_id: number;
  code: string;
  name: string;
  description: string | null;
  head_employee_id: number | null;
  head: string | null;
  budget: string | null;
  staff_count?: number;
  positions_count?: number;
}

export interface ApiPosition {
  position_id: number;
  position_code: string;
  title: string;
  department_id: number;
  department_name?: string;
  department?: string | null;
  salary_grade_id: number;
  salary_grade?: string;
  level: string;
  headcount: number;
  filled_count: number;
  vacancies: number;
}

export interface ApiSalaryGrade {
  salary_grade_id: number;
  code: string;
  title: string;
  min_salary: string;
  max_salary: string;
  currency_code: string;
  level: string;
  notes: string | null;
}

export interface ApiOrgNode {
  department_id: number;
  code: string;
  name: string;
  head: { employee_id: number; full_name: string; position_title: string } | null;
  headcount: number;
  filled: number;
  positions: ApiPosition[];
}

export const hcmApi = {
  employees: {
    list: (params?: Record<string, any>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: ApiEmployee[]; meta: any }>(`/employees${qs ? `?${qs}` : ""}`);
    },
    get: (id: number | string) => request<{ data: ApiEmployee }>(`/employees/${id}`),
    create: (data: Record<string, any>) =>
      request<{ message: string; data: ApiEmployee }>("/employees", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiEmployee }>(`/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: number | string) =>
      request<{ message: string }>(`/employees/${id}`, { method: "DELETE" }),
    regularize: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiEmployee }>(`/employees/${id}/regularize`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    promote: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiEmployee }>(`/employees/${id}/promote`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    exit: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiEmployee }>(`/employees/${id}/exit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  departments: {
    list: (params?: Record<string, any>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: ApiDepartment[]; meta: any }>(`/departments${qs ? `?${qs}` : ""}`);
    },
    create: (data: Record<string, any>) =>
      request<{ message: string; data: ApiDepartment }>("/departments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiDepartment }>(`/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: number | string) =>
      request<{ message: string }>(`/departments/${id}`, { method: "DELETE" }),
  },
  positions: {
    list: (params?: Record<string, any>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: ApiPosition[]; meta: any }>(`/positions${qs ? `?${qs}` : ""}`);
    },
    create: (data: Record<string, any>) =>
      request<{ message: string; data: ApiPosition }>("/positions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiPosition }>(`/positions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: number | string) =>
      request<{ message: string }>(`/positions/${id}`, { method: "DELETE" }),
  },
  salaryGrades: {
    list: (params?: Record<string, any>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: ApiSalaryGrade[]; meta: any }>(`/salary-grades${qs ? `?${qs}` : ""}`);
    },
    create: (data: Record<string, any>) =>
      request<{ message: string; data: ApiSalaryGrade }>("/salary-grades", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiSalaryGrade }>(`/salary-grades/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: number | string) =>
      request<{ message: string }>(`/salary-grades/${id}`, { method: "DELETE" }),
  },
  orgChart: {
    list: () => request<{ data: ApiOrgNode[] }>("/org-chart"),
  },
  hr3Recommendations: {
    list: () => request<{ data: ApiHR3Recommendation[] }>("/hr3-recommendations"),
    acknowledge: (id: number) =>
      request<{ message: string }>(`/hr3-recommendations/${id}/acknowledge`, {
        method: "POST",
      }),
  },
};

/* ========================================================================= */
/* 7. USER MANAGEMENT                                                        */
/* ========================================================================= */

export interface ApiSystemUser {
  system_user_id: number;
  username: string;
  email: string;
  full_name: string;
  department_name: string | null;
  employee_id: number | null;
  role_id: number;
  role: string;
  status: "Active" | "Suspended" | "Inactive";
  last_login_at: string | null;
  last_login_ip: string | null;
  permissions: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ApiRole {
  role_id: number;
  role_name: string;
  description: string | null;
  is_super_admin: boolean;
  is_protected: boolean;
  user_count: number;
  permissions: { module_name: string; permission_level: string }[];
}

export interface ApiLoginActivity {
  login_activity_id: number;
  system_user_id: number;
  login_at: string;
  ip_address: string;
  device_info: string;
  user_agent: string;
  status: string;
}

export const userManagementApi = {
  users: {
    list: (params?: Record<string, any>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: ApiSystemUser[]; meta: any }>(`/users${qs ? `?${qs}` : ""}`);
    },
    get: (id: number | string) => request<{ data: ApiSystemUser }>(`/users/${id}`),
    create: (data: Record<string, any>) =>
      request<{ message: string; data: ApiSystemUser }>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiSystemUser }>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: number | string) =>
      request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
    loginActivity: (id: number | string) =>
      request<{ data: ApiLoginActivity[]; meta: any }>(`/users/${id}/login-activity`),
  },
  roles: {
    list: (params?: Record<string, any>) => {
      const qs = new URLSearchParams(params).toString();
      return request<{ data: ApiRole[]; meta: any }>(`/roles${qs ? `?${qs}` : ""}`);
    },
    get: (id: number | string) => request<{ data: ApiRole }>(`/roles/${id}`),
    create: (data: Record<string, any>) =>
      request<{ message: string; data: ApiRole }>("/roles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiRole }>(`/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: number | string) =>
      request<{ message: string }>(`/roles/${id}`, { method: "DELETE" }),
    permissions: (id: number | string) =>
      request<{ data: { module_name: string; permission_level: string }[] }>(
        `/roles/${id}/permissions`,
      ),
    updatePermissions: (
      id: number | string,
      permissions: { module_name: string; permission_level: string }[],
    ) =>
      request<{ message: string; data: ApiRole }>(`/roles/${id}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      }),
  },
};

/* ========================================================================= */
/* 8. AUDIT LOG                                                              */
/* ========================================================================= */

export interface ApiAuditLog {
  audit_log_id: number;
  system_user_id: number | null;
  timestamp: string;
  occurred_at: string;
  user: string;
  role: string;
  department: string;
  action: string;
  module: string;
  module_name: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  severity: "Info" | "Warning" | "Critical";
  ip_address: string;
  device: string;
  url?: string | null;
}

export const auditLogApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiAuditLog[]; meta: any }>(`/audit-logs${qs ? `?${qs}` : ""}`);
  },
  stats: () =>
    request<{
      data: {
        total: number;
        by_severity: Record<string, number>;
        by_module: Record<string, number>;
        latest: ApiAuditLog | null;
      };
    }>("/audit-logs/stats"),
  get: (id: number | string) => request<{ data: ApiAuditLog }>(`/audit-logs/${id}`),
};

/* ========================================================================= */
/* 9. LANDING (public)                                                       */
/* ========================================================================= */

export interface ApiLandingCompany {
  name: string;
  timezone: string;
  tagline: string;
  about: string;
  mission: string;
  vision: string;
  values: string[];
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  facilities?: { name: string; body: string }[];
  faqs?: { q: string; a: string }[];
  socials?: string[];
}

export interface ApiLandingJob {
  job_post_id: number;
  slug: string;
  title: string;
  department_id: number;
  department_name: string;
  position_title: string;
  employment_type: "Full-time" | "Part-time" | "Contract" | "Seasonal";
  schedule: string | null;
  salary_min: string | null;
  salary_max: string | null;
  vacancies: number;
  filled_count: number;
  posted_date: string | null;
  experience_level: string | null;
  education_level: string | null;
  summary: string | null;
  description: string | null;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  benefits: string[];
  picture?: string | null;
  picture_url?: string | null;
}

export interface ApiAnnouncement {
  id: string;
  announcement_id: number;
  title: string;
  body: string;
  published_date: string | null;
  audience: string;
  status: string;
  author: string | null;
  created_at: string | null;
}

export const announcementsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiAnnouncement[] }>(`/announcements${qs ? `?${qs}` : ""}`);
  },
  create: (data: { title: string; body: string; audience: string; status?: string }) =>
    request<{ message: string; data: ApiAnnouncement }>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: number | string,
    data: { title: string; body: string; audience: string; status?: string },
  ) =>
    request<{ message: string; data: ApiAnnouncement }>(`/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number | string) =>
    request<{ message: string }>(`/announcements/${id}`, { method: "DELETE" }),
};

export interface ApiDashboardStats {
  applicants: {
    total: number;
    fit: number;
    by_status: Record<string, number>;
    by_stage: Record<string, number>;
    by_source: Record<string, number>;
    avg_fit_score: number;
    trend: { day: string; applications: number; screened: number }[];
  };
  interviews: { scheduled: number };
  job_posts: { open: number; total_applicants: number };
  new_hires: { total: number; by_stage: Record<string, number> };
  employees: {
    total: number;
    active: number;
    trend_6m: { month: string; headcount: number; hires: number; exits: number }[];
    trend_ytd: { month: string; headcount: number; hires: number; exits: number }[];
  };
  departments: { name: string; staff: number; open: number }[];
  system_users: {
    total: number;
    by_role: Record<string, number>;
    by_status: Record<string, number>;
    recent: {
      id: number;
      name: string;
      department: string | null;
      status: string;
      last_login_at: string | null;
    }[];
  };
  audit: {
    total: number;
    recent: {
      id: number;
      action: string;
      severity: string;
      user: string;
      timestamp: string | null;
    }[];
  };
}

export const dashboardApi = {
  stats: () => request<{ data: ApiDashboardStats }>("/dashboard/stats"),
};

export const landingApi = {
  company: () => request<{ data: ApiLandingCompany }>("/landing/company"),
  jobs: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiLandingJob[]; meta: any }>(`/landing/jobs${qs ? `?${qs}` : ""}`);
  },
  job: (id: number | string) => request<{ data: ApiLandingJob }>(`/landing/jobs/${id}`),
  announcements: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiAnnouncement[]; meta: any }>(
      `/landing/announcements${qs ? `?${qs}` : ""}`,
    );
  },
  /** Public lightweight extraction — only name/email/phone/address for auto-fill */
  extractResume: (formData: FormData) =>
    request<{
      success: boolean;
      personal_information: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
      };
      error_message?: string;
    }>("/landing/extract-resume", { method: "POST", body: formData }),
  apply: (data: Record<string, any>) =>
    request<{
      message: string;
      data: { applicant_id: number; applicant_code: string; job_title: string };
    }>("/landing/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ========================================================================= */
/* 10. EMPLOYEE SELF-SERVICE (ESS) & ESS MANAGEMENT                           */
/* ========================================================================= */

export interface ApiEssEmployee {
  id: number;
  code: string;
  name: string;
  email: string;
  department: string;
  position: string;
  supervisor: string;
  employment_type?: string;
  date_hired?: string;
}

export interface ApiLeaveBalance {
  id?: number;
  type: string;
  total: number;
  used: number;
  available: number;
  period_year?: number;
}

export interface ApiScheduleDay {
  day: string;
  shift: string;
  time: string;
  hours: string;
  location: string;
}

export interface ApiRecognitionItem {
  id: string;
  sender: string;
  senderRole: string;
  senderAvatar: string;
  recipient: string;
  recipientRole: string;
  recipientAvatar: string;
  badge: string;
  badgeColor: string;
  message: string;
  reactions: {
    clap: number;
    heart: number;
    fire: number;
    star: number;
  };
  timeAgo: string;
  createdAt: string;
}

export interface ApiPayrollData {
  employee_name: string;
  position: string;
  department: string;
  baseSalary: number;
  allowances: number;
  gross: number;
  net: number;
  nextPayout: string;
  deductions: {
    sss: number;
    philhealth: number;
    pagibig: number;
    tax: number;
    total: number;
  };
  payslips: {
    id: string;
    period: string;
    gross: number;
    deductions: number;
    net: number;
    payoutDate: string;
    status: string;
  }[];
}

export interface ApiEssOverview {
  employee: ApiEssEmployee;
  today_schedule: {
    shift_name: string;
    time: string;
    is_rest_day: boolean;
    location: string;
  };
  today_attendance: {
    time_in: string | null;
    time_out: string | null;
    status: string;
  };
  monthly_attendance?: {
    present: number;
    late: number;
    absent: number;
    overtime_hours: number;
    total_leave_available: number;
  };
  payroll_summary?: {
    base_salary: number;
    estimated_net: number;
    next_payout: string;
  };
  performance_summary?: {
    lms_completed: number;
    lms_total: number;
    competency_level: string;
    average_score: number;
  };
  leave_balances: ApiLeaveBalance[];
  pending_requests_count: number;
  recent_requests: any[];
}

export interface ApiEssBenefit {
  employee_benefit_id: number;
  benefit_name: string;
  reference_value: string | null;
  note: string | null;
  status: string;
  effective_date: string | null;
}

export interface ApiEssRequestItem {
  id: string;
  db_id?: number;
  employee?: string;
  employeeId?: string;
  department?: string;
  category: string;
  category_code?: string;
  type: string;
  filed: string;
  date_from?: string;
  date_to?: string;
  status:
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Returned for Clarification";
  assignedTo?: string;
  assigned_to?: string;
  details: string;
  note?: string;
  returnedCount?: number;
  attachment_path?: string | null;
}

export interface ApiEssCategory {
  ess_category_id: number;
  code: string;
  name: string;
  description: string | null;
  is_open: boolean;
  sort_order: number;
}

export const essApi = {
  // Employee Portal
  overview: () => request<ApiEssOverview>('/ess/my-overview'),
  schedule: () => request<{ employee: ApiEssEmployee; weekly_roster: ApiScheduleDay[] }>('/ess/my-schedule'),
  myAttendance: () =>
    request<{
      summary: {
        present_days: number;
        late_days: number;
        absent_days: number;
        overtime_hours: number;
        average_hours: number;
      };
      records: {
        id: number;
        date: string;
        day: string;
        rawDate: string;
        timeIn: string;
        timeOut: string;
        workedHours: number;
        overtimeHours: number;
        status: string;
        device: string;
        remarks: string;
      }[];
    }>('/ess/my-attendance'),
  myDocuments: () =>
    request<{
      documents: {
        id: number;
        code: string;
        title: string;
        category: string;
        status: string;
        verified: boolean;
        issuedDate: string;
        expiryDate: string;
        fileSize: string;
        fileType: string;
        downloadUrl: string | null;
      }[];
    }>('/ess/my-documents'),
  uploadDocument: (data: { title: string; category: string; file_path?: string }) =>
    request<{ message: string; document: any }>('/ess/my-documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  myPerformance: () =>
    request<{
      employee: {
        name: string;
        role: string;
        department: string;
        overall_rating: number;
        competency_level: string;
      };
      stats: {
        completed_courses: number;
        in_progress_courses: number;
        average_score: number;
        total_training_hours: number;
      };
      courses: {
        id: string;
        title: string;
        category: string;
        progress: number;
        status: string;
        score: number | null;
        duration: string;
        completedDate: string | null;
      }[];
    }>('/ess/my-performance'),
  getCategories: () =>
    request<{
      categories: {
        id: number;
        name: string;
        code: string;
        description: string | null;
        is_open: boolean;
      }[];
    }>('/ess/categories'),
  leaves: () => request<{ balances: ApiLeaveBalance[]; history: any[] }>('/ess/my-leaves'),
  benefits: () => request<{ benefits: ApiEssBenefit[] }>('/ess/my-benefits'),
  myPayroll: () => request<ApiPayrollData>('/ess/my-payroll'),
  recognitions: () => request<{ recognitions: ApiRecognitionItem[] }>('/ess/recognitions'),
  sendKudos: (data: { recipient: string; badge: string; message: string }) =>
    request<{ message: string; recognition: ApiRecognitionItem; recognitions: ApiRecognitionItem[] }>('/ess/recognitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reactKudos: (id: string, reaction: 'clap' | 'heart' | 'fire' | 'star') =>
    request<{ message: string; reactions: Record<string, number> }>(`/ess/recognitions/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    }),
  myRequests: (params?: Record<string, any>) => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    return request<{ requests: ApiEssRequestItem[] }>(`/ess/my-requests${qs ? `?${qs}` : ""}`);
  },
  createRequest: (data: {
    category_code?: string | undefined;
    category_name?: string | undefined;
    request_type: string;
    date_from?: string | undefined;
    date_to?: string | undefined;
    details: string;
    attachment_path?: string | null | undefined;
  }) =>
    request<{ message: string; request: any }>("/ess/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  clock: (action: "clock_in" | "clock_out") =>
    request<{ message: string; record: any }>("/ess/clock", {
      method: "POST",
      body: JSON.stringify({ action }),
    }),

  // Admin & Superadmin Management
  adminRequests: (params?: Record<string, any>) => {
    const qs = params ? new URLSearchParams(params).toString() : "";
    return request<{
      counts: {
        total: number;
        pending: number;
        under_review: number;
        approved: number;
        completed: number;
        rejected: number;
        returned: number;
      };
      requests: ApiEssRequestItem[];
    }>(`/ess/admin/requests${qs ? `?${qs}` : ""}`);
  },
  updateRequestStatus: (id: string | number, data: { status: string; note?: string | undefined }) =>
    request<{ message: string; request: any }>(`/ess/admin/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  fileOnBehalf: (data: {
    employee_id: number;
    category_name: string;
    request_type: string;
    date_from?: string | undefined;
    date_to?: string | undefined;
    details: string;
  }) =>
    request<{ message: string; request: any }>("/ess/admin/requests/behalf", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  categories: () => request<{ categories: ApiEssCategory[] }>("/ess/admin/categories"),
  toggleCategory: (id: string | number) =>
    request<{ message: string; category: ApiEssCategory }>(`/ess/admin/categories/${id}/toggle`, {
      method: "PUT",
    }),
  auditLogs: () => request<{ logs: any[] }>("/ess/admin/audit-logs"),
};

export interface ApiChatbotReply {
  reply: string;
  quick_replies: string[];
  topic: string | null;
}

export interface ApiChatbotFaq {
  faq_id: number;
  question: string;
  answer: string;
  keywords: string | null;
  enabled: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export const chatbotApi = {
  chat: (data: { message: string; session_id?: string | null; topic?: string | null }) =>
    request<ApiChatbotReply>("/landing/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const chatbotFaqApi = {
  list: () => request<{ data: ApiChatbotFaq[] }>("/chatbot/faqs"),
  create: (data: {
    question: string;
    answer: string;
    keywords?: string | null;
    enabled?: boolean;
    sort_order?: number;
  }) =>
    request<{ message: string; data: ApiChatbotFaq }>("/chatbot/faqs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: number | string,
    data: {
      question?: string;
      answer?: string;
      keywords?: string | null;
      enabled?: boolean;
      sort_order?: number;
    },
  ) =>
    request<{ message: string; data: ApiChatbotFaq }>(`/chatbot/faqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number | string) =>
    request<{ message: string }>(`/chatbot/faqs/${id}`, { method: "DELETE" }),
};

/* ========================================================================= */
/* 11. NOTIFICATIONS                                                          */
/* ========================================================================= */

export interface ApiNotification {
  id: string;
  notification_id: number;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  tone: "info" | "success" | "warning";
  type: string;
  module: string | null;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
}

export const notificationsApi = {
  list: () => request<{ data: ApiNotification[]; unread_count: number }>("/notifications"),
  markRead: (id: number | string) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    request<{ message: string }>("/notifications/mark-all-read", { method: "POST" }),
};
