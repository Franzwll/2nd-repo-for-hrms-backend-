/**
 * Centralized API client connecting the React frontend to the Laravel Backend API.
 */

import { clearSession, getToken } from "./auth";

const RAW_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string) || "http://127.0.0.1:8000/api/v1";
// Normalize: "/api" + "/applicants" must join as "/api/v1/applicants" (the Vite
// dev proxy forwards /api -> Laravel), never "/api/applicants".
const BASE_URL =
  RAW_BASE_URL.replace(/\/+$/, "") +
  (RAW_BASE_URL.replace(/\/+$/, "").endsWith("/v1") ? "" : "/v1");
export const API_BASE_URL = BASE_URL;

/**
 * Build a query string while dropping empty values. `new URLSearchParams`
 * stringifies `undefined` as "undefined", which breaks server-side filters and
 * validation for optional params.
 */
function toQueryString(params?: Record<string, unknown>): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null || item === "") continue;
        qs.append(key, String(item));
      }
      continue;
    }
    qs.append(key, String(value));
  }
  return qs.toString();
}

/** Never show raw SQL / DB internals to users — collapse them to a generic message. */
function sanitizeErrorMessage(raw: unknown): string {
  const text = String(raw ?? "");
  if (
    /SQLSTATE|SQL:|select .* from|target machine actively refused|Connection refused|PDOException|QueryException|oxford-suites-hrms-cache/i.test(
      text,
    )
  ) {
    return "Something went wrong. Please try again later.";
  }
  return text || "Something went wrong. Please try again later.";
}

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
      const message = sanitizeErrorMessage(
        errorData?.message ||
          `Request failed with status ${response.status}: ${response.statusText}`,
      );
      const error = new Error(message) as Error & {
        status?: number;
        code?: string;
        payload?: any;
        errors?: Record<string, string[]>;
      };
      error.status = response.status;
      if (errorData?.code) {
        error.code = errorData.code;
      }
      error.payload = errorData;
      if (errorData?.errors) {
        error.errors = errorData.errors;
      }
      throw error;
    }

    // If 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Vite proxy / SSR fallback can answer with 200 + text/html (index.html)
    // when the backend is unreachable or the dev server hasn't reloaded.
    // Fail fast as a network error (mock-data fallback) instead of a
    // confusing `JSON.parse: unexpected character` SyntaxError.
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new TypeError(
        `Expected JSON but received ${contentType || "unknown content type"} (HTTP ${response.status}) for ${url}`,
      );
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
  address?: string | null;
  applied_at: string | null;
  fit_score: number | null;
  status: "fit" | "other-role" | "credential" | "not-fit";
  stage:
    | "Screened"
    | "Interview Scheduled"
    | "Assessed"
    | "Assessment Test"
    | "Practical Test"
    | "Final Evaluation"
    | "Offer"
    | "Hired"
    | "Rejected"
    | "Accepted";
  /** Offer workflow — set when the final evaluation decision emails the
   *  applicant an offer (7-day response window) and HR records their reply. */
  offer_status?: "Pending" | "Accepted" | "Declined" | null;
  offer_sent_at?: string | null;
  offer_expires_at?: string | null;
  offer_start_date?: string | null;
  offer_days_left?: number | null;
  /** How the applicant replied (Email / SMS / Call / In person) — HR records
   *  it since replies arrive outside the app. */
  offer_response_channel?: "Email" | "SMS" | "Call" | "In person" | null;
  offer_response_note?: string | null;
  offer_responded_at?: string | null;
  offer_response_recorded_by?: string | null;
  /** Re-apply cooldown anchors — rejected_at starts the waiting period,
   *  cooldown_lifted_at records an HR early override. */
  rejected_at?: string | null;
  cooldown_lifted_at?: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
  archived_reason?: string | null;
  is_archived?: boolean;
  is_blocked?: boolean;
  blocked_at?: string | null;
  blocked_by?: string | null;
  blocked_reason?: string | null;
  block_scope?: string | null;
  block_expires_at?: string | null;
  is_active_blocked?: boolean;
  rejected_at_stage?: string | null;
  allowed_return_stages?: string[] | null;
  source: string | null;
  summary: string | null;
  flags_json: string[];
  resume_url: string | null;
  /** Number of uploaded supporting documents (added by withCount). */
  documents_count?: number;
  job_post?: {
    job_post_id: number;
    title: string;
    department?: string;
    /** Whether this position takes an assessment test — Core HCM position
     *  flag (owner); legacy job-post flag is the fallback. */
    requires_assessment?: boolean;
    /** Whether this position takes a practical assessment — Core HCM position
     *  flag (owner); legacy job-post flag is the fallback. */
    requires_practical?: boolean;
  };
  screening_entities?: { entity_id: number; label: string; value: string }[];
  screening_scores?: { score_id: number; criterion: string; score: number }[];
  latest_screening?: ApiScreening | null;
  interviews?: ApiInterview[];
  assessment?: ApiAssessment;
}

/** Supporting-document evidence blended into the ranking score. Produced by
 *  the NLP service (`verification_scoring.py`) from the applicant's verified
 *  COE / Certificate / Credential rows and persisted on the screening record. */
export interface ApiDocumentEvidence {
  /** NOT_PROVIDED | PENDING | VERIFIED | PARTIAL | DISCREPANCY */
  status?: string;
  /** Evidence share of the ranking score (0.15 = 15%). */
  weight?: number;
  documents_total?: number;
  decisive_count?: number;
  verified_count?: number;
  discrepancy_count?: number;
  unable_count?: number;
  pending_count?: number;
  ignored_count?: number;
  credit_ratio?: number | null;
  /** Mean document credit as a percentage (VERIFIED 100, UNABLE 50, DISCREPANCY 0). */
  documents_score?: number | null;
  /** Points the evidence added to the resume score (non-negative; evidence can only reward). */
  score_bonus?: number;
  /** Always 0 — kept for backward compatibility; documents never lower the score. */
  score_penalty?: number;
  escalate_invalid?: boolean;
  mismatched_fields?: string[];
  flags?: string[];
  per_document?: {
    applicant_document_id?: number | null;
    doc_type?: string;
    verification_status?: string;
    counted?: boolean;
    credit?: number | null;
    mismatched_fields?: string[];
    summary?: string | null;
    ignored_reason?: string | null;
  }[];
}

export interface ApiScreening {
  screening_id?: number;
  success?: boolean;
  processing_status: "PROCESSED" | "PARTIALLY_PROCESSED" | "FAILED" | "PENDING" | "PROCESSING";
  screening_result: "fit" | "other-role" | "credential" | "not-fit" | null;
  match_score: number | null;
  /** Resume-only score before the supporting-document evidence was blended in. */
  resume_match_score?: number | null;
  /** Supporting-document evidence behind the ranking score. */
  document_verification?: ApiDocumentEvidence | null;
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
  /** Staged supporting documents verified in-memory for the Add Applicant
   *  preview (Step 3). Negative applicant_document_ids mark unsaved rows. */
  preview_documents?: ApiApplicantDocument[];
}

export interface ApiFacility {
  facility_id: number;
  name: string;
  type: "On-site" | "Virtual";
  location: string | null;
  capacity: number;
  icon: string | null;
  description: string | null;
  is_active: boolean;
}

