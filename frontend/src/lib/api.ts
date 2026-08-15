/**
 * Centralized API client connecting the React frontend to the Laravel Backend API.
 */

const BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string) || 'http://127.0.0.1:8000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // response wasn't JSON
    }
    const message = errorData?.message || `Request failed with status ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
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
  stage: "Screened" | "Interview Scheduled" | "Assessed" | "Offer" | "Hired" | "Rejected";
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
  interviews?: ApiInterview[];
  assessment?: ApiAssessment;
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
}

export const applicantsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiApplicant[]; meta: any }>(`/applicants${qs ? `?${qs}` : ''}`);
  },
  get: (id: number | string) => request<ApiApplicant>(`/applicants/${id}`),
  create: (formData: FormData | Record<string, any>) => {
    const isForm = formData instanceof FormData;
    return request<ApiApplicant>('/applicants', {
      method: 'POST',
      body: isForm ? formData : JSON.stringify(formData),
    });
  },
  update: (id: number | string, data: FormData | Record<string, any>) => {
    const isForm = data instanceof FormData;
    return request<ApiApplicant>(`/applicants/${id}`, {
      method: isForm ? 'POST' : 'PUT',
      body: isForm ? data : JSON.stringify(data),
    });
  },
  delete: (id: number | string) => request<{ message: string }>(`/applicants/${id}`, { method: 'DELETE' }),
  hire: (id: number | string) => request<ApiApplicant>(`/applicants/${id}/hire`, { method: 'POST' }),
  stats: () => request<any>('/applicants/stats'),
  createAssessment: (applicantId: number | string, data: Record<string, any>) =>
    request<ApiAssessment>(`/applicants/${applicantId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const interviewsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiInterview[]; meta: any }>(`/interviews${qs ? `?${qs}` : ''}`);
  },
  create: (data: Record<string, any>) =>
    request<ApiInterview>('/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiInterview>(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/interviews/${id}`, { method: 'DELETE' }),
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
  benefits: string[];
  platforms?: string[];
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
    return request<{ data: ApiJobPost[]; meta: any }>(`/job-posts${qs ? `?${qs}` : ''}`);
  },
  get: (id: number | string) => request<ApiJobPost>(`/job-posts/${id}`),
  create: (data: Record<string, any>) =>
    request<ApiJobPost>('/job-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiJobPost>(`/job-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/job-posts/${id}`, { method: 'DELETE' }),
  toggle: (id: number | string) =>
    request<ApiJobPost>(`/job-posts/${id}/toggle`, { method: 'PATCH' }),
  publish: (id: number | string, platforms: string[]) =>
    request<ApiJobPost>(`/job-posts/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ platforms }),
    }),
  stats: () => request<any>('/job-posts/stats'),
};

export const requisitionsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiRequisition[]; meta: any }>(`/requisitions${qs ? `?${qs}` : ''}`);
  },
  get: (id: number | string) => request<ApiRequisition>(`/requisitions/${id}`),
  create: (data: Record<string, any>) =>
    request<ApiRequisition>('/requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiRequisition>(`/requisitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  convert: (id: number | string, jobPostId?: number) =>
    request<ApiRequisition>(`/requisitions/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify({ job_post_id: jobPostId }),
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
    employee_onboarding_item_id: number;
    item_text: string;
    done: boolean;
    completed_at: string | null;
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
    return request<{ data: ApiNewHire[]; meta: any }>(`/new-hires${qs ? `?${qs}` : ''}`);
  },
  get: (id: number | string) => request<ApiNewHire>(`/new-hires/${id}`),
  create: (data: Record<string, any>) =>
    request<ApiNewHire>('/new-hires', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiNewHire>(`/new-hires/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/new-hires/${id}`, { method: 'DELETE' }),
  promoteStage: (id: number | string) =>
    request<ApiNewHire>(`/new-hires/${id}/promote-stage`, { method: 'POST' }),
  stats: () => request<any>('/new-hires/stats'),
};

export const checklistTemplatesApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiChecklistTemplate[]; meta: any }>(`/checklist-templates${qs ? `?${qs}` : ''}`);
  },
  get: (id: number | string) => request<ApiChecklistTemplate>(`/checklist-templates/${id}`),
  create: (data: Record<string, any>) =>
    request<ApiChecklistTemplate>('/checklist-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number | string, data: Record<string, any>) =>
    request<ApiChecklistTemplate>(`/checklist-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/checklist-templates/${id}`, { method: 'DELETE' }),
  addItem: (templateId: number | string, item: { item_text: string; sort_order: number }) =>
    request<any>(`/checklist-templates/${templateId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateItem: (itemId: number | string, item: Partial<{ item_text: string; sort_order: number }>) =>
    request<any>(`/checklist-items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    }),
  deleteItem: (itemId: number | string) =>
    request<{ message: string }>(`/checklist-items/${itemId}`, { method: 'DELETE' }),
};

export const onboardingItemsApi = {
  listForNewHire: (newHireId: number | string) =>
    request<any[]>(`/new-hires/${newHireId}/onboarding-items`),
  bulkCreate: (newHireId: number | string, templateId: number | string) =>
    request<any>(`/new-hires/${newHireId}/onboarding-items/bulk`, {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId }),
    }),
  toggle: (itemId: number | string) =>
    request<{ employee_onboarding_item_id: number; done: boolean; completed_at: string | null }>(
      `/onboarding-items/${itemId}/toggle`,
      { method: 'PATCH' }
    ),
};

export const checklistRequestsApi = {
  list: (params?: Record<string, any>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ data: ApiChecklistRequest[]; meta: any }>(`/checklist-requests${qs ? `?${qs}` : ''}`);
  },
  create: (data: Record<string, any>) =>
    request<ApiChecklistRequest>('/checklist-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approve: (id: number | string) =>
    request<ApiChecklistRequest>(`/checklist-requests/${id}/approve`, { method: 'POST' }),
  reject: (id: number | string) =>
    request<ApiChecklistRequest>(`/checklist-requests/${id}/reject`, { method: 'POST' }),
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

export const settingsApi = {
  getAll: () => request<{ data: ApiSystemSetting[]; map: Record<string, any> }>('/settings'),
  get: (key: string) => request<ApiSystemSetting>(`/settings/${key}`),
  upsert: (key: string, value: any) =>
    request<ApiSystemSetting>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ setting_value: value }),
    }),
  bulkUpsert: (settings: { key: string; value: any }[]) =>
    request<{ message: string; data: ApiSystemSetting[] }>('/settings/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ settings }),
    }),
  delete: (key: string) => request<{ message: string }>(`/settings/${key}`, { method: 'DELETE' }),
};