export interface ApiInterview {
  interview_id: number;
  interview_code: string;
  applicant_id: number;
  scheduled_date: string;
  scheduled_time: string;
  /** End time added by the interview time-range migration; null on legacy rows. */
  scheduled_end_time: string | null;
  mode: "On-site" | "Virtual";
  facility_id: number | null;
  facility_status:
    | "Not Required"
    | "Waiting for Facility Approval"
    | "Facility Approved"
    | "Facility Declined"
    | null;
  facility?: {
    facility_id: number;
    name: string;
    type: "On-site" | "Virtual";
    location: string | null;
    capacity: number;
    icon: string | null;
  } | null;
  interviewer_employee_id: number | null;
  interviewer_name: string | null;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_continue_url: string | null;
  zoom_password: string | null;
  interview_notes?: string | null;
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
  comments_json: Record<string, string>;
  total_score: number | null;
  outcome: "Recommended" | "Hold" | "Not Recommended";
  result: "Passed" | "Failed" | null;
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

export interface ApiAssessmentTest {
  assessment_test_id: number;
  applicant_id: number;
  assessor_user_id: number | null;
  test_title: string;
  questions_json: { question: string; points: number }[];
  scores_json: Record<string, number>;
  total_score: number | null;
  passing_score: number | null;
  result: "Passed" | "Failed";
  test_date: string;
  remarks: string | null;
  applicant?: {
    applicant_id: number;
    applicant_code: string;
    name: string;
    position?: string;
    department?: string;
    stage?: string;
    requires_practical?: boolean;
  } | null;
}

export interface ApiPracticalTest {
  practical_test_id: number;
  applicant_id: number;
  assessor_user_id: number | null;
  task_title: string;
  criteria_json: { criterion: string; max_points: number }[];
  scores_json: Record<string, number>;
  total_score: number | null;
  result: "Passed" | "Failed";
  test_date: string;
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

export interface ApiScoreBreakdownItem {
  key: string;
  label: string;
  score: number | null;
  weight: number;
  applied: boolean;
  contribution: number | null;
}

export interface ApiFinalEvaluation {
  final_evaluation_id: number;
  applicant_id: number;
  evaluated_by_user_id: number | null;
  evaluation_date: string;
  screening_score: number | null;
  screening_status: string | null;
  interview_score: number | null;
  interview_result: "Passed" | "Failed" | null;
  assessment_test_score: number | null;
  assessment_test_result: "Passed" | "Failed" | null;
  practical_required: boolean;
  practical_test_score: number | null;
  practical_test_result: "Passed" | "Failed" | null;
  /** System-calculated overall score — backend authoritative, read-only. */
  overall_score: number | null;
  overall_score_rounded: number | null;
  score_breakdown: ApiScoreBreakdownItem[] | null;
  recommendation: "Recommended for Hire" | "For Another Position" | "Not Recommended";
  recommended_job_post_id: number | null;
  recommended_position_title: string | null;
  overall_remarks: string | null;
  applicant?: {
    applicant_id: number;
    applicant_code: string;
    name: string;
    position?: string;
    department?: string;
    stage?: string;
  } | null;
}

/* Supporting-document verification (NLP comparison of an uploaded COE /
 * Certificate / Credential against the applicant's resume claims). */
export type DocumentVerificationStatus =
  "PENDING" | "PROCESSING" | "VERIFIED" | "DISCREPANCY_FOUND" | "UNABLE_TO_VERIFY";

export interface ApiComparedResumeEntry {
  entry_index: number | null;
  total_entries: number;
  company?: string | null;
  job_title?: string | null;
  period?: string | null;
  location?: string | null;
}

export interface ApiDocumentVerificationCheck {
  resume_value: string | null;
  document_value: string | null;
  normalized_resume?: string | null;
  normalized_document?: string | null;
  match_method?: "exact" | "canonical_alias" | "fuzzy" | "date_tolerance" | "unable" | string;
  result: "MATCH" | "MISMATCH" | "UNABLE_TO_EXTRACT" | string;
  /** Human-readable reason for the verdict (e.g. why two dates within the
   *  tolerance window still count as the same period). */
  note?: string | null;
  /** Which resume entry the paper was measured against (COE checks). Lets HR
   *  trace a "Different" verdict back to the exact compared stint. */
  compared_resume_entry?: ApiComparedResumeEntry | null;
}

export interface ApiDocumentVerificationResult {
  success?: boolean;
  document_type?: string;
  verification_status?: DocumentVerificationStatus | string;
  checks?: Record<string, ApiDocumentVerificationCheck>;
  summary?: string;
  error?: string | null;
}

export interface ApiApplicantDocument {
  applicant_document_id: number;
  applicant_id: number;
  doc_type: "COE" | "Certificate" | "Credential" | "Others";
  title: string | null;
  original_copy: boolean;
  file_path: string | null;
  original_name: string | null;
  uploaded_at: string | null;
  verification_status?: DocumentVerificationStatus | string | null;
  verification_result?: ApiDocumentVerificationResult | null;
  extracted_profile?: Record<string, unknown> | null;
  verified_at?: string | null;
}

export function resolveStorageUrl(value: string | null): string | null {
  if (!value) return null;
  // BASE_URL may be relative ("/api/v1") so this works on any dev port.
  // Fall back to the page origin when it is not an absolute URL.
  let origin: string;
  try {
    origin = new URL(
      BASE_URL,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    ).origin;
  } catch {
    origin = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000";
  }
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
    const qs = toQueryString(params);
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
      data.append("_method", "PUT");
    }
    return request<ApiApplicant>(`/applicants/${id}`, {
      method: isForm ? "POST" : "PUT",
      body: isForm ? data : JSON.stringify(data),
    });
  },
  delete: (id: number | string) =>
    request<{ message: string }>(`/applicants/${id}`, { method: "DELETE" }),
  hire: (id: number | string) =>
    request<ApiApplicant>(`/applicants/${id}/hire`, { method: "POST" }),
  /** Super Admin only — move an applicant back to an earlier stage so a step
   *  can be redone (Rejected, Hired or still in the process). Clears the
   *  rejection/cooldown and offer-reply trail; a Pre-onboarding New Hire
   *  record is removed when the applicant was Hired. */
  returnToPipeline: (
    id: number | string,
    body: { target_stage: string; reason: string },
  ) =>
    request<ApiApplicant>(`/applicants/${id}/return-to-pipeline`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** Emails the offer (after a Final Evaluation recommended the candidate)
   *  and starts the applicant's 7-day response window. */
  sendOffer: (id: number | string, details?: string) =>
    request<ApiApplicant>(`/applicants/${id}/offer`, {
      method: "POST",
      body: JSON.stringify(details ? { details } : {}),
    }),
  /** Records the applicant's reply to the offer (HR reads the email/SMS/call).
   *  `channel` is how it arrived; accepting requires the start-of-work date. */
  respondToOffer: (
    id: number | string,
    body: {
      response: "accepted" | "declined";
      start_date?: string;
      channel: "Email" | "SMS" | "Call" | "In person";
      note?: string | undefined;
    },
  ) =>
    request<ApiApplicant>(`/applicants/${id}/offer/response`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  stats: () => request<any>("/applicants/stats"),
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
    }>("/applicants/extract-resume", {
      method: "POST",
      body: formData,
    }),
  screenResume: (formData: FormData) =>
    request<ApiScreeningPreview>("/applicants/screen-resume", {
      method: "POST",
      body: formData,
    }),
  getScreening: (id: number | string) =>
    request<{ data: ApiScreening }>(`/applicants/${id}/screening`),
  /** Re-runs the screening classification with the current supporting-document
   *  evidence (after uploading / re-verifying / removing a document) so the
   *  ranking percentage, rank order and official status stay in sync. */
  recomputeScreening: (id: number | string) =>
    request<{ data: ApiScreening; applicant: ApiApplicant }>(
      `/applicants/${id}/screening/recompute`,
      { method: "POST" },
    ),
  /** Streams the applicant's stored resume from the backend — always
   *  accessible, independent of the public/storage symlink, and same-origin
   *  (relative) so the review dialog's preview <iframe>/<img> renders PDFs
   *  and images inline instead of a blank white box. The Vite dev proxy
   *  forwards /api to Laravel. The auth token is appended as ?token= so the
   *  request authenticates server-side without an Authorization header. */
  resumeDocumentUrl: (applicantId: number | string) => {
    const token = getToken();
    return `/api/v1/applicants/${applicantId}/resume-document${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;
  },
  createAssessment: (applicantId: number | string, data: Record<string, any>) =>
    request<ApiAssessment>(`/applicants/${applicantId}/assessments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  /** Same-email past applications + cooldown countdown for the HR profile strip. */
  history: (id: number | string) =>
    request<ApiApplicantHistory>(`/applicants/${id}/history`),
  /** HR allows early re-application (lifts the waiting period, audited). */
  overrideCooldown: (id: number | string) =>
    request<{ message: string; data: ApiApplicant }>(
      `/applicants/${id}/cooldown/override`,
      { method: "POST" },
    ),
  /** Super Admin only — move an applicant to a selected recruitment stage. */
  moveToStage: (
    id: number | string,
    body: { target_stage: string; reason: string },
  ) =>
    request<ApiApplicant>(`/applicants/${id}/move-to-stage`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** Super Admin only — reopen a closed/rejected application. */
  reopen: (
    id: number | string,
    body: { target_stage?: string; reason: string },
  ) =>
    request<ApiApplicant>(`/applicants/${id}/reopen`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** Super Admin only — correct an incorrect hiring decision. */
  correctHiring: (
    id: number | string,
    body: {
      correction_type: "mistaken_hire" | "no_show" | "reneged";
      reason: string;
      apply_cooldown?: boolean;
    },
  ) =>
    request<ApiApplicant>(`/applicants/${id}/correct-hiring`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** Archive an applicant from active views. */
  archive: (id: number | string, body: { reason: string }) =>
    request<{ message: string; data: ApiApplicant }>(`/applicants/${id}/archive`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** Restore an applicant from archive back to active views. */
  restore: (id: number | string, body: { reason: string }) =>
    request<{ message: string; data: ApiApplicant }>(`/applicants/${id}/restore`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** Super Admin only — block an applicant from recruitment activities. */
  block: (
    id: number | string,
    body: { reason: string; scope?: "all_jobs" | "specific_job"; expires_at?: string | null },
  ) =>
    request<{ message: string; data: ApiApplicant }>(`/applicants/${id}/block`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** Super Admin only — unblock a restricted applicant. */
  unblock: (id: number | string, body: { reason: string }) =>
    request<{ message: string; data: ApiApplicant }>(`/applicants/${id}/unblock`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export interface ApiApplicantHistoryRow {
  applicant_id: number;
  applicant_code: string;
  job_post_id: number;
  position: string;
  applied_at: string | null;
  stage: string;
  status: string;
  offer_status?: string | null;
  rejected_at?: string | null;
  cooldown_lifted_at?: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
  archived_reason?: string | null;
  is_archived?: boolean;
  is_blocked?: boolean;
  blocked_at?: string | null;
  blocked_by?: string | null;
  blocked_reason?: string | null;
  block_scope?: string | null;
  block_expires_at?: string | null;
  is_active_blocked?: boolean;
  is_current: boolean;
  matched_rules?: string[];
  confidence?: string;
}

export interface ApiApplicantHistory {
  data: ApiApplicantHistoryRow[];
  cooldown: {
    applicant_code: string;
    applied_at: string | null;
    rejected_at: string | null;
    eligible_after: string;
    eligible_after_label: string;
    applied_label: string;
    days_left: number;
    job_post_id: number;
  } | null;
  block?: {
    is_blocked: boolean;
    reason: string | null;
    scope: string | null;
    applicant_code: string | null;
    matched_rules?: string[];
  } | null;
  cooldown_days: number;
  attempt_count: number;
  matched_applicants_count?: number;
}

export const assessmentsApi = {
  /** Global Assessment Test / Practical Test switches owned by Core HCM. */
  getConfig: () =>
    request<{ data: { assessment_test_enabled: boolean; practical_test_enabled: boolean } }>(
      `/assessments/config`,
    ),
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiAssessment[]; meta: any }>(`/assessments${qs ? `?${qs}` : ""}`);
  },
};

export interface ApiScreeningReference {
  ref_id: number;
  data_type: "skill" | "job_role" | "certification" | "education" | "experience";
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

/** HR-configurable screening scoring configuration (Screening Setup dialog). */
export interface ScreeningConfiguration {
  criteria: {
    [label: string]: { weight: number; enabled: boolean };
  };
  passing_score: number;
  /** 0–1 — minimum fraction of a job post's required skills that must match. */
  required_skills_coverage_min: number;
}

/** Entity types a requirement template row can carry (mirrors the NLP entity set). */
export type ScreeningRequirementEntityType =
  "skill" | "job_role" | "certification" | "education" | "experience";

export interface ApiRequirementTemplateItem {
  item_id: number;
  entity_type: ScreeningRequirementEntityType;
  value: string;
  required: boolean;
}

/** A per-position requirement template created in Screening Setup and applied to a job post. */
export interface ApiRequirementTemplate {
  template_id: number;
  name: string;
  position_id: number | null;
  position_title: string | null;
  description: string | null;
  active: boolean;
  items: ApiRequirementTemplateItem[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RequirementTemplatePayload {
  name: string;
  position_id: number | null;
  description?: string | null;
  active?: boolean;
  items: {
    entity_type: ScreeningRequirementEntityType;
    value: string;
    required?: boolean;
  }[];
}

/** DB-managed spaCy screening vocabulary (skills / job roles / certifications + aliases). */
export const screeningApi = {
  referenceData: {
    /** Grouped {skills, job_roles, certifications} mapping actually sent to the NLP service. */
    mapping: () =>
      request<{
        success: boolean;
        data: Record<
          "skills" | "job_roles" | "certifications" | "education" | "experience",
          Record<string, string[]>
        >;
        meta: { counts: Record<string, number> };
      }>("/screening/reference-data"),
    list: (params?: { data_type?: string; search?: string }) => {
      const qs = toQueryString(params);
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

  /** HR-configurable scoring configuration (Screening Setup dialog). */
  configuration: {
    /** NLP service health + saved / effective / default scoring settings. */
    status: () =>
      request<{
        success: boolean;
        data: {
          nlp_service: {
            online: boolean;
            base_model: string | null;
            custom_ner_loaded: boolean;
            model_info: Record<string, any> | null;
          };
          saved: ScreeningConfiguration | null;
          effective: ScreeningConfiguration;
          service_defaults: {
            weights: Record<string, number> | null;
            thresholds: Record<string, number> | null;
          } | null;
        };
      }>("/screening/status"),
    /** Persists the configuration used by every new screening run. */
    save: (configuration: ScreeningConfiguration) =>
      request<{ success: boolean; data: ScreeningConfiguration; message: string }>(
        "/screening/configuration",
        { method: "PUT", body: JSON.stringify({ configuration }) },
      ),
  },

  /**
   * Per-position requirement templates (Screening Setup → Requirement
   * Templates). Each template lists the requirement entities — skills, job
   * roles, certifications, education and experience — that the Job Post
   * Builder can apply to a post draft.
   */
  requirementTemplates: {
    list: (params?: { position_id?: number; active?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.position_id !== undefined) qs.set("position_id", String(params.position_id));
      if (params?.active !== undefined) qs.set("active", String(params.active));
      const query = qs.toString();
      return request<{ success: boolean; data: ApiRequirementTemplate[] }>(
        `/screening/requirement-templates${query ? `?${query}` : ""}`,
      );
    },
    create: (payload: RequirementTemplatePayload) =>
      request<{ success: boolean; data: ApiRequirementTemplate; message: string }>(
        "/screening/requirement-templates",
        { method: "POST", body: JSON.stringify(payload) },
      ),
    update: (id: number, payload: RequirementTemplatePayload) =>
      request<{ success: boolean; data: ApiRequirementTemplate; message: string }>(
        `/screening/requirement-templates/${id}`,
        { method: "PUT", body: JSON.stringify(payload) },
      ),
    remove: (id: number) =>
      request<{ success: boolean; message: string }>(`/screening/requirement-templates/${id}`, {
        method: "DELETE",
      }),
    toggleActive: (id: number) =>
      request<{ success: boolean; data: ApiRequirementTemplate }>(
        `/screening/requirement-templates/${id}/toggle`,
        { method: "PATCH" },
      ),
  },
};

export const interviewsApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
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
  /** Confirms the facility request (mock auto-approval) — flips the status
   *  from "Waiting for Facility Approval" to "Facility Approved" and
   *  automatically emails the applicant their confirmed schedule. */
  facilityApprove: (id: number | string) =>
    request<ApiInterview>(`/interviews/${id}/facility-approve`, { method: "POST" }),
  /** Mint a Meeting SDK signature to embed the Zoom meeting in the HRMS popup.
   *  Rejects (428/501) when the interview has no meeting yet or SDK keys are
   *  missing — the caller falls back to local preview + join-link button. */
  zoomSignature: (id: number | string, role: 0 | 1 = 0) =>
    request<{
      meeting_number: string;
      password: string | null;
      join_url: string | null;
      sdk_key: string;
      signature: string;
      role: number;
      user_name: string;
    }>(`/interviews/${id}/zoom-signature`, {
      method: "POST",
      body: JSON.stringify({ role }),
    }),

  /** Save interviewer notes during/after the interview. */
  saveNotes: (id: number | string, notes: string) =>
    request<{ message: string; interview_notes: string | null }>(`/interviews/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),
};

/* ========================================================================= */
/* 1b. FACILITIES / EVALUATION PIPELINE / VERIFICATION DOCUMENTS             */
/* ========================================================================= */

export const facilitiesApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiFacility[]; meta: any }>(`/facilities${qs ? `?${qs}` : ""}`);
  },
};

export const assessmentTestsApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiAssessmentTest[]; meta: any }>(
      `/assessment-tests${qs ? `?${qs}` : ""}`,
    );
  },
  create: (applicantId: number | string, data: Record<string, any>) =>
    request<ApiAssessmentTest>(`/applicants/${applicantId}/assessment-tests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiAssessmentTest>(`/assessment-tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/**
 * Assessment test LINKS — the applicant answers the test on their own device.
 * The staff member generates a single-use link (create); the applicant opens
 * the public page (show/submit are fetched with a plain, unauthenticated fetch
 * in the public runner so no staff session is required).
 */
export interface ApiAssessmentInvite {
  assessment_invite_id: number;
  token: string;
  applicant_id: number;
  applicant_name: string | null;
  position: string | null;
  test_title: string;
  passing_score: number;
  total_score: number | null;
  result: "Passed" | "Failed" | null;
  status: "Pending" | "Completed" | "Expired";
  expires_at: string | null;
  submitted_at: string | null;
  created_at: string | null;
}

export const assessmentInvitesApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiAssessmentInvite[] }>(`/assessment-invites${qs ? `?${qs}` : ""}`);
  },
  create: (applicantId: number | string, data: Record<string, any>) =>
    request<ApiAssessmentInvite>(`/applicants/${applicantId}/assessment-invites`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const practicalTestsApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiPracticalTest[]; meta: any }>(
      `/practical-tests${qs ? `?${qs}` : ""}`,
    );
  },
  create: (applicantId: number | string, data: Record<string, any>) =>
    request<ApiPracticalTest>(`/applicants/${applicantId}/practical-tests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiPracticalTest>(`/practical-tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export interface ApiFinalEvaluationPreview {
  applicant_id: number;
  position: string | null;
  practical_required: boolean;
  /** False when the applicant was never screened (no resume) — Screening is then excluded from the overall. */
  screening_applicable: boolean;
  scores: {
    screening_score: number | null;
    screening_status: string | null;
    interview_score: number | null;
    interview_result: "Passed" | "Failed" | null;
    assessment_test_score: number | null;
    assessment_test_result: "Passed" | "Failed" | null;
    practical_test_score: number | null;
    practical_test_result: "Passed" | "Failed" | null;
  };
  overall_score: number | null;
  overall_score_rounded: number | null;
  score_breakdown: ApiScoreBreakdownItem[];
  weights: { screening: number; interview: number; assessment: number; practical: number };
  calculation_complete: boolean;
  requirements: {
    interview_passed: boolean;
    assessment_passed: boolean;
    practical: "passed" | "missing_or_failed" | "not_required";
    all_passed: boolean;
  };
  blocking_verification_issues: number;
}

export const finalEvaluationsApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiFinalEvaluation[]; meta: any }>(
      `/final-evaluations${qs ? `?${qs}` : ""}`,
    );
  },
  preview: (applicantId: number | string) =>
    request<ApiFinalEvaluationPreview>(`/applicants/${applicantId}/final-evaluations/preview`),
  create: (applicantId: number | string, data: Record<string, any>) =>
    request<ApiFinalEvaluation>(`/applicants/${applicantId}/final-evaluations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiFinalEvaluation>(`/final-evaluations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const applicantDocumentsApi = {
  list: (applicantId: number | string, params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiApplicantDocument[]; meta: any }>(
      `/applicants/${applicantId}/documents${qs ? `?${qs}` : ""}`,
    );
  },
  /** Multipart upload of a verification document (COE, Certificate,
   *  Credential, Others) used to verify the resume/CV content. */
  upload: (applicantId: number | string, formData: FormData) =>
    request<ApiApplicantDocument>(`/applicants/${applicantId}/documents`, {
      method: "POST",
      body: formData,
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/applicant-documents/${id}`, { method: "DELETE" }),
  /** Re-runs supporting-document verification against the applicant's
   *  resume claims (e.g. after the resume was re-screened). */
  verify: (id: number | string) =>
    request<ApiApplicantDocument>(`/applicant-documents/${id}/verify`, { method: "POST" }),
  override: (id: number | string, reason?: string) =>
    request<ApiApplicantDocument>(`/applicant-documents/${id}/override`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  /** Streams the stored supporting-document file from the backend —
   *  same-origin (relative) so PDFs/images render inline in a new tab,
   *  with ?token= auth like the resume preview. Pass download=true to
   *  force a file download instead of inline preview. The Vite dev proxy
   *  forwards /api to Laravel. */
  fileUrl: (id: number | string, download = false) => {
    const token = getToken();
    const qs = new URLSearchParams();
    if (token) qs.set("token", token);
    if (download) qs.set("download", "1");
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return `/api/v1/applicant-documents/${id}/file${suffix}`;
  },
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
  /**
   * Saved builder canvas arrangement (ordered block ids). null means the post
   * was built before block order was persisted, so the default order applies.
   */
  blocks: string[] | null;
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
  /** Accepted-level chips; the scalars above are the weakest accepted level. */
  experience_levels?: string[] | null;
  education_levels?: string[] | null;
  summary: string | null;
  description: string | null;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  additional?: string[];
  instructions?: string | null;
  about?: string | null;
  platforms?: string[];
  picture: string | null;
  picture_url: string | null;
  applicants_count?: number;
  /** Test requirements resolved by the backend (Core HCM position flags,
   *  owner; legacy job-post columns are fallback). Read-only in Recruitment. */
  requires_assessment?: boolean;
  requires_practical?: boolean;
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

export interface JobDraftPayload {
  position_title: string;
  department?: string | undefined;
  employment_type?: string | undefined;
  schedule?: string | undefined;
  vacancies?: number | undefined;
  experience_level?: string | undefined;
  education_level?: string | undefined;
  /** Accepted-level chips; any of these clears the bar (scalar is the weakest). */
  experience_levels?: string[] | undefined;
  education_levels?: string[] | undefined;
  /** Post-specific requirements handed to the AI draft generator. */
  skills?: string[] | undefined;
  /** Reference-Data grounding terms when the post has no explicit skills. */
  screening_terms?: string[] | undefined;
  requested_note?: string | undefined;
  blocks?: string[] | undefined;
  notes?: Record<string, string> | undefined;
}

export interface JobDraftResult {
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  additional?: string[];
  instructions: string;
  about: string;
}

/** One provider in the AI chain (Gemini → second key → OpenRouter). */
export interface JobAiProvider {
  service: string;
  model: string;
  kind: "gemini" | "openrouter";
  blocked: boolean;
  blocked_until: string | null;
  blocked_reason: string | null;
}

/** Usage/limit snapshot behind the builder's "Generate with AI" indicator. */
export interface JobAiUsage {
  configured: boolean;
  primary_model: string;
  /** App-level cap (0 = unlimited). */
  daily_limit: number;
  used_today: number;
  remaining_today: number | null;
  attempts_today: number;
  failures_today: number;
  tokens_today: number;
  /** Set only when every provider is cooling down (usage limit / dead key). */
  blocked_until: string | null;
  blocked_code: string | null;
  blocked_reason: string | null;
  providers: JobAiProvider[];
  last_success: { service: string; model: string; at: string } | null;
  last_error: {
    code: string;
    message: string;
    retry_after_seconds: number | null;
    resets_at: string | null;
    at: string;
  } | null;
}

/** Body the API returns when a draft generation fails (429 for usage limits). */
export interface JobDraftErrorPayload {
  message?: string;
  code?: string;
  retry_after_seconds?: number | null;
  resets_at?: string | null;
  usage?: JobAiUsage;
}

export const jobPostsApi = {
  /** AI draft for the Job Post Builder — fills the 6 content blocks, HR reviews before saving. */
  generateDraft: (payload: JobDraftPayload) =>
    request<{
      success: boolean;
      data: JobDraftResult;
      meta: {
        model: string;
        generated_via: { service: string; model: string; free: boolean } | null;
        vocabulary: { skills_count: number; certifications_count: number };
        skills_matched: string[];
        skills_new: string[];
        usage?: JobAiUsage;
      };
    }>("/job-posts/generate-draft", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  /** Usage/limit snapshot for the AI draft indicator (triggers no generation). */
  aiUsage: (params?: { clear?: boolean }) => request<{ success: boolean; data: JobAiUsage }>(`/job-posts/ai-usage${params?.clear ? "?clear=1" : ""}`),
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiJobPost[]; meta: any }>(`/job-posts${qs ? `?${qs}` : ""}`);
  },
  get: (id: number | string) => request<ApiJobPost>(`/job-posts/${id}`),
  create: (data: FormData | Record<string, any>) => {
    const isForm = data instanceof FormData;
    return request<ApiJobPost>("/job-posts", {
      method: "POST",
      body: isForm ? data : JSON.stringify(data),
    });
  },
  update: (id: number | string, data: FormData | Record<string, any>) => {
    const isForm = data instanceof FormData;
    if (isForm) {
      // PHP never populates $_POST for raw multipart PUT bodies, so Laravel
      // sees an empty request. Send POST with a _method=PUT override field —
      // the standard Laravel pattern for multipart updates.
      data.append("_method", "PUT");
    }
    return request<ApiJobPost>(`/job-posts/${id}`, {
      method: isForm ? "POST" : "PUT",
      body: isForm ? data : JSON.stringify(data),
    });
  },
  delete: (id: number | string) =>
    request<{
      message: string;
      archived?: boolean;
      applicants?: number;
      requisitions?: number;
    }>(`/job-posts/${id}`, { method: "DELETE" }),
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
    const qs = toQueryString(params);
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
  remove: (id: number | string) =>
    request<{ message: string }>(`/requisitions/${id}`, { method: "DELETE" }),
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
  /** Department name — returned by PositionResource when the relation is loaded. */
  department_name?: string | null;
  salary_grade_id?: number | null;
  salary_grade?: string | null;
  salary_grade_code?: string | null;
  salary_grade_title?: string | null;
  salary_grade_min?: number | null;
  salary_grade_max?: number | null;
  level: string;
  headcount: number;
  filled_count: number;
  /** Open slots = headcount - filled_count, resolved by PositionResource. */
  vacancies?: number;
  requires_assessment?: boolean;
  requires_practical?: boolean;
}

/** Core HCM lookups — departments & positions live in the database. */
export const coreHcmApi = {
  departments: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiDepartment[]; meta: any }>(`/departments${qs ? `?${qs}` : ""}`);
  },
  createDepartment: (data: Record<string, any>) =>
    request<{ message: string; data: ApiDepartment }>("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.data),
  positions: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiPosition[]; meta: any }>(`/positions${qs ? `?${qs}` : ""}`);
  },
  createPosition: (data: Record<string, any>) =>
    request<{ message: string; data: ApiPosition }>("/positions", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.data),
  salaryGrades: {
    list: (params?: Record<string, any>) => {
      const qs = toQueryString(params);
      return request<{ data: ApiSalaryGrade[]; meta: any }>(`/salary-grades${qs ? `?${qs}` : ""}`);
    },
  },
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
  /** When HR requested the probationary performance evaluation (ISO timestamp
   *  or null) — drives the DOLE auto-regularization countdown. */
  evaluation_requested_at?: string | null;
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

export interface ApiOnboardingSubmission {
  employee_onboarding_item_id: number;
  new_hire_id: number | null;
  hire_name: string;
  hire_stage?: string | null;
  employee_id: number | null;
  item_text: string;
  phase?: string | null;
  file_name?: string | null;
  notes?: string | null;
  submitted_at?: string | null;
  returned_count: number;
  review_note?: string | null;
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
    const qs = toQueryString(params);
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
    const qs = toQueryString(params);
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
    request<{ message: string }>(`/checklist-templates/${id}`, { method: "DELETE" }),
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
    request<{
      employee_onboarding_item_id: number;
      template_item_id: number;
      item_text: string;
      done: boolean;
      phase: string;
    }>(`/new-hires/${newHireId}/onboarding-items`, {
      method: "POST",
      body: JSON.stringify({ template_item_id: templateItemId }),
    }),
  toggle: (itemId: number | string, body?: { done: boolean; review_note?: string | null }) =>
    request<{
      employee_onboarding_item_id: number;
      done: boolean;
      completed_at: string | null;
      review_note?: string | null;
      returned_count?: number;
    }>(`/onboarding-items/${itemId}/toggle`, {
      method: "PATCH",
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
  /** HR sends a submission back for correction with a reason (Edit-gated). */
  returnItem: (itemId: number | string, body: { note: string }) =>
    request<{
      employee_onboarding_item_id: number;
      done: boolean;
      review_note: string | null;
      returned_count: number;
    }>(`/onboarding-items/${itemId}/return`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  /** HR review queue: submitted-but-unverified items across hires (Edit-gated). */
  submissions: () =>
    request<{ count: number; data: ApiOnboardingSubmission[] }>(`/onboarding-submissions`),
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
   *  accessible, independent of the public/storage symlink. The URL is
   *  same-origin (relative) so the preview <iframe>/<img> lets the browser
   *  render PDFs/images inline instead of downloading them; the Vite dev proxy
   *  forwards /api to Laravel. The auth token is appended as ?token= so the
   *  request authenticates server-side without an Authorization header. */
  documentUrl: (itemId: number | string) => {
    const token = getToken();
    return `/api/v1/onboarding-items/${itemId}/document${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;
  },
};

export const checklistRequestsApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
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

export interface ApiBackupEntry {
  id: string;
  timestamp: string;
  size: string;
  type: string;
  filename: string;
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
  /** Which second factor the /otp step expects. */
  mfa_method?: "email_otp" | "totp";
  /** True for Super Admins without an enrolled authenticator (soft-mandatory). */
  totp_enrollment_required?: boolean;
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
    request<{
      notifications: Record<string, boolean>;
      preferences: Record<string, string>;
      /** Personal OTP-at-login flag stored on system_users.otp_enabled. */
      otp_enabled?: boolean;
      user?: string | null;
    }>(`/my/settings?user=${encodeURIComponent(user)}`),
  save: (scope: "notifications" | "preferences", user: string, value: any) =>
    request<{ setting_key: string; setting_value: any }>(`/my/settings/${scope}`, {
      method: "PUT",
      body: JSON.stringify({ user, value }),
    }),
  /** Toggles THIS account's OTP-at-login requirement (PUT /my/otp). */
  toggleOtp: (user: string, enabled: boolean) =>
    request<{ message: string; otp_enabled: boolean }>("/my/otp", {
      method: "PUT",
      body: JSON.stringify({ user, enabled }),
    }),
  changePassword: (user: string, currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/my/change-password", {
      method: "POST",
      body: JSON.stringify({ user, current_password: currentPassword, new_password: newPassword }),
    }),
};

export const authApi = {
  login: (email: string, password: string, captcha_token?: string) =>
    request<ApiLoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, captcha_token }),
    }),
  verifyOtp: (login_token: string, otp: string, captcha_token?: string) =>
    request<ApiVerifyResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ login_token, otp, captcha_token }),
    }),
  resendOtp: (login_token: string, captcha_token?: string) =>
    request<{ message: string; expires_in: number; debug_otp: string }>("/auth/otp/resend", {
      method: "POST",
      body: JSON.stringify({ login_token, captcha_token }),
    }),
  me: () => request<{ user: ApiVerifyResponse["user"] }>("/auth/me"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  confirmPassword: (password: string) =>
    request<{ ok: boolean }>("/auth/confirm-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  sessionPolicy: () =>
    request<{
      token_expiration_minutes: number;
      idle_timeout_minutes: number;
      roles?: Record<string, { token_minutes: number; idle_minutes: number }>;
      otp_expires_in_seconds: number;
      reset_expires_in_seconds: number;
    }>("/auth/session-policy"),
  forgotPassword: (email: string, captcha_token?: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, captcha_token }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password, password_confirmation: password }),
    }),
};

export interface MfaStatus {
  mfa_method: "email_otp" | "totp";
  totp_confirmed: boolean;
  recovery_codes_remaining: number;
  totp_required: boolean;
  email_otp_enabled: boolean;
}

export const mfaApi = {
  status: () => request<MfaStatus>("/auth/mfa/status"),
  setup: () =>
    request<{ otpauth_url: string; qr_svg: string; manual_key: string }>("/auth/mfa/totp/setup", {
      method: "POST",
    }),
  confirm: (code: string, password: string) =>
    request<{ message: string; recovery_codes: string[] }>("/auth/mfa/totp/confirm", {
      method: "POST",
      body: JSON.stringify({ code, password }),
    }),
  disable: (password: string, code?: string) =>
    request<{ message: string }>("/auth/mfa/totp/disable", {
      method: "POST",
      body: JSON.stringify({ password, code }),
    }),
  regenerateCodes: (password: string) =>
    request<{ message: string; recovery_codes: string[] }>("/auth/mfa/recovery-codes", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  verify: (login_token: string, code: string, captcha_token?: string) =>
    request<ApiVerifyResponse>("/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ login_token, code, captcha_token }),
    }),
  recover: (login_token: string, recovery_code: string, captcha_token?: string) =>
    request<ApiVerifyResponse & { recovery_codes_remaining?: number }>("/auth/mfa/recover", {
      method: "POST",
      body: JSON.stringify({ login_token, recovery_code, captcha_token }),
    }),
  adminReset: (userId: number | string) =>
    request<{ message: string }>(`/auth/mfa/reset/${userId}`, { method: "POST" }),
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
  /** Present on the ERM dossier endpoint; true when gov IDs are hidden. */
  pii_masked?: boolean;
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
  sss_number?: string | null;
  philhealth_number?: string | null;
  pagibig_number?: string | null;
  tin_number?: string | null;
  salary_step: string | null;
  employee_record_last_updated_at: string | null;
  emergency_contacts?: ApiEmergencyContact[];
  documents?: ApiDocument[];
  position_history?: ApiPositionHistory[];
  exit_record?: ApiExitRecord | null;
  leave_balances?: ApiEmployeeLeaveBalance[];
  leave_requests?: ApiEmployeeLeaveRequest[];
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
  source_type?: string | null;
  original_name?: string | null;
  file_path: string | null;
  file_url?: string | null;
  has_file?: boolean;
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

export interface ApiEmployeeLeaveBalance {
  leave_balance_id: number;
  leave_type: string;
  period_year: number;
  total_days: number;
  used_days: number;
  available_days: number;
}

export interface ApiEmployeeLeaveRequest {
  request_code: string;
  request_type: string;
  status: string;
  date_from: string | null;
  date_to: string | null;
  filed_at: string | null;
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
  department_name?: string | null;
  department?: string | null;
  salary_grade_id?: number | null;
  salary_grade?: string | null;
  salary_grade_code?: string | null;
  salary_grade_title?: string | null;
  salary_grade_min?: number | null;
  salary_grade_max?: number | null;
  level: string;
  headcount: number;
  filled_count: number;
  vacancies?: number;
  requires_assessment?: boolean;
  requires_practical?: boolean;
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
      const qs = toQueryString(params);
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
      const qs = toQueryString(params);
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
      const qs = toQueryString(params);
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
      const qs = toQueryString(params);
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
  promotions: {
    list: (params?: Record<string, any>) => {
      const qs = toQueryString(params);
      return request<{ data: ApiPromotionRequest[]; meta: any }>(
        `/promotion-requests${qs ? `?${qs}` : ""}`,
      );
    },
    review: (id: number | string, data: Record<string, any>) =>
      request<{ message: string }>(`/promotion-requests/${id}/review`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    forwardToHr3: (id: number | string, data?: Record<string, any>) =>
      request<{ message: string }>(`/promotion-requests/${id}/forward-to-hr3`, {
        method: "POST",
        body: JSON.stringify(data ?? {}),
      }),
    linkHr3Result: (id: number | string, data: Record<string, any>) =>
      request<{ message: string }>(`/promotion-requests/${id}/hr3-result`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

export interface ApiPromotionRequest {
  promotion_request_id: number;
  employee_id: number;
  current_position_id: number | null;
  requested_position_id: number | null;
  requested_salary_grade_id: number | null;
  hr3_recommendation_id?: number | null;
  forwarded_to_hr3_by?: number | null;
  forwarded_to_hr3_at?: string | null;
  justification: string;
  status:
    | "Pending"
    | "Under HR3 Review"
    | "Pending HR Action"
    | "Approved"
    | "Rejected"
    | "Returned"
    | "Terminated"
    | "Deferred";
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  hr3_recommendation?: {
    recommendation_id: number;
    recommendation_type: string;
    evaluation_score: number;
    status: string;
  } | null;
  employee?: {
    employee_code: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    department?: { name: string } | null;
    position?: { title: string } | null;
  } | null;
  requested_position?: { title: string } | null;
}

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
      const qs = toQueryString(params);
      return request<{
        data: ApiSystemUser[];
        meta: any;
        stats?: {
          total: number;
          active: number;
          suspended: number;
          admins: number;
        };
      }>(`/users${qs ? `?${qs}` : ""}`);
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
    resetPassword: (id: number | string, password: string) =>
      request<{ message: string }>(`/users/${id}/password`, {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
    loginActivity: (id: number | string) =>
      request<{ data: ApiLoginActivity[]; meta: any }>(`/users/${id}/login-activity`),
  },
  roles: {
    list: (params?: Record<string, any>) => {
      const qs = toQueryString(params);
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
  role: string | null;
  department: string | null;
  action: string;
  module: string;
  module_name: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  severity: "Info" | "Warning" | "Critical";
  ip_address: string | null;
  device: string | null;
  url?: string | null;
}

export const auditLogApi = {
  list: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
    return request<{ data: ApiAuditLog[]; meta: any }>(`/audit-logs${qs ? `?${qs}` : ""}`);
  },
  stats: () =>
    request<{
      data: {
        total: number;
        by_severity: Record<string, number>;
        by_module: Record<string, number>;
        modules: string[];
        unique_actors: number;
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
  faqs?: { q: string; a: string; category?: string }[];
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
  additional?: string[];
  instructions?: string | null;
  about?: string | null;
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
    const qs = toQueryString(params);
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
    const qs = toQueryString(params);
    return request<{ data: ApiLandingJob[]; meta: any }>(`/landing/jobs${qs ? `?${qs}` : ""}`);
  },
  job: (id: number | string) => request<{ data: ApiLandingJob }>(`/landing/jobs/${id}`),
  announcements: (params?: Record<string, any>) => {
    const qs = toQueryString(params);
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
  apply: (data: Record<string, any> | FormData) => {
    const isForm = data instanceof FormData;
    return request<{
      message: string;
      data: { applicant_id: number; applicant_code: string; job_title: string };
    }>("/landing/apply", {
      method: "POST",
      body: isForm ? data : JSON.stringify(data),
    });
  },
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
  shares?: number;
  userReactions?: string[];
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
  hero_source?: string;
  hero_period?: string | null;
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
    earnings?: { label: string; amount: number; ytd: number }[];
    deductions_breakdown?: { label: string; amount: number; ytd: number }[];
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
    competency_level: string | null;
    average_score: number | null;
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
    | "For Dispatch"
    | "With Module"
    | "For Release"
    | "Approved"
    | "For Fulfillment"
    | "Rejected"
    | "Completed"
    | "Cancelled"
    | "Returned for Clarification";
  /** Module that currently owns the request after the ESS gate. */
  module?: string | null;
  module_label?: string | null;
  routed_at?: string | null;
  module_note?: string | null;
  module_reference?: string | null;
  module_responded_at?: string | null;
  released_at?: string | null;
  assignedTo?: string;
  assigned_to?: string;
  details: string;
  note?: string;
  review_note?: string | null;
  returnedCount?: number;
  returned_count?: number;
  completed_at?: string | null;
  employeeDbId?: number;
  attachment_path?: string | null;
  /** Files attached to the request — employee uploads and module output. */
  attachments?: ApiEssRequestAttachment[];
  /** True once ESS Management has released the requested file. */
  has_fulfillment?: boolean;
  /** Filed -> Received -> Fulfilled timeline. */
  timeline?: { status: string; note: string | null; at: string | null }[];
}

export interface ApiEssRequestAttachment {
  id: number;
  direction: "employee" | "hr";
  /** Module that produced an outbound file (erm, attendance, payroll...). */
  source_module?: string | null;
  original_name: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  has_file: boolean;
}

export interface ApiDocumentRequest extends ApiEssRequestItem {
  employeeDbId?: number;
  has_fulfillment: boolean;
  attachments: ApiEssRequestAttachment[];
  archive_options?: {
    id: number;
    code: string;
    title: string;
    category: string;
    status: string;
    document_date: string | null;
    file_path: string | null;
  }[];
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
  overview: () => request<ApiEssOverview>("/ess/my-overview"),
  schedule: () =>
    request<{ employee: ApiEssEmployee; weekly_roster: ApiScheduleDay[] }>("/ess/my-schedule"),
  myAttendance: () =>
    request<{
      summary: {
        present_days: number;
        leave_days: number;
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
        status: string;
        remark?: string | null;
        lateMinutes?: number;
        undertimeMinutes?: number;
        overtimeHours?: number;
        device: string;
        remarks: string;
      }[];
    }>("/ess/my-attendance"),
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
    }>("/ess/my-documents"),
  uploadDocument: (data: { title: string; category: string; file_path?: string }) =>
    request<{ message: string; document: any }>("/ess/my-documents/upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  myPerformance: () =>
    request<{
      employee: {
        name: string;
        role: string;
        department: string;
        overall_rating: number | null;
        competency_level: string | null;
      };
      stats: {
        completed_courses: number;
        in_progress_courses: number;
        average_score: number | null;
        total_training_hours: number | null;
      };
      courses: {
        id: string;
        course_id?: number;
        title: string;
        category: string;
        progress: number | null;
        status: string;
        score: number | null;
        duration: string | null;
        completedDate: string | null;
        // Tier-1 LMS: drives the reading-gate + parity badges on the cards.
        reading_completed_at?: string | null;
        estimated_reading_minutes?: number | null;
        estimated_pages?: number | null;
        mandatory?: boolean;
      }[];
    }>("/ess/my-performance"),
  updateLearningProgress: (data: { course_code: string }) =>
    request<{ message: string; learning: any }>(`/ess/my-learning/progress`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  learningCertificate: (courseCode: string) =>
    request<{
      eligible: boolean;
      verification_code: string | null;
      course?: {
        code: string;
        title: string;
        category: string;
        score: number | null;
        completed_date: string | null;
      };
    }>(`/ess/my-learning/certificate/${encodeURIComponent(courseCode)}`),

  /* --- Tier-1 thin LMS: read handbook -> AI quiz -> auto-score ---------- */

  /** Handbook payload for the player's reading stage (content + optional file). */
  learningMaterial: (courseCode: string) =>
    request<{
      course: {
        code: string;
        title: string;
        category: string;
        estimated_reading_minutes: number | null;
        estimated_pages: number | null;
        mandatory: boolean;
      };
      content: string | null;
      file_url: string | null;
      status: string;
      reading_completed_at: string | null;
    }>(`/ess/my-learning/${encodeURIComponent(courseCode)}/material`),

  /** Marks the reading stage done. */
  completeLearningReading: (courseCode: string) =>
    request<{ message: string; reading_completed_at: string; status: string }>(
      `/ess/my-learning/${encodeURIComponent(courseCode)}/reading-complete`,
      { method: "POST", body: JSON.stringify({}) },
    ),

  /** Quiz delivery. Answer key is server-side only. */
  learningQuiz: (courseCode: string) =>
    request<{
      course: { code: string; title: string; category: string };
      pass_mark: number;
      total_items: number;
      time_limit_seconds: number;
      questions: { id: number; question: string; options: string[] }[];
      attempt_seed: number;
      already_passed: boolean;
      last_score: number | null;
    }>(`/ess/my-learning/${encodeURIComponent(courseCode)}/quiz`),

  /** Server-side grading; a pass flips the course to Completed immediately. */
  submitLearningQuiz: (courseCode: string, answers: Record<string, number>, attemptSeed: number) =>
    request<{
      passed: boolean;
      score: number;
      correct_count: number;
      total_count: number;
      pass_mark: number;
      status: string;
      certificate_eligible: boolean;
      already_completed?: boolean;
      review: {
        id: number;
        question: string;
        options: string[];
        correct_index: number;
        your_index: number | null;
        is_correct: boolean;
        explanation: string;
      }[];
    }>(`/ess/my-learning/${encodeURIComponent(courseCode)}/quiz`, {
      method: "POST",
      body: JSON.stringify({ answers, attempt_seed: attemptSeed }),
    }),

  /** Same-origin URL to stream a file-based handbook inline (token auth). */
  learningMaterialUrl: (courseCode: string) => {
    const token = getToken();
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    return `/api/v1/ess/my-learning/${encodeURIComponent(courseCode)}/file${qs}`;
  },
  adminLearning: () =>
    request<{
      records: {
        id: number;
        employee_id: number;
        employee_name: string;
        email: string;
        department: string;
        course_id: number;
        course_code: string;
        course_title: string;
        course_category: string;
        status: string;
        score: number | null;
        assigned_date: string | null;
        completed_date: string | null;
      }[];
      summary: { total: number; assigned: number; in_progress: number; completed: number };
    }>(`/ess/admin/learning`),
  verifyLearning: (id: number | string, data: { status: string; score?: number }) =>
    request<{ message: string; record: any }>(`/ess/admin/learning/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getCategories: () =>
    request<{
      categories: {
        id: number;
        name: string;
        code: string;
        description: string | null;
        is_open: boolean;
      }[];
    }>("/ess/categories"),
  leaves: () => request<{ balances: ApiLeaveBalance[]; history: any[] }>("/ess/my-leaves"),
  benefits: () => request<{ benefits: ApiEssBenefit[] }>("/ess/my-benefits"),
  myPayroll: () => request<ApiPayrollData>("/ess/my-payroll"),
  recognitions: () => request<{ recognitions: ApiRecognitionItem[] }>("/ess/recognitions"),
  sendKudos: (data: { recipient: string; badge: string; message: string }) =>
    request<{
      message: string;
      recognition: ApiRecognitionItem;
      recognitions: ApiRecognitionItem[];
    }>("/ess/recognitions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  reactKudos: (id: string, reaction: "clap" | "heart" | "fire" | "star") =>
    request<{ message: string; reactions: Record<string, number> }>(
      `/ess/recognitions/${id}/react`,
      {
        method: "POST",
        body: JSON.stringify({ reaction }),
      },
    ),
  shareKudos: (id: string) =>
    request<{ message: string; shares: number }>(`/ess/recognitions/${id}/share`, {
      method: "POST",
    }),
  myRequests: (params?: Record<string, any>) => {
    const qs = params ? toQueryString(params) : "";
    return request<{ requests: ApiEssRequestItem[] }>(`/ess/my-requests${qs ? `?${qs}` : ""}`);
  },
  createRequest: (data: Record<string, any> | FormData) => {
    const isForm = data instanceof FormData;
    return request<{ message: string; request: any }>("/ess/requests", {
      method: "POST",
      body: isForm ? data : JSON.stringify(data),
    });
  },
  /** Employee answers a "Returned for Clarification" request. */
  respondToRequest: (id: string | number, data: FormData) =>
    request<{ message: string; request: any }>(`/ess/requests/${id}/respond`, {
      method: "POST",
      body: data,
    }),
  /** Employee withdraws an open request. */
  cancelRequest: (id: string | number) =>
    request<{ message: string; request: any }>(`/ess/requests/${id}/cancel`, {
      method: "POST",
    }),
  /** HR review action: start | approve | reject | return. */
  reviewRequest: (
    id: string | number,
    decision: "start" | "approve" | "reject" | "return",
    note?: string,
    file?: File | null,
  ) => {
    if (file) {
      const form = new FormData();
      form.append("decision", decision);
      if (note) form.append("note", note);
      form.append("file", file);
      return request<{ message: string; request: any }>(`/ess/admin/requests/${id}/review`, {
        method: "POST",
        body: form,
      });
    }

    return request<{ message: string; request: any }>(`/ess/admin/requests/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ decision, ...(note ? { note } : {}) }),
    });
  },
  /** Attach the requested document and release it (ESS Management override). */
  fulfillRequest: (
    id: string | number,
    data: { file?: File | null; document_id?: number | null; note?: string },
  ) => {
    const form = new FormData();
    if (data.file) form.append("file", data.file);
    if (data.document_id) form.append("document_id", String(data.document_id));
    if (data.note) form.append("note", data.note);
    return request<{ message: string; request: any }>(`/ess/admin/requests/${id}/fulfill`, {
      method: "POST",
      body: form,
    });
  },
  /** ESS Management releases a module result to the employee. */
  releaseRequest: (id: string | number, note?: string) =>
    request<{ message: string; request: ApiEssRequestItem }>(
      `/ess/admin/requests/${id}/release`,
      { method: "POST", body: JSON.stringify({ ...(note ? { note } : {}) }) },
    ),
  /** ESS Management sends an already-reviewed request to a module. */
  dispatchRequest: (id: string | number, module?: string, note?: string) =>
    request<{ message: string; request: ApiEssRequestItem }>(
      `/ess/admin/requests/${id}/dispatch`,
      {
        method: "POST",
        body: JSON.stringify({ ...(module ? { module } : {}), ...(note ? { note } : {}) }),
      },
    ),
  /** ESS Management reroutes a request; any applied module result is reversed. */
  rerouteRequest: (id: string | number, module: string, note?: string) =>
    request<{ message: string; request: ApiEssRequestItem }>(
      `/ess/admin/requests/${id}/reroute`,
      { method: "POST", body: JSON.stringify({ module, ...(note ? { note } : {}) }) },
    ),
  /** Routing ledger for one request (dispatch/accept/complete/release legs). */
  requestRoutings: (id: string | number) =>
    request<{ routings: any[] }>(`/ess/admin/requests/${id}/routings`),

  // Generic module inbox (ERM uses its bespoke endpoints; these serve the
  // Attendance / Payroll / Performance queues and future modules).
  moduleRequests: (module: string, params?: Record<string, any>) => {
    const qs = params ? toQueryString(params) : "";
    return request<{
      module: string;
      module_label: string;
      counts: {
        total: number;
        for_dispatch: number;
        with_module: number;
        for_release: number;
      };
      requests: ApiEssRequestItem[];
    }>(`/ess/modules/${module}/requests${qs ? `?${qs}` : ""}`);
  },
  acceptModuleRequest: (module: string, id: string | number) =>
    request<{ message: string; request: ApiEssRequestItem }>(
      `/ess/modules/${module}/requests/${id}/accept`,
      { method: "POST" },
    ),
  declineModuleRequest: (module: string, id: string | number, reason: string) =>
    request<{ message: string; request: ApiEssRequestItem }>(
      `/ess/modules/${module}/requests/${id}/decline`,
      { method: "POST", body: JSON.stringify({ reason }) },
    ),
  completeModuleRequest: (
    module: string,
    id: string | number,
    data: Record<string, any> = {},
  ) => {
    const isForm = Object.values(data).some((v) => v instanceof File);
    if (!isForm) {
      return request<{ message: string; request: ApiEssRequestItem }>(
        `/ess/modules/${module}/requests/${id}/complete`,
        { method: "POST", body: JSON.stringify(data) },
      );
    }

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (value instanceof File) form.append(key, value);
      else form.append(key, String(value));
    });

    return request<{ message: string; request: ApiEssRequestItem }>(
      `/ess/modules/${module}/requests/${id}/complete`,
      { method: "POST", body: form },
    );
  },
  /** Same-origin URL to stream a file attached to the employee's own request
   *  (their upload or HR's fulfilment) with ?token= auth for browser opens. */
  requestAttachmentUrl: (requestId: string | number, attachmentId: string | number) => {
    const token = getToken();
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    return `/api/v1/ess/requests/${requestId}/attachments/${attachmentId}/file${qs}`;
  },
  /** HR view of an attachment on any employee request (ESS Management access). */
  adminRequestAttachmentUrl: (
    requestId: string | number,
    attachmentId: string | number,
  ) => {
    const token = getToken();
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    return `/api/v1/ess/admin/requests/${requestId}/attachments/${attachmentId}/file${qs}`;
  },
  /** Same-origin URL to stream the employee's own document file with ?token= auth. */
  documentFileUrl: (documentId: string | number) => {
    const token = getToken();
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    return `/api/v1/ess/my-documents/${documentId}/file${qs}`;
  },
  clock: (action: "clock_in" | "clock_out") =>
    request<{ message: string; record: any }>("/ess/clock", {
      method: "POST",
      body: JSON.stringify({ action }),
    }),
  myPromotionRequests: () => request<{ data: ApiPromotionRequest[] }>("/ess/my-promotion-requests"),
  // ESS-safe promotion position options (id/title/department only — no Core HCM permission needed).
  promotionPositions: () =>
    request<{ data: { position_id: number; title: string; department?: string | null }[] }>(
      "/ess/promotion-positions",
    ),
  // ESS-safe view of the employee's OWN onboarding checklist.
  myChecklist: () =>
    request<{
      data: any[];
      new_hire: { new_hire_id: number; new_hire_code: string; name: string; stage: string } | null;
    }>("/ess/my-checklist"),
  createPromotionRequest: (data: FormData) =>
    request<{ message: string; data: ApiPromotionRequest }>("/ess/my-promotion-requests", {
      method: "POST",
      body: data,
    }),

  // Admin & Superadmin Management
  adminRequests: (params?: Record<string, any>) => {
    const qs = params ? toQueryString(params) : "";
    return request<{
      counts: {
        total: number;
        pending: number;
        under_review: number;
        for_dispatch: number;
        with_module: number;
        for_release: number;
        approved: number;
        for_fulfillment: number;
        completed: number;
        rejected: number;
        returned: number;
        cancelled: number;
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

/* ========================================================================= */
/* Employee Records Management (ERM) — ESS document-request fulfilment loop  */
/* ========================================================================= */

export const ermApi = {
  /** Document requests filed by employees in ESS and routed to ERM. */
  documentRequests: (params?: Record<string, any>) => {
    const qs = params ? toQueryString(params) : "";
    return request<{
      counts: { total: number; pending: number; for_release: number; fulfilled: number };
      requests: ApiDocumentRequest[];
    }>(`/erm/document-requests${qs ? `?${qs}` : ""}`);
  },
  documentRequest: (id: string | number) =>
    request<{ request: ApiDocumentRequest }>(`/erm/document-requests/${id}`),
  /** Fulfil a request: upload a fresh file and/or attach an archived
   *  document (Team 8 seam) by id. */
  fulfill: (id: string | number, data: { file?: File; document_id?: number; note?: string }) => {
    const form = new FormData();
    if (data.file) form.append("file", data.file);
    if (data.document_id) form.append("document_id", String(data.document_id));
    if (data.note) form.append("note", data.note);
    return request<{ message: string; request: ApiDocumentRequest }>(
      `/erm/document-requests/${id}/fulfill`,
      { method: "POST", body: form },
    );
  },
  attachmentFileUrl: (requestId: string | number, attachmentId: string | number) => {
    const token = getToken();
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    return `/api/v1/erm/document-requests/${requestId}/attachments/${attachmentId}/file${qs}`;
  },

  /** The ERM-owned 201 dossier (employment master + personal/gov data). */
  employees: {
    dossier: (id: number | string) => request<{ data: ApiEmployee }>(`/erm/employees/${id}`),
    updateDossier: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; data: ApiEmployee }>(`/erm/employees/${id}/dossier`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    contacts: (id: number | string) =>
      request<{ contacts: ApiEmergencyContact[] }>(`/erm/employees/${id}/emergency-contacts`),
    addContact: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; contact: ApiEmergencyContact }>(
        `/erm/employees/${id}/emergency-contacts`,
        { method: "POST", body: JSON.stringify(data) },
      ),
    updateContact: (id: number | string, contactId: number | string, data: Record<string, any>) =>
      request<{ message: string; contact: ApiEmergencyContact }>(
        `/erm/employees/${id}/emergency-contacts/${contactId}`,
        { method: "PUT", body: JSON.stringify(data) },
      ),
    removeContact: (id: number | string, contactId: number | string) =>
      request<{ message: string }>(`/erm/employees/${id}/emergency-contacts/${contactId}`, {
        method: "DELETE",
      }),
    documents: (id: number | string) =>
      request<{ documents: ApiDocument[] }>(`/erm/employees/${id}/documents`),
    uploadDocument: (
      id: number | string,
      data: {
        title: string;
        category: string;
        file?: File;
        document_date?: string;
        expiry_date?: string;
        document_status?: string;
      },
    ) => {
      const form = new FormData();
      form.append("title", data.title);
      form.append("category", data.category);
      if (data.file) form.append("file", data.file);
      if (data.document_date) form.append("document_date", data.document_date);
      if (data.expiry_date) form.append("expiry_date", data.expiry_date);
      if (data.document_status) form.append("document_status", data.document_status);
      return request<{ message: string; document: ApiDocument }>(`/erm/employees/${id}/documents`, {
        method: "POST",
        body: form,
      });
    },
    verifyDocument: (id: number | string, documentId: number | string, status: string) =>
      request<{ message: string; document: ApiDocument }>(
        `/erm/employees/${id}/documents/${documentId}/verify`,
        { method: "POST", body: JSON.stringify({ status }) },
      ),
    updateDocument: (
      id: number | string,
      documentId: number | string,
      data: {
        title?: string;
        category?: string;
        document_status?: string;
        document_date?: string;
        expiry_date?: string;
      },
    ) =>
      request<{ message: string; document: ApiDocument }>(
        `/erm/employees/${id}/documents/${documentId}`,
        { method: "PUT", body: JSON.stringify(data) },
      ),
    removeDocument: (id: number | string, documentId: number | string) =>
      request<{ message: string }>(`/erm/employees/${id}/documents/${documentId}`, {
        method: "DELETE",
      }),
    documentFileUrl: (id: number | string, documentId: number | string) => {
      const token = getToken();
      const qs = token ? `?token=${encodeURIComponent(token)}` : "";
      return `/api/v1/erm/employees/${id}/documents/${documentId}/file${qs}`;
    },
    updateExitRecord: (id: number | string, data: Record<string, any>) =>
      request<{ message: string; exit_record: ApiExitRecord }>(`/erm/employees/${id}/exit-record`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    archive: (id: number | string) =>
      request<{ message: string }>(`/erm/employees/${id}/archive`, { method: "POST" }),
    restore: (id: number | string) =>
      request<{ message: string; data: ApiEmployee }>(`/erm/employees/${id}/restore`, {
        method: "POST",
      }),
    archived: () => request<{ data: ApiEmployee[] }>(`/erm/employees/archived`),
  },
};

export interface ApiChatbotSource {
  faq_id: number;
  question: string;
}

export interface ApiChatbotReply {
  reply: string;
  quick_replies: string[];
  topic: string | null;
  source?: "gemini" | "fallback";
  /** True when the rule engine answered (Gemini unavailable). */
  reduced?: boolean;
  /** DB id of the stored exchange — used for thumbs feedback. */
  message_id?: number | null;
  /** Curated FAQ entries the answer was based on. */
  sources?: ApiChatbotSource[];
}

export type ChatbotRole = "guest" | "applicant" | "employee" | "admin" | "superadmin";

export interface ChatbotTurn {
  role: "user" | "model";
  text: string;
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

export interface ApiChatbotAnalytics {
  conversations_today: number;
  messages_today: number;
  gemini_messages_30d: number;
  fallback_messages_30d: number;
  feedback_up: number;
  feedback_down: number;
  gemini_tokens_month: number;
  trend_14d: { date: string; conversations: number }[];
}

export interface ApiChatbotUnanswered {
  id: string;
  message: string;
  hits: number;
  last_at: string | null;
}

export const chatbotApi = {
  chat: (data: {
    message: string;
    session_id?: string | null;
    topic?: string | null;
    role?: ChatbotRole;
    history?: ChatbotTurn[];
  }) =>
    request<ApiChatbotReply>("/landing/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sessions: () => request<{ data: ApiChatSession[] }>("/chatbot/sessions"),
  sessionMessages: (sessionId: string) =>
    request<{ data: ApiChatSessionMessage[] }>(
      `/chatbot/sessions/${encodeURIComponent(sessionId)}/messages`,
    ),
};

export interface ApiChatSession {
  session_id: string;
  last_at: string;
  exchanges: number;
}

export interface ApiChatSessionMessage {
  id: number;
  message: string;
  reply: string;
  source: string | null;
  feedback: number | null;
  created_at: string;
}

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
  analytics: () => request<{ data: ApiChatbotAnalytics }>("/chatbot/analytics"),
  unanswered: () => request<{ data: ApiChatbotUnanswered[] }>("/chatbot/unanswered"),
  dismissUnanswered: (hash: string) =>
    request<{ message: string }>(`/chatbot/unanswered/${hash}`, { method: "DELETE" }),
  messageFeedback: (messageId: number, value: 1 | -1 | 0, sessionId?: string | null) =>
    request<{ message: string }>(`/chatbot/messages/${messageId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ value, session_id: sessionId ?? null }),
    }),
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

/* ========================================================================= */
/* 12. GLOBAL SITE SEARCH (non-confidential, role-gated)                      */
/* ========================================================================= */

export interface SearchHit {
  id: number | string;
  title: string;
  subtitle: string | null;
}

export interface GlobalSearchResult {
  departments: SearchHit[];
  positions: SearchHit[];
  jobs: SearchHit[];
  statuses: { title: string; subtitle: string }[];
  employees: SearchHit[];
  employees_hidden: boolean;
}

export interface UnifiedSearchResult {
  id: number | string;
  type: string;
  module: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface UnifiedSearchGroup {
  module: string;
  count: number;
  items: UnifiedSearchResult[];
}

export interface UnifiedSearchResponse {
  results: UnifiedSearchGroup[];
  total: number;
  query: string;
}

export const searchApi = {
  global: (q: string, limit = 6) =>
    request<{ data: GlobalSearchResult }>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  unified: (q: string, limit = 8) =>
    request<{ data: UnifiedSearchResponse }>(
      `/search/unified?q=${encodeURIComponent(q)}&limit=${limit}`,
    ),
};

/* ========================================================================= */
/* 13. PROFILE PHOTO                                                          */
/* ========================================================================= */

export const profileApi = {
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return request<{ message: string; url: string }>("/profile/photo", {
      method: "POST",
      body: formData,
    });
  },
  removePhoto: () => request<{ message: string }>("/profile/photo", { method: "DELETE" }),
};
