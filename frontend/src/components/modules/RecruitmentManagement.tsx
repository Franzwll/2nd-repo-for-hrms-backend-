import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronsUpDown,
  ClipboardList,
  Clock,
  Copy,
  Database,
  Download,
  Eye,
  FilePlus2,
  FileCheck,
  Check,
  ChevronDown,
  FileText,
  Flag,
  Lock,
  GraduationCap,
  GripVertical,
  Info,
  LayoutGrid,
  List,
  Loader2,
  PencilRuler,
  Plus,
  Printer,
  Repeat,
  ScanLine,
  Search,
  Send,
  Settings2,
  Sliders,
  Sparkles,
  SquareArrowOutUpRight,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useBlocker } from "@tanstack/react-router";

import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { PageHeader } from "@/components/portal/PageHeader";
import { StatCard } from "@/components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { CardSkeleton, StatCardsSkeleton } from "@/components/ui/loading-skeletons";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { ListBody } from "@/components/portal/ListBody";
import { DEFAULT_PAGE_SIZE } from "@/hooks/usePagination";
import { Textarea } from "@/components/ui/textarea";
import { peso, type Job, type JobStatus } from "@/data/jobs";
import { departments, positions, type Department, type Position } from "@/data/hr";
import {
  requisitionStore,
  useRequisitions,
  useRequisitionsLoading,
  type Requisition,
} from "@/data/requisitions";
import {
  assessmentCriteria,
  interviewers,
  screeningCriteria,
  statusMeta,
  type ApplicantStatus,
  type VerificationDocType,
} from "@/data/applicants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSort } from "@/components/portal/sortable";
import {
  UnifiedDocumentsUploader,
  pickResumeDoc,
  type UnifiedDoc,
} from "@/components/documents/UnifiedDocumentsUploader";
import { cn, downloadTextFile } from "@/lib/utils";
import {
  API_BASE_URL,
  applicantDocumentsApi,
  applicantsApi,
  coreHcmApi,
  jobPostsApi,
  resolveStorageUrl,
  screeningApi,
  type ApiJobPost,
  type ApiRequirementTemplate,
  type ApiScreeningPreview,
  type ApiScreeningReference,
  type JobAiUsage,
  type JobDraftErrorPayload,
  type JobDraftPayload,
  type RequirementTemplatePayload,
  type ScreeningConfiguration,
  type ScreeningRequirementEntityType,
} from "@/lib/api";
import {
  reportedEntitiesStore,
  useReportedEntities,
  type ReportedEntity,
  type ReportedEntityType,
} from "@/data/reported-entities";
import {
  isValidEmail,
  isValidName,
  isValidPhone,
  sanitizeDecimalString,
  sanitizeDigitsOnly,
  sanitizeInteger,
  sanitizeName,
  sanitizePhone,
} from "@/lib/validation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type ReportData,
} from "@/lib/report-export";
import { ReportMenu } from "@/components/ui/report-menu";
import {
  RequirementMatchPanel,
  ResumeInfoPanel,
  ScreeningDetailsAccordion,
  ScreeningModalSummary,
  ScreeningReferenceManager,
  ScreeningResumeDocsMatchDetail,
  keywordLibrary,
  shortEducationLabel,
  type ScreeningRequirementRow,
} from "@/components/modules/ApplicantManagement";

function transformApiJob(j: ApiJobPost): Job {
  const filled = Number(j.filled_count) || 0;
  /* Hires can outnumber the posted vacancies (e.g. 7 filled / 4 posted) when
     candidates arrive from other channels. The Core HCM positions table keeps
     vacancies >= filled, so the posting is normalized the same way here — the
     "n/m filled" badge and remaining-slot checks never see an impossible ratio. */
  const vacancies = Math.max(Number(j.vacancies) || 1, filled);
  const job: Job = {
    id: j.slug || String(j.job_post_id),
    dbId: j.job_post_id,
    positionId: j.position_id ?? null,
    title: j.title,
    department: j.department || "Front Office",
    employmentType: j.employment_type,
    schedule: j.schedule || "Shifting Schedule",
    salaryMin: Number(j.salary_min) || 0,
    salaryMax: Number(j.salary_max) || 0,
    vacancies,
    filled,
    posted: j.posted_date || new Date().toISOString().slice(0, 10),
    status: j.status,
    active: Boolean(j.active),
    experience: (j.experience_level || "1-2 Years") as any,
    education: (j.education_level || "High School Graduate") as any,
    /* Accepted level chips. The scalars above are the weakest accepted level,
       so a post saved before the list columns existed still shows one chip. */
    experienceLevels: acceptedLevels(j.experience_levels, j.experience_level),
    educationLevels: acceptedLevels(j.education_levels, j.education_level),
    summary: j.summary || "",
    description: j.description || "",
    responsibilities: j.responsibilities || [],
    qualifications: j.qualifications || [],
    skills: j.skills || [],
    additional: j.additional || [],
    instructions: j.instructions || "",
    about: j.about || "",
    benefits: [],
    applicants: Number(j.applicants_count) || 0,
    platforms: normalizePlatforms(j.platforms),
    blocks: j.blocks ?? null,
    /* Test requirements resolved by the backend (Core HCM position flags,
       owner). Read-only in Recruitment — shown as badges in Job Info. */
    requires_assessment: j.requires_assessment ?? false,
    requires_practical: j.requires_practical ?? false,
  };
  if (j.picture_url) job.picture = resolveStorageUrl(j.picture_url) ?? "";
  return job;
}

/** Colour-coded urgency badge classes. */
const urgencyBadge = (urgency: string) =>
  urgency === "Urgent"
    ? "border-destructive/40 bg-destructive/10 text-destructive"
    : urgency === "High"
      ? "border-warning/40 bg-warning/20 text-warning-foreground"
      : urgency === "Low"
        ? "border-border bg-muted text-muted-foreground"
        : "border-primary/30 bg-secondary/50 text-primary";

/** Certification-like text — TESDA / NC levels, certificates, licenses. The
 *  single line heuristic the Screening Requirements panel, the Entities card,
 *  the AI checklist modal and the requirement templates read certifications
 *  with, so they can never drift apart. */
const CERTIFICATION_LINE_RE =
  /nc\s*(i{1,3}|iv|1-4)|tesda|certificate|certification|license|licence|food handler/i;

/** Classifies a requirement-template term for the vocabulary: certification
 *  names (TESDA / NC II / certificate / license…) become certifications so the
 *  NLP credential analysis can verify them; everything else is a skill. */
function guessRefType(term: string): "skill" | "certification" {
  return CERTIFICATION_LINE_RE.test(term) ? "certification" : "skill";
}

/** Entity types the reported-entity queue can be promoted into. */
const REPORTED_TYPES: ReportedEntityType[] = [
  "education",
  "certification",
  "skill",
  "job_role",
  "experience",
];

const REPORTED_TYPE_LABELS: Record<ReportedEntityType, string> = {
  education: "Education",
  certification: "Certificate",
  skill: "Skill",
  job_role: "Job Role",
  experience: "Experience",
};

/** Structured job-post levels the education / experience requirement entities map to. */
const EDUCATION_LEVEL_OPTIONS = [
  "High School Graduate",
  "Vocational / TESDA",
  "College Level",
  "Bachelor's Degree",
] as const;

const EXPERIENCE_LEVEL_OPTIONS = ["No Experience", "1-2 Years", "3-5 Years", "5+ Years"] as const;

/**
 * Requirement-template entity types — the screening entity set (skill, job
 * role, certification, education, experience) plus the job post target each
 * one fills when a template is applied in the builder.
 */
const REQUIREMENT_ENTITY_META: {
  value: ScreeningRequirementEntityType;
  label: string;
  className: string;
  appliesTo: string;
}[] = [
  {
    value: "skill",
    label: "Skill",
    className: "border-primary/40 bg-primary/10 text-primary",
    appliesTo: "Screening Requirements panel",
  },
  {
    value: "certification",
    label: "Certification",
    className: "border-warning/40 bg-warning/20 text-warning-foreground",
    appliesTo: "Qualifications — screened as required certifications",
  },
  {
    value: "job_role",
    label: "Job role",
    className: "border-success/40 bg-success/10 text-success",
    appliesTo: "Qualifications — “Experience as …”",
  },
  {
    value: "education",
    label: "Education",
    className: "border-border bg-muted text-muted-foreground",
    appliesTo: "Job post education level",
  },
  {
    value: "experience",
    label: "Experience",
    className: "border-border bg-muted text-muted-foreground",
    appliesTo: "Job post experience level",
  },
];

const requirementEntityMeta = (type: ScreeningRequirementEntityType) =>
  REQUIREMENT_ENTITY_META.find((m) => m.value === type) ?? REQUIREMENT_ENTITY_META[0]!;

/** The same levels the Core HCM / job_posts columns accept (case-insensitive match). */
const isEducationLevel = (value: string) =>
  EDUCATION_LEVEL_OPTIONS.find((l) => l.toLowerCase() === value.trim().toLowerCase());

const isExperienceLevel = (value: string) =>
  EXPERIENCE_LEVEL_OPTIONS.find((l) => l.toLowerCase() === value.trim().toLowerCase());

/**
 * Accepted level chips for a draft: the API's list, falling back to the single
 * legacy scalar so posts saved before the list columns existed keep their
 * level. Blanks dropped, duplicates collapsed, order preserved.
 */
function acceptedLevels(list?: string[] | null, scalar?: string | null): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (value: string | null | undefined) => {
    const text = String(value ?? "").trim();
    const key = normalizeEntityText(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(text);
  };
  (list ?? []).forEach(push);
  if (out.length === 0) push(scalar);
  return out;
}

/**
 * The level that gates screening: with several levels accepted ("any of these")
 * that is the WEAKEST one, and it is what the single-value education_level /
 * experience_level columns carry. Falls back to the first accepted level when
 * none of them are in the known order (Reference Data added a new one).
 */
function weakestAcceptedLevel(levels: readonly string[], order: readonly string[]): string | null {
  let weakest: string | null = null;
  let weakestRank = Number.POSITIVE_INFINITY;
  for (const level of levels) {
    const rank = order.findIndex((l) => normalizeEntityText(l) === normalizeEntityText(level));
    if (rank < 0) continue;
    if (rank < weakestRank) {
      weakest = level;
      weakestRank = rank;
    }
  }
  return weakest ?? levels[0] ?? null;
}

/** Qualification lines that encode a template requirement entity: job role
 *  ("Experience as …") and non-standard education / experience values
 *  ("Education: …", "Experience: …"). The Screening Requirements panel reads
 *  roles and notes straight out of Qualifications, so a true replacement has
 *  to swap these lines out too. */
const EXPERIENCE_ROLE_LINE_RE = /^experience as\b/i;
const EDUCATION_NOTE_LINE_RE = /^education\s*:/i;
const EXPERIENCE_NOTE_LINE_RE = /^experience\s*:/i;

/**
 * Splits a requirement template into the pieces the Job Post Builder consumes:
 * the skill and certification terms, the qualification lines (certifications,
 * "Experience as …" roles, non-standard education / experience values) and the
 * two structured levels the NLP screening scores against.
 */
function templateRequirementParts(template: ApiRequirementTemplate) {
  const values = (type: ScreeningRequirementEntityType) =>
    template.items
      .filter((i) => i.entity_type === type)
      .map((i) => i.value.trim())
      .filter(Boolean);
  const educationValues = values("education");
  const experienceValues = values("experience");
  return {
    skills: values("skill"),
    certifications: values("certification"),
    /** Qualification lines this template contributes. */
    lines: [
      ...values("certification"),
      ...values("job_role").map((v) => `Experience as ${v}`),
      ...educationValues
        .filter((v) => !isEducationLevel(v))
        .map((v) => `Education: ${v}`),
      ...experienceValues
        .filter((v) => !isExperienceLevel(v))
        .map((v) => `Experience: ${v}`),
    ],
    /* Canonical levels the template requires. A template can name several — the
       chips accept "any of these" — while values outside the dropdown scale stay
       as qualification lines (see `lines` above). */
    educationLevels: [
      ...new Set(
        educationValues.map((v) => isEducationLevel(v)).filter((level) => level !== undefined),
      ),
    ],
    experienceLevels: [
      ...new Set(
        experienceValues.map((v) => isExperienceLevel(v)).filter((level) => level !== undefined),
      ),
    ],
  };
}

/**
 * Reported Entities — the queue filled by the flag buttons on UNRECOGNIZED
 * entities in every Resume Screening Result. HR either promotes a report into
 * the DB-managed screening vocabulary (type + optional aliases) or dismisses
 * it; promoted entries are recognized by the NLP service on the next run.
 */
export function ReportedEntitiesManager() {
  const reports = useReportedEntities();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [typeDrafts, setTypeDrafts] = useState<Record<string, ReportedEntityType>>({});
  const [aliasDrafts, setAliasDrafts] = useState<Record<string, string>>({});

  const pending = reports.filter((r) => r.status === "pending");
  const handled = reports.filter((r) => r.status !== "pending");
  const typeOf = (r: ReportedEntity) => typeDrafts[r.id] ?? r.suggestedType;

  const promote = async (r: ReportedEntity) => {
    setBusyId(r.id);
    try {
      await screeningApi.referenceData.create({
        data_type: typeOf(r),
        canonical_value: r.value,
        aliases_json: (aliasDrafts[r.id] ?? "")
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        active: true,
      });
      reportedEntitiesStore.markProcessed(r.id);
      toast.success(`"${r.value}" added to the screening vocabulary`, {
        description: "Future screenings will classify it as recognized.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (/unique|already|duplicate/i.test(msg)) {
        reportedEntitiesStore.markProcessed(r.id);
        toast.info(`"${r.value}" is already in the vocabulary — marked as processed`);
      } else {
        toast.error(`"${r.value}" could not be added — ${msg || "please try again."}`);
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-semibold">
            <Flag className="h-4 w-4 text-warning-foreground" /> Reported Entities
            {pending.length > 0 && <Badge variant="secondary">{pending.length} pending</Badge>}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Flagged as unrecognized during screening. Add them to the vocabulary so future runs
            recognize them.
          </p>
        </div>
        {handled.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => reportedEntitiesStore.clearProcessed()}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear handled ({handled.length})
          </Button>
        )}
      </div>

      {pending.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
          Nothing reported yet. Flag an unrecognized entry from a Resume Screening Result and it
          will appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {pending.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{r.value}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                    {r.source}
                    {r.applicant ? ` · ${r.applicant}` : ""} · reported{" "}
                    {new Date(r.reportedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-[0.65rem]">
                  Suggested: {REPORTED_TYPE_LABELS[r.suggestedType]}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Select
                  value={typeOf(r)}
                  onValueChange={(v) =>
                    setTypeDrafts((p) => ({ ...p, [r.id]: v as ReportedEntityType }))
                  }
                >
                  <SelectTrigger className="h-8 w-40 cursor-pointer text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORTED_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {REPORTED_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="h-8 min-w-0 flex-1 text-xs"
                  placeholder="Aliases (comma separated, optional)"
                  value={aliasDrafts[r.id] ?? ""}
                  onChange={(e) => setAliasDrafts((p) => ({ ...p, [r.id]: e.target.value }))}
                />
                <Button
                  size="sm"
                  className="h-8 cursor-pointer"
                  disabled={busyId === r.id}
                  onClick={() => promote(r)}
                >
                  {busyId === r.id ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Add to vocabulary
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 cursor-pointer"
                  disabled={busyId === r.id}
                  onClick={() => reportedEntitiesStore.dismiss(r.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {handled.length > 0 && (
        <div className="rounded-md border border-border/70 bg-muted/20 p-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Handled ({handled.length})
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
            {handled.slice(0, 10).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2">
                <CheckCircle2
                  className={r.status === "processed" ? "h-3.5 w-3.5 text-success" : "h-3.5 w-3.5"}
                />
                <span className="font-medium text-foreground">{r.value}</span>
                <span>· {r.status === "processed" ? "added to vocabulary" : "dismissed"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Builder flip-card back face: Entities Indicated                      */
/* Whatever HR fills in the builder inputs and dropdowns is indicated   */
/* here as screening entities — Recognized chips (green check) match    */
/* resumes through the NLP service, Unrecognized chips (with a +        */
/* button) are flagged until added to the vocabulary. Matching order    */
/* mirrors backend reference_data.canonicalize: exact → boundary        */
/* substring → token containment.                                       */
/* ------------------------------------------------------------------ */

type BuilderEntityMapping = Record<
  "skills" | "job_roles" | "certifications" | "education" | "experience",
  Record<string, string[]>
>;

/**
 * Education / experience levels the Job Info selects offer.
 *
 * These used to be hard-coded lists, which meant HR could not require a level
 * the screening model did not know about. They are now derived from the
 * screening reference data (data_type education / experience), so the select,
 * the requirement templates and the NLP vocabulary stay in step. The static
 * lists are only a fallback for the moment before that reference data loads.
 */
const FALLBACK_EDUCATION_LEVELS = [
  "High School Graduate",
  "Vocational / TESDA",
  "College Level",
  "Bachelor's Degree",
] as const;
const FALLBACK_EXPERIENCE_LEVELS = ["No Experience", "1-2 Years", "3-5 Years", "5+ Years"] as const;

/** Reference-data levels, ordered so the broad qualifications read first and
 *  the narrower ones (degree specialisations) follow alphabetically. */
function levelsFromReference(
  mapping: BuilderEntityMapping | null,
  group: "education" | "experience",
  fallback: readonly string[],
): string[] {
  const fromRef = Object.keys(mapping?.[group] ?? {});
  if (fromRef.length === 0) return [...fallback];
  return [...fromRef].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function normalizeEntityText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

interface BuilderEntityIndex {
  exact: Map<string, string>;
  keys: string[];
}

/** Flattens {canonical: aliases} into an exact lookup plus longest-first keys. */
function buildBuilderEntityIndex(mapping: Record<string, string[]>): BuilderEntityIndex {
  const exact = new Map<string, string>();
  Object.entries(mapping ?? {}).forEach(([canonical, aliases]) => {
    const canonKey = normalizeEntityText(canonical);
    if (canonKey && !exact.has(canonKey)) exact.set(canonKey, canonical);
    (aliases ?? []).forEach((alias) => {
      const key = normalizeEntityText(alias);
      if (key && !exact.has(key)) exact.set(key, canonical);
    });
  });
  return { exact, keys: [...exact.keys()].sort((a, b) => b.length - a.length) };
}

/** Exact → boundary-substring → token-containment, like the NLP service. */
function canonicalizeBuilderEntity(value: string, index: BuilderEntityIndex): string | null {
  const norm = normalizeEntityText(value);
  if (!norm) return null;
  const direct = index.exact.get(norm);
  if (direct) return direct;
  const padded = ` ${norm} `;
  for (const key of index.keys) {
    if (key.length >= 4 && padded.includes(` ${key} `)) return index.exact.get(key) ?? null;
  }
  const valueTokens = new Set(norm.split(" "));
  let best: string | null = null;
  let bestLen = 0;
  for (const key of index.keys) {
    const keyTokens = key.split(" ");
    if (keyTokens.length < 2 || key.length <= bestLen) continue;
    if (keyTokens.every((t) => valueTokens.has(t))) {
      best = index.exact.get(key) ?? null;
      bestLen = key.length;
    }
  }
  return best;
}

interface BuilderEntityHit {
  canonical: string;
  sample: string;
}

/** Splits filled lines into recognized canonicals vs unrecognized raw lines. */
function analyzeBuilderEntityLines(
  rawLines: string[],
  index: BuilderEntityIndex,
): { recognized: BuilderEntityHit[]; unrecognized: string[] } {
  const recognized = new Map<string, string>();
  const unrecognized: string[] = [];
  const seenUnrecognized = new Set<string>();
  rawLines.forEach((raw) => {
    const line = raw.trim();
    if (!line) return;
    const hits = new Set<string>();
    const whole = canonicalizeBuilderEntity(line, index);
    if (whole) hits.add(whole);
    const padded = ` ${normalizeEntityText(line)} `;
    index.keys.forEach((key) => {
      if (key.length >= 4 && padded.includes(` ${key} `)) {
        const canonical = index.exact.get(key);
        if (canonical) hits.add(canonical);
      }
    });
    if (hits.size === 0) {
      const key = normalizeEntityText(line);
      if (!seenUnrecognized.has(key)) {
        seenUnrecognized.add(key);
        unrecognized.push(line);
      }
    } else {
      hits.forEach((canonical) => {
        if (!recognized.has(canonical)) recognized.set(canonical, line);
      });
    }
  });
  return {
    recognized: [...recognized.entries()].map(([canonical, sample]) => ({ canonical, sample })),
    unrecognized,
  };
}

/** Per-resume scoring reference: group weights (points out of 100) plus the
 *  pass gate, mirroring matching.match_profile_to_requirements. Weights come
 *  live from Screening Setup when reachable, otherwise documented defaults. */
interface BuilderScoringRef {
  weights: { skills: number; experience: number; education: number; certifications: number };
  passingScore: number;
  coverageMin: number;
  live: boolean;
}

const DEFAULT_BUILDER_SCORING: BuilderScoringRef = {
  weights: { skills: 40, experience: 30, education: 20, certifications: 10 },
  passingScore: 75,
  coverageMin: 0.6,
  live: false,
};

/** Reads live weights out of the saved/effective screening configuration. */
function builderScoringFromConfig(
  effective: ScreeningConfiguration | null | undefined,
): BuilderScoringRef {
  if (!effective) return DEFAULT_BUILDER_SCORING;
  const findWeight = (match: string, fallback: number): number => {
    const entry = Object.entries(effective.criteria ?? {}).find(([name]) =>
      name.toLowerCase().includes(match),
    );
    const raw = entry ? Number(entry[1]?.weight) : NaN;
    if (!Number.isFinite(raw)) return fallback;
    // Stored either as percent (40) or fraction (0.4).
    return raw > 0 && raw <= 1 ? raw * 100 : raw;
  };
  const coverageRaw = Number(effective.required_skills_coverage_min);
  const passingRaw = Number((effective as { passing_score?: unknown }).passing_score);
  return {
    weights: {
      skills: findWeight("skill", 40),
      experience: findWeight("experience", 30),
      education: findWeight("education", 20),
      certifications: findWeight("cert", 10),
    },
    passingScore: Number.isFinite(passingRaw) ? passingRaw : 75,
    coverageMin: Number.isFinite(coverageRaw) ? coverageRaw : 0.6,
    live: true,
  };
}

/** One entity group (skills / roles / certifications) with its chips. */
function BuilderEntityGroup({
  icon,
  title,
  hint,
  scoreLine,
  recognized,
  unrecognized,
  addType,
  addingTerm,
  onAdd,
  emptyText,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  scoreLine?: string;
  recognized: BuilderEntityHit[];
  unrecognized: string[];
  addType: (term: string) => "skill" | "job_role" | "certification";
  addingTerm: boolean;
  onAdd: (term: string, type: "skill" | "job_role" | "certification") => void;
  emptyText: string;
}) {
  return (
    <section className="rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          {icon} {title}
        </p>
        <span className="shrink-0 text-right">
          {scoreLine ? (
            <span className="block text-[0.7rem] font-semibold text-foreground">{scoreLine}</span>
          ) : null}
          <span className="block text-[0.68rem] font-medium text-muted-foreground">
            {recognized.length} recognized · {unrecognized.length} to review
          </span>
        </span>
      </div>
      <p className="mt-0.5 text-[0.68rem] text-muted-foreground">{hint}</p>
      {recognized.length === 0 && unrecognized.length === 0 ? (
        <p className="mt-2 text-xs italic text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recognized.map(({ canonical, sample }) => (
            <Badge key={canonical} variant="secondary" className="gap-1 py-1 pl-2 pr-1 text-xs">
              <span title={sample !== canonical ? `From: ${sample}` : undefined}>{canonical}</span>
              <span
                className="text-[0.6rem] text-success"
                title="Recognized by the screening model"
              >
                ✓
              </span>
            </Badge>
          ))}
          {unrecognized.map((term) => (
            <Badge key={term} variant="outline" className="gap-1 py-1 pl-2 pr-1 text-xs">
              {term}
              <button
                type="button"
                disabled={addingTerm}
                title={`Add "${term}" to the screening vocabulary so the model recognizes it in resumes`}
                className="rounded-sm px-0.5 text-[0.65rem] font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                onClick={() => onAdd(term, addType(term))}
              >
                +
              </button>
            </Badge>
          ))}
        </div>
      )}
    </section>
  );
}

/** Screening Requirements panel — replaces the old Required Skills textarea.
 *  Position picker drives the requirement template; skills edit as
 *  vocabulary-backed chips writing to the same draft.skills string so
 *  skills_json, ScreeningService and the careers page are untouched.
 *  Education / Experience stay editable in Job Info (source of truth) and
 *  render here read-only. Certifications are derived from Qualifications. */
function ScreeningRequirementsPanel({
  draft,
  mapping,
  loading,
  error,
  addingTerm,
  scoring,
  positions,
  templateName,
  templateSkillCount,
  templateCertCount,
  hasTemplateForPosition,
  onPickPosition,
  onLevelsChange,
  onSkillsChange,
  onCertificationsChange,
  onAdd,
  onRetry,
  onCreateTemplate,
  creatingTemplate,
}: {
  draft: Draft;
  mapping: BuilderEntityMapping | null;
  loading: boolean;
  error: string | null;
  addingTerm: boolean;
  scoring: BuilderScoringRef;
  positions: {
    dbId?: number | null | undefined;
    title: string;
    department: string;
    level?: string | undefined;
    salaryBand?: string | undefined;
  }[];
  templateName: string | null;
  templateSkillCount: number;
  templateCertCount: number;
  hasTemplateForPosition: boolean;
  onPickPosition: (
    department: string,
    title: string,
    positionDbId?: number | null | undefined,
  ) => void;
  /** Education / experience live here now — the two fields NLP scores against.
   *  Lists, because the chips accept several levels ("any of these"). */
  onLevelsChange: (levels: {
    educationLevels: string[];
    experienceLevels: string[];
  }) => void;
  onSkillsChange: (next: string) => void;
  /** Adds a certification line to Qualifications, where the panel reads them. */
  onCertificationsChange: (next: string) => void;
  onAdd: (term: string, type: "skill" | "job_role" | "certification") => void;
  onRetry: () => void;
  /** Saves a requirement template for this position straight from the panel. */
  onCreateTemplate: () => void;
  creatingTemplate: boolean;
}) {
  const [comboOpen, setComboOpen] = useState(false);
  const [comboQuery, setComboQuery] = useState("");
  const [certComboOpen, setCertComboOpen] = useState(false);
  const [certQuery, setCertQuery] = useState("");
  /* Options come from screening reference data so the dropdown, the
     requirement templates and the NLP vocabulary never drift apart. */
  const educationLevels = levelsFromReference(
    mapping,
    "education",
    FALLBACK_EDUCATION_LEVELS,
  );
  const experienceLevels = levelsFromReference(
    mapping,
    "experience",
    FALLBACK_EXPERIENCE_LEVELS,
  );
  const splitLines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const skillsIndex = useMemo(
    () => buildBuilderEntityIndex(mapping?.skills ?? {}),
    [mapping],
  );
  const certsIndex = useMemo(
    () => buildBuilderEntityIndex(mapping?.certifications ?? {}),
    [mapping],
  );
  const skillsResult = useMemo(
    () => analyzeBuilderEntityLines(splitLines(draft.skills), skillsIndex),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft.skills, skillsIndex],
  );
  const certCandidateLines = useMemo(
    () =>
      [...splitLines(draft.qualifications), ...splitLines(draft.skills)].filter((line) =>
        CERTIFICATION_LINE_RE.test(line),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft.qualifications, draft.skills],
  );
  const certResult = useMemo(
    () => analyzeBuilderEntityLines(certCandidateLines, certsIndex),
    [certCandidateLines, certsIndex],
  );

  const perSkill =
    skillsResult.recognized.length > 0
      ? (scoring.weights.skills * 0.7) / skillsResult.recognized.length
      : null;

  const skillOptions = useMemo(() => {
    const all = Object.keys(mapping?.skills ?? {});
    const used = new Set(splitLines(draft.skills).map((s) => s.toLowerCase()));
    const q = comboQuery.trim().toLowerCase();
    return all
      .filter((s) => !used.has(s.toLowerCase()))
      .filter((s) => !q || s.toLowerCase().includes(q))
      .slice(0, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapping, draft.skills, comboQuery]);

  /* Certifications are read out of the Qualifications block, so adding one
     means adding a line there — and registering the term in the screening
     vocabulary when it is new, otherwise resumes would never match it. */
  const certOptions = useMemo(() => {
    const all = Object.keys(mapping?.certifications ?? {});
    const used = new Set(
      splitLines(draft.qualifications)
        .concat(splitLines(draft.skills))
        .map((s) => s.toLowerCase()),
    );
    const q = certQuery.trim().toLowerCase();
    return all
      .filter((c) => !used.has(c.toLowerCase()))
      .filter((c) => !q || c.toLowerCase().includes(q))
      .slice(0, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapping, draft.qualifications, draft.skills, certQuery]);

  const addCertification = (term: string) => {
    const value = term.trim();
    if (!value) return;
    const known = Boolean(canonicalizeBuilderEntity(value, certsIndex));
    onCertificationsChange([...splitLines(draft.qualifications), value].join("\n"));
    // New terms only — picking an existing one must not create a duplicate row.
    if (!known) void onAdd(value, "certification");
    setCertComboOpen(false);
    setCertQuery("");
  };

  const removeSkill = (term: string) => {    const next = splitLines(draft.skills).filter(
      (s) => s.toLowerCase() !== term.toLowerCase(),
    );
    onSkillsChange(next.join("\n"));
  };
  const addSkill = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const have = new Set(splitLines(draft.skills).map((s) => s.toLowerCase()));
    if (have.has(t.toLowerCase())) {
      setComboOpen(false);
      setComboQuery("");
      return;
    }
    onSkillsChange([...splitLines(draft.skills), t].join("\n"));
    setComboOpen(false);
    setComboQuery("");
  };

  /* Positions are keyed by their Core HCM id, never by name: Front Office
     holds a Rank & File (POS-001) and a Staff (POS-018) "Front Desk
     Receptionist", and a name-only key collapses them into one. The label
     gains its level + band so those two read differently in the list. */
  const positionKey = (p: {
    dbId?: number | null | undefined;
    title: string;
    department: string;
  }) =>
    p.dbId !== undefined && p.dbId !== null
      ? `id:${p.dbId}`
      : `name:${p.department}|||${p.title}`;

  const titleDuplicates = positions.filter(
    (p) => p.department === draft.department && p.title === draft.title,
  ).length > 1;

  const positionLabel = (p: {
    title: string;
    department: string;
    level?: string | undefined;
    salaryBand?: string | undefined;
  }) => {
    const base = `${p.title} — ${p.department}`;
    return titleDuplicates && (p.level || p.salaryBand)
      ? `${base} · ${[p.level, p.salaryBand].filter(Boolean).join(" · ")}`
      : base;
  };

  const currentValue =
    draft.positionDbId !== null && draft.positionDbId !== undefined
      ? `id:${draft.positionDbId}`
      : draft.title && draft.department
        ? `name:${draft.department}|||${draft.title}`
        : "";

  if (loading) {
    return (
      <p className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading screening vocabulary…
      </p>
    );
  }
  if (error) {
    return (
      <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
        <p className="text-xs text-destructive">{error}</p>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Position picker — the control that resolves template + skills + certs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <Label className="shrink-0 text-[0.7rem]">Position</Label>
        <Select
          value={currentValue}
          onValueChange={(v) => {
            const picked = positions.find((p) => positionKey(p) === v);
            if (picked?.title && picked.department) {
              onPickPosition(picked.department, picked.title, picked.dbId ?? null);
            }
          }}
        >
          <SelectTrigger className="h-8 max-w-[360px] flex-1 text-xs">
            <SelectValue placeholder="Select a position from Core HR" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((p) => (
              <SelectItem key={positionKey(p)} value={positionKey(p)}>
                {positionLabel(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template provenance banner */}
      {templateName ? (
        <p className="rounded-md bg-secondary/40 px-2.5 py-1.5 text-[0.65rem] leading-relaxed text-muted-foreground">
          From template <span className="font-medium text-foreground">{templateName}</span> ·{" "}
          {templateSkillCount} skill{templateSkillCount === 1 ? "" : "s"},{" "}
          {templateCertCount} certification{templateCertCount === 1 ? "" : "s"} · every
          future posting of this role reuses it.
        </p>
      ) : (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-2.5">
          <p className="text-[0.7rem] font-medium">
            {hasTemplateForPosition
              ? "No requirement template applied yet."
              : `No requirement template for ${draft.title || "this position"}.`}
          </p>
          <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
            Screening will have no skills to match against. Pick from the vocabulary below, or
            save them as this position&apos;s requirement template.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-1.5 h-7 text-[0.7rem]"
            disabled={creatingTemplate}
            onClick={onCreateTemplate}
          >
            {creatingTemplate ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Plus className="mr-1 h-3 w-3" /> Create requirements for this position
              </>
            )}
          </Button>
        </div>
      )}

      {/* Skills — editable chips backed by draft.skills */}
      <section className="rounded-lg border border-border/60 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold">Skills</p>
            <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
              From this position&apos;s requirement template
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-right">
              <span className="block text-[0.7rem] font-semibold text-foreground">
                {scoring.weights.skills} pts ·{" "}
                {perSkill !== null
                  ? `≈${perSkill.toFixed(2)} pts each`
                  : "add recognized skills to score"}
              </span>
              <span className="block text-[0.68rem] font-medium text-muted-foreground">
                {skillsResult.recognized.length} recognized · {skillsResult.unrecognized.length}{" "}
                to review
              </span>
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 shrink-0 text-[0.7rem]"
              onClick={() => setComboOpen((o) => !o)}
            >
              <Plus className="mr-1 h-3 w-3" /> Add skill
            </Button>
          </div>
        </div>
        {skillsResult.recognized.length === 0 && skillsResult.unrecognized.length === 0 ? (
          <p className="mt-2 text-xs italic text-muted-foreground">
            No skills yet — pick from the vocabulary or apply a requirement template.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skillsResult.recognized.map(({ canonical, sample }) => (
              <Badge
                key={canonical}
                variant="secondary"
                className="gap-1 py-1 pl-2 pr-1 text-xs"
              >
                <span title={sample !== canonical ? `From: ${sample}` : undefined}>
                  {canonical}
                </span>
                <span className="text-[0.6rem] text-success" title="Recognized by the screening model">
                  ✓
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${canonical}`}
                  className="rounded-sm px-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  onClick={() => removeSkill(sample)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {skillsResult.unrecognized.map((term) => (
              <Badge key={term} variant="outline" className="gap-1 py-1 pl-2 pr-1 text-xs">
                {term}
                <button
                  type="button"
                  disabled={addingTerm}
                  title={`Add "${term}" to the screening vocabulary so the model recognizes it in resumes`}
                  className="rounded-sm px-0.5 text-[0.65rem] font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                  onClick={() => onAdd(term, "skill")}
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${term}`}
                  className="rounded-sm px-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  onClick={() => removeSkill(term)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {comboOpen && (
          <div className="relative mt-2">
            <Input
              autoFocus
              className="h-8 text-xs"
              placeholder="Type to search the screening vocabulary…"
              value={comboQuery}
              onChange={(e) => setComboQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setComboOpen(false);
                  setComboQuery("");
                }
                if (e.key === "Enter" && comboQuery.trim()) {
                  const first = skillOptions[0];
                  addSkill(first ?? comboQuery.trim());
                }
              }}
            />
            <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
              {skillOptions.length === 0 && !comboQuery.trim() ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Every vocabulary skill is already on this post.
                </p>
              ) : skillOptions.length === 0 ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted"
                  onClick={() => addSkill(comboQuery.trim())}
                >
                  <span>
                    Add <span className="font-medium">“{comboQuery.trim()}”</span> to this post
                  </span>
                </button>
              ) : (
                skillOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted"
                    onClick={() => addSkill(s)}
                  >
                    <span>{s}</span>
                    <span className="text-[0.65rem] font-medium text-success">in vocabulary</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Certifications — derived from Qualifications (+ skills), read-only here */}
      <section className="rounded-lg border border-border/60 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold">Certifications</p>
            <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
              Matched against the certification vocabulary · added here or written in Qualifications
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="text-right">
              <span className="block text-[0.7rem] font-semibold text-foreground">
                {scoring.weights.certifications} pts
              </span>
              <span className="block text-[0.68rem] font-medium text-muted-foreground">
                {certResult.recognized.length} recognized · {certResult.unrecognized.length} to
                review
              </span>
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[0.7rem]"
              onClick={() => setCertComboOpen((o) => !o)}
            >
              <Plus className="mr-1 h-3 w-3" /> Add certification
            </Button>
          </div>
        </div>
        {certResult.recognized.length === 0 && certResult.unrecognized.length === 0 ? (
          <p className="mt-2 text-xs italic text-muted-foreground">
            None detected yet — certification-like lines in Qualifications appear here.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {certResult.recognized.map(({ canonical, sample }) => (
              <Badge
                key={canonical}
                variant="secondary"
                className="gap-1 py-1 pl-2 pr-1 text-xs"
              >
                <span title={sample !== canonical ? `From: ${sample}` : undefined}>
                  {canonical}
                </span>
                <span className="text-[0.6rem] text-success" title="Recognized by the screening model">
                  ✓
                </span>
              </Badge>
            ))}
            {certResult.unrecognized.map((term) => (
              <Badge key={term} variant="outline" className="gap-1 py-1 pl-2 pr-1 text-xs">
                {term}
                <button
                  type="button"
                  disabled={addingTerm}
                  title={`Add "${term}" to the screening vocabulary`}
                  className="rounded-sm px-0.5 text-[0.65rem] font-bold text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                  onClick={() => onAdd(term, "certification")}
                >
                  +
                </button>
              </Badge>
            ))}
          </div>
        )}
        {certComboOpen && (
          <div className="relative mt-2">
            <Input
              autoFocus
              className="h-8 text-xs"
              placeholder="Type to search certifications…"
              value={certQuery}
              onChange={(e) => setCertQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setCertComboOpen(false);
                  setCertQuery("");
                }
                if (e.key === "Enter" && certQuery.trim()) {
                  const first = certOptions[0];
                  addCertification(first ?? certQuery.trim());
                }
              }}
            />
            <div className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
              {certOptions.length === 0 && !certQuery.trim() ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Every certification in the vocabulary is already on this post.
                </p>
              ) : certOptions.length === 0 ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted"
                  onClick={() => addCertification(certQuery.trim())}
                >
                  <span>
                    Add{" "}
                    <span className="font-medium">“{certQuery.trim()}”</span> to this post
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground">new vocabulary term</span>
                </button>
              ) : (
                certOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted"
                    onClick={() => addCertification(c)}
                  >
                    <span>{c}</span>
                    <span className="text-[0.65rem] font-medium text-success">in vocabulary</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Education / Experience — chips off Reference Data, like Skills. Several
          can be accepted at once ("any of these"): the screening columns then
          hold the weakest accepted level, which is the bar an applicant must
          clear. */}
      <div className="grid gap-2 sm:grid-cols-2">
        <LevelChips
          label="Education level"
          pts={scoring.weights.education}
          value={draft.educationLevels}
          options={educationLevels}
          onChange={(next) =>
            onLevelsChange({ educationLevels: next, experienceLevels: draft.experienceLevels })
          }
        />
        <LevelChips
          label="Experience level"
          pts={scoring.weights.experience}
          value={draft.experienceLevels}
          options={experienceLevels}
          onChange={(next) =>
            onLevelsChange({ educationLevels: draft.educationLevels, experienceLevels: next })
          }
        />
      </div>
    </div>
  );
}

/**
 * Screening level chips — the same add / remove interaction as the Skills row,
 * fed by screening Reference Data so the chips, the requirement templates and
 * the NLP vocabulary never drift apart. A post can accept more than one level;
 * with several accepted the screener holds the applicant to the WEAKEST of them
 * ("any of these").
 */
function LevelChips({
  label,
  pts,
  value,
  options,
  onChange,
}: {
  label: string;
  pts: number;
  value: string[];
  options: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const sameLevel = (a: string, b: string) => normalizeEntityText(a) === normalizeEntityText(b);
  const unused = options.filter((o) => !value.some((v) => sameLevel(v, o)));
  const q = query.trim().toLowerCase();
  const matches = q ? unused.filter((o) => o.toLowerCase().includes(q)) : unused;

  const add = (level: string) => {
    const text = level.trim();
    if (!text) return;
    if (!value.some((v) => sameLevel(v, text))) onChange([...value, text]);
    setOpen(false);
    setQuery("");
  };
  const remove = (level: string) => onChange(value.filter((v) => !sameLevel(v, level)));

  return (
    <section className="rounded-lg border border-border/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold">
            {label} · {pts} pts
          </p>
          <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
            {value.length > 1
              ? `Any of these — ${value.length} accepted`
              : "Add more than one to accept any of them"}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 shrink-0 text-[0.7rem]"
          onClick={() => setOpen((o) => !o)}
        >
          <Plus className="mr-1 h-3 w-3" /> Add level
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="mt-2 text-xs italic text-muted-foreground">
          No level yet — the screener awards this axis to everyone until one is added.
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((level) => (
            <Badge key={level} variant="secondary" className="gap-1 py-1 pl-2 pr-1 text-xs">
              <span>{level}</span>
              <button
                type="button"
                aria-label={`Remove ${level}`}
                className="rounded-sm px-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                onClick={() => remove(level)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {open && (
        <div className="relative mt-2">
          <Input
            autoFocus
            className="h-8 text-xs"
            placeholder="Type to search levels…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
              if (e.key === "Enter") add(matches[0] ?? query.trim());
            }}
          />
          <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
            {matches.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {q ? `No level matches “${query.trim()}”.` : "Every level is already on this post."}
              </p>
            ) : (
              matches.map((level) => (
                <button
                  key={level}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted"
                  onClick={() => add(level)}
                >
                  <span>{level}</span>
                  <span className="text-[0.65rem] font-medium text-success">in vocabulary</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/** Back face content: every filled builder field indicated as entities. */
function BuilderEntitiesCard({
  draft,
  mapping,
  loading,
  error,
  addingTerm,
  scoring,
  onAdd,
  onRetry,
  onFlipBack,
}: {
  draft: Draft;
  mapping: BuilderEntityMapping | null;
  loading: boolean;
  error: string | null;
  addingTerm: boolean;
  scoring: BuilderScoringRef;
  onAdd: (term: string, type: "skill" | "job_role" | "certification") => void;
  onRetry: () => void;
  onFlipBack: () => void;
}) {
  const splitLines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const filledFields: string[] = [];
  if (draft.title.trim()) filledFields.push(draft.title.trim());
  if (draft.department.trim()) filledFields.push(draft.department.trim());
  if (draft.employmentType.trim()) filledFields.push(draft.employmentType.trim());
  if (draft.schedule.trim()) filledFields.push(draft.schedule.trim());
  if (draft.vacancies.trim()) filledFields.push(`${draft.vacancies.trim()} vacancies`);
  if (draft.salaryMin.trim() || draft.salaryMax.trim())
    filledFields.push(`₱${draft.salaryMin.trim() || "—"} – ₱${draft.salaryMax.trim() || "—"}`);

  const skillsIndex = buildBuilderEntityIndex(mapping?.skills ?? {});
  const rolesIndex = buildBuilderEntityIndex(mapping?.job_roles ?? {});
  const certsIndex = buildBuilderEntityIndex(mapping?.certifications ?? {});

  const skillsResult = analyzeBuilderEntityLines(splitLines(draft.skills), skillsIndex);
  const titleCanonical = draft.title.trim()
    ? canonicalizeBuilderEntity(draft.title.trim(), rolesIndex)
    : null;
  // Only certification-like lines are checked — plain sentences and skill tags
  // are not certificates, so showing them "to review" would invite adding
  // garbage to the vocabulary.
  const certCandidateLines = [
    ...splitLines(draft.qualifications),
    ...splitLines(draft.skills),
  ].filter((line) => CERTIFICATION_LINE_RE.test(line));
  const certResult = analyzeBuilderEntityLines(certCandidateLines, certsIndex);

  // Per-card scoring lines — simple points each indicated reference is worth
  // to a resume. Required skills share 70% of the skills weight; each
  // recognized certificate shares the certifications weight.
  const perSkill =
    skillsResult.recognized.length > 0
      ? (scoring.weights.skills * 0.7) / skillsResult.recognized.length
      : null;
  const perCert =
    certResult.recognized.length > 0
      ? scoring.weights.certifications / certResult.recognized.length
      : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <ScanLine className="h-4 w-4 text-primary" /> Entities Indicated
        </h2>
        <Button type="button" size="sm" variant="outline" onClick={onFlipBack}>
          <Repeat className="mr-1.5 h-3.5 w-3.5" /> Back to editing
        </Button>
      </div>
      <p className="text-[0.7rem] text-muted-foreground">
        Whatever is filled in the builder inputs and dropdowns, indicated as screening entities.
        Recognized terms match resumes — others are flagged until added to the vocabulary.
      </p>

      {loading ? (
        <p className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading screening vocabulary…
        </p>
      ) : error ? (
        <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Filled fields
            </p>
            {filledFields.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {filledFields.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-1.5 text-xs italic text-muted-foreground">
                Nothing filled yet — fill the builder, then flip here.
              </p>
            )}
          </div>

          <BuilderEntityGroup
            icon={<Users className="h-3.5 w-3.5 text-primary" />}
            title="Job role"
            hint="From the Job title dropdown"
            recognized={
              titleCanonical && draft.title.trim()
                ? [{ canonical: titleCanonical, sample: draft.title.trim() }]
                : []
            }
            unrecognized={draft.title.trim() && !titleCanonical ? [draft.title.trim()] : []}
            addType={() => "job_role"}
            addingTerm={addingTerm}
            onAdd={onAdd}
            emptyText="No job title selected yet."
          />

          <BuilderEntityGroup
            icon={<Briefcase className="h-3.5 w-3.5 text-primary" />}
            title="Skills"
            hint="From the Screening Requirements panel"
            scoreLine={
              perSkill !== null
                ? `${scoring.weights.skills} pts · ≈${perSkill.toFixed(2)} pts each`
                : `${scoring.weights.skills} pts · add recognized skills to score`
            }
            recognized={skillsResult.recognized}
            unrecognized={skillsResult.unrecognized}
            addType={() => "skill"}
            addingTerm={addingTerm}
            onAdd={onAdd}
            emptyText="No skills filled in Screening Requirements yet."
          />

          <BuilderEntityGroup
            icon={<Clock className="h-3.5 w-3.5 text-primary" />}
            title="Experience"
            hint="Years of experience required"
            scoreLine={`${scoring.weights.experience} pts · auto-given, not indicated`}
            recognized={[]}
            unrecognized={[]}
            addType={() => "skill"}
            addingTerm={addingTerm}
            onAdd={onAdd}
            emptyText="Not indicated — the builder has no experience field."
          />

          <BuilderEntityGroup
            icon={<BookOpen className="h-3.5 w-3.5 text-primary" />}
            title="Education"
            hint="Minimum education level required"
            scoreLine={`${scoring.weights.education} pts · auto-given, not indicated`}
            recognized={[]}
            unrecognized={[]}
            addType={() => "skill"}
            addingTerm={addingTerm}
            onAdd={onAdd}
            emptyText="Not indicated — the builder has no education field."
          />

          <BuilderEntityGroup
            icon={<GraduationCap className="h-3.5 w-3.5 text-primary" />}
            title="Certifications"
            hint="Certification-like lines from the Qualifications block and Screening Requirements panel"
            scoreLine={
              perCert !== null
                ? `${scoring.weights.certifications} pts · ≈${perCert.toFixed(2)} pts each`
                : `${scoring.weights.certifications} pts · add recognized certs to score`
            }
            recognized={certResult.recognized}
            unrecognized={certResult.unrecognized}
            addType={(term) => guessRefType(term)}
            addingTerm={addingTerm}
            onAdd={onAdd}
            emptyText="No certifications detected in the filled blocks yet."
          />

          <p className="rounded-md bg-secondary/40 p-3 text-[0.7rem] leading-relaxed text-muted-foreground">
            Unrecognized terms are still published with the post — but resumes mentioning them will
            be flagged for review until the term is added to the vocabulary with the + button.
            Resumes need ≥{Math.round(scoring.coverageMin * 100)}% of required skills and score ≥{" "}
            {scoring.passingScore} to pass.
          </p>
        </>
      )}
    </div>
  );
}

/** One-click reveal of a requisition's justification note. */
function RequisitionNote({ req, label = "View note" }: { req: Requisition; label?: string }) {
  if (!req.justification) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 w-full min-w-0 gap-1 px-2 text-xs">
          <FileText className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-2 p-4 text-left">
        <div>
          <p className="font-display text-sm font-semibold">Request note — {req.id}</p>
          <p className="text-[0.7rem] text-muted-foreground">
            {req.position} · {req.department} · {req.count} opening(s)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={urgencyBadge(req.urgency)}>
            {req.urgency} urgency
          </Badge>
          <span className="text-[0.7rem] text-muted-foreground">Requested {req.requestedAt}</span>
        </div>
        <p className="rounded-md bg-secondary/40 p-3 text-xs italic leading-relaxed text-muted-foreground">
          “{req.justification}”
        </p>
      </PopoverContent>
    </Popover>
  );
}

const templates = [
  {
    id: "front-office",
    name: "Front Office Template",
    summary: "Guest-facing role template with PMS and shifting-schedule language.",
    responsibilities:
      "Welcome and assist hotel guests.\nProcess check-in and check-out procedures.\nHandle reservations, inquiries, and guest concerns.",
    qualifications:
      "Bachelor's degree in Hospitality, Tourism or related field.\nAt least 1 year front office experience.\nExcellent English communication skills.",
  },
  {
    id: "kitchen",
    name: "Kitchen / Culinary Template",
    summary: "Back-of-house template with TESDA certification and sanitation clauses.",
    responsibilities:
      "Prepare mise en place for assigned station.\nCook menu items to standard recipes.\nMaintain HACCP sanitation standards.",
    qualifications:
      "TESDA Cookery NC II holder.\nAt least 2 years hot-kitchen experience.\nWilling to work shifting schedules and holidays.",
  },
  {
    id: "housekeeping",
    name: "Housekeeping Template",
    summary: "Rooms division template covering turnover targets and safety.",
    responsibilities:
      "Clean and prepare assigned guestrooms.\nReport maintenance issues promptly.\nManage linen and amenity stocks.",
    qualifications:
      "High school graduate or vocational.\nPhysically fit, attentive to detail.\nPrevious hotel housekeeping experience an advantage.",
  },
];

/**
 * Publishing channel. The social media (Facebook / Instagram) and job-board
 * (Indeed) targets were removed — the careers website is the only destination,
 * so a post publishes there the moment it is published, with no channel choice
 * to make. Kept as a constant because the create / update payloads still record
 * it (`platforms: ["Website"]`) and legacy rows can hold older channel names.
 */
const KEPT_PLATFORMS: readonly string[] = ["Website"];

/**
 * Normalizes a post's stored channel list to the channels the UI still
 * offers: legacy rows labelled "Company Website" map onto "Website", and
 * removed channels (Facebook / Instagram / Indeed) are dropped so they can
 * never leak into a save. A post with nothing left — or nothing stored —
 * reads as published to the website.
 */
function normalizePlatforms(stored?: string[] | null): string[] {
  const list = Array.isArray(stored) ? stored : [];
  const kept: string[] = [];
  for (const p of list) {
    const name = p === "Company Website" ? "Website" : p;
    if (KEPT_PLATFORMS.includes(name) && !kept.includes(name)) kept.push(name);
  }
  return kept.length ? kept : ["Website"];
}

type BlockId =
  | "title"
  | "info"
  | "picture"
  | "description"
  | "responsibilities"
  | "qualifications"
  | "skills"
  | "additional"
  | "instructions"
  | "about";

const blockLibrary: { id: BlockId; label: string; hint: string }[] = [
  { id: "title", label: "Job Title", hint: "Headline + department" },
  { id: "info", label: "Job Info", hint: "Type, schedule, vacancies, salary" },
  /* Requirements sit above the prose: what the screener matches against is the
     first thing HR should settle, before writing the ad around it. */
  { id: "skills", label: "Screening Requirements", hint: "Skills, certifications, education and experience the resume screener matches" },
  { id: "description", label: "Job Description", hint: "Short role pitch" },
  { id: "responsibilities", label: "Key Responsibilities", hint: "Bulleted duties" },
  { id: "qualifications", label: "Qualifications", hint: "Bulleted requirements" },
  { id: "additional", label: "Additional Info", hint: "Perks, shift details, dress code (optional)" },
  { id: "instructions", label: "Application Instruction", hint: "How to apply" },
  { id: "about", label: "About Company", hint: "Company blurb" },
  { id: "picture", label: "Picture of Hiring", hint: "Template or uploaded image" },
];

const fullBlocks: BlockId[] = blockLibrary.map((b) => b.id);

/**
 * Resolves a post's saved canvas arrangement into a usable block order.
 *
 * A stored list can go stale — a block id removed from the library, or a block
 * added since the post was saved. Unknown ids are dropped and anything missing
 * is appended in default order, so opening an old post never leaves the canvas
 * with a missing component.
 */
function blocksForJob(saved?: string[] | null): BlockId[] {
  if (!Array.isArray(saved) || saved.length === 0) return fullBlocks;
  const known = new Set<string>(fullBlocks);
  const ordered = saved.filter((id): id is BlockId => known.has(id));
  const seen = new Set(ordered);
  return [...ordered, ...fullBlocks.filter((id) => !seen.has(id))];
}

/** The 6 AI-fillable content blocks — the prose blocks the checklist modal writes. Skills are not written by the model; when the post has none they are adopted from the Reference Data vocabulary afterwards (see MAX_AI_SKILL_TERMS). */
const AI_CONTENT_BLOCKS: BlockId[] = [
  "description",
  "responsibilities",
  "qualifications",
  "additional",
  "instructions",
  "about",
];

/** Blocks that must hold text before publishing / updating a template.
 *  Additional Info stays AI-fillable above but is optional — an empty
 *  Additional Info never blocks Publish job post or Update template. */
const REQUIRED_PUBLISH_BLOCKS: BlockId[] = [
  "description",
  "responsibilities",
  "qualifications",
  "instructions",
  "about",
];

/**
 * How many screening terms are adopted when "Generate with AI" runs on a post
 * with an empty Screening Requirements block. Screening weights every listed
 * term, so adopting all 60 grounding terms would make the post a checklist
 * nobody can pass — a short, reviewable list is the point.
 */
const MAX_AI_SKILL_TERMS = 8;

/** Cap on certificates adopted from the generated copy — certifications carry a
 *  small screening weight, so a handful of canonical terms is the useful part. */
const MAX_AI_CERT_TERMS = 4;

/** Appends canonical terms to a text block without duplicating a line the block
 *  already has (case- and punctuation-insensitively). */
function mergeIntoBlock(current: string, additions: string[]): string {
  const key = (s: string) => aiLineKeyOf(s);
  const have = new Set(current.split("\n").map(key).filter(Boolean));
  return [
    ...current
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    ...additions.filter((a) => !have.has(key(a))),
  ].join("\n");
}

/** Shared line key so AI-written bullets and adopted vocabulary terms dedupe. */
function aiLineKeyOf(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.;,]+$/, "");
}

/** Raw draft text for one content block (used by publish validation). */
function blockText(d: Draft, id: BlockId): string {
  switch (id) {
    case "description":
      return d.description;
    case "responsibilities":
      return d.responsibilities;
    case "qualifications":
      return d.qualifications;
    case "skills":
      return d.skills;
    case "additional":
      return d.additional;
    case "instructions":
      return d.instructions;
    case "about":
      return d.about;
    default:
      return "";
  }
}

/** "45s" / "3m" / "6h 10m" — compact countdown for the AI usage indicator. */
function aiCountdown(seconds: number): string {
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.ceil((seconds % 3600) / 60)}m`;
  if (seconds >= 60) return `${Math.ceil(seconds / 60)}m`;
  return `${Math.max(0, seconds)}s`;
}

/** Short labels for the backend AI failure codes shown in the indicator. */
const AI_FAILURE_LABELS: Record<string, string> = {
  quota_day: "Daily usage limit",
  daily_limit: "Daily limit (set by admin)",
  rate_minute: "Rate limit",
  auth: "API key rejected",
  model: "Model not found",
  request: "Request rejected",
  overloaded: "Service overloaded",
  network: "Connection problem",
  unreadable: "Unreadable response",
  not_configured: "AI not configured",
  provider: "Provider error",
};

function aiFailureLabel(code: string | null | undefined): string {
  if (!code) return "AI unavailable";
  return AI_FAILURE_LABELS[code] ?? "AI unavailable";
}

/** The 3 code paths that mean "the AI usage is used up" (mirrors the backend). */
const AI_LIMIT_CODES = new Set(["quota_day", "rate_minute", "daily_limit", "quota"]);

/** Tailwind classes per Generate-with-AI indicator tone. */
const AI_TONE_CLASS = {
  ready: "border-success/30 bg-success/10 text-success",
  busy: "border-primary/30 bg-primary/10 text-primary",
  limit: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
  off: "border-border bg-muted text-muted-foreground",
  muted: "border-border bg-muted text-muted-foreground",
} as const;

/**
 * Enum of work schedule options for the job post builder — kept in sync with
 * the backend WorkSchedule enum (Modules\RecruitmentManagement\Enums).
 */
const WORK_SCHEDULE_OPTIONS = [
  "Shifting Schedule",
  "Day Shift (8:00 AM - 5:00 PM)",
  "Night Shift (10:00 PM - 6:00 AM)",
  "Monday to Friday (9:00 AM - 6:00 PM)",
  "Flexible Schedule",
  "Weekend Shift",
  "Rotating Shifts",
] as const;

type Draft = {
  title: string;
  department: string;
  /**
   * Core HCM `positions.position_id` behind this draft. Titles are NOT unique
   * per department — Front Office has both a Rank & File (POS-001, SG-05) and a
   * Staff (POS-018, SG-10) "Front Desk Receptionist" — so every position
   * lookup resolves through this id first and only falls back to the title when
   * a post predates it (position_id null) or the draft is brand new.
   */
  positionDbId: number | null;
  employmentType: string;
  schedule: string;
  /** "" = follow the position's assigned grade; otherwise a salary_grade_id. */
  salaryGradeId: string;
  salaryMin: string;
  salaryMax: string;
  vacancies: string;
  description: string;
  responsibilities: string;
  qualifications: string;
  skills: string;
  additional: string;
  instructions: string;
  about: string;
  /**
   * Structured screening levels — the exact fields the NLP match scoring reads.
   * Lists because the panel offers them as chips off Reference Data, so a post
   * can accept several ("any of these"); the API derives the weakest accepted
   * level for the single-value screening columns.
   */
  educationLevels: string[];
  experienceLevels: string[];
  /* Test requirements are owned by Core HCM (positions.requires_assessment /
     requires_practical) — the Recruitment toggles were removed. The draft no
     longer stores these; the linked position's flags (draftPosition) decide
     the applicant pipeline. Legacy Job rows still carry the resolved values
     for display. */
};

const blankDraft: Draft = {
  title: "",
  department: "",
  positionDbId: null,
  employmentType: "Full-time",
  schedule: "Shifting Schedule",
  salaryGradeId: "",
  salaryMin: "",
  salaryMax: "",
  vacancies: "1",
  description: "",
  responsibilities: "",
  qualifications: "",
  skills: "",
  additional: "",
  instructions: "",
  about: "",
  educationLevels: [],
  experienceLevels: [],
};

const defaultAbout =
  "Oxford Suites Makati is a premier all-suite hotel in the heart of Makati's business district, known for warm Filipino hospitality and dependable service.";
const defaultInstructions =
  "Interested applicants may send their updated resume through this posting or walk-in for an interview at the HR Office, Oxford Suites Makati.";

function jobToDraft(j: Job): Draft {
  return {
    title: j.title,
    department: j.department,
    positionDbId: j.positionId ?? null,
    employmentType: j.employmentType,
    schedule: j.schedule,
    salaryGradeId: "",
    salaryMin: String(j.salaryMin),
    salaryMax: String(j.salaryMax),
    /* A post can never hold fewer vacancies than the hires it recorded — the
       "7/4 filled" drift is repaired to "7/7" here as well (backend keeps the
       stored column aligned on every save). */
    vacancies: String(Math.max(j.vacancies, j.filled)),
    description: j.summary,
    responsibilities: j.responsibilities.join("\n"),
    qualifications: j.qualifications.join("\n"),
    skills: j.skills.join("\n"),
    additional: (j.additional ?? []).join("\n"),
    instructions: j.instructions?.trim() ? j.instructions : defaultInstructions,
    about: j.about?.trim() ? j.about : defaultAbout,
    educationLevels: acceptedLevels(j.educationLevels, j.education),
    experienceLevels: acceptedLevels(j.experienceLevels, j.experience),
  };
}

function hasContentFor(id: BlockId, d: Draft): boolean {
  switch (id) {
    case "title":
      return d.title.trim() !== "";
    case "info":
      return (
        d.salaryMin.trim() !== "" ||
        d.salaryMax.trim() !== "" ||
        d.salaryGradeId.trim() !== "" ||
        (d.vacancies.trim() !== "" && d.vacancies !== "1")
      );
    case "description":
      return d.description.trim() !== "";
    case "responsibilities":
      return d.responsibilities.trim() !== "";
    case "qualifications":
      return d.qualifications.trim() !== "";
    case "skills":
      return d.skills.trim() !== "";
    case "additional":
      return d.additional.trim() !== "";
    case "instructions":
      return d.instructions.trim() !== "";
    case "about":
      return d.about.trim() !== "";
    default:
      return false;
  }
}

function snapshotOf(d: Draft, b: BlockId[]) {
  return JSON.stringify({ d, b });
}

/* ===================================================================== */
/* Requirement Templates (Screening Setup)                               */
/* ===================================================================== */

type RequirementTemplateForm = {
  name: string;
  /** "none" = any position, otherwise the Core HCM position_id as a string. */
  positionId: string;
  description: string;
  active: boolean;
  items: { entity_type: ScreeningRequirementEntityType; value: string }[];
};

const blankRequirementForm: RequirementTemplateForm = {
  name: "",
  positionId: "none",
  description: "",
  active: true,
  items: [],
};

/**
 * Screening Setup → Requirement Templates.
 *
 * HR defines, per position entity, the requirement entities a resume must
 * satisfy (skill, job role, certification, education, experience) and applies
 * a template to a job post — "Use in job post" merges it into the Job Post
 * Builder draft (Screening Requirements, Qualifications and the structured education
 * / experience levels the NLP screening scores against).
 */
const REQUIREMENT_TEMPLATE_ENTITY_TYPES: ScreeningRequirementEntityType[] = [
  "skill",
  "certification",
  "job_role",
  "education",
  "experience",
];

/** Requirement templates bulk-upload — mirrors the Reference Data bulk
 *  format so HR already knows it. Two shapes are accepted:
 *  1) entity lines appended to the open template: entity_type,value
 *  2) template lines that create/update whole templates:
 *     template_name,position_title_or_id,entity_type,value
 *  Lines starting with # are comments. entity_type is one of
 *  skill, certification, job_role, education, experience. */
type RequirementTemplateBulkRow = {
  templateName: string | null;
  positionRef: string | null;
  entityType: ScreeningRequirementEntityType;
  value: string;
};

function parseRequirementTemplateBulk(
  text: string,
): { rows: RequirementTemplateBulkRow[]; templateMode: boolean } {
  const rows: RequirementTemplateBulkRow[] = [];
  let templateMode = false;
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split(",").map((p) => p.trim());
    if (parts.length >= 4) {
      const [rawTemplate, rawPosition, rawType, ...rest] = parts;
      const entityType = (rawType ?? "").toLowerCase().replace(/\s+/g, "_") as ScreeningRequirementEntityType;
      const value = rest.join(",").trim();
      if (!rawTemplate || !value || !REQUIREMENT_TEMPLATE_ENTITY_TYPES.includes(entityType)) return;
      templateMode = true;
      rows.push({ templateName: rawTemplate, positionRef: rawPosition || null, entityType, value });
      return;
    }
    if (parts.length === 2) {
      const [rawType, ...rest] = parts;
      const entityType = (rawType ?? "").toLowerCase().replace(/\s+/g, "_") as ScreeningRequirementEntityType;
      const value = rest.join(",").trim();
      if (!value || !REQUIREMENT_TEMPLATE_ENTITY_TYPES.includes(entityType)) return;
      rows.push({ templateName: null, positionRef: null, entityType, value });
    }
  });
  return { rows, templateMode: templateMode && rows.some((r) => r.templateName) };
}

function downloadRequirementTemplateSample() {
  downloadTextFile(
    "requirement-templates-sample.csv",
    [
      "# Requirement templates bulk upload — one entry per line.",
      "# Mode A (entities for the open template): entity_type,value",
      "# Mode B (whole templates): template_name,position_title_or_id,entity_type,value",
      "# entity_type is one of: skill, certification, job_role, education, experience",
      "# position can be a title (e.g. Front Desk Receptionist) or position_id, or empty for Any position.",
      "skill,Guest Relations",
      "skill,Check-in / Check-out",
      "certification,TESDA Front Office NC II",
      "education,Bachelor's Degree",
      "experience,1-2 Years",
      "Front Desk Core,Front Desk Receptionist,skill,Reservations",
      "Front Desk Core,Front Desk Receptionist,certification,TESDA Front Office NC II",
      "Front Desk Core,Front Desk Receptionist,education,Bachelor's Degree",
    ].join("\n"),
  );
}

export function RequirementTemplateManager({
  templates,
  loading,
  error,
  positions,
  refValues,
  refOptions,
  busyId,
  onReload,
  onToggleActive,
  onUseTemplate,
  onAddToVocabulary,
}: {
  templates: ApiRequirementTemplate[];
  loading: boolean;
  error: string | null;
  positions: Position[];
  refValues: Set<string>;
  refOptions: Record<ScreeningRequirementEntityType, { value: string; label: string }[]>;
  busyId: number | null;
  onReload: () => void;
  onToggleActive: (template: ApiRequirementTemplate) => void;
  onUseTemplate: (template: ApiRequirementTemplate) => void;
  onAddToVocabulary: (term: string, type: "skill" | "job_role" | "certification") => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RequirementTemplateForm>(blankRequirementForm);
  const [itemType, setItemType] = useState<ScreeningRequirementEntityType>("skill");
  const [itemValue, setItemValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiRequirementTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkDragActive, setBulkDragActive] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const isRecognized = (value: string) => refValues.has(value.trim().toLowerCase());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (positionFilter === "unassigned" && t.position_id !== null) return false;
      if (
        positionFilter !== "all" &&
        positionFilter !== "unassigned" &&
        String(t.position_id) !== positionFilter
      ) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        t.name,
        t.position_title ?? "",
        t.description ?? "",
        ...t.items.map((i) => i.value),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [templates, search, positionFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(blankRequirementForm);
    setItemType("skill");
    setItemValue("");
    setEditorOpen(true);
  };

  const openEdit = (template: ApiRequirementTemplate) => {
    setEditingId(template.template_id);
    setForm({
      name: template.name,
      positionId: template.position_id === null ? "none" : String(template.position_id),
      description: template.description ?? "",
      active: template.active,
      items: template.items.map((i) => ({ entity_type: i.entity_type, value: i.value })),
    });
    setItemType("skill");
    setItemValue("");
    setEditorOpen(true);
  };

  const addItem = (type: ScreeningRequirementEntityType, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((f) => {
      const duplicate = f.items.some(
        (i) => i.entity_type === type && i.value.toLowerCase() === trimmed.toLowerCase(),
      );
      if (duplicate) {
        toast.info(`"${trimmed}" is already in this template`);
        return f;
      }
      return { ...f, items: [...f.items, { entity_type: type, value: trimmed }] };
    });
  };

  const removeItem = (index: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));

  /** Resolves a bulk position cell (title or id) to a position_id, or null
   *  for Any position. Unknown titles stay null so the row is never lost. */
  const resolveBulkPositionId = (ref: string | null): number | null => {
    if (!ref || !ref.trim()) return null;
    const cleaned = ref.trim();
    if (/^\d+$/.test(cleaned)) {
      const byId = positions.find((p) => String(p.dbId) === cleaned);
      if (byId?.dbId !== undefined) return byId.dbId;
      return Number(cleaned);
    }
    const byTitle = positions.find((p) => p.title.toLowerCase() === cleaned.toLowerCase());
    return byTitle?.dbId ?? null;
  };

  /** Bulk-uploads a CSV/TXT file. Entity-only rows append to the open form;
   *  template rows create missing templates (matched by name + position) and
   *  append new entities, then reload the manager list. */
  const handleTemplateBulkUpload = async (file: File | null | undefined) => {
    if (!file || bulkSaving) return;
    setBulkSaving(true);
    try {
      const { rows, templateMode } = parseRequirementTemplateBulk(await file.text());
      if (rows.length === 0) {
        toast.error("No valid rows found in the file.", {
          description:
            "Expected per line: entity_type,value — or template_name,position,entity_type,value. Download the sample for the exact format.",
        });
        return;
      }
      if (!templateMode || rows.every((r) => !r.templateName)) {
        let added = 0;
        let dupes = 0;
        setForm((f) => {
          const next = [...f.items];
          for (const row of rows) {
            const exists = next.some(
              (i) => i.entity_type === row.entityType && i.value.toLowerCase() === row.value.toLowerCase(),
            );
            if (exists) {
              dupes += 1;
              continue;
            }
            next.push({ entity_type: row.entityType, value: row.value });
            added += 1;
          }
          return { ...f, items: next };
        });
        toast.success(`${added} entit${added === 1 ? "y" : "ies"} added to this template`, {
          description:
            dupes > 0 ? `${dupes} duplicate(s) skipped.` : "Review the list below, then press Create template.",
        });
        return;
      }
      const groups = new Map<string, RequirementTemplateBulkRow[]>();
      for (const row of rows) {
        if (!row.templateName) continue;
        const key = `${row.templateName.toLowerCase()}|${(row.positionRef ?? "").toLowerCase()}`;
        groups.set(key, [...(groups.get(key) ?? []), row]);
      }
      let created = 0;
      let updated = 0;
      let skipped = 0;
      for (const group of groups.values()) {
        const templateName = group[0]!.templateName!.trim();
        const positionId = resolveBulkPositionId(group[0]!.positionRef);
        const items = group.map((r) => ({ entity_type: r.entityType, value: r.value, required: true }));
        try {
          const existing = templates.find(
            (t) => t.name.toLowerCase() === templateName.toLowerCase() && (t.position_id ?? null) === positionId,
          );
          if (existing) {
            const known = new Set(existing.items.map((i) => `${i.entity_type}|${i.value.toLowerCase()}`));
            const fresh = items.filter((i) => !known.has(`${i.entity_type}|${i.value.toLowerCase()}`));
            if (fresh.length === 0) {
              skipped += 1;
              continue;
            }
            await screeningApi.requirementTemplates.update(existing.template_id, {
              name: existing.name,
              position_id: existing.position_id,
              description: existing.description ?? null,
              active: existing.active,
              items: [...existing.items.map((i) => ({ entity_type: i.entity_type, value: i.value, required: true })), ...fresh],
            });
            updated += 1;
          } else {
            await screeningApi.requirementTemplates.create({
              name: templateName,
              position_id: positionId,
              description: null,
              active: true,
              items,
            });
            created += 1;
          }
        } catch {
          skipped += 1;
        }
      }
      toast.success(`${created} template(s) created${updated > 0 ? `, ${updated} updated` : ""}`, {
        description: skipped > 0 ? `${skipped} group(s) skipped (duplicate or invalid).` : undefined,
      });
      setEditorOpen(false);
      onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read the bulk file.");
    } finally {
      setBulkSaving(false);
    }
  };

  /** Curated starter keywords for the selected position (screening keyword library). */
  const suggestions = useMemo(() => {
    if (form.positionId === "none") return [] as string[];
    const title = positions.find((p) => String(p.dbId) === form.positionId)?.title;
    return title ? (keywordLibrary[title] ?? []) : [];
  }, [form.positionId, positions]);

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Give the requirement template a name.");
      return;
    }
    if (form.items.length === 0) {
      toast.error("Add at least one requirement entity to the template.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      position_id: form.positionId === "none" ? null : Number(form.positionId),
      description: form.description.trim() || null,
      active: form.active,
      items: form.items.map((i) => ({
        entity_type: i.entity_type,
        value: i.value,
        required: true,
      })),
    };
    try {
      if (editingId !== null) {
        await screeningApi.requirementTemplates.update(editingId, payload);
      } else {
        await screeningApi.requirementTemplates.create(payload);
      }
      toast.success(
        editingId !== null
          ? `Requirement template "${payload.name}" updated`
          : `Requirement template "${payload.name}" created`,
        {
          description:
            "Apply it from the Job Post Builder picker below, or press “Use in job post”.",
        },
      );
      setEditorOpen(false);
      onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The requirement template could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await screeningApi.requirementTemplates.remove(deleteTarget.template_id);
      toast.success(`Deleted requirement template "${deleteTarget.name}"`);
      setDeleteTarget(null);
      onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The template could not be deleted.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Templates by position</h3>
          <p className="text-xs text-muted-foreground">
            Reusable requirements you can apply to a job post in one click.
          </p>
        </div>
        <Button size="sm" className="cursor-pointer" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New template
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="h-9 w-64 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All positions</SelectItem>
            <SelectItem value="unassigned">Any position (not position-bound)</SelectItem>
            {positions
              .filter((p) => p.dbId !== undefined)
              .map((p) => (
                <SelectItem key={p.id} value={String(p.dbId)}>
                  {p.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="h-9 w-56 pl-8 text-xs"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-[0.7rem] text-muted-foreground">
          {filtered.length} of {templates.length} template{templates.length === 1 ? "" : "s"}
        </span>
      </div>
      {loading ? (
        <p className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading requirement templates…
        </p>
      ) : error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
          <Button size="sm" variant="outline" className="ml-3 cursor-pointer" onClick={onReload}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
          {templates.length === 0
            ? "No requirement templates yet — create one so every job post for that position reuses the same screening requirements."
            : "No templates match your filters."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((template) => (
            <div
              key={template.template_id}
              className={cn(
                "rounded-md border p-3",
                template.active ? "border-border" : "border-dashed border-border bg-muted/30",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {template.name}
                    <Badge variant="outline">{template.position_title ?? "Any position"}</Badge>
                    {!template.active && <Badge variant="secondary">Inactive</Badge>}
                  </p>
                  {template.description && (
                    <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 cursor-pointer"
                    disabled={!template.active}
                    title={
                      template.active
                        ? "Apply this template's requirements to the job post draft"
                        : "Activate the template to use it in a job post"
                    }
                    onClick={() => onUseTemplate(template)}
                  >
                    <FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> Use in job post
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 cursor-pointer"
                    title="Edit template"
                    onClick={() => openEdit(template)}
                  >
                    <PencilRuler className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 cursor-pointer text-destructive"
                    title="Delete template"
                    onClick={() => setDeleteTarget(template)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={template.active}
                    disabled={busyId === template.template_id}
                    onCheckedChange={() => onToggleActive(template)}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
                {REQUIREMENT_ENTITY_META.flatMap((meta) => {
                  const values = template.items.filter((i) => i.entity_type === meta.value);
                  if (values.length === 0) return [];
                  return [
                    <span
                      key={`${template.template_id}-${meta.value}`}
                      className="flex flex-wrap items-center gap-1"
                    >
                      <Badge variant="outline" className={cn("text-[0.65rem]", meta.className)}>
                        {meta.label}
                      </Badge>
                      {values.map((item) => (
                        <Badge
                          key={item.item_id}
                          variant="secondary"
                          className="gap-1 text-[0.65rem]"
                          title={
                            isRecognized(item.value)
                              ? "Recognized by the screening model"
                              : "Not in the screening vocabulary yet"
                          }
                        >
                          {item.value}
                          {isRecognized(item.value) ? (
                            <span className="text-success">✓</span>
                          ) : (
                            <button
                              type="button"
                              disabled={busyId !== null}
                              title={`Add "${item.value}" to the screening vocabulary`}
                              className="cursor-pointer font-bold text-primary hover:underline disabled:opacity-50"
                              onClick={() =>
                                onAddToVocabulary(item.value, guessRefType(item.value))
                              }
                            >
                              +
                            </button>
                          )}
                        </Badge>
                      ))}
                    </span>,
                  ];
                })}
                {template.items.length === 0 && (
                  <span className="text-[0.7rem] text-muted-foreground">
                    No requirement entities in this template yet — edit it to add some.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit requirement template" : "New requirement template"}
            </DialogTitle>
            <DialogDescription>
              Pick the position this template belongs to, then add the requirement entities a resume
              must satisfy. Applying the template to a job post seeds the Screening Requirements panel, the
              Qualifications block and the structured education / experience levels the screening
              scores against.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Template name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Front Desk Receptionist — Core Requirements"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Position (entity)</Label>
                <Select
                  value={form.positionId}
                  onValueChange={(v) => setForm({ ...form, positionId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any position</SelectItem>
                    {positions
                      .filter((p) => p.dbId !== undefined)
                      .map((p) => (
                        <SelectItem key={p.id} value={String(p.dbId)}>
                          {p.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this template covers"
              />
            </div>

            <div className="space-y-3 rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-xs">Requirement entities</Label>
                <label className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                  Active for the builder
                  <Switch
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={itemType}
                  onValueChange={(v) => {
                    setItemType(v as ScreeningRequirementEntityType);
                    setItemValue("");
                  }}
                >
                  <SelectTrigger className="h-9 w-40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUIREMENT_ENTITY_META.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label} ({refOptions[m.value]?.length ?? 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value=""
                  onValueChange={(v) => {
                    if (v === "__custom__") {
                      customInputRef.current?.focus();
                      return;
                    }
                    addItem(itemType, v);
                  }}
                >
                  <SelectTrigger className="h-9 min-w-0 flex-1 text-xs">
                    <SelectValue
                      placeholder={
                        (refOptions[itemType] ?? []).length > 0
                          ? `Pick from Reference Data — ${(refOptions[itemType] ?? []).length} available, or type below`
                          : "No vocabulary for this type yet — type a custom value below"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {(refOptions[itemType] ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Type a custom value below…</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 cursor-pointer"
                  disabled={!itemValue.trim()}
                  onClick={() => {
                    addItem(itemType, itemValue);
                    setItemValue("");
                  }}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add entity
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  ref={customInputRef}
                  className="h-9 min-w-0 flex-1 text-xs"
                  placeholder={
                    itemType === "skill"
                      ? "Or type a custom skill, e.g. Guest Recovery"
                      : itemType === "job_role"
                        ? "Or type a custom role, e.g. Night Auditor"
                        : itemType === "certification"
                          ? "Or type a custom cert, e.g. Barista NC II"
                          : itemType === "education"
                            ? "Or type a custom education, e.g. BS HRM"
                            : "Or type a custom experience, e.g. 2+ Years"
                  }
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && itemValue.trim()) {
                      e.preventDefault();
                      addItem(itemType, itemValue);
                      setItemValue("");
                    }
                  }}
                />
              </div>

              <p className="text-[0.7rem] text-muted-foreground">
                {requirementEntityMeta(itemType).appliesTo} · education / experience values matching{" "}
                {EDUCATION_LEVEL_OPTIONS.join(" / ")} or {EXPERIENCE_LEVEL_OPTIONS.join(" / ")} fill
                the job post&apos;s structured levels; any other value is added as a qualification
                line.
              </p>

              {suggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/70 bg-muted/30 p-2">
                  <span className="text-[0.65rem] font-medium text-muted-foreground">
                    Suggested for this position:
                  </span>
                  {suggestions.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="cursor-pointer gap-1 text-[0.65rem] hover:border-primary/60"
                      title={`Add "${s}" as a requirement entity`}
                      onClick={() => addItem(guessRefType(s), s)}
                    >
                      <Plus className="h-3 w-3" /> {s}
                    </Badge>
                  ))}
                </div>
              )}

              {form.items.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[0.7rem] text-muted-foreground">
                  No entities yet — add the skills, certifications, education and experience this
                  role requires.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {REQUIREMENT_ENTITY_META.flatMap((meta) =>
                    form.items.map((item, index) =>
                      item.entity_type === meta.value ? (
                        <div
                          key={`${item.entity_type}-${index}`}
                          className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
                        >
                          <Badge variant="outline" className={cn("text-[0.65rem]", meta.className)}>
                            {meta.label}
                          </Badge>
                          <span className="min-w-0 flex-1 truncate text-xs">{item.value}</span>
                          {isRecognized(item.value) ? (
                            <span
                              className="text-[0.65rem] text-success"
                              title="Recognized by the screening model"
                            >
                              ✓ in vocabulary
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="cursor-pointer text-[0.65rem] font-semibold text-primary hover:underline"
                              title={`Add "${item.value}" to the screening vocabulary`}
                              onClick={() =>
                                onAddToVocabulary(item.value, guessRefType(item.value))
                              }
                            >
                              + vocabulary
                            </button>
                          )}
                          <button
                            type="button"
                            className="cursor-pointer text-muted-foreground hover:text-destructive"
                            title="Remove entity"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null,
                    ),
                  )}
                </div>
              )}
            </div>
            <div
              className={cn(
                "space-y-2 rounded-md border border-dashed p-3 transition-colors",
                bulkDragActive ? "border-primary bg-primary/10" : "border-border bg-muted/30",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setBulkDragActive(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setBulkDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setBulkDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setBulkDragActive(false);
                void handleTemplateBulkUpload(e.dataTransfer.files?.[0]);
              }}
            >
              <Label className="flex items-center gap-1.5 text-xs">
                <Upload className="h-3.5 w-3.5" /> Bulk upload entities
                {bulkSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  ref={bulkInputRef}
                  type="file"
                  accept=".csv,.txt"
                  disabled={bulkSaving}
                  className="h-9 w-full cursor-pointer text-xs sm:w-52"
                  onChange={(e) => {
                    void handleTemplateBulkUpload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 cursor-pointer"
                  disabled={bulkSaving}
                  onClick={() => {
                    downloadRequirementTemplateSample();
                    toast.success("Sample bulk-upload file downloaded");
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download sample
                </Button>
              </div>
              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                Drag &amp; drop a <code className="rounded bg-muted px-1">.csv / .txt</code> file here, or
                pick one. Entity lines (<code className="rounded bg-muted px-1">entity_type,value</code>)
                append to this template; template lines (
                <code className="rounded bg-muted px-1">template_name,position,entity_type,value</code>)
                create whole templates. Download the sample for the exact format.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button className="cursor-pointer" disabled={saving} onClick={save}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : editingId !== null ? (
                "Save template"
              ) : (
                "Create template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this requirement template?</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.name}&quot; will be removed from Screening Setup. Job posts
              already built with it keep their content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RecruitmentManagement({ role }: { role: "superadmin" | "admin" }) {
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const [jobList, setJobList] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    setJobsLoading(true);
    jobPostsApi
      .list({ per_page: 100 })
      .then((res) => {
        setJobList((res?.data ?? []).map(transformApiJob));
      })
      .catch((err) => {
        // 401 (expired token) is handled globally (redirect to /login);
        // NetworkError (CORS/offline) and SyntaxError (proxy returned HTML,
        // e.g. stale-Vite/SSR fallback) both fall back to mock data, so only
        // log unexpected failures.
        const status = (err as { status?: number } | null)?.status;
        if (status !== 401 && !(err instanceof TypeError) && !(err instanceof SyntaxError)) {
          console.warn("Could not fetch jobs from API:", err);
        }
      })
      .finally(() => setJobsLoading(false));
  }, []);

  /** Departments, positions & salary grades straight from Core HCM. */
  const [apiDepartments, setApiDepartments] = useState<Department[]>([]);
  const [apiPositions, setApiPositions] = useState<Position[]>([]);
  const [salaryGrades, setSalaryGrades] = useState<
    { salary_grade_id: number; code: string; title: string; min_salary: number | null; max_salary: number | null }[]
  >([]);

  useEffect(() => {
    Promise.allSettled([
      coreHcmApi.departments({ per_page: 100 }),
      coreHcmApi.positions({ per_page: 100 }),
      coreHcmApi.salaryGrades.list({ per_page: 200 }),
    ])
      .then(([deptRes, posRes, gradeRes]) => {
        if (deptRes.status === "fulfilled") {
          setApiDepartments(
            (deptRes.value?.data ?? []).map((d) => ({
              code: d.code,
              name: d.name,
              description: d.description ?? "",
              head: "—",
              staff: 0,
              openRequisitions: 0,
              budget: 0,
              dbId: d.department_id,
            })),
          );
        }
        const gradeById = new Map<number, { code: string; title: string; min_salary: number | null; max_salary: number | null }>();
        if (gradeRes.status === "fulfilled") {
          const grades = (gradeRes.value?.data ?? []).map((g) => ({
            salary_grade_id: g.salary_grade_id,
            code: g.code,
            title: g.title,
            min_salary: g.min_salary !== null && g.min_salary !== undefined ? Number(g.min_salary) : null,
            max_salary: g.max_salary !== null && g.max_salary !== undefined ? Number(g.max_salary) : null,
          }));
          setSalaryGrades(grades);
          grades.forEach((g) => gradeById.set(g.salary_grade_id, g));
        }
        if (posRes.status === "fulfilled") {
          setApiPositions(
            (posRes.value?.data ?? []).map((p) => {
              const gradeId = p.salary_grade_id ?? null;
              const grade = gradeId !== null ? gradeById.get(gradeId) : undefined;
              // Prefer the embedded band the API already resolved; fall back
              // to the freshly fetched grade list (list order isn't guaranteed).
              const band =
                p.salary_grade ||
                (grade
                  ? `${grade.code} (₱${Number(grade.min_salary ?? 0).toLocaleString()} – ₱${Number(grade.max_salary ?? 0).toLocaleString()})`
                  : p.salary_grade_code && (p.salary_grade_min !== null || p.salary_grade_max !== null)
                    ? `${p.salary_grade_code} (₱${Number(p.salary_grade_min ?? 0).toLocaleString()} – ₱${Number(p.salary_grade_max ?? 0).toLocaleString()})`
                    : (p.salary_grade_code ?? ""));
              return {
                id: p.position_code || `POS-${p.position_id}`,
                title: p.title,
                department: p.department_name ?? p.department ?? "General",
                level: (p.level as Position["level"]) || "Rank & File",
                headcount: p.headcount,
                filled: p.filled_count,
                /* Open slots from Core HCM (headcount - filled). Kept so the
                   builder can align the posting's vacancies with the request. */
                vacancies: Math.max(0, (p.vacancies ?? p.headcount - p.filled_count)),
                salaryBand: band,
                dbId: p.position_id,
                departmentId: p.department_id,
                salaryGradeId: gradeId,
                salaryGradeMin:
                  p.salary_grade_min !== undefined && p.salary_grade_min !== null
                    ? Number(p.salary_grade_min)
                    : (grade?.min_salary ?? null),
                salaryGradeMax:
                  p.salary_grade_max !== undefined && p.salary_grade_max !== null
                    ? Number(p.salary_grade_max)
                    : (grade?.max_salary ?? null),
                /* Test requirements owned by Core HCM — the builder shows them
                   read-only; the applicant pipeline gates on these flags. */
                requires_assessment: p.requires_assessment ?? false,
                requires_practical: p.requires_practical ?? false,
              };
            }),
          );
        }
      })
      .catch((err) => {
        console.warn("Could not fetch departments/positions from API:", err);
      });
  }, []);

  const knownDepartments = apiDepartments;
  const knownPositions = apiPositions;

  const [tab, setTab] = useState("postings");
  const [mode, setMode] = useState<"template" | "custom">("custom");
  const [newOpen, setNewOpen] = useState(false);
  const [blocks, setBlocks] = useState<BlockId[]>([]);
  const [dragging, setDragging] = useState<BlockId | null>(null);
  const [activeBlock, setActiveBlock] = useState<BlockId>("title");
  /** Canvas container — used to locate a block's editor control for auto-focus. */
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [reqSearch, setReqSearch] = useState("");
  const [reqStatus, setReqStatus] = useState("all");
  const [reqDept, setReqDept] = useState("all");
  const [reqUrgency, setReqUrgency] = useState("all");
  const [reqPage, setReqPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sourceReqId, setSourceReqId] = useState<string | null>(null);
  /** Manually linked pending requisition when the post wasn't converted from one. */
  const [linkedReqId, setLinkedReqId] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /* Add Applicant wizard (moved from Applicant Management)               */
  /* ------------------------------------------------------------------ */

  const [addOpen, setAddOpen] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2>(1);
  /**
   * Single smart upload box (Step 1): resume + supporting docs in any order.
   * Every file is auto-recognized on upload (rule + filename + content
   * check); the highest Resume-score file becomes the resume pick, the rest
   * are supporting docs. Details are auto-filled once, from the FIRST file
   * actually recognized as a resume.
   * Derived bridges keep every downstream consumer (auto-fill, screening,
   * save, replace-confirm) working unchanged.
   */
  const [unifiedDocs, setUnifiedDocs] = useState<UnifiedDoc[]>([]);
  const unifiedResumePick = pickResumeDoc(unifiedDocs);
  const addResumeFile = unifiedResumePick?.file ?? null;
  const addFileName = addResumeFile?.name ?? "";
  const verificationDocs = unifiedDocs
    .filter((d) => unifiedResumePick?.id !== d.id)
    .map((d) => {
      const raw = d.manualType ?? d.result?.predicted_type ?? "Others";
      // screen-resume + applicant-documents only accept COE | Certificate | Credential | Others —
      // anything else (Resume leftovers, unexpected strings) becomes Others so validation never 422s.
      const docType: VerificationDocType =
        raw === "COE" || raw === "Certificate" || raw === "Credential" ? raw : "Others";
      return { docType, title: d.file.name, originalCopy: false, file: d.file };
    });
  /** Pending upload awaiting user confirmation to replace existing details. */
  const [pendingResume, setPendingResume] = useState<File | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [addDept, setAddDept] = useState<string>("");
  /** When set (admin flow), the wizard is locked to this job post. */
  const [addPresetJob, setAddPresetJob] = useState<Job | null>(null);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
  });
  /** Confirmation when Step 1 has unsaved fill-up and user tries to X */
  const [confirmStep2ExitOpen, setConfirmStep2ExitOpen] = useState(false);
  const hasStep2Data =
    [addForm.name, addForm.email, addForm.phone, addForm.address].some(
      (v) => v.trim().length > 0,
    ) ||
    Boolean(addFileName) ||
    Boolean(addResumeFile);
  const [screenResult, setScreenResult] = useState<{
    score: number;
    status: ApplicantStatus;
    entities: { label: string; value: string }[];
    detail?: ApiScreeningPreview | null;
  } | null>(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  /** Screening setup dialog (moved from Applicant Management header). */
  const [screeningOpen, setScreeningOpen] = useState(false);
  /** Active tab inside the Screening Setup dialog. */
  const [screeningTab, setScreeningTab] = useState("templates");
  const [criteria, setCriteria] = useState(screeningCriteria);
  const [passing, setPassing] = useState(75);
  /** Minimum fraction of a post's required skills that must match (0—100%). */
  const [coverageMin, setCoverageMin] = useState(60);
  /** NLP service status shown inside the Screening Setup dialog. */
  const [nlpStatus, setNlpStatus] = useState<{
    online: boolean;
    base_model: string | null;
    custom_ner_loaded: boolean;
  } | null>(null);
  /** True while the screening configuration is being saved. */
  const [savingConfig, setSavingConfig] = useState(false);
  /** Vocabulary (Reference Data) lookup so template chips can show which
   *  terms the model already recognizes — loaded when the dialog opens. */
  const [refValues, setRefValues] = useState<Set<string>>(new Set());
  /** Grouped vocabulary options powering the template entity picker, so HR
   *  adds entities straight from Reference Data instead of free-typing. */
  const [refOptions, setRefOptions] = useState<
    Record<ScreeningRequirementEntityType, { value: string; label: string }[]>
  >({ skill: [], certification: [], job_role: [], education: [], experience: [] });
  const [addingTerm, setAddingTerm] = useState(false);
  /** Requirement templates (Screening Setup) — shared by the manager and the
   *  Job Post Builder picker. */
  const [requirementTemplates, setRequirementTemplates] = useState<ApiRequirementTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateBusyId, setTemplateBusyId] = useState<number | null>(null);
  const totalWeight = criteria.reduce((t, c) => t + (c.enabled ? c.weight : 0), 0);

  /** Loads the requirement templates used by the Screening Setup manager. */
  const loadRequirementTemplates = useCallback(() => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    screeningApi.requirementTemplates
      .list()
      .then((res) => setRequirementTemplates(res.data ?? []))
      .catch((e) => {
        console.warn("Could not load requirement templates:", e);
        setTemplatesError(
          e instanceof Error && e.message ? e.message : "Could not load requirement templates.",
        );
      })
      .finally(() => setTemplatesLoading(false));
  }, []);

  useEffect(() => {
    loadRequirementTemplates();
  }, [loadRequirementTemplates]);

  /** Loads the live screening configuration + NLP service status when the
   *  Screening Setup dialog opens — no fake defaults, everything shown is
   *  what screenings actually run with. The fast vocabulary lookup is fired
   *  first so it is not stuck behind the slow NLP health probe. */
  const loadScreeningStatus = useCallback(() => {
    // Requirement templates + vocabulary lookup fire first so the manager and
    // the chips have data without waiting for the slow NLP health probe.
    loadRequirementTemplates();
    // Vocabulary lookup for the Requirement Templates tab — lets each chip
    // show whether the model already recognizes that term.
    screeningApi.referenceData
      .list()
      .then((res) => {
        const set = new Set<string>();
        const grouped: Record<ScreeningRequirementEntityType, { value: string; label: string }[]> = {
          skill: [],
          certification: [],
          job_role: [],
          education: [],
          experience: [],
        };
        (res.data ?? []).forEach((r) => {
          (r.aliases_json ?? [])
            .concat(r.canonical_value)
            .forEach((v) => set.add(v.trim().toLowerCase()));
          // Only active vocabulary is offered as a pick; inactive rows stay
          // hidden so templates never require a term the model ignores.
          if (!r.active) return;
          const bucket = grouped[r.data_type as ScreeningRequirementEntityType];
          if (!bucket) return;
          if (bucket.some((o) => o.value.toLowerCase() === r.canonical_value.trim().toLowerCase())) return;
          bucket.push({ value: r.canonical_value, label: r.canonical_value });
        });
        (Object.keys(grouped) as ScreeningRequirementEntityType[]).forEach((k) =>
          grouped[k].sort((a, b) => a.label.localeCompare(b.label)),
        );
        setRefOptions(grouped);
        setRefValues(set);
      })
      .catch((e) => console.warn("Could not load reference data for templates:", e));
    screeningApi.configuration
      .status()
      .then((res) => {
        const data = res.data;
        setNlpStatus(data.nlp_service);
        const effective = data.saved ?? data.effective;
        setCriteria(
          Object.entries(effective.criteria).map(([name, entry]) => ({
            name,
            weight: entry.weight,
            enabled: entry.enabled,
          })),
        );
        setPassing(effective.passing_score);
        setCoverageMin(Math.round((effective.required_skills_coverage_min ?? 0.6) * 100));
      })
      .catch((e) => console.warn("Could not load screening configuration status:", e));
  }, [loadRequirementTemplates]);

  useEffect(() => {
    if (screeningOpen) loadScreeningStatus();
  }, [screeningOpen, loadScreeningStatus]);

  /** Persists the HR screening configuration — it applies to every new
   *  screening run through the NLP service (weights + thresholds). */
  const saveScreeningConfiguration = async () => {
    if (totalWeight !== 100) {
      toast.error(`Enabled criteria weights must total 100% — currently ${totalWeight}%.`);
      return;
    }
    const configuration = {
      criteria: Object.fromEntries(
        criteria.map((c) => [c.name, { weight: c.weight, enabled: c.enabled }]),
      ),
      passing_score: passing,
      required_skills_coverage_min: coverageMin / 100,
    };
    setSavingConfig(true);
    try {
      await screeningApi.configuration.save(configuration);
      toast.success("Screening configuration saved — it applies to every new resume screening.");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message
          ? e.message
          : "The screening configuration could not be saved.",
      );
    } finally {
      setSavingConfig(false);
    }
  };

  /** Activates / deactivates a requirement template (builder availability). */
  const toggleRequirementTemplate = async (template: ApiRequirementTemplate) => {
    setTemplateBusyId(template.template_id);
    try {
      const res = await screeningApi.requirementTemplates.toggleActive(template.template_id);
      setRequirementTemplates((prev) =>
        prev.map((t) => (t.template_id === res.data.template_id ? res.data : t)),
      );
      toast.success(
        `Requirement template "${res.data.name}" ${res.data.active ? "activated" : "deactivated"}`,
        {
          description: res.data.active
            ? "It is available in the Job Post Builder picker again."
            : "It is hidden from the Job Post Builder picker.",
        },
      );
    } catch (e) {
      toast.error(
        e instanceof Error && e.message ? e.message : "The template could not be updated.",
      );
    } finally {
      setTemplateBusyId(null);
    }
  };

  /** Applies a requirement template to the Job Post Builder draft: skills seed
   *  Screening Requirements, certifications / job roles seed Qualifications (roles as
   *  an "Experience as …" line) and education / experience entities fill the
   *  structured levels the NLP screening scores against. Non-standard education
   *  / experience values become qualification lines instead of being lost.
   *
   *  `opts.replaceRequirements` makes the application a true replacement of the
   *  post's screening requirements: skills, certifications, the role lines and
   *  the structured education / experience levels become the template's — the
   *  behavior the role-switch confirmation promises with its "+ / −" preview.
   *  Called without it (auto-apply on a clean draft, Screening Setup "Use
   *  template") keeps the additive behavior so hand-typed requirements survive.
   */
  const applyRequirementTemplateToDraft = (
    template: ApiRequirementTemplate,
    opts: { replaceRequirements?: boolean } = {},
  ) => {
    const mergeLines = (current: string, additions: string[]) => {
      const existing = new Set(
        current
          .split("\n")
          .map((l) => l.trim().toLowerCase())
          .filter(Boolean),
      );
      return [
        ...current
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        ...additions.filter((a) => !existing.has(a.trim().toLowerCase())),
      ];
    };

    const parts = templateRequirementParts(template);
    const currentSkillLines = draft.skills
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const templateSkillSet = new Set(parts.skills.map((s) => s.toLowerCase()));

    /** Whether a qualification line encodes a screening requirement — exactly
     *  the lines a true replacement owns. */
    const requirementLine = (line: string) =>
      CERTIFICATION_LINE_RE.test(line) ||
      EXPERIENCE_ROLE_LINE_RE.test(line) ||
      EDUCATION_NOTE_LINE_RE.test(line) ||
      EXPERIENCE_NOTE_LINE_RE.test(line);

    const nextSkills = opts.replaceRequirements
      ? [...new Set(parts.skills)]
      : mergeLines(draft.skills, parts.skills);
    /* Replace mode: the post's screening requirements become exactly the
       template's — every requirement line the previous role left in
       Qualifications (certifications, "Experience as …" roles, education /
       experience notes) is swapped for the template's. Hand-written bullets
       that encode no requirement survive. */
    const nextQualifications = opts.replaceRequirements
      ? [
          ...new Set([
            ...draft.qualifications
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
              .filter((l) => !requirementLine(l)),
            ...parts.lines,
          ]),
        ]
      : mergeLines(draft.qualifications, parts.lines);

    /* Level chips. Replacing swaps the accepted levels for the template's; adding
       unions them so a template that asks for one level never deletes the ones
       already on the post. A template that names none leaves them alone — the
       confirm dialog says so up front. */
    const levelChips = (current: string[], incoming: string[]) => {
      if (incoming.length === 0) return current;
      if (!opts.replaceRequirements) {
        return [
          ...current,
          ...incoming.filter(
            (level) => !current.some((c) => normalizeEntityText(c) === normalizeEntityText(level)),
          ),
        ];
      }
      return incoming;
    };
    const educationLevels = levelChips(draft.educationLevels, parts.educationLevels);
    const experienceLevels = levelChips(draft.experienceLevels, parts.experienceLevels);

    setDraft((d) => ({
      ...d,
      skills: nextSkills.join("\n"),
      qualifications: nextQualifications.join("\n"),
      educationLevels,
      experienceLevels,
    }));
    setAppliedTemplate(template);
    // Make sure the seeded blocks sit on the builder canvas and are active.
    setBlocks((b) => {
      const needed = (["skills", "qualifications"] as BlockId[]).filter((id) => !b.includes(id));
      return needed.length ? [...b, ...needed] : b;
    });
    setActiveBlock("skills");
    setScreeningOpen(false);
    setTab("builder");
    setBuilderStarted(true);

    const summary: string[] = [];
    if (parts.skills.length)
      summary.push(`${parts.skills.length} skill${parts.skills.length === 1 ? "" : "s"}`);
    if (parts.lines.length) {
      summary.push(
        `${parts.lines.length} qualification line${parts.lines.length === 1 ? "" : "s"}`,
      );
    }
    if (parts.educationLevels.length)
      summary.push(
        `${parts.educationLevels.length} education level${parts.educationLevels.length === 1 ? "" : "s"}`,
      );
    if (parts.experienceLevels.length)
      summary.push(
        `${parts.experienceLevels.length} experience level${parts.experienceLevels.length === 1 ? "" : "s"}`,
      );
    if (opts.replaceRequirements) {
      /* Say how much came off so the replacement reads as total, not additive —
         the confirm dialog previews the same sets. */
      const removedSkills = currentSkillLines.filter(
        (s) => !templateSkillSet.has(s.toLowerCase()),
      ).length;
      const removedLines = draft.qualifications
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => requirementLine(l)).length;
      if (removedSkills + removedLines > 0) {
        summary.push(
          `${removedSkills + removedLines} previous requirement line${
            removedSkills + removedLines === 1 ? "" : "s"
          } replaced`,
        );
      }
    }
    toast.success(
      opts.replaceRequirements
        ? `Requirement template "${template.name}" replaced the screening requirements`
        : `Requirement template "${template.name}" applied to the job post`,
      {
        description: summary.length
          ? `${summary.join(" · ")} — review them in the builder before saving.`
          : "Review the builder draft before saving.",
      },
    );
  };

  /** Adds a template term to the Reference Data vocabulary (skill/role/cert)
   *  so the NLP model starts recognizing it in resumes. When the entry already
   *  exists, the backend's unique rule rejects it — surfaced as a friendly
   *  "already recognized" message instead of an error. */
  const addTermToVocabulary = async (
    term: string,
    type: "skill" | "job_role" | "certification",
  ) => {
    const value = term.trim();
    if (!value) return;
    setAddingTerm(true);
    try {
      await screeningApi.referenceData.create({
        data_type: type,
        canonical_value: value,
        aliases_json: [],
        active: true,
      });
      setRefValues((prev) => new Set(prev).add(value.toLowerCase()));
      toast.success(`"${value}" added to the screening vocabulary`, {
        description:
          "The model will recognize it as a " + type.replace("_", " ") + " in every new screening.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (/unique|already|duplicate/i.test(msg)) {
        toast.info(`"${value}" is already in the vocabulary`);
      } else {
        toast.error(`"${value}" could not be added — ${msg || "please try again."}`);
      }
    } finally {
      setAddingTerm(false);
    }
  };

  /** Maps the NLP service's official status codes to the UI status values. */
  const toUiStatus = (code: unknown): ApplicantStatus => {
    switch (code) {
      case "PERFECT_FOR_THE_JOB":
        return "fit";
      case "INVALID_CREDENTIAL":
        return "credential";
      case "FIT_FOR_OTHER_JOB":
        return "other-role";
      default:
        return "not-fit";
    }
  };

  /** Applies the file unconditionally and runs the extraction auto-fill
   *  in replace mode (values overwrite whatever the form held). */
  const applyResumeFile = (file: File) => {
    void autofillFromResume(file, { overwrite: true });
  };

  /** Latest-request guard so a quick re-upload never applies stale results. */
  const autofillSeq = useRef(0);
  const [resumeAutofilling, setResumeAutofilling] = useState(false);

  /** Normalizes extracted contact numbers to plain local form:
   *  strips "-" and spaces, converts a leading +63 to 0
   *  ("+63 917-403-8821" -> "09174038821"). Returns null when unusable. */
  const normalizePHPhone = (raw?: string | null): string | null => {
    if (!raw) return null;
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("63") && digits.length === 12) {
      digits = "0" + digits.slice(2);
    }
    if (digits.length < 7 || digits.length > 15) return null;
    return digits;
  };

  const autofillFromResume = async (
    file: File,
    opts: { overwrite: boolean } = { overwrite: false },
  ) => {
    const seq = ++autofillSeq.current;
    setResumeAutofilling(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await applicantsApi.extractResume(fd);
      if (seq !== autofillSeq.current || !res.success) return;
      const pi = res.personal_information ?? {};
      // Compute the fields the resume actually supplied up-front: the state
      // updater below runs asynchronously, so a `filled` array mutated inside
      // it would still be empty when we check it for the toast.
      const supplied = (["name", "email", "phone", "address"] as const).filter((key) => {
        const raw = key === "phone" ? (normalizePHPhone(pi[key]) ?? "") : (pi[key]?.trim() ?? "");
        return raw.length > 0;
      });
      setAddForm((prev) => {
        const next = { ...prev };
        const put = (key: "name" | "email" | "phone" | "address", raw?: string | null) => {
          const value = key === "phone" ? (normalizePHPhone(raw) ?? "") : (raw?.trim() ?? "");
          if (!value) return;
          if (!opts.overwrite && next[key].trim()) return; // merge mode: keep user input
          if (next[key].trim() === value) return; // nothing to change
          next[key] = value;
        };
        put("name", pi.name);
        put("email", pi.email);
        put("phone", pi.phone);
        put("address", pi.address);
        return next;
      });
      if (supplied.length) {
        toast.info(
          `${opts.overwrite ? "Replaced" : "Auto-filled"} ${supplied.length} field${supplied.length === 1 ? "" : "s"} from "${file.name}" — review before continuing.`,
        );
      }
    } catch (e) {
      console.warn("Resume auto-fill failed:", e);
      if (seq === autofillSeq.current) {
        toast.error("Could not read contact details from this resume.");
      }
    } finally {
      if (seq === autofillSeq.current) setResumeAutofilling(false);
    }
  };

  /** Opens any staged local file (resume or verification doc) in a new tab. */
  const openLocalFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  /** Downloads any staged local file (resume or verification doc). */
  const downloadLocalFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  /** Initials for the Step 3 applicant strip avatar. */
  const addInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "AP";

  /** Positions of the department currently selected in the wizard — deduplicated by title. */
  const addPositions = useMemo(() => {
    const filtered = knownPositions.filter((p) => p.department === addDept);
    const seen = new Map<string, (typeof filtered)[number]>();
    for (const p of filtered) {
      if (!seen.has(p.title)) seen.set(p.title, p);
    }
    return Array.from(seen.values());
  }, [knownPositions, addDept]);

  /** A posting accepts applicants only while Open, active, and not fully filled. */
  const isPostAvailable = (j: Job) =>
    j.active &&
    (j.status === "Open" || (j.status as string) === "published") &&
    j.vacancies - j.filled > 0;

  /** True when the department + position pair already has a job post (any status). */
  const isPairTaken = (dept: string, positionTitle: string) =>
    positionTitle !== "" && jobList.some((j) => j.department === dept && j.title === positionTitle);

  /**
   * Duplicate-post guard for the "new post" picker. Matched on position_id so
   * the supervisory "Front Desk Receptionist" (POS-018) is not reported as
   * taken just because the front-line one (POS-001) is posted. Posts that carry
   * no position_id at all fall back to the dept + title check, since there is
   * nothing better to compare them on.
   */
  const isPairTakenFor = (dept: string, positionDbId?: number | null) => {
    if (positionDbId === undefined || positionDbId === null) {
      return isPairTaken(dept, pendingPosition);
    }
    return jobList.some(
      (j) =>
        j.department === dept &&
        (j.positionId !== undefined && j.positionId !== null
          ? j.positionId === positionDbId
          : j.title === pendingPosition),
    );
  };

  /** True when the selected department/position pair has an available job post. */
  const postingIndicator = useCallback(
    (dept: string, positionTitle?: string) =>
      jobList.some(
        (j) =>
          j.department === dept &&
          (!positionTitle || j.title === positionTitle) &&
          j.active &&
          (j.status === "Open" || (j.status as string) === "published") &&
          j.vacancies - j.filled > 0,
      ),
    [jobList],
  );

  const resetAddWizard = () => {
    setAddStep(1);
    setScreenResult(null);
    setUnifiedDocs([]);
    setPendingResume(null);
    setReplaceOpen(false);
    setAddForm({ name: "", email: "", phone: "", address: "", position: "" });
  };

  const closeAddWizard = () => {
    setAddOpen(false);
    resetAddWizard();
  };

  const requestCloseWizard = () => {
    if (addStep === 1 && hasStep2Data) {
      setConfirmStep2ExitOpen(true);
    } else {
      closeAddWizard();
    }
  };

  const handleConfirmStep2Discard = () => {
    setConfirmStep2ExitOpen(false);
    closeAddWizard();
  };

  const handleConfirmStep2Stay = () => {
    setConfirmStep2ExitOpen(false);
  };

  /** Admin flow — locked to the clicked job post (department + position auto-set). */
  const openAddApplicantForJob = (job: Job) => {
    setAddPresetJob(job);
    setAddDept(job.department);
    setAddForm({ name: "", email: "", phone: "", address: "", position: job.title });
    setAddStep(1);
    setScreenResult(null);
    setUnifiedDocs([]);
    setPendingResume(null);
    setReplaceOpen(false);
    setAddOpen(true);
  };

  /** Super admin flow — free choice of any department & position. */
  const openAddApplicantFree = () => {
    setAddPresetJob(null);
    const firstDept = knownDepartments[0]?.name ?? departments[0]?.name ?? "";
    const firstPos = knownPositions.find((p) => p.department === firstDept)?.title ?? "";
    setAddDept(firstDept);
    setAddForm({ name: "", email: "", phone: "", address: "", position: firstPos });
    setAddStep(1);
    setScreenResult(null);
    setUnifiedDocs([]);
    setPendingResume(null);
    setReplaceOpen(false);
    setAddOpen(true);
  };

  /**
   * Resolves the job post the applicant will be attached to.
   * Applicants may only be added to an available post (Open, active, with
   * remaining slots). Closed, Draft and fully-filled postings refuse new
   * applicants — no draft post is auto-created anymore.
   */
  const resolveJobPostId = async (): Promise<number | null> => {
    // Admin flow — the job post is known up-front; still verify availability.
    if (addPresetJob?.dbId) {
      const preset = jobList.find((j) => j.dbId === addPresetJob.dbId) ?? addPresetJob;
      if (!isPostAvailable(preset)) {
        toast.error(
          `Cannot add applicant: the job post for ${preset.title} is ${
            preset.status === "Open" || (preset.status as string) === "published"
              ? "full"
              : preset.status
          } and is not accepting applications.`,
        );
        return null;
      }
      return addPresetJob.dbId;
    }

    // Super admin flow — reuse only an available post for the position.
    const available = jobList.find(
      (j) => j.title === addForm.position && j.department === addDept && isPostAvailable(j),
    );
    if (available?.dbId) return available.dbId;

    const existing = jobList.find((j) => j.title === addForm.position && j.department === addDept);
    toast.error(
      !addForm.position
        ? "Select a position first — this department has no defined positions."
        : existing
          ? `No available job post for ${addForm.position} in ${addDept} — the posting is ${
              existing.status === "Open" ? "full" : existing.status
            }. Reopen it before adding applicants.`
          : `No job post exists for ${addForm.position} in ${addDept} — create and publish one before adding applicants.`,
    );
    return null;
  };

  /**
   * Runs the real spaCy NLP screening through the Laravel backend.
   * The uploaded resume is analyzed against the selected job post and all
   * other open positions; the full result payload is kept so saving the
   * applicant can reuse it (no second NLP call).
   */
  const runScreening = async (jobPostId?: number) => {
    if (!addResumeFile) {
      toast.error("Upload a resume file first.");
      return;
    }
    setScreeningLoading(true);
    try {
      const id = jobPostId ?? (await resolveJobPostId());
      if (!id) {
        setScreeningLoading(false);
        return;
      }
      const fd = new FormData();
      fd.append("resume", addResumeFile);
      fd.append("job_post_id", String(id));
      // Staged supporting documents (Step 2) — verified in-memory against the
      // resume profile so Step 3 shows the real Resume vs Documents breakdown
      // and blended percentage instead of "No proof papers".
      verificationDocs.forEach((doc) => {
        fd.append("documents[]", doc.file);
        fd.append("doc_types[]", doc.docType);
      });
      const result = await applicantsApi.screenResume(fd);
      if (!result.success) {
        throw new Error(result.error_message || "The resume could not be processed.");
      }
      setScreenResult({
        score: Number((result.match_score ?? 0).toFixed(2)),
        status: toUiStatus(result.screening_status),
        entities:
          result.entities?.map((e) => ({
            label:
              e.label === "EDUCATION"
                ? "EDU"
                : e.label === "ORGANIZATION"
                  ? "ORG"
                  : e.label === "CERTIFICATION"
                    ? "CERT"
                    : e.label,
            value: e.value,
          })) ?? [],
        detail: result,
      });
      toast.success(
        `Screening complete — ${result.match_score ?? 0}% (${statusMeta[toUiStatus(result.screening_status)].label})`,
      );
      setAddStep(2);
    } catch (e) {
      console.warn("Resume screening failed:", e);
      toast.error(
        e instanceof Error && e.message && !e.message.startsWith("Request failed")
          ? e.message
          : "Could not screen the resume. Make sure the NLP service is running on port 8001, then retry.",
      );
    } finally {
      setScreeningLoading(false);
    }
  };

  const saveNewApplicant = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.address) {
      toast.error("Complete name, email, phone number and address.");
      return;
    }
    if (!isValidName(addForm.name)) {
      toast.error("Please enter a valid full name (letters only, no numbers).");
      return;
    }
    if (!isValidEmail(addForm.email)) {
      toast.error("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    if (!isValidPhone(addForm.phone)) {
      toast.error("Please enter a valid contact number (7 to 15 digits).");
      return;
    }

    const res = screenResult;
    if (!res) {
      toast.error("Run the resume screening first before saving.");
      return;
    }
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    try {
      const jobPostId = addPresetJob?.dbId ?? (await resolveJobPostId());
      if (!jobPostId) return;

      const isImageResume =
        Boolean(addResumeFile) &&
        (/\.(jpe?g|png|webp|heic|heif|bmp|gif|tiff?|avif|svg)$/i.test(addResumeFile?.name ?? "") ||
          (addResumeFile?.type ?? "").startsWith("image/"));
      const base = {
        job_post_id: jobPostId,
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        source: isImageResume ? "Walk-in" : "Online Portal",
        summary: `Added via ${isImageResume ? "image (OCR)" : "document"} screening — ${addFileName || "uploaded resume"}, scored ${res.score}%.`,
        status: res.status,
        stage: "Screened",
        flags_json: res.status === "credential" ? ["Manual credential verification required"] : [],
        fit_score: res.score,
      };
      let payload: FormData | Record<string, any> = base;
      if (addResumeFile) {
        const fd = new FormData();
        Object.entries(base).forEach(([k, v]) => {
          if (k === "flags_json") {
            fd.append(k, JSON.stringify(v ?? []));
          } else {
            fd.append(k, String(v));
          }
        });
        fd.append("resume", addResumeFile);
        if (res.detail) {
          fd.append("screening_payload", JSON.stringify(res.detail));
        }
        payload = fd;
      }
      const created = await applicantsApi.create(payload);

      // Persist verification documents against the newly created applicant
      // (COE / Certificate / Credential / Others — resume content proofs).
      if (verificationDocs.length > 0 && created?.applicant_id) {
        for (const doc of verificationDocs) {
          try {
            const fd = new FormData();
            fd.append("doc_type", doc.docType);
            fd.append("title", doc.title);
            fd.append("original_copy", doc.originalCopy ? "1" : "0");
            fd.append("file", doc.file);
            await applicantDocumentsApi.upload(created.applicant_id, fd);
          } catch (docErr) {
            console.warn("Could not persist verification document:", docErr);
          }
        }
        toast.success(
          `${verificationDocs.length} verification document(s) attached for resume verification`,
        );
      }

      toast.success(`${base.name} added to the applicant list in Applicant Management`);
      setAddOpen(false);
      resetAddWizard();
    } catch (e) {
      console.warn("Could not persist applicant to database API:", e);
      toast.error(
        `${addForm.name} could not be saved to the database. ${
          e instanceof Error ? e.message : ""
        }`,
      );
    }
  };

  const requisitions = useRequisitions();
  const reqsLoading = useRequisitionsLoading();

  const [draft, setDraft] = useState<Draft>(blankDraft);

  /** Website preview panel in the right column. Open by default — the recruiter
   *  should see the posting as applicants will without clicking anything; the
   *  close (X) only hides it until they ask for it again. */
  const [previewOpen, setPreviewOpen] = useState(true);
  const [customPosterUrl, setCustomPosterUrl] = useState<string | null>(null);
  /** The actual File object, uploaded with the job post on publish. */
  const [posterFile, setPosterFile] = useState<File | null>(null);
  /** True while the Google AI draft is being generated for the builder. */
  const [generatingDraft, setGeneratingDraft] = useState(false);

  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [pendingDept, setPendingDept] = useState("");
  const [pendingPosition, setPendingPosition] = useState("");
  /** Core HCM position id behind `pendingPosition` — titles are not unique. */
  const [pendingPositionDbId, setPendingPositionDbId] = useState<number | null>(null);
  /** False shows the "create a job posting" entry card instead of the builder canvas. */
  const [builderStarted, setBuilderStarted] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [confirmTemplateOpen, setConfirmTemplateOpen] = useState(false);
  const [pendingTemplateJob, setPendingTemplateJob] = useState<Job | null>(null);
  /** Styled confirm before AI generation overwrites filled builder blocks. */
  const [confirmGenerateOpen, setConfirmGenerateOpen] = useState(false);
  /** Block awaiting delete-confirmation (only set when it holds user content). */
  const [pendingRemoveBlock, setPendingRemoveBlock] = useState<BlockId | null>(null);
  /** "Do this for all" — skips the remove-confirm for the rest of this session only (in-memory, resets on reload). */
  const [skipRemoveConfirm, setSkipRemoveConfirm] = useState(false);
  /** Checkbox state inside the remove-confirm dialog. */
  const [removeForAll, setRemoveForAll] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  /** Content Templates opens with the builder — the saved-post list is the
   *  offline fallback when the AI usage limit is spent, so hiding it behind a
   *  click hid the exact path HR needs. Collapsing is still available. */
  const [templatesOpen, setTemplatesOpen] = useState(true);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(snapshotOf(blankDraft, []));
  /** Template the screening requirements on this post actually came from (provenance for the panel banner). Null when hand-typed or carried over. */
  const [appliedTemplate, setAppliedTemplate] = useState<ApiRequirementTemplate | null>(null);
  /** In flight for the panel's one-click "Create requirements for this position". */
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  /** Template awaiting confirm-before-overwrite when switching positions with existing skills. */
  const [pendingTemplate, setPendingTemplate] = useState<{
    template: ApiRequirementTemplate;
    positionLabel: string;
  } | null>(null);
  /** AI checklist modal — the six prose blocks + per-block notes. */
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiChecked, setAiChecked] = useState<Record<string, boolean>>({
    description: true,
    responsibilities: true,
    qualifications: true,
    additional: true,
    instructions: true,
    about: true,
  });
  const [aiNotes, setAiNotes] = useState<Record<string, string>>({
    description: "",
    responsibilities: "",
    qualifications: "",
    additional: "",
    instructions: "",
    about: "",
  });
  /** Per-block write report shown inside the AI modal after generation.
   *  `reusedPrefix` overrides the bullet wording for rows that adopted terms
   *  into Screening Requirements rather than reusing the post's own skills. */
  const [aiReport, setAiReport] = useState<
    { block: string; label: string; detail: string; reused: string[]; reusedPrefix?: string }[]
  >([]);
  /** Entities view: false shows the builder canvas, true shows Entities Indicated. */
  const [builderFlipped, setBuilderFlipped] = useState(false);
  /** Screening vocabulary for entity indication — lazy-loaded on first flip. */
  const [entityMapping, setEntityMapping] = useState<BuilderEntityMapping | null>(null);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityError, setEntityError] = useState<string | null>(null);
  /** Live scoring weights for the scoring reference — same lazy load. */
  const [entityScoring, setEntityScoring] = useState<BuilderScoringRef>(DEFAULT_BUILDER_SCORING);
  /** AI usage/limit snapshot behind the Generate with AI indicator. */
  const [aiUsage, setAiUsage] = useState<JobAiUsage | null>(null);
  /** Live countdown (seconds) until the AI limit resets — 0 when not blocked. */
  const [aiBlockedSeconds, setAiBlockedSeconds] = useState(0);
  /** Content Templates palette — the fallback target when AI usage is used up. */
  const templatesCardRef = useRef<HTMLDivElement | null>(null);

  /** Loads the live screening vocabulary the first time the card flips. */
  const loadEntityMapping = useCallback(() => {
    setEntityLoading(true);
    setEntityError(null);
    screeningApi.referenceData
      .mapping()
      .then((res) => setEntityMapping(res.data))
      .catch(() =>
        setEntityError(
          "Could not load the screening vocabulary. Check the connection, then try again.",
        ),
      )
      .finally(() => setEntityLoading(false));
    screeningApi.configuration
      .status()
      .then((res) =>
        setEntityScoring(builderScoringFromConfig(res.data.saved ?? res.data.effective)),
      )
      .catch(() => setEntityScoring(DEFAULT_BUILDER_SCORING));
  }, []);

  const toggleBuilderFlip = () => {
    const next = !builderFlipped;
    setBuilderFlipped(next);
    if (next && !entityMapping && !entityLoading) loadEntityMapping();
  };

  /* The Screening Requirements panel shows live ✓ marks, so the vocabulary
     must load when the builder opens — not only on card flip. */
  useEffect(() => {
    if (tab === "builder" && builderStarted && !entityMapping && !entityLoading && !entityError) {
      loadEntityMapping();
    }
  }, [tab, builderStarted, entityMapping, entityLoading, entityError, loadEntityMapping]);

  /**
   * Refreshes the AI usage/limit snapshot shown beside Generate with AI.
   * Best-effort: a failing indicator must never block the builder.
   */
  const loadAiUsage = useCallback(() => {
    jobPostsApi
      .aiUsage()
      .then((res) => setAiUsage(res.data))
      .catch(() => {
        // Keep the last known snapshot — no toast, this is background data.
      });
  }, []);

  useEffect(() => {
    void loadAiUsage();
  }, [loadAiUsage]);

  // Tick the "resets in …" countdown locally while the AI limit is active.
  useEffect(() => {
    if (!aiUsage?.blocked_until) {
      setAiBlockedSeconds(0);
      return;
    }
    const target = new Date(aiUsage.blocked_until).getTime();
    let refreshed = false;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setAiBlockedSeconds(remaining);
      // Cool-down expired — pull a fresh snapshot so the chip flips back to
      // "ready" with real counters instead of the stale blocked state.
      if (remaining === 0 && !refreshed) {
        refreshed = true;
        void loadAiUsage();
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [aiUsage?.blocked_until, loadAiUsage]);

  /** Adds an unrecognized builder term to the vocabulary, then reflects it locally. */
  const addEntityTerm = async (term: string, type: "skill" | "job_role" | "certification") => {
    await addTermToVocabulary(term, type);
    const key = type === "skill" ? "skills" : type === "job_role" ? "job_roles" : "certifications";
    setEntityMapping((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], [term.trim()]: [] } } : prev,
    );
  };

  /**
   * "Create requirements for this position" — writes the requirement template
   * for the draft's position straight away, instead of dropping HR into the
   * Screening Setup dialog with an empty form.
   *
   * It seeds the template from what the draft already requires (skills plus the
   * certification-like qualification lines, canonicalised against the screening
   * vocabulary), so the click is loss-free: the post keeps its requirements and
   * the template becomes the reusable copy for the next posting of the role. An
   * existing template for the same position is merged into rather than
   * duplicated, and terms it already holds are kept as-is.
   */
  const createTemplateForDraftPosition = async () => {
    const title = draft.title.trim();
    if (!title) {
      toast.error("Select a job position first — requirement templates are per position.");
      return;
    }
    const positionId = draft.positionDbId ?? null;
    const skillsIdx = buildBuilderEntityIndex(entityMapping?.skills ?? {});
    const certsIdx = buildBuilderEntityIndex(entityMapping?.certifications ?? {});
    const toLines = (s: string) =>
      s
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

    const items: RequirementTemplatePayload["items"] = [];
    const seen = new Set<string>();
    const push = (entity_type: "skill" | "certification", value: string) => {
      const key = `${entity_type}|${value.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ entity_type, value, required: true });
    };

    toLines(draft.skills).forEach((line) => {
      const canonical = canonicalizeBuilderEntity(line, skillsIdx);
      // Unrecognized lines are deliberately skipped: a template that carries a
      // typo would score every future applicant against a term nothing matches.
      if (canonical) push("skill", canonical);
    });
    [...toLines(draft.qualifications), ...toLines(draft.skills)]
      .filter((line) => CERTIFICATION_LINE_RE.test(line))
      .forEach((line) => {
        const canonical = canonicalizeBuilderEntity(line, certsIdx);
        if (canonical) push("certification", canonical);
      });

    if (items.length === 0) {
      toast.error("Nothing to save yet", {
        description:
          "Add at least one skill from the vocabulary (or a certification) before creating the template.",
      });
      return;
    }

    const name = `${title} Requirements`;
    /* One template per position is the model the builder applies from, so a
       position that already has one is extended rather than given a second.
       An exact name match wins; otherwise the position's existing active
       template is merged into. */
    const forPosition = requirementTemplates.filter(
      (t) => t.active && (t.position_id ?? null) === positionId,
    );
    const existing =
      forPosition.find((t) => t.name.trim().toLowerCase() === name.toLowerCase()) ??
      forPosition[0];

    setCreatingTemplate(true);
    try {
      let saved: ApiRequirementTemplate;
      if (existing) {
        const known = new Set(existing.items.map((i) => `${i.entity_type}|${i.value.toLowerCase()}`));
        const fresh = items.filter((i) => !known.has(`${i.entity_type}|${i.value.toLowerCase()}`));
        if (fresh.length === 0) {
          // Nothing new to fold in — re-saving would only bump updated_at.
          setAppliedTemplate(existing);
          toast.success(`“${existing.name}” already covers this position`, {
            description: "Nothing changed — every requirement is already saved on the template.",
          });
          setScreeningOpen(true);
          setScreeningTab("templates");
          return;
        }
        const merged = [
          ...existing.items.map((i) => ({
            entity_type: i.entity_type,
            value: i.value,
            required: true,
          })),
          ...fresh,
        ];
        const res = await screeningApi.requirementTemplates.update(existing.template_id, {
          name: existing.name,
          position_id: existing.position_id,
          description: existing.description ?? null,
          active: existing.active,
          items: merged,
        });
        saved = res.data;
        setAppliedTemplate(saved);
        toast.success(`Added ${fresh.length} requirement${fresh.length === 1 ? "" : "s"} to “${saved.name}”`, {
          description: "The existing template for this position was extended, not replaced.",
        });
      } else {
        const res = await screeningApi.requirementTemplates.create({
          name,
          position_id: positionId,
          description: `Screening requirements for ${title}.`,
          active: true,
          items,
        });
        saved = res.data;
        setAppliedTemplate(saved);
        toast.success(`Requirement template “${saved.name}” created`, {
          description: `${items.length} requirement${items.length === 1 ? "" : "s"} saved for ${title}. Every future posting of this role starts from them.`,
        });
      }
      loadRequirementTemplates();
      setScreeningOpen(true);
      setScreeningTab("templates");
    } catch (e) {
      console.warn("Could not create requirement template:", e);
      toast.error("The requirement template could not be saved.", {
        description: e instanceof Error && e.message ? e.message : undefined,
      });
    } finally {
      setCreatingTemplate(false);
    }
  };

  const canSaveDraft = useMemo(
    () => blocks.some((id) => hasContentFor(id, draft)),
    [blocks, draft],
  );
  const isDirty = useMemo(
    () => tab === "builder" && canSaveDraft && snapshotOf(draft, blocks) !== savedSnapshot,
    [tab, canSaveDraft, draft, blocks, savedSnapshot],
  );

  /**
   * "Generate with AI" usage indicator: which state the AI is in right now
   * (ready / generating / limit reached / not configured) and how many drafts
   * were used today. `limited` also disables the button while the provider
   * cool-down is running — a click cannot succeed until it expires.
   */
  const aiIndicator = useMemo(() => {
    const used = aiUsage?.used_today ?? 0;
    const limit = aiUsage?.daily_limit ?? 0;
    /* daily_limit 0 (or a null remaining) means unlimited, so there is no meter
       to fill — show the plain count instead of a misleading 0%. */
    const capped = limit > 0;
    const percent = capped ? Math.min(100, Math.round((used / limit) * 100)) : null;

    if (generatingDraft) {
      return {
        tone: "busy" as const,
        label: "Generating…",
        title: "The AI is writing the content blocks now.",
        percent: null as number | null,
        limited: false,
      };
    }
    if (!aiUsage) {
      return {
        tone: "muted" as const,
        label: "AI status…",
        title: "Checking the AI usage and limits.",
        percent: null as number | null,
        limited: false,
      };
    }
    if (!aiUsage.configured) {
      return {
        tone: "off" as const,
        label: "AI not configured",
        title:
          "No GEMINI_API_KEY / JOB_GROQ_API_KEY / JOB_OPENROUTER_API_KEY is set on the API server — ask an admin to configure one.",
        percent: null as number | null,
        limited: false,
      };
    }
    if (aiBlockedSeconds > 0) {
      return {
        tone: "limit" as const,
        label: `AI limit · ${aiCountdown(aiBlockedSeconds)}`,
        title: `${aiFailureLabel(aiUsage.blocked_code)} — ${
          aiUsage.blocked_reason ?? "the AI usage is used up."
        } Use a Content Template meanwhile.`,
        percent: 100 as number | null,
        limited: true,
      };
    }

    const tokens = aiUsage.tokens_today ?? 0;
    const failures = aiUsage.failures_today ?? 0;
    return {
      tone: "ready" as const,
      label: capped ? `${used}/${limit} drafts today` : `${used} drafts today`,
      title: [
        `Ready — ${used} AI draft(s) today${capped ? ` of the ${limit} allowed` : " (no daily cap set)"} via ${aiUsage.primary_model}.`,
        tokens > 0 ? `${tokens.toLocaleString()} tokens spent today.` : null,
        failures > 0 ? `${failures} failed attempt(s) today.` : null,
      ]
        .filter(Boolean)
        .join(" "),
      percent,
      limited: false,
    };
  }, [aiUsage, aiBlockedSeconds, generatingDraft]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const routeBlocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
  });

  const saveDraftAction = async () => {
    const title = draft.title.trim() || "Untitled position";
    const draftId =
      editingJobId ??
      `draft-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const existing = jobList.find((j) => j.id === draftId);
    /* Saving must not change what is live. A brand-new post becomes a draft;
       an existing one keeps the status and active flag it already has, so
       editing a published ad through Save cannot quietly pull it off the careers
       page. Publishing is the only thing that changes that, and it is what the
       primary button does. */
    const keepPublished = Boolean(existing?.dbId);
    const liveStatus: JobStatus = keepPublished
      ? (existing?.status ?? "Draft")
      : "Draft";
    const liveActive = keepPublished ? (existing?.active ?? false) : false;
    /* Website is the only channel, so a save records it either way — the
       status above is what decides draft vs live. */
    const livePlatforms = [...KEPT_PLATFORMS];
    // One posting per position + department — refuse a new draft that
    // duplicates another posting's pair (updates to the same post are fine).
    const draftClash = jobList.find(
      (j) => j.id !== draftId && j.title === title && j.department === draft.department,
    );
    if (!existing?.dbId && draftClash) {
      toast.error(
        `A job post already exists for ${title} in ${draft.department} (${draftClash.status}) — edit the existing post instead of creating a duplicate.`,
      );
      return;
    }
    const payload: Job = {
      id: draftId,
      /* Keep the database id across optimistic updates — losing it makes the
         next save of the same card take the create branch and the backend
         rejects it as DUPLICATE_JOB_POST. */
      ...(existing?.dbId !== undefined ? { dbId: existing.dbId } : {}),
      title,
      department: draft.department,
      employmentType: draft.employmentType as Job["employmentType"],
      schedule: draft.schedule,
      salaryMin: Number(draft.salaryMin) || 0,
      salaryMax: Number(draft.salaryMax) || 0,
      vacancies: Number(draft.vacancies) || 1,
      filled: existing?.filled ?? 0,
      posted: existing?.posted ?? new Date().toISOString().slice(0, 10),
      status: liveStatus,
      active: liveActive,
      /* Levels come from the Screening Requirements chips. The scalars are the
         weakest accepted level (what the screener gates on); the lists carry
         every accepted level ("any of these"). An empty chip row means "no
         requirement on this axis", so nothing is invented here. */
      experience: (weakestAcceptedLevel(draft.experienceLevels, EXPERIENCE_LEVEL_OPTIONS) ??
        existing?.experience ??
        "1-2 Years") as Job["experience"],
      education: (weakestAcceptedLevel(draft.educationLevels, EDUCATION_LEVEL_OPTIONS) ??
        existing?.education ??
        "High School Graduate") as Job["education"],
      experienceLevels: acceptedLevels(
        draft.experienceLevels.length ? draft.experienceLevels : existing?.experienceLevels,
        existing?.experience,
      ),
      educationLevels: acceptedLevels(
        draft.educationLevels.length ? draft.educationLevels : existing?.educationLevels,
        existing?.education,
      ),
      summary: draft.description,
      description: draft.description,
      responsibilities: lines(draft.responsibilities),
      qualifications: lines(draft.qualifications),
      skills: lines(draft.skills),
      additional: lines(draft.additional),
      instructions: draft.instructions,
      about: draft.about,
      applicants: existing?.applicants ?? 0,
      benefits: [],
      platforms: livePlatforms,
      blocks: blocks,
    };
    setJobList((prev) =>
      prev.some((j) => j.id === draftId)
        ? prev.map((j) => (j.id === draftId ? payload : j))
        : [payload, ...prev],
    );
    setEditingJobId(draftId);
    setSavedSnapshot(snapshotOf(draft, blocks));

    // Persist the draft to the database so it survives reloads
    try {
      let positionId =
        draft.positionDbId ??
        positionsForDepartment(draft.department).find((p) => p.title === title)?.dbId;
      let departmentId = knownDepartments.find((d) => d.name === draft.department)?.dbId;
      if (!departmentId) {
        // Department codes are required by StoreDepartmentRequest; generate
        // one from the name like the publish flow does.
        const code =
          draft.department
            .split(/[\s&/\\-]+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 20) || "DEPT";
        const created = await coreHcmApi.createDepartment({ name: draft.department, code });
        departmentId = created.department_id;
      }
      if (!positionId) {
        // Positions require a salary grade (StorePositionRequest marks it
        // required) — reuse the publish handler's resolution: the draft's
        // grade, else the band whose range fits, else the lowest grade.
        const gradesRes = await coreHcmApi.salaryGrades.list({ per_page: 200 });
        const grades = gradesRes?.data ?? [];
        const draftMin = Number(draft.salaryMin) || 0;
        const byMin = [...grades].sort((a, b) => Number(a.min_salary) - Number(b.min_salary));
        const inRange = byMin.find((g) => {
          const lo = Number(g.min_salary) || 0;
          const hi =
            g.max_salary === null || g.max_salary === undefined ? Infinity : Number(g.max_salary);
          return draftMin >= lo && draftMin <= hi;
        });
        const gradePick =
          grades.find((g) => String(g.salary_grade_id) === draft.salaryGradeId) ?? inRange ?? byMin[0];
        if (!gradePick) {
          throw new Error("No salary grade exists — create one in Core HCM → Salary Grades first.");
        }
        const created = await coreHcmApi.createPosition({
          title,
          department_id: departmentId,
          salary_grade_id: gradePick.salary_grade_id,
          level: "Rank & File",
          headcount: Number(draft.vacancies) || 1,
        });
        positionId = created.position_id;
      }

      const basePayload = {
        position_id: positionId,
        department_id: departmentId,
        title: payload.title,
        employment_type: payload.employmentType,
        schedule: payload.schedule,
        salary_min: payload.salaryMin,
        salary_max: payload.salaryMax,
        vacancies: payload.vacancies,
        /* The post's current publish state travels with the save — a draft
           toggle that ignored it is what used to unpublish a live ad. */
        status: liveStatus,
        active: liveActive,
        /* Structured screening levels — the NLP match scoring reads them, so
           a save has to carry them or they silently revert to the old value.
           The scalars are the weakest accepted level; the lists are every level
           the chips accept ("any of these"). */
        experience_level: payload.experience,
        education_level: payload.education,
        experience_levels: payload.experienceLevels ?? [],
        education_levels: payload.educationLevels ?? [],
        summary: payload.summary,
        description: payload.description,
        responsibilities: payload.responsibilities,
        qualifications: payload.qualifications,
        skills: payload.skills,
        additional: payload.additional,
        instructions: payload.instructions,
        about: payload.about,
        platforms: livePlatforms,
        /* Canvas arrangement, so the recruiter's drag order survives the save.
           Test requirements are owned by Core HCM (positions table) — never
           sent from Recruitment; the linked position's flags decide the
           applicant pipeline. */
        blocks: payload.blocks ?? [],
      };

      if (existing?.dbId) {
        await jobPostsApi.update(existing.dbId, basePayload);
      } else {
        const created = await jobPostsApi.create(basePayload);
        setJobList((prev) =>
          prev.map((j) => (j.id === draftId ? { ...j, dbId: created.job_post_id } : j)),
        );
      }
      toast.success(
        keepPublished
          ? `“${title}” saved${liveStatus === "Open" ? " — still live on " + livePlatforms.join(", ") : ""}`
          : `Draft saved — “${title}” is in your postings as a draft`,
      );
    } catch (e) {
      console.warn("Could not persist draft to database API:", e);
      toast.error(`“${title}” was kept locally, but could not be saved to the database.`);
    }
  };

  const toggleActive = async (id: string) => {
    const target = jobList.find((j) => j.id === id);
    setJobList((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, active: !j.active, status: !j.active ? "Open" : ("Closed" as const) }
          : j,
      ),
    );
    try {
      await jobPostsApi.toggle(target?.dbId ?? id);
      toast.success("Job post status updated in database");
    } catch (e) {
      console.warn("Could not toggle job on API:", e);
    }
  };

  const deleteJob = async (job: Job) => {
    if (!job.dbId) return;
    const applicantCount = Number(job.applicants) || 0;
    const confirmed = await confirm({
      title: applicantCount > 0 ? "Archive job posting?" : "Delete job posting?",
      description:
        applicantCount > 0
          ? `Archive the “${job.title}” job posting? It has ${applicantCount} applicant${
              applicantCount === 1 ? "" : "s"
            }. The posting will be removed from the list, but candidate, interview and offer records will be kept.`
          : `Delete the “${job.title}” job posting? Job posts with linked hiring records are archived instead of being permanently deleted.`,
      confirmLabel: applicantCount > 0 ? "Archive" : "Delete",
      destructive: applicantCount === 0,
    });
    if (!confirmed) return;
    try {
      const result = await jobPostsApi.delete(job.dbId);
      setJobList((prev) => prev.filter((item) => item.id !== job.id));
      if (result?.archived) {
        toast.success(`“${job.title}” archived`, {
          description: result.message,
        });
      } else {
        toast.success(`“${job.title}” deleted`);
      }
    } catch (e) {
      const err = e as { message?: string };
      console.warn("Could not delete job on API:", e);
      toast.error(err?.message || "The job posting could not be deleted.");
    }
  };

  const totalVacancies = jobList.reduce((t, j) => t + j.vacancies, 0);
  const totalFilled = jobList.reduce((t, j) => t + j.filled, 0);

  const lines = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setDraft((d) => ({
      ...d,
      description: t.summary,
      responsibilities: t.responsibilities,
      qualifications: t.qualifications,
    }));
    toast.success(`${t.name} applied to the draft`);
  };

  /**
   * Checklist-driven AI fill for the 6 prose blocks (description,
   * responsibilities, qualifications, additional, instructions, about).
   * Skills come from the requirement template, never the AI. The backend
   * grounds prose in the screening vocabulary so matches stay meaningful;
   * when the post has no screening requirements yet, the modal seeds the AI
   * context from Reference Data and highlights the fallback. The requisition's
   * requested note (when the post is sourced from a staffing request) rides
   * along as extra context. Nothing is published — HR reviews the filled
   * draft in the builder first.
   */
  const generateDraftWithAI = () => {
    if (!draft.title.trim()) {
      toast.error("Select a job position first — the AI needs a role to write about.");
      return;
    }
    /* The Reference Data vocabulary backs the "no screening requirements"
       fallback shown in the modal — load it if the builder has not yet. */
    if (!entityMapping && !entityLoading && !entityError) loadEntityMapping();
    setAiReport([]);
    setAiModalOpen(true);
  };

  /** Reference Data skill terms (canonical values from the screening
   *  vocabulary) used to ground the AI when the post has no requirements. */
  const referenceSkillTerms = useMemo(
    () => Object.keys(entityMapping?.skills ?? {}).sort((a, b) => a.localeCompare(b)),
    [entityMapping],
  );

  /** Punctuation-insensitive line key so regenerated bullets dedupe cleanly. */
  const aiLineKey = aiLineKeyOf;

  const runGenerateDraft = async () => {
    const wanted = (Object.keys(aiChecked) as BlockId[]).filter((b) => aiChecked[b]);
    if (wanted.length === 0) {
      toast.error("Tick at least one block to generate.");
      return;
    }
    const notes: Record<string, string> = {};
    wanted.forEach((b) => {
      const v = (aiNotes[b] ?? "").trim();
      if (v) notes[b] = v;
    });
    const skillLines = lines(draft.skills);
    const requestedNote = (sourceReq?.justification ?? "").trim();
    const payload: JobDraftPayload = {
      position_title: draft.title.trim(),
      department: draft.department || undefined,
      employment_type: draft.employmentType || undefined,
      schedule: draft.schedule || undefined,
      vacancies: Number(draft.vacancies) || 1,
      /* Level chips: the scalar is the bar the applicant must clear, the list
         says the post accepts any of them. */
      experience_level: weakestAcceptedLevel(draft.experienceLevels, EXPERIENCE_LEVEL_OPTIONS) ?? undefined,
      education_level: weakestAcceptedLevel(draft.educationLevels, EDUCATION_LEVEL_OPTIONS) ?? undefined,
      experience_levels: draft.experienceLevels,
      education_levels: draft.educationLevels,
      blocks: wanted,
      notes,
    };
    if (skillLines.length > 0) {
      // The post's own requirements — the AI must reflect these verbatim.
      payload.skills = skillLines;
    } else if (referenceSkillTerms.length > 0) {
      // No requirements yet: fall back to Reference Data so the AI still has
      // screening terms to ground the prose on.
      payload.screening_terms = referenceSkillTerms.slice(0, 60);
    }
    if (requestedNote) payload.requested_note = requestedNote;
    setGeneratingDraft(true);
    try {
      const res = await jobPostsApi.generateDraft(payload);
      const generated = res.data;
      const matched = res.meta?.skills_matched ?? [];
      const report: {
        block: string;
        label: string;
        detail: string;
        reused: string[];
        reusedPrefix?: string;
      }[] = [];
      /* Computed OUTSIDE the setDraft updater on purpose: pushing into `report`
         from inside an updater is a side effect, and React StrictMode invokes
         updaters twice in development — which duplicated every report row
         ("two children with the same key: description"). */
      const mergeLines = (current: string, incoming: string[]) => {
        const have = new Set(
          current
            .split("\n")
            .map((l) => aiLineKey(l))
            .filter(Boolean),
        );
        const fresh = incoming
          .map((l) => l.trim())
          .filter(Boolean)
          .filter((l) => !have.has(aiLineKey(l)));
        return {
          text: [...current.split("\n").map((l) => l.trim()).filter(Boolean), ...fresh].join(
            "\n",
          ),
          added: fresh.length,
          total: incoming.filter(Boolean).length,
        };
      };
      const vocabHits = (lines: string[]): string[] => {
        if (!entityMapping) return [];
        const idx = buildBuilderEntityIndex(entityMapping.skills ?? {});
        const out: string[] = [];
        const seen = new Set<string>();
        lines.forEach((l) => {
          const c = canonicalizeBuilderEntity(l, idx);
          if (c && !seen.has(c)) {
            seen.add(c);
            out.push(c);
          }
        });
        return out;
      };
      const next: Draft = { ...draft };
      if (wanted.includes("description" as BlockId) && generated.description) {
        const replaced = next.description.trim() !== "";
        next.description = generated.description;
        report.push({
          block: "description",
          label: "Job Description",
          detail: replaced
            ? "replaced (your previous paragraph was overwritten)"
            : "written",
          reused: [],
        });
      }
      if (
        wanted.includes("responsibilities" as BlockId) &&
        generated.responsibilities?.length
      ) {
        const m = mergeLines(next.responsibilities, generated.responsibilities);
        next.responsibilities = m.text;
        report.push({
          block: "responsibilities",
          label: "Key Responsibilities",
          detail: m.added === 0 ? "nothing new — already matches" : `${m.added} line(s) written`,
          reused: vocabHits(generated.responsibilities),
        });
      }
      if (wanted.includes("qualifications" as BlockId) && generated.qualifications?.length) {
        const m = mergeLines(next.qualifications, generated.qualifications);
        next.qualifications = m.text;
        report.push({
          block: "qualifications",
          label: "Qualifications",
          detail: m.added === 0 ? "nothing new — already matches" : `${m.added} line(s) written`,
          reused: vocabHits(generated.qualifications),
        });
      }
      if (wanted.includes("additional" as BlockId) && (generated.additional ?? []).length) {
        const m = mergeLines(next.additional, generated.additional ?? []);
        next.additional = m.text;
        report.push({
          block: "additional",
          label: "Additional Info",
          detail: m.added === 0 ? "nothing new — already matches" : `${m.added} line(s) written`,
          reused: [],
        });
      }
      if (wanted.includes("instructions" as BlockId) && generated.instructions) {
        const replaced = next.instructions.trim() !== "";
        next.instructions = generated.instructions;
        report.push({
          block: "instructions",
          label: "Application Instruction",
          detail: replaced ? "replaced (your previous paragraph was overwritten)" : "written",
          reused: [],
        });
      }
      if (wanted.includes("about" as BlockId) && generated.about) {
        const replaced = next.about.trim() !== "";
        next.about = generated.about;
        report.push({
          block: "about",
          label: "About Company",
          detail: replaced ? "replaced (your previous paragraph was overwritten)" : "written",
          reused: [],
        });
      }
      /* All four screening axes are adopted from what the AI actually wrote,
         not from what it could have written: one prose scan answers every
         question below. Skills and certificates only ever ADD lines; the two
         level dropdowns only move when the copy names a level the post does not
         already require. Nothing is invented and nothing is dropped — the
         recruiter still reviews it in the builder. */
      const prose = [
        next.description,
        next.responsibilities,
        next.qualifications,
        next.additional,
        next.instructions,
        next.about,
      ]
        .join("\n")
        .toLowerCase();
      /** Does the generated copy name this vocabulary term (canonical or alias)?
       *  Short tokens are skipped: "Bar" would match half the prose. */
      const proseNames = (term: string, aliases: string[] = []) =>
        [term, ...aliases].some((form) => {
          const norm = normalizeEntityText(form);
          return norm.length >= 4 && prose.includes(norm);
        });

      /* 1. SKILLS — only when the post had none, so the AI wrote from the
            Reference Data fallback (payload.screening_terms) instead of the
            post's own terms. Those become the post's requirements now, capped
            so the recruiter reviews a short list. Leaving the block empty would
            publish a post whose screening scores zero on the skills axis. */
      const skillsMap = entityMapping?.skills ?? {};
      const knownSkills = new Set(referenceSkillTerms.map((t) => normalizeEntityText(t)));
      let addedSkills: string[] = [];
      if (skillLines.length === 0 && referenceSkillTerms.length > 0) {
        /* The backend reports which vocabulary terms it reused, but only scans
           three blocks — so also scan the whole prose (aliases included)
           against the grounding terms it was handed. */
        const fromProse = (payload.screening_terms ?? []).filter((term) =>
          proseNames(term, skillsMap[term] ?? []),
        );
        addedSkills = [
          ...new Set([...matched.filter((t) => knownSkills.has(normalizeEntityText(t))), ...fromProse]),
        ].slice(0, MAX_AI_SKILL_TERMS);
      }
      if (addedSkills.length > 0) {
        next.skills = addedSkills.join("\n");
        report.push({
          block: "skills",
          label: "Screening Requirements",
          detail: `was empty — filled with ${addedSkills.length} Reference Data term(s) the copy uses`,
          reused: addedSkills,
          reusedPrefix: "✓ adopted from Reference Data",
        });
      } else if (skillLines.length === 0 && referenceSkillTerms.length > 0) {
        report.push({
          block: "skills",
          label: "Screening Requirements",
          detail: "left empty — the copy used no vocabulary term. Add skills from Reference Data.",
          reused: [],
        });
      }

      /* 2. CERTIFICATIONS — the panel reads them out of Qualifications, so the
            canonical terms the copy names are written there. Needed because the
            model is grounded on the whole certification vocabulary and writes
            whatever it wants: a post asking for "a TESDA certification" but
            never naming one scores every applicant zero on that axis. */
      const certMap = entityMapping?.certifications ?? {};
      const certIndex = buildBuilderEntityIndex(certMap);
      const existingCerts = new Set(
        [...lines(next.qualifications), ...lines(next.skills)]
          .map((l) => canonicalizeBuilderEntity(l, certIndex))
          .filter((c): c is string => Boolean(c)),
      );
      const addedCerts = Object.keys(certMap)
        .filter((term) => !existingCerts.has(term) && proseNames(term, certMap[term] ?? []))
        .slice(0, MAX_AI_CERT_TERMS);
      if (addedCerts.length > 0) {
        next.qualifications = mergeIntoBlock(next.qualifications, addedCerts);
        report.push({
          block: "certifications",
          label: "Certifications",
          detail: `${addedCerts.length} certificate(s) named by the copy, added to Qualifications so the screener can verify them`,
          reused: addedCerts,
          reusedPrefix: "✓ adopted from Reference Data",
        });
      }

      /* 3. EDUCATION + 4. EXPERIENCE — structured fields the NLP scores
            against, not prose, so they only move when the copy names a canonical
            level. The model is told the post's current levels, so a mismatch
            means the copy genuinely reads differently — surfaced in the report
            rather than applied silently. */
      /* Level chips — filled ONLY when the post has none, exactly like skills.
         Adding a level to a post that already has one would LOOSEN screening
         ("any of these" is gated by the weakest accepted level), so an AI must
         never quietly lower the bar. When levels are already set, a level the
         copy names but the post does not accept is reported as a suggestion. */
      const levelChanges: string[] = [];
      const levelSuggestions: string[] = [];
      /* Strongest canonical level the copy names — a post that asks for nothing
         gets the strictest thing the copy mentioned, so the bar is not softer
         than the copy implies. */
      const strongestNamedLevel = <T extends string>(
        group: "education" | "experience",
        order: readonly T[],
      ): T | null => {
        const map = entityMapping?.[group] ?? {};
        const rank = (level: string) =>
          order.findIndex((l) => normalizeEntityText(l) === normalizeEntityText(level));
        const named = order.filter((level) => proseNames(level, map[level] ?? []));
        if (named.length === 0) return null;
        // Strongest = the one the post already ranks highest, so a copy that
        // mentions both "college" and "bachelor's" lands on bachelor's.
        return named.reduce((a, b) => (rank(b) > rank(a) ? b : a));
      };
      const aiEducation = strongestNamedLevel("education", EDUCATION_LEVEL_OPTIONS);
      const aiExperience = strongestNamedLevel("experience", EXPERIENCE_LEVEL_OPTIONS);
      const hasEducation = draft.educationLevels.length > 0;
      const hasExperience = draft.experienceLevels.length > 0;
      if (aiEducation && !hasEducation) {
        next.educationLevels = [aiEducation];
        levelChanges.push(`education → ${aiEducation}`);
      } else if (aiEducation && hasEducation && !draft.educationLevels.some((l) => normalizeEntityText(l) === normalizeEntityText(aiEducation))) {
        levelSuggestions.push(`education ${aiEducation}`);
      }
      if (aiExperience && !hasExperience) {
        next.experienceLevels = [aiExperience];
        levelChanges.push(`experience → ${aiExperience}`);
      } else if (aiExperience && hasExperience && !draft.experienceLevels.some((l) => normalizeEntityText(l) === normalizeEntityText(aiExperience))) {
        levelSuggestions.push(`experience ${aiExperience}`);
      }
      if (levelChanges.length > 0) {
        report.push({
          block: "levels",
          label: "Education / Experience",
          detail: `was empty — filled with ${levelChanges.join(" · ")} from the copy`,
          reused: [],
        });
      }
      if (levelSuggestions.length > 0) {
        report.push({
          block: "levels",
          label: "Education / Experience",
          detail: `the copy also asks for ${levelSuggestions.join(" · ")} — adding a chip lowers the bar, so it is left to you`,
          reused: [],
        });
      }

      setDraft(next);
      // Make sure generated blocks sit on the canvas and are visible.
      setBlocks((b) => {
        const ids: BlockId[] = [...wanted];
        if (addedSkills.length > 0) ids.push("skills");
        if (addedCerts.length > 0) ids.push("qualifications");
        return [...b, ...ids.filter((id) => !b.includes(id))];
      });
      setActiveBlock(wanted[0] ?? "description");
      setAiReport(report);
      if (res.meta?.usage) setAiUsage(res.meta.usage);
      const via = res.meta?.generated_via;
      const viaNote = via ? ` via ${via.service}${via.free ? " (free model)" : ""}` : "";
      const usageNote = res.meta?.usage ? ` · ${res.meta.usage.used_today} AI draft(s) today` : "";
      /* One line for the screening axes that moved, so the toast tells the
         truth about the whole draft and not just the prose blocks. */
      const adopted: string[] = [];
      if (addedSkills.length) adopted.push(`${addedSkills.length} skill(s)`);
      if (addedCerts.length) adopted.push(`${addedCerts.length} certificate(s)`);
      if (levelChanges.length) adopted.push(levelChanges.join(", "));
      toast.success(`AI draft ready for “${draft.title}” — ${report.length} block(s) written${viaNote}`, {
        description: adopted.length
          ? `Screening requirements adopted from Reference Data: ${adopted.join(" · ")}.${usageNote}`
          : matched.length > 0
            ? `Reused ${matched.length} vocabulary term(s): ${matched.slice(0, 4).join(", ")}${matched.length > 4 ? "…" : ""}.${usageNote}`
            : `Review each block, then Save draft or Publish.${usageNote}`,
      });
    } catch (e) {
      const err = e as Error & { status?: number; payload?: JobDraftErrorPayload };
      const payload = err.payload;
      if (payload?.usage) setAiUsage(payload.usage);

      // Usage-limit failures drive the indicator state: say what ran out, when
      // it resets, and offer the Content Templates as the offline path.
      if (payload?.code && AI_LIMIT_CODES.has(payload.code)) {
        const seconds =
          payload.retry_after_seconds ??
          (payload.resets_at
            ? Math.max(0, Math.ceil((new Date(payload.resets_at).getTime() - Date.now()) / 1000))
            : null);
        toast.error(aiFailureLabel(payload.code), {
          duration: 12000,
          description: `${payload.message ?? "The AI usage is used up."}${
            seconds ? ` Resets in ${aiCountdown(seconds)}.` : ""
          }`,
          action: {
            label: "Use a template",
            onClick: () =>
              templatesCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
          },
        });
        void loadAiUsage();
        return;
      }

      toast.error(
        err.message && !err.message.startsWith("Request failed")
          ? err.message
          : "AI draft failed — check the API key, then retry or use a template.",
      );
      void loadAiUsage();
    } finally {
      setGeneratingDraft(false);
    }
  };

  const publish = async () => {
    /* The careers website is the only destination left, so this is no longer a
       channel choice: publishing always goes live on the website. Draft vs live
       is the button the recruiter pressed (Save draft vs Publish). */
    const chosen = [...KEPT_PLATFORMS];
    // Both footer buttons ("Publish job post" for new posts, "Update template"
    // when editing) run this same function, so every guard below applies to
    // creating AND updating. Toasts name the active mode so that's visible.
    const verb = editingJobId ? "updating the template" : "publishing";
    if (!draft.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    const rawVac = Number(draft.vacancies);
    if (isNaN(rawVac) || rawVac < 1) {
      toast.error("Vacancies must be a valid positive number (at least 1).");
      return;
    }
    const vac = rawVac;
    const sMin = Number(draft.salaryMin) || 0;
    const sMax = Number(draft.salaryMax) || 0;
    if (sMin < 0 || sMax < 0) {
      toast.error("Salary amounts cannot be negative.");
      return;
    }
    // Unrealistic salaries (e.g. 0–10) are rejected — blank stays allowed and
    // publishes as "Salary to be discussed". Raise MIN_REALISTIC_SALARY to
    // tighten (e.g. 1000) without touching the logic below.
    const MIN_REALISTIC_SALARY = 10;
    const minEntered = draft.salaryMin.trim() !== "";
    const maxEntered = draft.salaryMax.trim() !== "";
    if (
      (minEntered && sMin <= MIN_REALISTIC_SALARY) ||
      (maxEntered && sMax <= MIN_REALISTIC_SALARY)
    ) {
      toast.error(`Salary must be over ₱${MIN_REALISTIC_SALARY} — or leave both blank.`);
      return;
    }
    if (sMin > sMax && sMax > 0) {
      toast.error("Minimum salary cannot be greater than maximum salary.");
      return;
    }
    // Publishing requires a complete post — every required content block must hold
    // real text (drafts may stay partial via "Save draft"). Additional Info is
    // optional and never blocks publishing / updating. Missing blocks
    // are added to the canvas and focused so HR can fill them immediately.
    const missingIds = REQUIRED_PUBLISH_BLOCKS.filter((id) => lines(blockText(draft, id)).length === 0);
    const missingLabels = missingIds.map(
      (id) => blockLibrary.find((b) => b.id === id)?.label ?? id,
    );
    if (!String(draft.department ?? "").trim()) missingLabels.unshift("Department");
    if (missingLabels.length > 0) {
      setBlocks((b) => [...b, ...missingIds.filter((id) => !b.includes(id))]);
      const firstMissing = missingIds[0];
      if (firstMissing) setActiveBlock(firstMissing);
      toast.error(`Complete these before ${verb}: ${missingLabels.join(", ")}`, {
        description: "Use Generate with AI or fill each block manually.",
      });
      return;
    }
    /* Screening requirements must be matchable: at least one recognised skill.
       When the vocabulary hasn't loaded yet, fall back to requiring any skill
       line so publishing is never blocked by a slow network. */
    const skillLines = lines(draft.skills);
    if (skillLines.length === 0) {
      setBlocks((b) => (b.includes("skills") ? b : [...b, "skills"]));
      setActiveBlock("skills");
      toast.error(`Add at least one skill in Screening Requirements before ${verb}.`, {
        description: "Skills come from the position's requirement template or the vocabulary picker.",
      });
      return;
    }
    if (entityMapping) {
      const idx = buildBuilderEntityIndex(entityMapping.skills ?? {});
      const res = analyzeBuilderEntityLines(skillLines, idx);
      if (res.recognized.length === 0) {
        setBlocks((b) => (b.includes("skills") ? b : [...b, "skills"]));
        setActiveBlock("skills");
        toast.error(`Add at least one skill the screener recognises before ${verb}.`, {
          description:
            "Unrecognised terms score 0 — pick from the vocabulary or add the term with +.",
        });
        return;
      }
    }
    const editingFilled = editingJobId ? (jobList.find((j) => j.id === editingJobId)?.filled ?? 0) : 0;
    const editingDbId = editingJobId ? jobList.find((j) => j.id === editingJobId)?.dbId : undefined;
    const jobPayload: Job = {
      id:
        editingJobId ??
        `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()
          .toString()
          .slice(-4)}`,
      /* Keep the database id across optimistic updates — losing it makes the
         next save of the same card take the create branch and the backend
         rejects it as DUPLICATE_JOB_POST. */
      ...(editingDbId !== undefined ? { dbId: editingDbId } : {}),
      title: draft.title,
      department: draft.department,
      employmentType: draft.employmentType as Job["employmentType"],
      schedule: draft.schedule,
      salaryMin: Number(draft.salaryMin) || 0,
      salaryMax: Number(draft.salaryMax) || 0,
      vacancies: Number(draft.vacancies) || 1,
      filled: editingFilled,
      posted: editingJobId
        ? (jobList.find((j) => j.id === editingJobId)?.posted ??
          new Date().toISOString().slice(0, 10))
        : new Date().toISOString().slice(0, 10),
      status: "Open",
      active: true,
      /* Chips -> weakest accepted level for the scalar columns, plus the full
         accepted list so "any of these" survives the round trip. */
      experience: (weakestAcceptedLevel(draft.experienceLevels, EXPERIENCE_LEVEL_OPTIONS) ??
        "No Experience") as Job["experience"],
      education: (weakestAcceptedLevel(draft.educationLevels, EDUCATION_LEVEL_OPTIONS) ??
        "High School Graduate") as Job["education"],
      experienceLevels: draft.experienceLevels,
      educationLevels: draft.educationLevels,
      summary: draft.description,
      description: draft.description,
      responsibilities: lines(draft.responsibilities),
      qualifications: lines(draft.qualifications),
      skills: lines(draft.skills),
      additional: lines(draft.additional),
      instructions: draft.instructions,
      about: draft.about,
      applicants: editingJobId ? (jobList.find((j) => j.id === editingJobId)?.applicants ?? 0) : 0,
      benefits: [],
      platforms: chosen,
      /* Canvas arrangement, so the recruiter's drag order survives the save. */
      blocks,
    };
    const posterUrl = customPosterUrl ?? jobList.find((j) => j.id === editingJobId)?.picture;
    if (posterUrl) jobPayload.picture = posterUrl;

    setJobList((prev) =>
      editingJobId
        ? prev.map((j) => (j.id === editingJobId ? jobPayload : j))
        : [jobPayload, ...prev],
    );
    /* The requisition is converted only after the job post is actually
       persisted (see markConverted below). Converting it optimistically here
       stranded it as "Converted" with no linked job post whenever the save
       failed, hiding it from the pending requisitions list. */
    setTab("postings");
    setEditingJobId(null);
    setSourceReqId(null);
    setBuilderStarted(false);
    setSavedSnapshot(snapshotOf(blankDraft, []));

    // Persist to backend database API — resolve the position & department
    // from the database (Core HCM) and auto-create them when the role is new,
    // so every posting carries a valid position_id / department_id.
    // NOTE: department creation requires a unique `code` and position creation
    // requires a `salary_grade_id` — both are supplied here so a brand-new
    // title/department from the builder never fails validation server-side.
    const deptCodeFor = (name: string) => {
      const initials = name
        .split(/[\s&/\\-]+/)
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      return (initials || "DEPT").slice(0, 20);
    };
    let positionId =
      draft.positionDbId ??
      positionsForDepartment(draft.department).find((p) => p.title === draft.title)?.dbId;
    let departmentId = knownDepartments.find((d) => d.name === draft.department)?.dbId;

    // Hoisted so the DUPLICATE_JOB_POST self-heal in catch can resend it.
    let payload: Record<string, any> | FormData = {};
    try {
      if (!departmentId) {
        let code = deptCodeFor(draft.department);
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const created = await coreHcmApi.createDepartment({
              name: draft.department,
              code,
            });
            departmentId = created.department_id;
            break;
          } catch (deptErr) {
            const codeTaken = (deptErr as { errors?: Record<string, string[]> })?.errors?.["code"];
            if (codeTaken && attempt < 2) {
              code = `${deptCodeFor(draft.department)}${attempt + 2}`.slice(0, 20);
              continue;
            }
            throw deptErr;
          }
        }
      }
      if (!positionId) {
        // Positions require a salary grade — prefer the Job Info grade picker,
        // then the grade whose range fits the draft salary, falling back to
        // the lowest grade. HR can adjust it later in Core HCM → Departments
        // & Positions.
        const gradesRes = await coreHcmApi.salaryGrades.list({ per_page: 100 });
        const grades = gradesRes?.data ?? [];
        const explicit = draft.salaryGradeId
          ? grades.find((g) => String(g.salary_grade_id) === draft.salaryGradeId)
          : undefined;
        const draftMin = Number(draft.salaryMin) || 0;
        const byMin = [...grades].sort((a, b) => Number(a.min_salary) - Number(b.min_salary));
        const inRange = byMin.find((g) => {
          const lo = Number(g.min_salary) || 0;
          const hi =
            g.max_salary === null || g.max_salary === undefined ? Infinity : Number(g.max_salary);
          return draftMin >= lo && draftMin <= hi;
        });
        const gradePick = explicit ?? inRange ?? byMin[0];
        if (!gradePick) {
          throw new Error("No salary grade exists — create one in Core HCM → Salary Grades first.");
        }
        const created = await coreHcmApi.createPosition({
          title: draft.title,
          department_id: departmentId,
          salary_grade_id: gradePick.salary_grade_id,
          level: "Rank & File",
          headcount: Number(draft.vacancies) || 1,
        });
        positionId = created.position_id;
      }

      const basePayload = {
        position_id: positionId,
        department_id: departmentId,
        title: jobPayload.title,
        employment_type: jobPayload.employmentType,
        schedule: jobPayload.schedule,
        salary_min: jobPayload.salaryMin,
        salary_max: jobPayload.salaryMax,
        vacancies: jobPayload.vacancies,
        status: jobPayload.status,
        active: jobPayload.active,
        /* Structured screening levels — the NLP match scoring reads the scalar
           (weakest accepted); the list keeps every level the chips accept. */
        experience_level: jobPayload.experience,
        education_level: jobPayload.education,
        experience_levels: jobPayload.experienceLevels ?? [],
        education_levels: jobPayload.educationLevels ?? [],
        summary: jobPayload.summary,
        description: jobPayload.description,
        responsibilities: jobPayload.responsibilities,
        qualifications: jobPayload.qualifications,
        skills: jobPayload.skills,
        additional: jobPayload.additional,
        instructions: jobPayload.instructions,
        about: jobPayload.about,
        platforms: chosen,
        /* Builder canvas arrangement, so the recruiter's drag order survives.
           Test requirements are owned by Core HCM (positions table) — never
           sent from Recruitment; the linked position's flags decide the
           applicant pipeline. */
        blocks: jobPayload.blocks ?? [],
      };
      // Uploaded poster picture rides along as multipart/form-data
      payload = basePayload;
      if (posterFile) {
        const fd = new FormData();
        Object.entries(basePayload).forEach(([k, v]) => {
          if (k === "active") {
            // Laravel's boolean rule rejects the string "true"/"false"
            fd.append(k, String(v ? 1 : 0));
          } else if (Array.isArray(v)) {
            // PHP only builds an array from repeated multipart keys when the
            // name ends with "[]" (e.g. responsibilities[]=a&responsibilities[]=b)
            v.forEach((item) => fd.append(`${k}[]`, String(item)));
          } else {
            fd.append(k, String(v));
          }
        });
        fd.append("picture", posterFile);
        payload = fd;
      }

      let createdJobId: number | undefined;
      const existing = editingJobId ? jobList.find((j) => j.id === editingJobId) : undefined;
      // One posting per position + department — refuse a new post that
      // duplicates another posting's pair (updates to the same post are fine).
      const clash = jobList.find(
        (j) =>
          j.id !== jobPayload.id &&
          j.title === jobPayload.title &&
          j.department === jobPayload.department,
      );
      if (!(editingJobId && existing?.dbId) && clash) {
        toast.error(
          `A job post already exists for ${jobPayload.title} in ${jobPayload.department} (${clash.status}) — edit the existing post instead of creating a duplicate.`,
        );
        return;
      }
      if (editingJobId && existing?.dbId) {
        await jobPostsApi.update(existing.dbId, payload);
      } else {
        // No saved record yet (e.g. a locally-kept draft) — create a real row
        const created = await jobPostsApi.create(payload);
        createdJobId = created.job_post_id;
        setJobList((prev) =>
          prev.map((j) => (j.id === jobPayload.id ? { ...j, dbId: created.job_post_id } : j)),
        );
      }
      if (sourceReqId) {
        const srcReq = requisitions.find((r) => r.id === sourceReqId);
        const jobDbId = createdJobId ?? jobList.find((j) => j.id === jobPayload.id)?.dbId;
        if (jobDbId) {
          await requisitionStore.markConverted(srcReq?.id ?? sourceReqId, jobDbId);
        }
      }
      toast.success(
        editingJobId
          ? `“${jobPayload.title}” template updated`
          : `“${jobPayload.title}” published to ${chosen.join(", ")}`,
      );
    } catch (e) {
      console.warn("Could not persist job post to database API:", e);
      const err = e as {
        status?: number;
        code?: string;
        message?: string;
        payload?: { existing_job_post_id?: number };
      };
      const dupId = err?.payload?.existing_job_post_id;
      // Self-heal a mistaken create: we were editing (Edit Template) but the
      // local entry had no dbId, so the save took the create branch. The
      // backend names the conflicting post — update it instead of failing.
      if ((err?.code === "DUPLICATE_JOB_POST" || err?.status === 409) && editingJobId && dupId) {
        try {
          await jobPostsApi.update(dupId, payload);
          setJobList((prev) =>
            prev.map((j) => (j.id === jobPayload.id ? { ...j, dbId: dupId } : j)),
          );
          toast.success(`“${jobPayload.title}” template updated`);
        } catch (retryErr) {
          console.warn("Retry-as-update for duplicate job post failed:", retryErr);
          toast.error(
            err?.message ||
              `A job post already exists for “${jobPayload.title}” — edit the existing post instead of creating a duplicate.`,
          );
        }
        return;
      }
      if (err?.code === "DUPLICATE_JOB_POST" || err?.status === 409) {
        toast.error(
          err?.message ||
            `A job post already exists for “${jobPayload.title}” — edit the existing post instead of creating a duplicate.`,
        );
      } else if (err?.message) {
        toast.error(`The job posting could not be saved to the database: ${err.message}`);
      } else {
        toast.error("The job posting could not be saved to the database.");
      }
    }
  };

  /** Seed salary grade/band + salary range from a Core HCM position. */
  const seedFromPosition = (
    department: string,
    title: string,
    base: Draft,
    positionDbId?: number | null,
  ): Draft => {
    const departmentId = knownDepartments.find((d) => d.name === department)?.dbId;
    /* Resolve by id when the picker supplied one — Front Office has two
       "Front Desk Receptionist" rows on different salary bands, and a
       name-only match would seed the wrong one. */
    const position =
      (positionDbId !== undefined && positionDbId !== null
        ? knownPositions.find((p) => p.dbId === positionDbId)
        : null) ??
      knownPositions.find(
        (p) =>
          (((departmentId !== undefined && p.departmentId === departmentId) ||
            (p.departmentId === undefined && p.department === department)) &&
            p.title === title),
      );
    if (!position) return base;
    const grade = position.salaryGradeId
      ? salaryGrades.find((g) => g.salary_grade_id === position.salaryGradeId)
      : null;
    return {
      ...base,
      positionDbId: position.dbId ?? base.positionDbId,
      salaryGradeId: position.salaryGradeId ? String(position.salaryGradeId) : base.salaryGradeId,
      salaryMin:
        base.salaryMin ||
        (grade?.min_salary ?? position.salaryGradeMin ?? null)?.toString() ||
        base.salaryMin,
      salaryMax:
        base.salaryMax ||
        (grade?.max_salary ?? position.salaryGradeMax ?? null)?.toString() ||
        base.salaryMax,
    };
  };

  const startNewPost = (department: string, position?: string, positionDbId?: number | null) => {
    const seeded: Draft = seedFromPosition(
      department,
      position ?? "",
      { ...blankDraft, department, title: position ?? "", positionDbId: positionDbId ?? null },
      positionDbId,
    );
    setDraft(seeded);
    /* A new post opens with the full canvas rather than a lone Job Title block:
       the whole structure is then visible and HR writes into sections instead of
       hunting for which components to add. Blocks they never touch are simply
       empty, and the publish gate says which ones matter. */
    const order = position ? fullBlocks : [];
    setBlocks(order);
    setBuilderStarted(true);
    setActiveBlock("skills");
    setEditingJobId(null);
    setSourceReqId(null);
    setLinkedReqId(null);
    /* Brand-new post: follow Core HCM for salary band and open slots. */
    setSalaryLocked(false);
    setVacanciesLocked(false);
    setMode("custom");
    setNewOpen(false);
    setDeptDialogOpen(false);
    setSavedSnapshot(snapshotOf(seeded, order));
    setTab("builder");
    setPendingTab(null);
  };

  const editTemplate = (job: Job) => {
    const seeded = jobToDraft(job);
    /* Restore the recruiter's own block arrangement, not the default order. */
    const order = blocksForJob(job.blocks);
    setDraft(seeded);
    setBlocks(order);
    setEditingJobId(job.id);
    setSourceReqId(null);
    setLinkedReqId(null);
    setMode("template");
    setBuilderStarted(true);
    /* The saved figures win while editing — don't let the Core HCM auto-fill
       overwrite what is already published. A grade change re-arms it. */
    setSalaryLocked(true);
    setVacanciesLocked(true);
    setSavedSnapshot(snapshotOf(seeded, order));
    setTab("builder");
    toast.message(`Editing template for “${job.title}”`);
  };

  const copyAndUseTemplate = (job: Job) => {
    const seeded = jobToDraft(job);
    const order = blocksForJob(job.blocks);
    setDraft(seeded);
    setBlocks(order);
    /* A copy becomes a brand-new posting, so it starts unpublished. */
    setEditingJobId(null);
    setSourceReqId(null);
    setLinkedReqId(null);
    setMode("template");
    setBuilderStarted(true);
    /* A copy starts from Core HCM truth: salary band + open slots re-apply. */
    setSalaryLocked(false);
    setVacanciesLocked(false);
    setSavedSnapshot(snapshotOf(seeded, order));
    setTab("builder");
    toast.message(`Copied “${job.title}” — publish as a new posting`);
  };

  const convertRequisition = (reqId: string) => {
    const req = requisitions.find((r) => r.id === reqId);
    if (!req) return;
    const seeded: Draft = seedFromPosition(
      req.department,
      req.position,
      {
        ...blankDraft,
        title: req.position,
        department: req.department,
        vacancies: String(req.count),
        description: `We are looking for ${req.count} ${req.position}(s) to join our ${req.department} team.`,
      },
    );
    setDraft(seeded);
    setBlocks(fullBlocks);
    setEditingJobId(null);
    setSourceReqId(reqId);
    setLinkedReqId(null);
    setMode("template");
    setBuilderStarted(true);
    setSavedSnapshot(snapshotOf(seeded, fullBlocks));
    setTab("builder");
  };

  const addBlock = (id: BlockId) => {
    setBlocks((b) => (b.includes(id) ? b : [...b, id]));
    setActiveBlock(id);
  };
  const removeBlock = (id: BlockId) => setBlocks((b) => b.filter((x) => x !== id));

  /** True when removing this block would discard text the user entered. */
  const blockHasContent = (id: BlockId): boolean => {
    if (id === "picture") return posterFile !== null || customPosterUrl !== null;
    if (id === "title") return false;
    return hasContentFor(id, draft);
  };

  /** Clears the draft data behind a block being removed. */
  const clearBlockContent = (id: BlockId) => {
    if ((AI_CONTENT_BLOCKS as BlockId[]).includes(id)) {
      setDraft((d) => ({
        ...d,
        description: id === "description" ? "" : d.description,
        responsibilities: id === "responsibilities" ? "" : d.responsibilities,
        qualifications: id === "qualifications" ? "" : d.qualifications,
        skills: id === "skills" ? "" : d.skills,
        additional: id === "additional" ? "" : d.additional,
        instructions: id === "instructions" ? "" : d.instructions,
        about: id === "about" ? "" : d.about,
      }));
      return;
    }
    if (id === "info")
      setDraft((d) => ({ ...d, salaryGradeId: "", salaryMin: "", salaryMax: "" }));
    if (id === "picture") handlePosterRemove();
  };

  /** Trash-icon handler: a filled block asks first so text is never lost by accident. */
  const requestRemoveBlock = (id: BlockId) => {
    if (skipRemoveConfirm) {
      // "Do this for all" was checked earlier this session — same outcome as
      // confirming: remove the block and clear its text, no dialog.
      clearBlockContent(id);
      removeBlock(id);
      return;
    }
    if (blockHasContent(id)) {
      setRemoveForAll(false);
      setPendingRemoveBlock(id);
      return;
    }
    removeBlock(id);
  };

  const confirmRemoveBlock = () => {
    if (removeForAll) setSkipRemoveConfirm(true);
    if (pendingRemoveBlock) {
      clearBlockContent(pendingRemoveBlock);
      removeBlock(pendingRemoveBlock);
    }
    setPendingRemoveBlock(null);
  };

  /**
   * Focuses a block's first editor control (textarea or combobox trigger).
   * Runs only when a DIFFERENT block becomes active — never steals focus
   * from controls the user clicked directly inside the current block.
   */
  const focusBlockEditor = (id: BlockId) => {
    requestAnimationFrame(() => {
      const scope = composerRef.current;
      if (!scope) return;
      const blockEl = scope.querySelector<HTMLElement>(`[data-block-id="${id}"]`);
      if (!blockEl) return;
      const target =
        blockEl.querySelector<HTMLElement>("textarea") ??
        blockEl.querySelector<HTMLElement>('button[role="combobox"]') ??
        blockEl.querySelector<HTMLElement>("input");
      if (!target) return;
      target.focus();
      blockEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  /** Auto-select the first control once, whenever the active block changes. */
  useEffect(() => {
    if (!activeBlock) return;
    focusBlockEditor(activeBlock);
  }, [activeBlock]);

  /**
   * Clicking a component selects it and focuses its first combobox / textarea.
   * Clicks on interactive elements inside an already-open block (textareas,
   * inputs, comboboxes…) are left alone so users can move between fields and
   * place their cursor anywhere without the selection snapping back.
   */
  const selectBlock = (id: BlockId, e: ReactMouseEvent<HTMLDivElement>) => {
    if (activeBlock === id) return;
    const target = e.target as HTMLElement;
    if (target.closest("textarea, input, button[role='combobox'], button, label")) return;
    setActiveBlock(id);
  };

  const dropOn = (target: BlockId) => {
    if (!dragging || dragging === target) return;
    setBlocks((b) => {
      const next = b.includes(dragging) ? b.filter((x) => x !== dragging) : [...b];
      const i = next.indexOf(target);
      next.splice(i, 0, dragging);
      return next;
    });
    setDragging(null);
  };

  const has = (id: BlockId) => blocks.includes(id);

  const openCount = useMemo(() => jobList.filter((j) => j.active).length, [jobList]);

  const filteredJobs = useMemo(() => {
    const now = new Date();
    const cutoffFor = (f: string) => {
      if (f === "7") return new Date(now.getTime() - 7 * 86400000);
      if (f === "30") return new Date(now.getTime() - 30 * 86400000);
      if (f === "90") return new Date(now.getTime() - 90 * 86400000);
      if (f === "year") return new Date(now.getFullYear(), 0, 1);
      return null;
    };
    const cutoff = cutoffFor(dateFilter);
    return jobList.filter((j) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || j.status === statusFilter;
      const matchesDept = deptFilter === "all" || j.department === deptFilter;
      const matchesDate = !cutoff || new Date(`${j.posted}T00:00:00`) >= cutoff;
      return matchesSearch && matchesStatus && matchesDept && matchesDate;
    });
  }, [jobList, search, statusFilter, deptFilter, dateFilter]);

  const listSort = useSort(filteredJobs, {
    title: (j: Job) => j.title,
    department: (j: Job) => j.department,
    status: (j: Job) => j.status,
    salary: (j: Job) => j.salaryMin,
    filled: (j: Job) => j.filled,
    posted: (j: Job) => j.posted,
  });

  const PAGE_SIZE = DEFAULT_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(listSort.sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedJobs = listSort.sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, deptFilter, dateFilter]);

  /* Position / Status / Salary / Filled / Posted / Actions — the "Published to"
     column went away with the channel badges (Website is the only channel). */
  const listGridCols =
    "md:grid-cols-[minmax(220px,2fr)_90px_150px_180px_130px_minmax(240px,auto)]";

  // Metric cards jump to the postings list with the matching filter applied.
  const focusPostings = (status: "all" | "Open" | "Closed", sortBy?: "filled" | "applicants") => {
    setTab("postings");
    setStatusFilter(status);
    setSearch("");
    setDeptFilter("all");
    setDateFilter("all");
    setPage(1);
    if (sortBy === "filled") {
      setViewMode("list");
    }
    requestAnimationFrame(() => {
      document.getElementById("recruitment-postings")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };
  // Metric cards jump to the requisitions list with the matching filter applied.
  const focusRequisitions = (opts: { status?: string; urgency?: string } = {}) => {
    setTab("requisitions");
    setReqStatus(opts.status ?? "all");
    setReqUrgency(opts.urgency ?? "all");
    setReqSearch("");
    setReqDept("all");
    setReqPage(1);
  };
  // Requisitions use the same aligned-column treatment as the postings list view.
  const reqGridCols =
    "md:grid-cols-[minmax(130px,1.1fr)_106px_62px_88px_80px_86px_112px_96px_104px]";

  function ListSortHead({
    sortKey,
    children,
    align = "left",
  }: {
    sortKey: "title" | "department" | "status" | "salary" | "filled" | "posted";
    children: ReactNode;
    align?: "left" | "right" | "center";
  }) {
    const active = listSort.sort?.key === sortKey;
    const Icon = !active ? ChevronsUpDown : listSort.sort?.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => listSort.toggle(sortKey)}
        className={cn(
          "flex items-center gap-1.5 text-left text-[0.65rem] font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end text-right",
          align === "center" && "justify-center text-center",
        )}
      >
        <span>{children}</span>
        <Icon className={cn("h-3 w-3 shrink-0", active ? "opacity-100" : "opacity-40")} />
      </button>
    );
  }

  type RequisitionSortKey =
    "id" | "position" | "department" | "count" | "requestedAt" | "urgency" | "status";

  function RequisitionSortHead({
    sortKey,
    children,
    align = "left",
    sort,
    onSort,
  }: {
    sortKey: RequisitionSortKey;
    children: ReactNode;
    align?: "left" | "right" | "center";
    sort: ReturnType<typeof useSort<Requisition, RequisitionSortKey>>["sort"];
    onSort: (key: RequisitionSortKey) => void;
  }) {
    const active = sort?.key === sortKey;
    const Icon = !active ? ChevronsUpDown : sort?.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1.5 text-left text-[0.65rem] font-semibold uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end text-right",
          align === "center" && "justify-center text-center",
        )}
      >
        <span>{children}</span>
        <Icon className={cn("h-3 w-3 shrink-0", active ? "opacity-100" : "opacity-40")} />
      </button>
    );
  }

  const pendingRequisitions = requisitions.filter((r) => r.status !== "Converted");
  const highUrgencyCount = requisitions.filter(
    (r) => r.urgency === "High" && r.status !== "Converted",
  ).length;

  /** A requisition counts as new when raised within a week of the latest request. */
  const latestReqTime = Math.max(
    ...requisitions.map((r) => new Date(r.requestedAt).getTime()).filter((t) => !Number.isNaN(t)),
    0,
  );
  const isNewRequisition = (requestedAt: string) =>
    latestReqTime - new Date(requestedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;

  const reqUrgencies = Array.from(new Set(requisitions.map((r) => r.urgency)));
  const filteredRequisitions = pendingRequisitions.filter((r) => {
    const q = reqSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${r.id} ${r.position} ${r.department} ${r.urgency} ${r.justification}`
        .toLowerCase()
        .includes(q);
    return (
      matchesSearch &&
      (reqStatus === "all" || r.status === reqStatus) &&
      (reqDept === "all" || r.department === reqDept) &&
      (reqUrgency === "all" || r.urgency === reqUrgency)
    );
  });
  const reqSort = useSort(filteredRequisitions, {
    id: (r: Requisition) => r.id,
    position: (r: Requisition) => r.position,
    department: (r: Requisition) => r.department,
    count: (r: Requisition) => r.count,
    requestedAt: (r: Requisition) => r.requestedAt,
    urgency: (r: Requisition) => r.urgency,
    status: (r: Requisition) => r.status,
  });
  const REQ_PER_PAGE = DEFAULT_PAGE_SIZE;
  const reqPageCount = Math.max(1, Math.ceil(reqSort.sorted.length / REQ_PER_PAGE));
  const reqPageSafe = Math.min(reqPage, reqPageCount);
  const visibleRequisitions = reqSort.sorted.slice(
    (reqPageSafe - 1) * REQ_PER_PAGE,
    reqPageSafe * REQ_PER_PAGE,
  );

  const handleTabChange = (value: string) => {
    if (tab === "builder" && value !== "builder" && isDirty) {
      setPendingTab(value);
      setConfirmLeaveOpen(true);
      return;
    }
    if (value === "builder" && !editingJobId && !sourceReqId && !isDirty) {
      // Always land on the dashed "Create a job posting" card first.
      setBuilderStarted(false);
      setDeptDialogOpen(false);
      setNewOpen(false);
    }
    setTab(value);
  };

  const confirmLeaveSave = () => {
    saveDraftAction();
    setConfirmLeaveOpen(false);
    if (pendingTab) setTab(pendingTab);
    setPendingTab(null);
  };

  const confirmLeaveDiscard = () => {
    setSavedSnapshot(snapshotOf(draft, blocks));
    setConfirmLeaveOpen(false);
    if (pendingTab) setTab(pendingTab);
    setPendingTab(null);
  };

  const effectiveReqId = sourceReqId ?? linkedReqId;
  const sourceReq = requisitions.find((r) => r.id === effectiveReqId) ?? null;

  useEffect(() => {
    if (!linkedReqId || sourceReqId) return;
    const request = requisitions.find((r) => r.id === linkedReqId);
    if (!request) return;
    setDraft((current) => ({
      ...current,
      title: request.position,
      department: request.department,
      vacancies: String(request.count),
    }));
    /* Linking a request after the fact is a new source of truth — re-arm both
       auto-fills so vacancies and the salary band follow Core HCM again. */
    setVacanciesLocked(false);
    setSalaryLocked(false);
  }, [linkedReqId, sourceReqId, requisitions]);

  /** Predefined recruitment reports — the only reports this module exports. */
  const recruitmentReportOptions = [
    {
      id: "postings" as const,
      title: "Vacancies & Postings",
      description: "Every job posting with vacancies, filled slots, applicants and status.",
    },
    {
      id: "requisitions" as const,
      title: "Vacancy Requisitions",
      description: "Pending staffing requisitions raised from Core HCM.",
    },
    {
      id: "funnel" as const,
      title: "Time-to-Fill & Funnel",
      description: "Days open, fill rate and applicants-per-vacancy per posting.",
    },
  ];
  type RecruitmentReportId = (typeof recruitmentReportOptions)[number]["id"];

  const daysOpenOf = (posted: string): number => {
    const t = new Date(`${posted}T00:00:00`).getTime();
    if (Number.isNaN(t)) return 0;
    return Math.max(0, Math.round((Date.now() - t) / 86_400_000));
  };

  const buildPostingsReport = (): ReportData => {
    // Org-chart arrangement: Position immediately followed by Department,
    // rows ordered Department → Position (same hierarchy as the org chart).
    // Department names resolve against the Core HCM master so postings can
    // never drift from the org chart's Department ↔ Position mapping.
    const deptOfJob = (title: string, fallback: string) =>
      knownPositions.find((p) => p.title === title)?.department ?? fallback;
    const postRows = filteredJobs
      .map((job) => ({ ...job, department: deptOfJob(job.title, job.department) }))
      .sort(
        (a, b) =>
          a.department.localeCompare(b.department) || a.title.localeCompare(b.title),
      );
    const deptCount = new Set(postRows.map((j) => j.department)).size;
    return {
      title: "Recruitment Management Report",
      subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()} · Predefined report: Vacancies & Postings · Department: ${deptFilter} | Status: ${statusFilter}`,
      columns: [
        { header: "Position", key: "title" },
        { header: "Department", key: "department" },
        { header: "Status", key: "status" },
        { header: "Vacancies", key: "vacancies" },
        { header: "Filled", key: "filled" },
        { header: "Applicants", key: "applicants" },
        { header: "Posted", key: "posted" },
      ],
      rows: [
        ...postRows,
        ...pendingRequisitions.map((request) => ({
          title: `${request.position} (requisition ${request.id})`,
          department: request.department,
          status: request.status,
          vacancies: request.count,
          filled: "-",
          applicants: "-",
          posted: request.requestedAt,
        })),
      ],
      summary: [
        { label: "Active postings", value: openCount },
        { label: "Total vacancies", value: totalVacancies },
        { label: "Pending requisitions", value: pendingRequisitions.length },
        { label: "Departments covered", value: deptCount },
        { label: "Rows in report", value: postRows.length },
      ],
    };
  };

  const buildRequisitionsReport = (): ReportData => ({
    title: "Vacancy Requisitions Report",
    subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()} · Predefined report: Vacancy Requisitions (pending from Core HCM) · Department: ${reqDept} | Status: ${reqStatus} | Urgency: ${reqUrgency}`,
    columns: [
      { header: "Reference", key: "id" },
      { header: "Position", key: "position" },
      { header: "Department", key: "department" },
      { header: "Openings", key: "count" },
      { header: "Urgency", key: "urgency" },
      { header: "Status", key: "status" },
      { header: "Requested", key: "requestedAt" },
    ],
    rows: [...filteredRequisitions]
      .map((request) => ({ ...request }))
      .sort(
        (a, b) =>
          String(a.department).localeCompare(String(b.department)) ||
          String(a.position).localeCompare(String(b.position)),
      ),
    summary: [
      { label: "Pending requisitions", value: pendingRequisitions.length },
      { label: "High urgency", value: highUrgencyCount },
      { label: "Filtered", value: filteredRequisitions.length },
    ],
  });

  const buildFunnelReport = (): ReportData => {
    const deptOfJob = (title: string, fallback: string) =>
      knownPositions.find((p) => p.title === title)?.department ?? fallback;
    const scopedJobs = filteredJobs.map((job) => ({
      ...job,
      department: deptOfJob(job.title, job.department),
    }));
    const rows = scopedJobs
      .map((job) => {
        const daysOpen = daysOpenOf(job.posted);
        const remaining = Math.max(0, job.vacancies - job.filled);
        const fillRate = job.vacancies > 0 ? Math.round((job.filled / job.vacancies) * 100) : 0;
        const perVacancy = job.vacancies > 0 ? (job.applicants / job.vacancies).toFixed(1) : "—";
        return {
          title: job.title,
          department: job.department,
          status: job.status,
          posted: job.posted,
          daysOpen,
          vacancies: job.vacancies,
          filled: job.filled,
          remaining,
          fillRate: `${fillRate}%`,
          applicants: job.applicants,
          perVacancy,
        };
      })
      .sort(
        (a, b) =>
          String(a.department).localeCompare(String(b.department)) ||
          String(a.title).localeCompare(String(b.title)),
      );
    const avgDays = rows.length
      ? Math.round(rows.reduce((t, r) => t + (r.daysOpen as number), 0) / rows.length)
      : 0;
    const totalFilled = scopedJobs.reduce((t, j) => t + j.filled, 0);
    const totalApplicants = scopedJobs.reduce((t, j) => t + j.applicants, 0);
    return {
      title: "Recruitment Time-to-Fill & Funnel Report",
      subtitle: `Oxford Suites Makati HRMS · ${new Date().toLocaleDateString()} · Predefined report: Time-to-Fill & Funnel · Department: ${deptFilter} | Status: ${statusFilter}`,
      columns: [
        { header: "Position", key: "title" },
        { header: "Department", key: "department" },
        { header: "Status", key: "status" },
        { header: "Posted", key: "posted" },
        { header: "Days open", key: "daysOpen" },
        { header: "Vacancies", key: "vacancies" },
        { header: "Filled", key: "filled" },
        { header: "Remaining", key: "remaining" },
        { header: "Fill rate", key: "fillRate" },
        { header: "Applicants", key: "applicants" },
        { header: "Applicants / vacancy", key: "perVacancy" },
      ],
      rows,
      summary: [
        { label: "Active postings", value: openCount },
        { label: "Total vacancies", value: totalVacancies },
        { label: "Total filled", value: totalFilled },
        { label: "Total applicants", value: totalApplicants },
        { label: "Avg. days open", value: avgDays },
      ],
    };
  };

  const buildRecruitmentReport = (id: RecruitmentReportId): ReportData => {
    if (id === "requisitions") return buildRequisitionsReport();
    if (id === "funnel") return buildFunnelReport();
    return buildPostingsReport();
  };

  /** Shared-menu options — SAME locked-ZIP program, titles stay page-relevant. */
  const recruitmentMenuOptions = recruitmentReportOptions.map((option) => ({
    id: option.id,
    title: option.title,
    description: option.description,
    build: () => buildRecruitmentReport(option.id),
    recordCount:
      option.id === "requisitions" ? filteredRequisitions.length : filteredJobs.length,
  }));

  const salaryLine =
    draft.salaryMin || draft.salaryMax
      ? `${peso(Number(draft.salaryMin) || 0)} — ${peso(Number(draft.salaryMax) || 0)} a month`
      : "Salary to be discussed";

  const renderRequestedNote = () =>
    sourceReq ? (
      <div className="space-y-2 rounded-md border border-border bg-secondary/30 p-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold">Requested Note — {sourceReq.id}</p>
          <Badge variant="outline" className={urgencyBadge(sourceReq.urgency)}>
            {sourceReq.urgency} urgency
          </Badge>
        </div>
        <p className="text-[0.7rem] text-muted-foreground">
          {sourceReq.position} · {sourceReq.department} · {sourceReq.count} opening(s) · Requested{" "}
          {sourceReq.requestedAt}
        </p>
        {sourceReq.justification && (
          <p className="rounded-md bg-card p-3 text-xs italic leading-relaxed text-muted-foreground">
            “{sourceReq.justification}”
          </p>
        )}
      </div>
    ) : (
      <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
        This posting wasn't sourced from a staffing request — no requested note on file.
      </div>
    );

  const posterImageUrl =
    customPosterUrl ??
    `${API_BASE_URL}/job-posts/template-picture?title=${encodeURIComponent(draft.title || "Position")}`;
  const positionsForDepartment = (department: string) => {
    const departmentId = knownDepartments.find((d) => d.name === department)?.dbId;
    return knownPositions.filter(
      (p) =>
        (departmentId !== undefined && p.departmentId === departmentId) ||
        (p.departmentId === undefined && p.department === department),
    );
  };

  /* Options in the Job Title block are identified by the Core HCM position id,
     never by the title: Front Office holds a Rank & File (POS-001) and a Staff
     (POS-018) "Front Desk Receptionist", and a title-only value makes both
     options indistinguishable. When that happens the level is appended so HR
     can tell the two bands apart at a glance. */
  const titleBlockKey = (p: { dbId?: number | null; title?: string }) =>
    p.dbId !== undefined && p.dbId !== null ? `id:${p.dbId}` : `name:${p.title ?? ""}`;
  const deptPositions = positionsForDepartment(draft.department);
  const titleBlockDuplicates = deptPositions.filter((p) => p.title === draft.title).length > 1;
  /** How many positions in a department share this exact title. */
  const pendingDeptTitleCount = (title: string) =>
    positionsForDepartment(pendingDept).filter((p) => p.title === title).length;

  /**
   * The Core HCM position behind the current draft (department + title).
   * Read through a ref so the salary/vacancy auto-fill effects do not need it
   * in their dependency arrays (it is a new object on every position change).
   */
  const draftPositionRef = useRef<Position | null>(null);

  const draftPosition = useMemo(() => {
    const deptPositions = positionsForDepartment(draft.department);
    /* The id identifies the exact role; the title is only a fallback for posts
       whose position_id is missing or no longer in Core HCM. */
    return (
      (draft.positionDbId !== null && draft.positionDbId !== undefined
        ? deptPositions.find((p) => p.dbId === draft.positionDbId)
        : null) ??
      deptPositions.find((p) => p.title === draft.title) ??
      null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.department, draft.title, draft.positionDbId, knownPositions, knownDepartments]);

  /** Salary grade object currently selected in Job Info ("") = position grade. */  const draftGrade = useMemo(() => {
    if (draft.salaryGradeId) {
      return salaryGrades.find((g) => String(g.salary_grade_id) === draft.salaryGradeId) ?? null;
    }
    if (draftPosition?.salaryGradeId) {
      return (
        salaryGrades.find((g) => g.salary_grade_id === draftPosition.salaryGradeId) ?? null
      );
    }
    return null;
  }, [draft.salaryGradeId, draftPosition, salaryGrades]);

  /** Core HCM band the draft should follow — the selected grade, else the position's. */
  const draftBand = useMemo(() => {
    const min = draftGrade?.min_salary ?? draftPosition?.salaryGradeMin ?? null;
    const max = draftGrade?.max_salary ?? draftPosition?.salaryGradeMax ?? null;
    if (min === null || min === undefined || max === null || max === undefined) return null;
    return { min: Number(min), max: Number(max) };
  }, [draftGrade, draftPosition]);

  /**
   * Salary fields the recruiter has deliberately typed, so an auto-sync from
   * Core HCM never overwrites their numbers. Reset whenever the band changes.
   */
  const [salaryLocked, setSalaryLocked] = useState(false);

  /**
   * Auto-fetch salary from Core HCM — no button, no click.
   *
   * Runs whenever the draft's band changes (grade picked, position chosen, or
   * requisition converted). A manual edit wins only until the band changes
   * again; picking a different band re-arms the sync automatically.
   */
  useEffect(() => {
    if (!draftBand || salaryLocked) return;
    setDraft((d) => {
      const min = String(draftBand.min);
      const max = String(draftBand.max);
      if (d.salaryMin === min && d.salaryMax === max) return d;
      return { ...d, salaryMin: min, salaryMax: max };
    });
  }, [draftBand, salaryLocked]);

  /* A different grade/position is a new source of truth — re-arm the auto-fill
     so a stale manual override does not stick. */
  const bandSourceRef = useRef(
    draftBand ? `${draftBand.min}-${draftBand.max}` : null,
  );
  useEffect(() => {
    const source = draftBand ? `${draftBand.min}-${draftBand.max}` : null;
    if (source !== bandSourceRef.current) {
      bandSourceRef.current = source;
      setSalaryLocked(false);
    }
  }, [draftBand]);

  /** Hires already recorded on the post being edited — vacancies can never drop below it. */
  const editingFilledRef = useRef(0);
  editingFilledRef.current = editingJobId
    ? (jobList.find((j) => j.id === editingJobId)?.filled ?? 0)
    : 0;

  /**
   * Vacancies the draft should align to, in priority order:
   *   1. the requested count of a linked staffing requisition,
   *   2. the Core HCM position's open slots (headcount - filled).
   * A post can never advertise fewer slots than the hires it already recorded.
   */
  const coreHcmVacancies = useMemo(() => {
    const req = sourceReqId ? requisitions.find((r) => r.id === sourceReqId) : undefined;
    if (req) {
      return { count: Math.max(1, Number(req.count) || 1), source: `requisition ${req.id}` as const };
    }
    if (draftPosition) {
      const open = Math.max(0, draftPosition.vacancies ?? 0);
      return {
        count: Math.max(1, open),
        source: `Core HCM position (${draftPosition.headcount} headcount − ${draftPosition.filled} filled)` as const,
      };
    }
    return null;
  }, [sourceReqId, requisitions, draftPosition]);

  const [vacanciesLocked, setVacanciesLocked] = useState(false);

  /** Align vacancies with Core HCM whenever the source or position changes. */
  useEffect(() => {
    if (!coreHcmVacancies || vacanciesLocked) return;
    setDraft((d) => {
      const next = String(Math.max(coreHcmVacancies.count, editingFilledRef.current));
      if (d.vacancies === next) return d;
      return { ...d, vacancies: next };
    });
  }, [coreHcmVacancies, vacanciesLocked]);

  /* A different requisition/position is a new source of truth — re-arm the
     auto-fill so the stale manual override does not stick. */
  const vacancySourceRef = useRef(coreHcmVacancies?.source ?? null);
  useEffect(() => {
    const source = coreHcmVacancies?.source ?? null;
    if (source !== vacancySourceRef.current) {
      vacancySourceRef.current = source;
      setVacanciesLocked(false);
    }
  }, [coreHcmVacancies]);

  /**
   * Applies a Core HCM position's assigned salary grade/band to the Job Info
   * draft, filling salary min/max from the band. Explicit salary edits are
   * kept — pass forceSalary to overwrite them (used when the position itself
   * changes).
   */
  const applyPositionToDraft = (
    department: string,
    title: string,
    opts: { forceSalary?: boolean; positionDbId?: number | null | undefined } = {},
  ) => {
    /* Prefer the explicit position id. Two positions can share a title inside
       one department, so a name-only match would silently attach the wrong
       salary band, headcount and requirement template. */
    const position =
      (opts.positionDbId !== undefined && opts.positionDbId !== null
        ? knownPositions.find((p) => p.dbId === opts.positionDbId)
        : null) ??
      knownPositions.find((p) => {
        const departmentId = knownDepartments.find((d) => d.name === department)?.dbId;
        const sameDept =
          (departmentId !== undefined && p.departmentId === departmentId) ||
          (p.departmentId === undefined && p.department === department);
        return sameDept && p.title === title;
      }) ??
      null;

    setDraft((d) => {
      const next: Draft = {
        ...d,
        department,
        title,
        positionDbId: position?.dbId ?? opts.positionDbId ?? d.positionDbId,
      };
      if (position?.salaryGradeId) {
        next.salaryGradeId = String(position.salaryGradeId);
      }
      const grade =
        (position?.salaryGradeId &&
          salaryGrades.find((g) => g.salary_grade_id === position.salaryGradeId)) ||
        null;
      const bandMin = grade?.min_salary ?? position?.salaryGradeMin ?? null;
      const bandMax = grade?.max_salary ?? position?.salaryGradeMax ?? null;
      if (opts.forceSalary || d.salaryMin.trim() === "") {
        if (bandMin !== null && bandMin !== undefined) next.salaryMin = String(bandMin);
      }
      if (opts.forceSalary || d.salaryMax.trim() === "") {
        if (bandMax !== null && bandMax !== undefined) next.salaryMax = String(bandMax);
      }
      return next;
    });

    if (position) {
      const grade = position.salaryGradeId
        ? salaryGrades.find((g) => g.salary_grade_id === position.salaryGradeId)
        : null;
      if (grade) {
        toast.info(`Job Info synced from Core HCM — ${position.title}`, {
          description: `${grade.code} (${peso(Number(grade.min_salary ?? 0))} – ${peso(Number(grade.max_salary ?? 0))})`,
        });
      }
    }

    /* Position-driven requirements: resolve the active template for this
       position and auto-apply it on a clean draft, or ask first when the
       draft already holds skills so hand-typed requirements are never wiped
       silently. Templates with position_id = null ("any position") never
       auto-apply. */
    const tpl =
      position?.dbId !== undefined && position?.dbId !== null
        ? requirementTemplates.find(
            (t) => t.active && t.position_id !== null && t.position_id === position!.dbId,
          ) ?? null
        : null;
    if (!tpl) {
      setAppliedTemplate(null);
    } else if (draft.skills.trim() === "") {
      applyRequirementTemplateToDraft(tpl);
    } else {
      setPendingTemplate({ template: tpl, positionLabel: `${title} — ${department}` });
    }
  };

  const handlePosterUpload = (file: File | null) => {
    if (!file) return;
    setPosterFile(file);
    const url = URL.createObjectURL(file);
    setCustomPosterUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const handlePosterRemove = () => {
    setPosterFile(null);
    setCustomPosterUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  /** Poster control: lets the recruiter swap the template photo used on the FB/IG hiring poster. */
  const PosterUploadControl = () => (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border p-2.5 text-[0.7rem]">
      <span className="font-medium text-muted-foreground">Picture of hiring:</span>
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 font-medium hover:border-primary/40">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePosterUpload(e.target.files?.[0] ?? null)}
        />
        Upload photo
      </label>
      {customPosterUrl && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[0.7rem]"
          onClick={handlePosterRemove}
        >
          Remove
        </Button>
      )}
    </div>
  );

  /** Hiring poster template — the position name is already burned into the
   *  image by the backend template-picture endpoint (white box on the left),
   *  so no frontend overlay is rendered. This guarantees the title can never
   *  drift over the red shapes / building photo on the right. */
  const HiringPoster = ({ className }: { className?: string }) => (
    <div className={cn("relative aspect-square w-full overflow-hidden bg-card", className)}>
      <img
        src={posterImageUrl}
        alt="Oxford Suites Makati hiring poster"
        className="h-full w-full object-cover"
      />
    </div>
  );

  const renderWebsitePreview = () => (
    <div className="space-y-5 rounded-md border border-border bg-card p-6">
      {has("title") && (
        <div>
          <h3 className="font-display text-3xl font-semibold leading-tight text-foreground">
            {draft.title || "Untitled role"}
          </h3>
          <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
            {draft.employmentType} · {draft.schedule} · Makati City
          </p>
        </div>
      )}
      {has("info") && (draft.salaryMin || draft.salaryMax) && (
        <p className="text-sm font-bold text-primary">
          {peso(Number(draft.salaryMin) || 0)} — {peso(Number(draft.salaryMax) || 0)} per month
        </p>
      )}
      <div className="border-t border-border" />
      {has("description") && draft.description && (
        <div>
          <p className="font-display text-lg font-semibold">Job Description</p>
          <p className="mt-1.5 text-muted-foreground">{draft.description}</p>
        </div>
      )}
      {has("responsibilities") && lines(draft.responsibilities).length > 0 && (
        <div>
          <p className="font-display text-lg font-semibold">Responsibilities</p>
          <ul className="mt-1.5 space-y-1.5">
            {lines(draft.responsibilities).map((r) => (
              <li key={r} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {has("qualifications") && lines(draft.qualifications).length > 0 && (
        <div>
          <p className="font-display text-lg font-semibold">Qualifications</p>
          <ul className="mt-1.5 space-y-1.5">
            {lines(draft.qualifications).map((r) => (
              <li key={r} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {has("additional") && lines(draft.additional).length > 0 && (
        <div>
          <p className="font-display text-lg font-semibold">Additional Info</p>
          <ul className="mt-1.5 space-y-1.5">
            {lines(draft.additional).map((r) => (
              <li key={r} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {has("instructions") && draft.instructions && (
        <div>
          <p className="font-display text-lg font-semibold">How to Apply</p>
          <p className="mt-1.5 text-muted-foreground">{draft.instructions}</p>
        </div>
      )}
      {has("about") && draft.about && (
        <div>
          <p className="font-display text-lg font-semibold">About us</p>
          <p className="mt-1.5 text-muted-foreground">{draft.about}</p>
        </div>
      )}
      {has("picture") && <HiringPoster className="mx-auto max-w-md" />}
      <Button size="sm" className="w-full sm:w-auto">
        Apply Now
      </Button>
    </div>
  );

  return (
    <div>
      {confirmDialog}
      <PageHeader
        title="Recruitment Management"
        description="Job post builder with website preview, vacancy status and posting list."
        actions={
          <div className="flex items-center gap-2">
            <ReportMenu reports={recruitmentMenuOptions} />
            <Button
              size="icon"
              variant="outline"
              aria-label="Screening setup"
              title="Screening setup"
              onClick={() => setScreeningOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {jobsLoading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Postings"
            value={openCount}
            icon={Send}
            tone="primary"
            onClick={() => focusPostings("Open")}
          />
          <StatCard
            label="Total Vacancies"
            value={totalVacancies}
            icon={Briefcase}
            tone="gold"
            onClick={() => focusPostings("all")}
          />
          <StatCard
            label="Pending Requisitions"
            value={pendingRequisitions.length}
            icon={FileText}
            tone="success"
            onClick={() => focusRequisitions({ status: "Pending" })}
          />
          <StatCard
            label="High Urgency"
            value={highUrgencyCount}
            icon={AlertTriangle}
            tone="caution"
            onClick={() => focusRequisitions({ urgency: "High" })}
          />
        </div>
      )}

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-6">
        <TabsList>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="postings"
          >
            <Briefcase className="h-3.5 w-3.5" /> Vacancies &amp; Postings
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="builder"
          >
            <FilePlus2 className="h-3.5 w-3.5" /> Job Post Builder
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="requisitions"
          >
            <Send className="h-3.5 w-3.5" /> Requisitions
            {pendingRequisitions.length ? ` (${pendingRequisitions.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent id="recruitment-postings" value="postings" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Briefcase className="h-4 w-4 text-primary" /> Vacancies &amp; Postings
            </h2>
            <div className="grid w-full grid-cols-2 items-center gap-2 md:flex md:w-auto md:flex-wrap md:justify-end [&_input]:w-full [&_button[role=combobox]]:w-full md:[&_button[role=combobox]]:w-44">
              <div className="relative col-span-2 w-full min-w-0 md:col-span-1 md:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posted positions…"
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {knownDepartments.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setNewOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New job post
              </Button>
              {role === "superadmin" && (
                <Button onClick={openAddApplicantFree}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add applicant
                </Button>
              )}
            </div>
          </div>

          <ListBody
            className={cn(
              viewMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-2",
            )}
          >
            {jobsLoading ? (
              viewMode === "grid" ? (
                <>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="border-border/70">
                      <CardContent className="p-5">
                        <CardSkeleton rows={5} />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/70">
                      <CardContent className="p-5">
                        <CardSkeleton rows={2} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <>
                {viewMode === "list" && (
                  <div className="space-y-2 overflow-x-auto pb-1">
                    <div
                      className={cn(
                        "hidden min-w-[1240px] items-center gap-3 rounded-md border border-transparent px-3 py-1.5 md:grid",
                        listGridCols,
                      )}
                    >
                      <ListSortHead sortKey="title">Position</ListSortHead>
                      <ListSortHead sortKey="status">Status</ListSortHead>
                      <ListSortHead sortKey="salary">Salary</ListSortHead>
                      <ListSortHead sortKey="filled">Filled</ListSortHead>
                      <ListSortHead sortKey="posted">Posted</ListSortHead>
                      <span className="text-right text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        Actions
                      </span>
                    </div>
                    {pagedJobs.map((j) => {
                      const pct = Math.min(
                        100,
                        Math.round((j.filled / Math.max(1, j.vacancies)) * 100),
                      );
                      return (
                        <Card
                          key={j.id}
                          className={cn(
                            "md:min-w-[1240px]",
                            j.active ? "border-success/40" : "border-border/70 opacity-80",
                          )}
                        >
                          <CardContent
                            className={cn("grid items-center gap-3 p-3 md:grid", listGridCols)}
                          >
                            <div className="min-w-0">
                              <p className="eyebrow truncate">{j.department}</p>
                              <h3 className="truncate font-display text-base font-semibold leading-tight">
                                {j.title}
                              </h3>
                              <p className="truncate text-[0.7rem] text-muted-foreground">
                                {j.employmentType} · {j.schedule}
                              </p>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className={
                                  j.status === "Open"
                                    ? "border-success/30 bg-success/15 text-success"
                                    : "border-border"
                                }
                              >
                                {j.status}
                              </Badge>
                            </div>
                            <p className="truncate text-xs font-medium">
                              {peso(j.salaryMin)} — {peso(j.salaryMax)}
                            </p>
                            <div>
                              <div className="flex justify-between text-[0.65rem] text-muted-foreground">
                                <span>
                                  {j.filled}/{j.vacancies} filled
                                </span>
                                <span>{j.applicants} applicants</span>
                              </div>
                              <Progress value={pct} className="mt-1 h-1.5" />
                            </div>
                            <span
                              className="whitespace-nowrap text-[0.7rem] text-muted-foreground"
                              title={`Posted ${j.posted}`}
                            >
                              Posted {j.posted}
                            </span>
                            <div className="flex items-center justify-end gap-2">
                              {role === "admin" && (
                                <Button
                                  size="sm"
                                  onClick={() => openAddApplicantForJob(j)}
                                  disabled={!isPostAvailable(j)}
                                  title={
                                    isPostAvailable(j)
                                      ? `Add applicant for ${j.title}`
                                      : `Cannot add applicant — this posting is ${j.status === "Open" ? "full" : j.status}`
                                  }
                                >
                                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add applicant
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => editTemplate(j)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyAndUseTemplate(j)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Switch
                                checked={j.active}
                                onCheckedChange={() => toggleActive(j.id)}
                                aria-label={`Toggle posting for ${j.title}`}
                              />
                              {role === "superadmin" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 border border-destructive/40 text-destructive hover:text-destructive"
                                  onClick={() => deleteJob(j)}
                                  aria-label={`Delete posting for ${j.title}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
                {viewMode === "grid" &&
                  pagedJobs.map((j) => {
                    const pct = Math.min(
                      100,
                      Math.round((j.filled / Math.max(1, j.vacancies)) * 100),
                    );
                    return (
                      <Card
                        key={j.id}
                        className={j.active ? "border-success/40" : "border-border/70 opacity-80"}
                      >
                        <CardContent className="flex h-full flex-col p-5">
                          <div className="min-h-0 flex-1">
                            <img
                              src={
                                j.picture ||
                                `${API_BASE_URL}/job-posts/template-picture?title=${encodeURIComponent(j.title)}`
                              }
                              alt={`${j.title} hiring poster`}
                              className="mb-3 aspect-video w-full rounded-md border border-border object-cover"
                              onError={(e) => {
                                // A stale picture path 404s — fall back to the
                                // composed template poster instead of a broken icon.
                                const el = e.currentTarget;
                                const fallback = `${API_BASE_URL}/job-posts/template-picture?title=${encodeURIComponent(j.title)}`;
                                if (el.src !== fallback) el.src = fallback;
                              }}
                            />
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="eyebrow">{j.department}</p>
                                <h3 className="font-display text-xl font-semibold">{j.title}</h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {j.employmentType} · {j.schedule}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  j.status === "Open"
                                    ? "border-success/30 bg-success/15 text-success"
                                    : "border-border"
                                }
                              >
                                {j.status}
                              </Badge>
                            </div>

                            <p className="mt-3 text-sm font-medium">
                              {peso(j.salaryMin)} — {peso(j.salaryMax)}
                            </p>

                            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                              <span>
                                {j.filled} filled of {j.vacancies}
                              </span>
                              <span>{j.applicants} applicants</span>
                            </div>
                            <Progress value={pct} className="mt-2 h-2" />
                          </div>
                          {/* No reserved height here: it parked the buttons at
                              the bottom of an over-tall band and left a long
                              empty gap under the divider on every card. */}
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                            {role === "admin" && (
                              <Button
                                size="sm"
                                onClick={() => openAddApplicantForJob(j)}
                                disabled={!isPostAvailable(j)}
                                title={
                                  isPostAvailable(j)
                                    ? `Add applicant for ${j.title}`
                                    : `Cannot add applicant — this posting is ${j.status === "Open" ? "full" : j.status}`
                                }
                              >
                                <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add applicant
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => editTemplate(j)}>
                              Edit Template
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyAndUseTemplate(j)}
                            >
                              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy & Use Template
                            </Button>
                            {role === "superadmin" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="border border-destructive/40 text-destructive hover:text-destructive"
                                onClick={() => deleteJob(j)}
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                              </Button>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Posted {j.posted}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">
                                {j.active ? "Open" : "Closed"}
                              </span>
                              <Switch
                                checked={j.active}
                                onCheckedChange={() => toggleActive(j.id)}
                                aria-label={`Toggle posting for ${j.title}`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {filteredJobs.length === 0 && (
                  <div className="md:col-span-2 xl:col-span-3">
                    <ListEmptyState placeholder="Search posted positions…" />
                  </div>
                )}
              </>
            )}
          </ListBody>

          <TablePagination
            page={safePage}
            pageCount={pageCount}
            from={filteredJobs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
            to={Math.min(safePage * PAGE_SIZE, filteredJobs.length)}
            total={filteredJobs.length}
            label="postings"
            showRangeLabel={false}
            onPageChange={setPage}
          />
        </TabsContent>

        <TabsContent value="requisitions" className="mt-4">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <Send className="h-5 w-5 text-primary" /> Vacancy Requisitions
                  </h2>
                </div>
                <div className="grid w-full grid-cols-2 items-center gap-2 md:flex md:w-auto md:flex-wrap md:justify-end [&_input]:w-full [&_button[role=combobox]]:w-full md:[&_button[role=combobox]]:w-44">
                  <div className="relative col-span-2 w-full min-w-0 md:col-span-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search position, department…"
                      value={reqSearch}
                      onChange={(e) => {
                        setReqSearch(e.target.value);
                        setReqPage(1);
                      }}
                    />
                  </div>
                  <Select
                    value={reqStatus}
                    onValueChange={(v) => {
                      setReqStatus(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={reqDept}
                    onValueChange={(v) => {
                      setReqDept(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {knownDepartments.map((d) => (
                        <SelectItem key={d.code} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={reqUrgency}
                    onValueChange={(v) => {
                      setReqUrgency(v);
                      setReqPage(1);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All urgencies</SelectItem>
                      {reqUrgencies.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ReportMenu
                    report={() => buildRequisitionsReport()}
                    recordCount={filteredRequisitions.length}
                    buttonClassName="h-9 w-full whitespace-nowrap md:w-auto"
                  />
                </div>
              </div>
              <ListBody className="mt-4 space-y-2 overflow-x-auto">
                {reqsLoading && requisitions.length === 0 ? (
                  <Card className="border-border/70">
                    <CardContent className="p-5">
                      <CardSkeleton rows={5} />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div
                      className={cn(
                        "hidden items-center gap-2 px-3 py-1.5 md:grid md:min-w-[960px]",
                        reqGridCols,
                      )}
                    >
                      <RequisitionSortHead sortKey="id" sort={reqSort.sort} onSort={reqSort.toggle}>
                        Ref Number
                      </RequisitionSortHead>
                      <RequisitionSortHead
                        sortKey="department"
                        sort={reqSort.sort}
                        onSort={reqSort.toggle}
                      >
                        Department
                      </RequisitionSortHead>
                      <RequisitionSortHead
                        sortKey="count"
                        sort={reqSort.sort}
                        onSort={reqSort.toggle}
                      >
                        Openings
                      </RequisitionSortHead>
                      <RequisitionSortHead
                        sortKey="requestedAt"
                        sort={reqSort.sort}
                        onSort={reqSort.toggle}
                      >
                        Requested
                      </RequisitionSortHead>
                      <RequisitionSortHead
                        sortKey="urgency"
                        sort={reqSort.sort}
                        onSort={reqSort.toggle}
                      >
                        Urgency
                      </RequisitionSortHead>
                      <RequisitionSortHead
                        sortKey="status"
                        sort={reqSort.sort}
                        onSort={reqSort.toggle}
                      >
                        Status
                      </RequisitionSortHead>
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        Set status
                      </span>
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        Note
                      </span>
                      <span className="text-right text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        Job post
                      </span>
                    </div>
                    {visibleRequisitions.map((r) => (
                      <Card key={r.id} className="border-border/70">
                        <CardContent
                          className={cn(
                            "grid grid-cols-2 items-center gap-2 px-3 py-2 md:min-w-[960px]",
                            reqGridCols,
                          )}
                        >
                          <div className="col-span-2 flex min-w-0 items-center gap-2 md:col-span-1">
                            <span className="eyebrow shrink-0">{r.id}</span>
                            <span className="truncate text-sm font-semibold leading-tight">
                              {r.position}
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{r.department}</p>
                          <p className="text-xs font-medium">
                            <span className="text-muted-foreground md:hidden">Openings: </span>
                            {r.count}
                          </p>
                          <p className="truncate text-[0.7rem] text-muted-foreground">
                            {r.requestedAt}
                          </p>
                          <div>
                            <Badge variant="outline" className={urgencyBadge(r.urgency)}>
                              {r.urgency}
                            </Badge>
                          </div>
                          <div>
                            <Badge
                              variant="outline"
                              className={
                                r.status === "Done"
                                  ? "border-success/30 bg-success/15 text-success"
                                  : r.status === "Converted"
                                    ? "border-border bg-muted text-muted-foreground"
                                    : "border-caution/40 bg-caution/15 text-caution"
                              }
                            >
                              {r.status}
                            </Badge>
                          </div>
                          <div>
                            {r.status === "Converted" ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <Select
                                value={r.status}
                                onValueChange={(v) =>
                                  requisitionStore.update(r.id, {
                                    status: v as Requisition["status"],
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 w-full text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Done">Mark as Done</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <div className="col-span-2 flex min-w-0 items-center md:col-span-1">
                            <RequisitionNote req={r} />
                          </div>
                          <div className="col-span-2 flex items-center justify-end md:col-span-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 px-2 text-xs"
                              title="Convert to job post"
                              onClick={() => convertRequisition(r.id)}
                            >
                              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                              Convert
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredRequisitions.length === 0 && <ListEmptyState subject="requisitions" />}
                  </>
                )}
              </ListBody>
              <TablePagination
                page={reqPageSafe}
                pageCount={reqPageCount}
                from={filteredRequisitions.length === 0 ? 0 : (reqPageSafe - 1) * REQ_PER_PAGE + 1}
                to={Math.min(reqPageSafe * REQ_PER_PAGE, filteredRequisitions.length)}
                total={filteredRequisitions.length}
                label="requisitions"
                showRangeLabel={false}
                onPageChange={setReqPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-4">
          {!builderStarted ? (
            <button
              type="button"
              onClick={() => {
                setPendingDept(draft.department || (knownDepartments[0]?.name ?? ""));
                setPendingPosition("");
                setPendingPositionDbId(null);
                setDeptDialogOpen(true);
              }}
              className="group flex min-h-[520px] w-full flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-12 text-center transition-all hover:border-primary/60 hover:bg-primary/5 active:scale-[0.995]"
            >
              <span className="flex h-20 w-20 items-center justify-center text-primary transition-transform group-hover:scale-105">
                <FilePlus2 className="h-9 w-9" />
              </span>
              <span className="font-display text-3xl font-semibold">Create a job posting</span>
              <span className="max-w-lg text-sm text-muted-foreground">
                Choose a department and job position to start a new posting, then build it with
                drag-and-drop content blocks and see it exactly as applicants will on the careers
                site.
              </span>
              <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-2 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> Start a new posting
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => {
                    setBuilderStarted(false);
                    setNewOpen(false);
                    setDeptDialogOpen(false);
                  }}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Create job post
                </button>
                <span>›</span>
                <button
                  type="button"
                  onClick={() => {
                    setPendingDept(draft.department || (knownDepartments[0]?.name ?? ""));
                    setPendingPosition("");
                    setPendingPositionDbId(null);
                    setDeptDialogOpen(true);
                  }}
                  className="underline-offset-4 hover:text-primary hover:underline"
                >
                  {draft.department || "Department"}
                </button>
                <span>›</span>
                <button
                  type="button"
                  onClick={() => {
                    setPendingDept(draft.department || (knownDepartments[0]?.name ?? ""));
                    setPendingPosition(draft.title);
                    setPendingPositionDbId(draft.positionDbId);
                    setDeptDialogOpen(true);
                  }}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {draft.title || "Untitled position"}
                </button>
              </div>

              {/* All three columns stretch to the tallest one so the palette,
                  canvas and preview share a top and bottom edge. */}
              <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_minmax(340px,420px)] 2xl:grid-cols-[240px_minmax(0,1fr)_480px]">
                {/* Component palette */}
                <Card
                  ref={templatesCardRef}
                  /* xl:h-0 + xl:min-h-full: contributes nothing to the row height,
                     so the palette is capped at the canvas card's height and the
                     template list scrolls inside it instead of stretching the page
                     past "Edit Your Job Post". */
                  className="flex flex-col border-border/70 xl:h-0 xl:min-h-full"
                >
                  <CardContent className="flex h-full flex-col p-3">
                    <p className="eyebrow mb-2 font-bold">Add Components</p>
                    {/* shrink-0: when the canvas card is short these stay whole and
                        the template list below absorbs the shortfall instead. */}
                    <div className="shrink-0 space-y-1.5">
                      {blockLibrary.map((b) => (
                        <div
                          key={b.id}
                          draggable
                          onDragStart={() => setDragging(b.id)}
                          onDragEnd={() => setDragging(null)}
                          onClick={() => addBlock(b.id)}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-[0.7rem] transition ${
                            has(b.id)
                              ? "border-success/30 bg-success/5 opacity-60"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          {has(b.id) ? (
                            <Check
                              className="h-3 w-3 shrink-0 text-success"
                              aria-label="Already on the canvas"
                            />
                          ) : (
                            <Plus className="h-3 w-3 shrink-0 text-muted-foreground" />
                          )}
                          <span className="font-semibold">{b.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[0.65rem] text-muted-foreground">
                      Drag onto the canvas to reorder — the arrangement is saved with the post. Click
                      to add a block you removed.
                    </p>

                    <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={() => setTemplatesOpen((v) => !v)}
                        className="flex w-full items-center justify-between gap-2 text-left"
                        aria-expanded={templatesOpen}
                      >
                        <span className="eyebrow font-bold">Content Templates</span>
                        <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                          {jobList.length} saved
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${templatesOpen ? "rotate-180" : ""}`}
                          />
                        </span>
                      </button>
                      {templatesOpen && (
                    <div className="mt-3 flex min-h-0 flex-1 flex-col space-y-3">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search templates..."
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          className="h-7 pl-7 text-xs"
                        />
                      </div>
                      {/* No height cap: the palette card stretches with the
                          canvas, so expanding a long component made the card
                          tall while the list stopped at max-h-64 and left dead
                          space under the last template. flex-1 + overflow-y-auto
                          fills the card to its bottom edge and still scrolls
                          when the card itself is short. */}
                      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                        {(() => {
                          const q = templateSearch.trim().toLowerCase();
                          const filtered = q
                            ? jobList.filter((j) =>
                                `${j.title} ${j.department}`.toLowerCase().includes(q),
                              )
                            : jobList;
                          const grouped: Record<string, Job[]> = {
                            Draft: [],
                            Open: [],
                            Closed: [],
                          };
                          for (const j of filtered) {
                            const s = j.status as string;
                            if (grouped[s]) grouped[s].push(j);
                            else grouped[j.status]?.push(j);
                          }
                          const order: (keyof typeof grouped)[] = ["Draft", "Open", "Closed"];
                          const hasAny = order.some((k) => (grouped[k]?.length ?? 0) > 0);
                          if (!hasAny) {
                            return (
                              <p className="py-2 text-xs text-muted-foreground">
                                {q
                                  ? `No templates match "${templateSearch}"`
                                  : "No templates yet — create a draft, open or closed post."}
                              </p>
                            );
                          }
                          return order.map((status) => {
                            const list = grouped[status];
                            if (!list || list.length === 0) return null;
                            return (
                              <div key={status}>
                                <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                                  {status} ({list.length})
                                </p>
                                <div className="mt-1 space-y-1.5">
                                  {list.map((j) => (
                                    <button
                                      key={j.id}
                                      type="button"
                                      onClick={() => {
                                        setPendingTemplateJob(j);
                                        setConfirmTemplateOpen(true);
                                      }}
                                      className="w-full rounded-md border border-border px-2 py-1.5 text-left text-[0.68rem] hover:border-primary/40"
                                      title={`${j.title} — ${j.department}`}
                                    >
                                      <span className="block truncate font-medium">{j.title}</span>
                                      <span className="block truncate text-[0.62rem] text-muted-foreground">
                                        {j.department}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Canvas / composer — toggles to Entities Indicated via the header button */}
                <Card className="flex h-full flex-col border-border/70">
                  {builderFlipped ? (
                    <CardContent className="space-y-3 p-4">
                      <BuilderEntitiesCard
                        draft={draft}
                        mapping={entityMapping}
                        loading={entityLoading}
                        error={entityError}
                        addingTerm={addingTerm}
                        scoring={entityScoring}
                        onAdd={addEntityTerm}
                        onRetry={loadEntityMapping}
                        onFlipBack={() => setBuilderFlipped(false)}
                      />
                    </CardContent>
                  ) : (
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                          <FilePlus2 className="h-4 w-4 text-primary" />
                          {editingJobId ? "Edit Your Job Post" : "Edit Your Job Post"}
                        </h2>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={toggleBuilderFlip}
                            title="See entities indicated from whatever is filled in the builder"
                          >
                            <Repeat className="mr-1.5 h-3.5 w-3.5" />
                            Entities
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={generatingDraft || !draft.title.trim() || aiIndicator.limited}
                            onClick={generateDraftWithAI}
                            title={
                              aiIndicator.limited
                                ? aiIndicator.title
                                : draft.title.trim()
                                  ? "Auto-fill description, responsibilities, qualifications, additional info, instructions and about with Google AI (grounded in your screening vocabulary)"
                                  : "Select a job position first"
                            }
                          >
                            {generatingDraft ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {generatingDraft ? "Generating…" : "Generate with AI"}
                          </Button>
                          {/* Usage indicator — drafts spent today against the daily
                              cap, with a meter whenever a cap is configured. */}
                          <span
                            className={`hidden items-center gap-2 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium sm:inline-flex ${AI_TONE_CLASS[aiIndicator.tone]}`}
                            title={aiIndicator.title}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-current"
                              aria-hidden="true"
                            />
                            {aiIndicator.label}
                            {aiIndicator.percent !== null && (
                              <span
                                className="h-1 w-10 overflow-hidden rounded-full bg-current/25"
                                aria-hidden="true"
                              >
                                <span
                                  className="block h-full rounded-full bg-current"
                                  style={{ width: `${aiIndicator.percent}%` }}
                                />
                              </span>
                            )}
                          </span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                aria-label="How Generate with AI works"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 space-y-3 p-4 text-left">
                              <div>
                                <p className="font-display text-sm font-semibold">
                                  What Generate with AI fills
                                </p>
                                <p className="text-[0.7rem] text-muted-foreground">
                                  One click fills these 6 components on the canvas:
                                </p>
                              </div>
                              <ul className="space-y-1">
                                {AI_CONTENT_BLOCKS.map((id) => (
                                  <li
                                    key={id}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                                  >
                                    <CheckCircle2 className="h-3 w-3 shrink-0 text-gold" />
                                    {blockLibrary.find((b) => b.id === id)?.label ?? id}
                                  </li>
                                ))}
                              </ul>
                              <div className="space-y-1.5 rounded-md bg-secondary/40 p-3">
                                <p className="text-[0.7rem] font-semibold">How it is built</p>
                                <ol className="list-decimal space-y-1 pl-4 text-[0.7rem] leading-relaxed text-muted-foreground">
                                  <li>
                                    <span className="font-medium text-foreground">Job input</span> —
                                    position, department, type, schedule & vacancies from this
                                    builder.
                                  </li>
                                  <li>
                                    <span className="font-medium text-foreground">
                                      + Screening vocabulary
                                    </span>{" "}
                                    — recognized skills & certifications, so applicant matching
                                    keeps working. New terms (max 2) are flagged for your review.
                                  </li>
                                  <li>
                                    <span className="font-medium text-foreground">
                                      + Gemini 3.5 Flash-Lite
                                    </span>{" "}
                                    — server default model; writes the 6 components from the job +
                                    vocabulary. If it is slow or unavailable, the server falls over to
                                    Groq, then OpenRouter.
                                  </li>
                                </ol>
                              </div>
                              {/* Usage & limits — the indicator's detail view */}
                              <div className="space-y-1.5 rounded-md bg-secondary/40 p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[0.7rem] font-semibold">Usage &amp; limits</p>
                                  <button
                                    type="button"
                                    onClick={() => void loadAiUsage()}
                                    className="text-[0.65rem] font-medium text-primary underline-offset-2 hover:underline"
                                  >
                                    Refresh
                                  </button>
                                </div>
                                {aiUsage ? (
                                  <>
                                    <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                                      {aiUsage.used_today} draft(s) today
                                      {aiUsage.daily_limit > 0 ? ` of ${aiUsage.daily_limit}` : ""}
                                      {aiUsage.failures_today > 0
                                        ? ` · ${aiUsage.failures_today} failed`
                                        : ""}
                                      {aiUsage.tokens_today > 0
                                        ? ` · ${aiUsage.tokens_today.toLocaleString()} tokens`
                                        : ""}
                                    </p>
                                    {aiUsage.daily_limit > 0 && (
                                      <Progress
                                        value={Math.min(
                                          100,
                                          (aiUsage.used_today / aiUsage.daily_limit) * 100,
                                        )}
                                        className="h-1.5"
                                      />
                                    )}
                                    <ul className="space-y-1">
                                      {aiUsage.providers.map((p) => (
                                        <li
                                          key={`${p.kind}-${p.service}-${p.model}`}
                                          className="flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-muted-foreground"
                                        >
                                          {p.blocked ? (
                                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500 dark:text-amber-400" />
                                          ) : (
                                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                                          )}
                                          <span>
                                            <span className="font-medium text-foreground">
                                              {p.service}
                                            </span>{" "}
                                            — {p.model}
                                            {p.blocked
                                              ? ` · ${p.blocked_reason ?? "cooling down"}`
                                              : ""}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                    {aiUsage.blocked_until && aiBlockedSeconds > 0 && (
                                      <p className="text-[0.68rem] font-medium text-amber-600 dark:text-amber-400">
                                        Limit reached — ready again in{" "}
                                        {aiCountdown(aiBlockedSeconds)}.
                                      </p>
                                    )}
                                    {aiUsage.last_error && (
                                      <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
                                        Last failure: {aiFailureLabel(aiUsage.last_error.code)} —{" "}
                                        {aiUsage.last_error.message}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-[0.7rem] italic text-muted-foreground">
                                    Usage is unavailable right now — the indicator updates after the
                                    next attempt.
                                  </p>
                                )}
                              </div>
                              <p className="text-[0.65rem] italic text-muted-foreground">
                                Nothing publishes automatically — review each block, then Save draft
                                or Publish.
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="space-y-2" ref={composerRef}>
                        {blocks.map((id) => {
                          const meta = blockLibrary.find((b) => b.id === id)!;
                          return (
                            <div
                              key={id}
                              data-block-id={id}
                              draggable
                              onDragStart={() => setDragging(id)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => dropOn(id)}
                              onClick={(e) => selectBlock(id, e)}
                              className={`rounded-md border px-3 py-2 transition ${
                                activeBlock === id
                                  ? "border-primary bg-secondary/40"
                                  : "border-border hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2 text-xs font-medium">
                                  <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-muted-foreground" />
                                  {meta.label}
                                  <span className="hidden text-[0.65rem] font-normal text-muted-foreground sm:inline">
                                    {meta.hint}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    requestRemoveBlock(id);
                                  }}
                                  aria-label={`Remove ${meta.label}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                </button>
                              </div>

                              {activeBlock === id && (
                                <div className="mt-2 space-y-2">
                                  {id === "title" && (
                                    <div className="space-y-2">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      <div className="space-y-1">
                                        <Label className="text-[0.7rem]">Department</Label>
                                        <Select
                                          value={draft.department}
                                          onValueChange={(department) => {
                                            const firstPosition =
                                              positionsForDepartment(department)[0];
                                            if (firstPosition) {
                                              applyPositionToDraft(department, firstPosition.title, {
                                                forceSalary: true,
                                                positionDbId: firstPosition.dbId,
                                              });
                                            } else {
                                              setDraft({
                                                ...draft,
                                                department,
                                                title: "",
                                                positionDbId: null,
                                              });
                                            }
                                          }}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select a department" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {knownDepartments.map((d) => (
                                              <SelectItem key={d.code} value={d.name}>
                                                {d.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-[0.7rem]">Job title</Label>
                                        <Select
                                          value={
                                            draft.positionDbId != null
                                              ? titleBlockKey({ dbId: draft.positionDbId })
                                              : draft.title
                                                ? titleBlockKey({ dbId: null, title: draft.title })
                                                : ""
                                          }
                                          onValueChange={(v) => {
                                            const picked = deptPositions.find(
                                              (p) => titleBlockKey(p) === v,
                                            );
                                            if (picked) {
                                              applyPositionToDraft(
                                                draft.department,
                                                picked.title,
                                                {
                                                  forceSalary: true,
                                                  positionDbId: picked.dbId,
                                                },
                                              );
                                            }
                                          }}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Select a position from Core HR" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {deptPositions.map((p) => (
                                              <SelectItem
                                                key={titleBlockKey(p)}
                                                value={titleBlockKey(p)}
                                              >
                                                {titleBlockDuplicates ? `${p.title} · ${p.level}` : p.title}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    {draftPosition?.salaryBand && (
                                      <p className="rounded-md bg-secondary/40 px-2.5 py-1.5 text-[0.65rem] leading-relaxed text-muted-foreground">
                                        Core HCM salary band — {draftPosition.salaryBand}
                                      </p>
                                    )}
                                    </div>
                                  )}
                                  {id === "info" && (
                                    <div className="space-y-2">
                                     <div className="grid gap-2 sm:grid-cols-3">
                                         <div className="space-y-1">
                                           <Label className="text-[0.7rem]">Type</Label>
                                          <Select
                                            value={draft.employmentType}
                                            onValueChange={(v) =>
                                              setDraft({ ...draft, employmentType: v })
                                            }
                                          >
                                            <SelectTrigger className="h-8 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {[
                                                "Full-time",
                                                "Part-time",
                                                "Contract",
                                                "Seasonal",
                                              ].map((t) => (
                                                <SelectItem key={t} value={t}>
                                                  {t}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[0.7rem]">Schedule</Label>
                                          <Select
                                            value={draft.schedule || "Shifting Schedule"}
                                            onValueChange={(v) =>
                                              setDraft({ ...draft, schedule: v })
                                            }
                                          >
                                            <SelectTrigger className="h-8 text-xs">
                                              <SelectValue placeholder="Select work schedule" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {WORK_SCHEDULE_OPTIONS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                  {s}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[0.7rem]">Vacancies</Label>
                                          <Input
                                            type="number"
                                            min={1}
                                            className="h-8 text-xs"
                                            value={draft.vacancies}
                                            disabled={role === "admin" && Boolean(sourceReqId)}
                                            onChange={(e) => {
                                              setVacanciesLocked(true);
                                              setDraft({
                                                ...draft,
                                                vacancies: sanitizeDigitsOnly(e.target.value),
                                              });
                                            }}
                                          />
                                          {/* Escape hatch for a custom headcount: hand the
                                          vacancies back to Core HCM open slots. */}
                                          {coreHcmVacancies && vacanciesLocked && (
                                            <button
                                              type="button"
                                              className="text-[0.7rem] font-medium text-primary hover:underline"
                                              onClick={() => {
                                                setVacanciesLocked(false);
                                                setDraft((d) => ({
                                                  ...d,
                                                  vacancies: String(
                                                    Math.max(coreHcmVacancies.count, editingFilledRef.current),
                                                  ),
                                                }));
                                              }}
                                            >
                                              Reset vacancies
                                            </button>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[0.7rem]">Salary min (₱)</Label>
                                          <Input
                                            type="number"
                                            min={0}
                                            className="h-8 text-xs"
                                            value={draft.salaryMin}
                                            onChange={(e) => {
                                              setSalaryLocked(true);
                                              setDraft({
                                                ...draft,
                                                salaryMin: sanitizeDecimalString(e.target.value),
                                              });
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[0.7rem]">Salary max (₱)</Label>
                                          <Input
                                            type="number"
                                            min={0}
                                            className="h-8 text-xs"
                                            value={draft.salaryMax}
                                            onChange={(e) => {
                                              setSalaryLocked(true);
                                              setDraft({
                                                ...draft,
                                                salaryMax: sanitizeDecimalString(e.target.value),
                                              });
                                            }}
                                          />
                                          {/* Escape hatch for custom figures: hand the salary back
                                          to the Core HCM band. Lives inside this cell so it
                                          never claims a grid row of its own. */}
                                          {draftBand && salaryLocked && (
                                            <button
                                              type="button"
                                              className="block text-[0.7rem] font-medium text-primary hover:underline"
                                              onClick={() => setSalaryLocked(false)}
                                            >
                                              Reset to band
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Test requirements — owned by Core HCM. Read-only here:
                                          the linked position's flags decide the applicant
                                          pipeline (edit them in Core HCM → Departments &
                                          Positions). */}
                                      <div className="space-y-2 pt-2 border-t border-border/50">
                                        <div className="flex items-center gap-2 text-xs">
                                          <span
                                            className={
                                              draftPosition?.requires_assessment
                                                ? "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-medium text-primary"
                                                : "inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 font-medium text-muted-foreground"
                                            }
                                          >
                                            {draftPosition?.requires_assessment ? "●" : "○"} Assessment Test{" "}
                                            {draftPosition?.requires_assessment ? "required" : "not required"}
                                          </span>
                                          <span className="text-[0.65rem] text-muted-foreground">
                                            {draftPosition
                                              ? `From position “${draftPosition.title}” in Core HCM`
                                              : "Select a position to see its Core HCM test requirements"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                          <span
                                            className={
                                              draftPosition?.requires_practical
                                                ? "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-medium text-primary"
                                                : "inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 font-medium text-muted-foreground"
                                            }
                                          >
                                            {draftPosition?.requires_practical ? "●" : "○"} Practical Test{" "}
                                            {draftPosition?.requires_practical ? "required" : "not required"}
                                          </span>
                                          <span className="text-[0.65rem] text-muted-foreground">
                                            Every applicant for this position must undergo the required stages
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                     )}
                                   {id === "description" && (
                                    <Textarea
                                      autoFocus
                                      rows={2}
                                      className="text-xs"
                                      value={draft.description}
                                      onChange={(e) =>
                                        setDraft({ ...draft, description: e.target.value })
                                      }
                                      placeholder="Short pitch of the role…"
                                    />
                                  )}
                                  {id === "picture" && (
                                    <div className="space-y-2">
                                      <HiringPoster className="mx-auto max-w-md" />
                                      <PosterUploadControl />
                                    </div>
                                  )}
                                  {id === "responsibilities" && (
                                    <Textarea
                                      autoFocus
                                      rows={3}
                                      className="text-xs"
                                      value={draft.responsibilities}
                                      onChange={(e) =>
                                        setDraft({ ...draft, responsibilities: e.target.value })
                                      }
                                      placeholder="One responsibility per line…"
                                    />
                                  )}
                                  {id === "qualifications" && (
                                    <Textarea
                                      autoFocus
                                      rows={3}
                                      className="text-xs"
                                      value={draft.qualifications}
                                      onChange={(e) =>
                                        setDraft({ ...draft, qualifications: e.target.value })
                                      }
                                      placeholder="One qualification per line…"
                                    />
                                  )}
                                  {id === "skills" && (
                                    <ScreeningRequirementsPanel
                                      draft={draft}
                                      mapping={entityMapping}
                                      loading={entityLoading}
                                      error={entityError}
                                      addingTerm={addingTerm}
                                      scoring={entityScoring}
                                      positions={knownPositions.map((p) => ({
                                        dbId: p.dbId,
                                        title: p.title,
                                        department: p.department,
                                        level: p.level,
                                        salaryBand: p.salaryBand,
                                      }))}
                                      templateName={appliedTemplate?.name ?? null}
                                      templateSkillCount={
                                        appliedTemplate
                                          ? appliedTemplate.items.filter(
                                              (i) => i.entity_type === "skill",
                                            ).length
                                          : 0
                                      }
                                      templateCertCount={
                                        appliedTemplate
                                          ? appliedTemplate.items.filter(
                                              (i) => i.entity_type === "certification",
                                            ).length
                                          : 0
                                      }
                                      hasTemplateForPosition={(() => {
                                        const pid = draft.positionDbId;
                                        return requirementTemplates.some(
                                          (t) =>
                                            t.active &&
                                            t.position_id !== null &&
                                            pid !== undefined &&
                                            pid !== null &&
                                            t.position_id === pid,
                                        );
                                      })()}
                                      onPickPosition={(dept, title, positionDbId) =>
                                        applyPositionToDraft(dept, title, {
                                          forceSalary: true,
                                          positionDbId,
                                        })
                                      }
                                      onSkillsChange={(next) =>
                                        setDraft({ ...draft, skills: next })
                                      }
                                      onCertificationsChange={(next) =>
                                        setDraft({ ...draft, qualifications: next })
                                      }
                                      onAdd={addEntityTerm}
                                      onRetry={loadEntityMapping}
                                      onLevelsChange={(levels) =>
                                        setDraft((d) => ({
                                          ...d,
                                          educationLevels: levels.educationLevels,
                                          experienceLevels: levels.experienceLevels,
                                        }))
                                      }
                                      onCreateTemplate={createTemplateForDraftPosition}
                                      creatingTemplate={creatingTemplate}
                                    />
                                  )}
                                  {id === "additional" && (
                                    <Textarea
                                      autoFocus
                                      rows={3}
                                      className="text-xs"
                                      value={draft.additional}
                                      onChange={(e) =>
                                        setDraft({ ...draft, additional: e.target.value })
                                      }
                                      placeholder="One item per line…"
                                    />
                                  )}
                                  {id === "instructions" && (
                                    <Textarea
                                      autoFocus
                                      rows={2}
                                      className="text-xs"
                                      value={draft.instructions}
                                      onChange={(e) =>
                                        setDraft({ ...draft, instructions: e.target.value })
                                      }
                                      placeholder="How should applicants apply?"
                                    />
                                  )}
                                  {id === "about" && (
                                    <Textarea
                                      autoFocus
                                      rows={2}
                                      className="text-xs"
                                      value={draft.about}
                                      onChange={(e) =>
                                        setDraft({ ...draft, about: e.target.value })
                                      }
                                      placeholder="Company blurb…"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => dragging && addBlock(dragging)}
                          className="rounded-md border border-dashed border-border py-3 text-center text-[0.7rem] text-muted-foreground"
                        >
                          Drop a component here
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canSaveDraft}
                          onClick={saveDraftAction}
                        >
                          {/* Save never unpublishes: new posts save as Draft,
                              edits keep their live status — only Publish /
                              Update template changes what is live. */}
                          {editingJobId ? "Save changes as draft" : "Save draft"}
                        </Button>
                        <Button size="sm" onClick={publish}>
                          <Send className="mr-2 h-4 w-4" />
                          {editingJobId ? "Update template" : "Publish job post"}
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Requested note + the live website preview, stacked in the
                    third column so both stay visible while editing. Capped at
                    the canvas card's height (xl:h-0 xl:min-h-full) with the
                    preview scrolling inside — same limit as the palette. */}
                <div className="flex flex-col gap-4 overflow-hidden xl:h-0 xl:min-h-full">
                  <Card className="shrink-0 overflow-y-auto border-border/70 xl:max-h-[50%]">
                    <CardContent className="p-4">
                      <h2 className="font-display text-lg font-semibold">Requested Note</h2>
                      {!sourceReqId && (
                        <div className="mt-2 space-y-1.5">
                          <Label className="text-xs">Link a pending staffing request</Label>
                          <Select
                            value={linkedReqId ?? "none"}
                            onValueChange={(v) => setLinkedReqId(v === "none" ? null : v)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="No staffing request" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No staffing request</SelectItem>
                              {requisitions
                                .filter((r) => r.status === "Pending")
                                .map((r) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.id} — {r.position} ({r.department})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="mt-2">{renderRequestedNote()}</div>
                    </CardContent>
                  </Card>

                  {/* Website is the only publishing channel, so the preview needs
                      no channel tabs — and it is rendered here instead of behind
                      a "Preview post" click, so the recruiter always sees the
                      posting as applicants will. */}
                  {previewOpen ? (
                    <Card className="flex min-h-0 flex-1 flex-col border-border/70">
                      <CardContent className="flex min-h-0 flex-1 flex-col p-4">
                        <div className="flex shrink-0 items-start justify-between gap-2">
                          <div>
                            <h2 className="font-display text-lg font-semibold">
                              {draft.title || "Untitled position"} — Website preview
                            </h2>
                            <p className="mt-0.5 text-[0.7rem] leading-relaxed text-muted-foreground">
                              Full-size preview of how this posting will appear on the company
                              website.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            onClick={() => setPreviewOpen(false)}
                            aria-label="Close website preview"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Scrolls inside the card instead of growing it, so the
                            column never gets taller than the canvas card. */}
                        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 text-sm">
                          {renderWebsitePreview()}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setPreviewOpen(true)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Show website preview
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={newOpen || deptDialogOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          setDeptDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose department and job position</DialogTitle>
            <DialogDescription>
              Pick the department and the position this job post is for — it seeds the builder with
              a blank, customizable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select
                value={pendingDept}
                onValueChange={(v) => {
                  setPendingDept(v);
                  setPendingPosition("");
                  setPendingPositionDbId(null);
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {knownDepartments.map((d) => (
                    <SelectItem key={d.code} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Job position</Label>
              <Select
                value={
                  pendingPositionDbId !== null
                    ? titleBlockKey({ dbId: pendingPositionDbId })
                    : pendingPosition
                      ? titleBlockKey({ dbId: null, title: pendingPosition })
                      : ""
                }
                onValueChange={(v) => {
                  const picked = positionsForDepartment(pendingDept).find(
                    (p) => titleBlockKey(p) === v,
                  );
                  if (picked) {
                    setPendingPosition(picked.title);
                    setPendingPositionDbId(picked.dbId ?? null);
                  }
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  {positionsForDepartment(pendingDept).map((p) => (
                    <SelectItem key={titleBlockKey(p)} value={titleBlockKey(p)}>
                      {pendingDeptTitleCount(p.title) > 1
                        ? `${p.title} · ${p.level}`
                        : p.title}
                    </SelectItem>
                  ))}
                  {positionsForDepartment(pendingDept).length === 0 && (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      No positions defined for this department.
                    </div>
                  )}
                </SelectContent>
              </Select>
              {isPairTakenFor(pendingDept, pendingPositionDbId) && (
                <p className="flex items-start gap-1.5 text-xs font-medium text-destructive">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    A job post already exists for this position and department — edit the existing
                    post instead of creating a duplicate.
                  </span>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setNewOpen(false);
                setDeptDialogOpen(false);
              }}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              disabled={!pendingPosition || isPairTakenFor(pendingDept, pendingPositionDbId)}
              title={
                isPairTakenFor(pendingDept, pendingPositionDbId)
                  ? "A job post already exists for this position and department"
                  : "Start a new job post"
              }
              onClick={() => startNewPost(pendingDept, pendingPosition, pendingPositionDbId)}
            >
              <PencilRuler className="mr-2 h-4 w-4" /> Start job post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this job post as a draft?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in the Job Post Builder. Save your progress as a draft before
              leaving, or discard the changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmLeaveOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={confirmLeaveDiscard}>
              Discard
            </Button>
            <Button onClick={confirmLeaveSave}>Save as draft & leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={routeBlocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open) routeBlocker.reset?.();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this job post as a draft?</DialogTitle>
            <DialogDescription>
              You’re navigating away with unsaved Job Post Builder changes. Save your progress as a
              draft before leaving, or discard the changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => routeBlocker.reset?.()}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSavedSnapshot(snapshotOf(draft, blocks));
                routeBlocker.proceed?.();
              }}
            >
              Discard
            </Button>
            <Button
              onClick={() => {
                saveDraftAction();
                routeBlocker.proceed?.();
              }}
            >
              Save as draft & leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD APPLICANT DIALOG — NLP resume screening wizard */}
      <Dialog open={addOpen} onOpenChange={(o) => (o ? setAddOpen(true) : requestCloseWizard())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[95vw] w-[95vw] lg:max-w-[1500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add Applicant</DialogTitle>
            <DialogDescription>
              {addPresetJob
                ? `${addPresetJob.department} · Step ${addStep} of 2 — `
                : `Step ${addStep} of 2 — `}
              {addStep === 1
                ? "upload documents and enter applicant details"
                : "review the screening result"}
            </DialogDescription>
          </DialogHeader>

          {addStep === 1 && (
            <div className="space-y-4">
              {/* Department — locked to the clicked job post for admins,
                  free choice of every department for the super admin. */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={addDept}
                  disabled={Boolean(addPresetJob)}
                  onValueChange={(v) => {
                    setAddDept(v);
                    const first = knownPositions.find((p) => p.department === v);
                    setAddForm((f) => ({ ...f, position: first?.title ?? "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {knownDepartments.map((d) => (
                      <SelectItem key={d.code} value={d.name}>
                        <span className="flex items-center gap-2">
                          {d.name}
                          {postingIndicator(d.name) && (
                            <span className="rounded bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-success">
                              Posting
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Applying for — locked to the clicked job post for admins. */}
              <div className="space-y-2">
                <Label>Applying for</Label>
                <Select
                  value={addForm.position}
                  disabled={Boolean(addPresetJob) || addPositions.length === 0}
                  onValueChange={(v) => setAddForm({ ...addForm, position: v })}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        addPositions.length === 0
                          ? "No positions defined for this department"
                          : "Select a position"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {addPositions.map((p) => (
                      <SelectItem key={p.id} value={p.title}>
                        <span className="flex items-center gap-2">
                          {p.title}
                          {postingIndicator(addDept, p.title) && (
                            <span className="rounded bg-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-success">
                              Posting
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                    {addPositions.length === 0 && (
                      <div className="px-2 py-3 text-xs text-muted-foreground">
                        No positions defined for this department.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {!addPresetJob && (
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Position not listed? Create it first in Core HCM → Departments &amp;
                      Positions, then create and publish a job post — applicants can only be added
                      to open postings with remaining slots.
                    </span>
                  </p>
                )}
                {!addPresetJob &&
                  addForm.position !== "" &&
                  addDept !== "" &&
                  !postingIndicator(addDept, addForm.position) && (
                    <p className="flex items-start gap-1.5 text-xs font-medium text-destructive">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        No available job post for {addForm.position} in {addDept} — the posting is
                        closed, in draft, or full. Reopen or publish it before adding applicants.
                      </span>
                    </p>
                  )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input
                    value={addForm.name}
                    placeholder="e.g. Maria Clara Santos"
                    onChange={(e) => setAddForm({ ...addForm, name: sanitizeName(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="e.g. maria.santos@gmail.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact number</Label>
                  <Input
                    placeholder="e.g. 0917 123 4567"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({ ...addForm, phone: sanitizePhone(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    placeholder="e.g. Makati City, Metro Manila"
                    value={addForm.address}
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  />
                </div>
              </div>

              <UnifiedDocumentsUploader
                docs={unifiedDocs}
                onChange={setUnifiedDocs}
                onResumeRecognized={(file) => {
                  // Fires once, only when a file is actually RECOGNIZED as the
                  // resume (not merely the first upload). Details already on
                  // the form are protected by the replace-confirm guard;
                  // otherwise the four fields are filled once, automatically.
                  const hasExistingDetails = [
                    addForm.name,
                    addForm.email,
                    addForm.phone,
                    addForm.address,
                  ].some((v) => v.trim().length > 0);
                  if (hasExistingDetails) {
                    setPendingResume(file);
                    setReplaceOpen(true);
                    return;
                  }
                  void autofillFromResume(file, { overwrite: false });
                }}
                title="Resume + supporting documents"
                hint="Drop the resume + COE + certificates in any order — every file is auto-recognized. Details are filled from the first recognized resume, then you can run resume screening."
              />
              {resumeAutofilling && (
                <p className="text-xs text-muted-foreground">Reading resume — filling contact fields…</p>
              )}
              {/* OLD_RESUME_DROPZONE_REMOVED */}
              {/* Supporting docs auto-split inside the unified box above — no
                  separate verification panel (files persist via verificationDocs). */}

              <DialogFooter className="gap-2">
                <Button
                  disabled={
                    screeningLoading ||
                    // Files are auto-recognized right after upload — wait for
                    // that to settle so the resume pick is always accurate.
                    unifiedDocs.some((d) => d.status === "pending" || d.status === "classifying") ||
                    (!addPresetJob &&
                      addForm.position !== "" &&
                      addDept !== "" &&
                      !postingIndicator(addDept, addForm.position))
                  }
                  onClick={() => {
                    if (!addForm.position) {
                      toast.error(
                        "Select a position first — this department has no defined positions.",
                      );
                      return;
                    }
                    if (!addPresetJob && !postingIndicator(addDept, addForm.position)) {
                      toast.error(
                        `No available job post for ${addForm.position} in ${addDept} — reopen or publish the posting before adding applicants.`,
                      );
                      return;
                    }
                    if (!addForm.name.trim()) {
                      toast.error("Full name is required.");
                      return;
                    }
                    if (!isValidName(addForm.name)) {
                      toast.error(
                        "Full name must contain letters only (no numbers or special symbols).",
                      );
                      return;
                    }
                    if (!addForm.email.trim()) {
                      toast.error("Email address is required.");
                      return;
                    }
                    if (!isValidEmail(addForm.email)) {
                      toast.error(
                        "Please enter a valid formal email address (e.g. name@domain.com).",
                      );
                      return;
                    }
                    if (!addForm.phone.trim()) {
                      toast.error("Contact number is required.");
                      return;
                    }
                    if (!isValidPhone(addForm.phone)) {
                      toast.error("Please enter a valid phone number (7 to 15 digits).");
                      return;
                    }
                    if (!addForm.address.trim()) {
                      toast.error("Address is required.");
                      return;
                    }
                    if (!addFileName && !addResumeFile) {
                      toast.error("Please upload or choose a resume file.");
                      return;
                    }
                    runScreening();
                  }}
                >
                  {screeningLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Screening resume...
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" /> Run resume screening
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {addStep === 2 && screenResult && (
            <div className="space-y-4">
              {/* Applicant strip — mirrors the Review dialog header */}
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                    {addInitials(addForm.name || "Applicant")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-semibold leading-tight">
                      {addForm.name || "Applicant"}
                    </p>
                    <Badge variant="outline" className={statusMeta[screenResult.status].className}>
                      {statusMeta[screenResult.status].label}
                    </Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />{" "}
                      {addForm.position || "Position"}
                    </span>
                    <span className="inline-flex items-center gap-1">{addDept}</span>
                  </p>
                </div>
                {addResumeFile && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-border/70 px-3 py-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 max-w-52">
                      <p className="truncate text-xs font-semibold" title={addFileName}>
                        {addFileName}
                      </p>
                      <p className="text-[0.7rem] text-muted-foreground">
                        {/\.pdf$/i.test(addResumeFile.name)
                          ? "PDF · Resume"
                          : /\.(jpe?g|png)$/i.test(addResumeFile.name) ||
                              addResumeFile.type.startsWith("image/")
                            ? "Image · Resume"
                            : "DOCX · Resume"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[0.7rem]"
                      onClick={() => openLocalFile(addResumeFile)}
                    >
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[0.7rem]"
                      onClick={() => downloadLocalFile(addResumeFile)}
                    >
                      <Download className="mr-1 h-3 w-3" /> Download
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <div className="space-y-4">
                  {(() => {
                    const detail = screenResult.detail;
                    const breakdown = detail?.score_breakdown;
                    const passed = screenResult.score >= passing;
                    const matched =
                      breakdown?.["skills"]?.matched_required ??
                      screenResult.entities.filter((e) => e.label === "SKILL").map((e) => e.value);
                    const missing =
                      breakdown?.["skills"]?.missing_required ?? (matched.length === 0 ? [] : []);
                    const education: string[] =
                      detail?.profile?.education ??
                      screenResult.entities.filter((e) => e.label === "EDU").map((e) => e.value);
                    const yearsExperience =
                      detail?.profile?.estimated_years_experience ??
                      breakdown?.["experience"]?.estimated_years ??
                      null;
                    const educationLabel = shortEducationLabel(education);
                    const profileSkills = detail?.profile?.skills ?? [];
                    const entitySkills = screenResult.entities
                      .filter((e) => e.label === "SKILL")
                      .map((e) => e.value);
                    const panelSkills = (
                      profileSkills.length > 0 ? profileSkills : entitySkills
                    ).slice(0, 12);
                    const recognizedRoles =
                      detail?.profile?.job_roles?.recognized ??
                      detail?.validation?.job_role_analysis?.recognized ??
                      [];
                    const unrecognizedRoles =
                      detail?.profile?.job_roles?.unrecognized ??
                      detail?.validation?.job_role_analysis?.unrecognized ??
                      [];
                    const workExperience = detail?.profile?.work_experience ?? [];
                    const certifications = detail?.profile?.certifications ?? [];
                    const unrecognizedCerts =
                      (detail?.profile as { unrecognized_certifications?: string[] } | undefined)
                        ?.unrecognized_certifications ?? [];
                    const personal = detail?.profile?.personal_information;
                    const personalInfo = {
                      name: personal?.name ?? (addForm.name || null),
                      email: personal?.email ?? (addForm.email || null),
                      phone: personal?.phone ?? (addForm.phone || null),
                    };
                    const rows: ScreeningRequirementRow[] = [
                      ...matched.map((label) => ({
                        label,
                        state: "found" as const,
                        group: "skills" as const,
                        hint: "Detected in resume",
                      })),
                      ...missing.map((label) => ({
                        label,
                        state: "missing" as const,
                        group: "skills" as const,
                        hint: "Not detected in resume",
                      })),
                    ];
                    const expBreak = breakdown?.["experience"];
                    let expMinYears: number | null = expBreak?.min_years_required ?? null;
                    if (expBreak) {
                      const met = !!expBreak.requirement_met;
                      const minYears = expBreak.min_years_required ?? null;
                      rows.push({
                        label: minYears ? `${minYears}+ Years Experience` : "Work Experience",
                        state: met ? "meets" : "missing",
                        group: "experience",
                        hint:
                          yearsExperience !== null
                            ? `Applicant ${yearsExperience} yrs`
                            : met
                              ? "Requirement satisfied"
                              : "Below requirement",
                      });
                    } else if (yearsExperience !== null) {
                      rows.push({
                        label: "2+ Years Experience",
                        state: yearsExperience >= 2 ? "meets" : "missing",
                        group: "experience",
                        hint: `Applicant ${yearsExperience} yrs`,
                      });
                      expMinYears = 2;
                    }
                    const eduBreak = breakdown?.["education"];
                    if (eduBreak && !eduBreak.no_requirements) {
                      const reqLevel =
                        eduBreak.required_level || eduBreak.matched?.[0] || "Bachelor's Degree";
                      const eduMissing = eduBreak.missing ?? [];
                      const eduFound = eduMissing.length === 0;
                      rows.push({
                        label: reqLevel,
                        state: eduFound ? "found" : "missing",
                        group: "education",
                        hint: eduFound
                          ? `Applicant: ${education[0] ?? reqLevel}`
                          : `Required: ${reqLevel}`,
                      });
                    } else if (education.length > 0) {
                      rows.push({
                        label: educationLabel,
                        state: "found",
                        group: "education",
                        hint: `Applicant: ${education[0] ?? educationLabel}`,
                      });
                    }
                    const certBreak = breakdown?.["certifications"];
                    if (certBreak && !certBreak.no_requirements) {
                      (certBreak.matched ?? []).forEach((label) =>
                        rows.push({
                          label,
                          state: "found",
                          group: "certifications",
                          hint: "Detected in resume",
                        }),
                      );
                      (certBreak.missing ?? []).forEach((label) =>
                        rows.push({
                          label,
                          state: "missing",
                          group: "certifications",
                          hint: "Not detected in resume",
                        }),
                      );
                    }
                    const alt = detail?.alternative_job;
                    const addVm = {
                      score: screenResult.score,
                      detail,
                      /* Preview screening has no stored documents yet, so the
                         ranking score equals the resume score here. */
                      resumeScore: detail?.resume_match_score ?? screenResult.score,
                      verification: detail?.document_verification ?? null,
                      matched,
                      missing,
                      rows,
                      skills: panelSkills,
                      skillsRecognized: profileSkills.length > 0,
                      recognizedRoles,
                      unrecognizedRoles,
                      workExperience,
                      education,
                      certifications,
                      unrecognizedCertifications: unrecognizedCerts,
                      personalInfo,
                      yearsExperience,
                      experienceMinYears: expMinYears,
                      educationLabel,
                    };

                    return (
                      <>
                        <ScreeningModalSummary
                          status={screenResult.status}
                          score={screenResult.score}
                          matchedCount={matched.length}
                          missingCount={missing.length}
                          yearsExperience={yearsExperience}
                          educationLabel={educationLabel}
                        />

                        <div className="grid items-stretch gap-4 lg:grid-cols-3">
                          <ResumeInfoPanel
                            title="Key Information Extracted"
                            variant="modal"
                            skills={panelSkills}
                            recognizedRoles={recognizedRoles}
                            unrecognizedRoles={unrecognizedRoles}
                            workExperience={workExperience}
                            education={education}
                            experienceYears={yearsExperience}
                            certifications={certifications}
                            personalInfo={personalInfo}
                            skillsRecognized={profileSkills.length > 0}
                            unrecognizedCertifications={unrecognizedCerts}
                          />
                          <RequirementMatchPanel rows={rows} experienceMinYears={expMinYears} />
                          <ScreeningResumeDocsMatchDetail
                            docs={detail?.preview_documents ?? []}
                            loading={screeningLoading}
                            resumeName={personalInfo.name ?? addForm.name}
                            resumeEducation={education}
                            resumeCertifications={certifications}
                          />
                        </div>

                        {/* Supporting documents staged in this application */}
                        <div className="rounded-xl border border-border bg-card p-5">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                              <FileCheck className="h-4.5 w-4.5 text-primary" /> Supporting Document
                              Verification
                            </h3>
                            <Badge
                              variant="outline"
                              className="border-border bg-secondary text-secondary-foreground"
                            >
                              {verificationDocs.length} document
                              {verificationDocs.length === 1 ? "" : "s"}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                            {detail?.preview_documents && detail.preview_documents.length > 0
                              ? `Checked against the resume in this preview — the ${screenResult.score}% score already includes this evidence. They will be re-verified after the applicant is saved.`
                              : "Proofs staged with this application — they will be verified against the resume after the applicant is saved."}
                          </p>
                          {verificationDocs.length === 0 ? (
                            <p className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                              <Info className="h-4 w-4 shrink-0" /> No verification papers staged.
                              Upload a COE, certificate or credential in Step 2 (optional).
                            </p>
                          ) : (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {verificationDocs.map((d, i) => {
                                const preview =
                                  detail?.preview_documents?.[i] ?? null;
                                const status = preview?.verification_status
                                  ? String(preview.verification_status)
                                  : null;
                                const badgeLabel =
                                  status === "VERIFIED"
                                    ? "Verified"
                                    : status === "DISCREPANCY_FOUND"
                                      ? "Discrepancy"
                                      : status === "PENDING" || status === "PROCESSING"
                                        ? status === "PENDING"
                                          ? "Pending"
                                          : "Checking"
                                        : status === "UNABLE_TO_VERIFY"
                                          ? "Unable to verify"
                                          : "Staged";
                                const badgeClass =
                                  status === "VERIFIED"
                                    ? "border-success/25 bg-success/10 text-success"
                                    : status === "DISCREPANCY_FOUND"
                                      ? "border-warning/30 bg-warning/10 text-warning-foreground"
                                      : "border-border bg-secondary text-muted-foreground";
                                return (
                                <div
                                  key={`${d.docType}-${d.file.name}-${i}`}
                                  className="rounded-lg border border-border/70 p-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                                      <FileText className="h-4 w-4" />
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[0.65rem] ${badgeClass}`}
                                      title={
                                        preview?.verification_result?.summary ??
                                        "Staged with this application"
                                      }
                                    >
                                      {badgeLabel}
                                    </Badge>
                                  </div>
                                  <p
                                    className="mt-2 truncate text-xs font-semibold"
                                    title={d.title}
                                  >
                                    {d.title}
                                  </p>
                                  <p className="truncate text-[0.7rem] text-muted-foreground">
                                    {d.docType} · {d.originalCopy ? "Original" : "Copy"}
                                  </p>
                                  <div className="mt-2 flex gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 flex-1 px-2 text-[0.7rem]"
                                      onClick={() => openLocalFile(d.file)}
                                    >
                                      <Eye className="mr-1 h-3 w-3" /> View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 flex-1 px-2 text-[0.7rem]"
                                      onClick={() => downloadLocalFile(d.file)}
                                    >
                                      <Download className="mr-1 h-3 w-3" /> Download
                                    </Button>
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <ScreeningDetailsAccordion
                          detail={detail}
                          variant="modal"
                          position={addForm.position || "Position"}
                          score={screenResult.score}
                          vm={addVm}
                        />

                        {/* Alternative job recommendation */}
                        {alt && (
                          <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm">
                            <p className="font-medium text-warning">
                              Recommended alternative: {alt.title} (
                              {Math.round(alt.alternative_match_score ?? 0)}%)
                            </p>
                            {alt.reason && (
                              <p className="mt-1 text-xs text-muted-foreground">{alt.reason}</p>
                            )}
                          </div>
                        )}

                        {/* Recommendation */}
                        <div
                          className={cn(
                            "rounded-md border p-3 text-sm",
                            passed
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-destructive/30 bg-destructive/10 text-destructive",
                          )}
                        >
                          <p className="font-medium">
                            {passed
                              ? "Recommendation: Move forward — the applicant is saved to the applicant list for interview scheduling."
                              : "Recommendation: Save for review or refer to a better-matching role in Applicant Management."}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => {
                            toast("Re-running resume analysis…");
                            runScreening();
                          }}
                        >
                          <ScanLine className="mr-2 h-4 w-4" /> Retry analysis
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAddStep(1)}>
                  Back
                </Button>
                <Button onClick={saveNewApplicant}>Save applicant</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONTENT TEMPLATE CONFIRMATION — fill all components */}
      <Dialog open={confirmTemplateOpen} onOpenChange={setConfirmTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Use this template?</DialogTitle>
            <DialogDescription>
              This will fill all components in the builder with &quot;{pendingTemplateJob?.title}
              &quot;
              {pendingTemplateJob ? ` — ${pendingTemplateJob.department}` : ""} data. Missing
              components will be automatically created. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmTemplateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pendingTemplateJob) return;
                const seeded = jobToDraft(pendingTemplateJob);
                setDraft(seeded);
                setBlocks(fullBlocks);
                setEditingJobId(pendingTemplateJob.id);
                setSourceReqId(null);
                setLinkedReqId(null);
                setMode("template");
                setBuilderStarted(true);
                setSavedSnapshot(snapshotOf(seeded, fullBlocks));
                setConfirmTemplateOpen(false);
                toast.success(
                  `Template "${pendingTemplateJob.title}" applied — all components filled`,
                );
              }}
            >
              Fill all components
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI GENERATE CONFIRMATION — replaces the 6 filled content blocks */}
      <Dialog open={confirmGenerateOpen} onOpenChange={setConfirmGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate with AI?</DialogTitle>
            <DialogDescription>
              This will replace the current Job Description, Key Responsibilities, Qualifications,
              Additional Info, Application Instruction and About Company with AI-generated content
              grounded in your screening vocabulary.
              {!lines(draft.skills).length && (
                <>
                  {" "}
                  Screening Requirements are empty, so they get filled from the Reference Data terms
                  the copy uses — the same pass adopts any certificates it names and sets the
                  education / experience levels it asks for. Continue?
                </>
              )}
              {lines(draft.skills).length > 0 && " Continue?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmGenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={generatingDraft}
              onClick={() => {
                setConfirmGenerateOpen(false);
                void runGenerateDraft();
              }}
            >
              {generatingDraft ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM-BEFORE-OVERWRITE — switching positions with existing skills asks first */}
      <Dialog
        open={pendingTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTemplate(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace the requirements already on this post?</DialogTitle>
            <DialogDescription>
              This draft already has screening requirements. Applying “
              {pendingTemplate?.template.name}” for {pendingTemplate?.positionLabel} will
              replace its skills, certifications and education / experience levels with the
              template's.
            </DialogDescription>
          </DialogHeader>
          {pendingTemplate && (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed">
              {(() => {
                const split = (s: string) =>
                  s
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean);
                const key = (s: string) => s.trim().toLowerCase();
                const curSkills = split(draft.skills);
                const curQual = split(draft.qualifications);
                const parts = templateRequirementParts(pendingTemplate.template);

                /* Preview the same sets apply() swaps: every template piece not
                   already on the draft (+), every requirement line on the draft
                   not in the template (−). */
                const curSkillsSet = new Set(curSkills.map(key));
                const tplSkillsSet = new Set(parts.skills.map(key));
                const curQualSet = new Set(curQual.map(key));
                const tplRoleLines = parts.lines.filter((l) => EXPERIENCE_ROLE_LINE_RE.test(l));
                const tplNoteLines = parts.lines.filter(
                  (l) => EDUCATION_NOTE_LINE_RE.test(l) || EXPERIENCE_NOTE_LINE_RE.test(l),
                );
                const tplCertSet = new Set(parts.certifications.map(key));
                const tplRoleSet = new Set(tplRoleLines.map(key));
                const tplNoteSet = new Set(tplNoteLines.map(key));
                const noteLine = (l: string) =>
                  EDUCATION_NOTE_LINE_RE.test(l) || EXPERIENCE_NOTE_LINE_RE.test(l);

                const rows = [
                  {
                    label: "Skills",
                    add: parts.skills.filter((s) => !curSkillsSet.has(key(s))),
                    remove: curSkills.filter((s) => !tplSkillsSet.has(key(s))),
                  },
                  {
                    label: "Certifications",
                    add: parts.certifications.filter((c) => !curQualSet.has(key(c))),
                    remove: curQual.filter(
                      (l) => CERTIFICATION_LINE_RE.test(l) && !tplCertSet.has(key(l)),
                    ),
                  },
                  {
                    label: "Job roles",
                    add: tplRoleLines.filter((l) => !curQualSet.has(key(l))),
                    remove: curQual.filter(
                      (l) => EXPERIENCE_ROLE_LINE_RE.test(l) && !tplRoleSet.has(key(l)),
                    ),
                  },
                  {
                    label: "Education / experience notes",
                    add: tplNoteLines.filter((l) => !curQualSet.has(key(l))),
                    remove: curQual.filter((l) => noteLine(l) && !tplNoteSet.has(key(l))),
                  },
                ].filter((r) => r.add.length > 0 || r.remove.length > 0);

                /* Replacing swaps the accepted level chips for the template's. */
                const levelChanges: { label: string; from: string; to: string }[] = [];
                const levelRow = (
                  label: string,
                  current: string[],
                  incoming: readonly string[],
                ): string => {
                  if (incoming.length === 0) return "";
                  const added = incoming.filter(
                    (l) => !current.some((c) => key(c) === key(l)),
                  );
                  const removed = current.filter(
                    (c) => !incoming.some((l) => key(c) === key(l)),
                  );
                  if (added.length === 0 && removed.length === 0) return "";
                  return [
                    added.length ? `+ ${added.join(", ")}` : "",
                    removed.length ? `− ${removed.join(", ")}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ");
                };
                const educationRow = levelRow(
                  "Education levels",
                  draft.educationLevels,
                  parts.educationLevels,
                );
                const experienceRow = levelRow(
                  "Experience levels",
                  draft.experienceLevels,
                  parts.experienceLevels,
                );
                [
                  { label: "Education levels", text: educationRow },
                  { label: "Experience levels", text: experienceRow },
                ].forEach((r) => {
                  if (r.text) levelChanges.push({ label: r.label, from: "", to: r.text });
                });
                const levelsKept: string[] = [];
                if (parts.educationLevels.length === 0) levelsKept.push("education");
                if (parts.experienceLevels.length === 0) levelsKept.push("experience");

                return (
                  <>
                    {rows.map((r) => (
                      <p key={r.label} className="mt-1 first:mt-0">
                        <span className="font-medium">{r.label}:</span>{" "}
                        {r.add.length > 0 && (
                          <span className="text-success">+ {r.add.join(", ")}</span>
                        )}
                        {r.add.length > 0 && r.remove.length > 0 && " · "}
                        {r.remove.length > 0 && (
                          <span className="text-destructive">− {r.remove.join(", ")}</span>
                        )}
                      </p>
                    ))}
                    {levelChanges.map((c) => (
                      <p key={c.label} className="mt-1">
                        <span className="font-medium">{c.label}:</span> {c.to}
                      </p>
                    ))}
                    {levelsKept.length > 0 && (
                      <p className="mt-1 italic text-muted-foreground">
                        {levelsKept.join(" / ")} level{levelsKept.length === 1 ? "" : "s"} stay
                        unchanged — this template defines none.
                      </p>
                    )}
                    {rows.length === 0 &&
                      levelChanges.length === 0 &&
                      levelsKept.length === 0 && (
                        <p>Nothing on this draft changes — it already matches the template.</p>
                      )}
                  </>
                );
              })()}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                /* Kept requirements are now carried over from the previous
                   role, not handed down by the new position's template — the
                   only case that keeps matching provenance is the same
                   template being re-confirmed. */
                if (appliedTemplate?.template_id !== pendingTemplate?.template.template_id) {
                  setAppliedTemplate(null);
                }
                setPendingTemplate(null);
              }}
            >
              Keep what I have
            </Button>
            <Button
              onClick={() => {
                if (pendingTemplate) {
                  /* True replace: skills, certifications, role lines and the
                     education / experience levels become the template's (the
                     dialog's "+ / −" preview), instead of merging into what is
                     there. */
                  applyRequirementTemplateToDraft(pendingTemplate.template, {
                    replaceRequirements: true,
                  });
                }
                setPendingTemplate(null);
              }}
            >
              Replace with template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GENERATE WITH AI — checklist modal: context read-only, blocks checkable */}
      <Dialog
        open={aiModalOpen}
        onOpenChange={(open) => {
          if (!open) setAiModalOpen(false);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generate with AI</DialogTitle>
            <DialogDescription>
              Tick only what you want written. The values below are always sent as
              context — the AI never writes them, it only writes the prose, grounded on
              them.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Always sent to the AI
            </p>
            <div className="mt-2 grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-xs">
              <span className="text-muted-foreground">Position</span>
              <span className="font-medium">{draft.title || "—"}</span>
              <span className="text-muted-foreground">Department</span>
              <span className="font-medium">{draft.department || "—"}</span>
              {sourceReq && (
                <>
                  <span className="text-muted-foreground">Requested note</span>
                  <span className="leading-relaxed">
                    {sourceReq.justification ? (
                      <span className="italic">“{sourceReq.justification}”</span>
                    ) : (
                      <span className="italic text-muted-foreground">
                        none on {sourceReq.id}
                      </span>
                    )}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">Skills</span>
              <span>
                {(() => {
                  const skillLines = lines(draft.skills);
                  if (skillLines.length) {
                    return (
                      <span className="flex flex-wrap gap-1">
                        {skillLines.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[0.65rem]">
                            {s}
                          </Badge>
                        ))}
                      </span>
                    );
                  }
                  /* No screening requirements on the post: the AI grounds on the
                     Reference Data vocabulary instead — show what it will use. */
                  if (referenceSkillTerms.length) {
                    return (
                      <span className="block space-y-1">
                        <span className="flex flex-wrap gap-1">
                          {referenceSkillTerms.slice(0, 12).map((s) => (
                            <Badge key={s} variant="outline" className="text-[0.65rem]">
                              {s}
                            </Badge>
                          ))}
                          {referenceSkillTerms.length > 12 && (
                            <span className="self-center text-[0.65rem] text-muted-foreground">
                              +{referenceSkillTerms.length - 12} more
                            </span>
                          )}
                        </span>
                        <span className="block text-[0.65rem] italic text-muted-foreground">
                          No screening requirements yet — grounded on {referenceSkillTerms.length}{" "}
                          Reference Data term{referenceSkillTerms.length === 1 ? "" : "s"}. The ones
                          the copy uses are added here when you generate, along with any certificate
                          it names and the education / experience levels it asks for.
                        </span>
                      </span>
                    );
                  }
                  return <span className="italic text-muted-foreground">none</span>;
                })()}
              </span>
              <span className="text-muted-foreground">Certificate</span>
              <span>
                {(() => {
                  const certs = lines(draft.qualifications).filter((l) =>
                    CERTIFICATION_LINE_RE.test(l),
                  );
                  return certs.length ? (
                    <span className="flex flex-wrap gap-1">
                      {certs.map((c) => (
                        <Badge key={c} variant="secondary" className="text-[0.65rem]">
                          {c}
                        </Badge>
                      ))}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground">none</span>
                  );
                })()}
              </span>
              <span className="text-muted-foreground">Education</span>
              <span className="font-medium">
                {draft.educationLevels.length ? draft.educationLevels.join(" or ") : "—"}
              </span>
              <span className="text-muted-foreground">Experience</span>
              <span className="font-medium">
                {draft.experienceLevels.length ? draft.experienceLevels.join(" or ") : "—"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Choose what to generate
          </p>
          <div className="space-y-2">
            {(
              [
                ["description", "Job Description", "e.g. warm and service-led, not corporate"],
                ["responsibilities", "Key Responsibilities", "e.g. keep duties to guest-facing work, 6 lines"],
                ["qualifications", "Qualifications", "e.g. repeat the required certificates verbatim"],
                ["additional", "Additional Info", "e.g. list perks and shift details, skip anything we cannot promise"],
                ["instructions", "Application Instruction", "e.g. mention walk-in at the HR Office"],
                ["about", "About Company", "e.g. two sentences, no history lecture"],
              ] as const
            ).map(([key, label, ph]) => (
              <div
                key={key}
                className={`grid grid-cols-[170px_1fr] items-center gap-2 ${aiChecked[key] ? "" : "opacity-50"}`}
              >
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <Checkbox
                    checked={aiChecked[key] ?? false}
                    onCheckedChange={(v) => setAiChecked((p) => ({ ...p, [key]: v === true }))}
                  />
                  {label}
                </label>
                <Input
                  className="h-8 text-xs"
                  placeholder={ph}
                  value={aiNotes[key] ?? ""}
                  onChange={(e) => setAiNotes((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          {aiReport.length > 0 && (
            <div className="mt-3 space-y-1.5 rounded-lg border border-border/60 p-3">
              {aiReport.map((r) => (
                <div key={r.block} className="flex items-baseline gap-2 text-xs">
                  <span className="w-36 shrink-0 text-muted-foreground">{r.label}</span>
                  <span>
                    {r.detail}
                    {r.reused.length > 0 && (
                      <ul className="mt-0.5 list-disc pl-4 text-[0.7rem] text-muted-foreground">
                        {r.reused.map((t) => (
                          <li key={t}>
                            {r.reusedPrefix ?? "✓ reused a term from your skills"} →{" "}
                            <span className="font-medium text-foreground">{t}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </span>
                </div>
              ))}
              <div className="flex items-baseline gap-2 pt-1 text-xs">
                <span className="w-36 shrink-0 text-muted-foreground">Left alone</span>
                <span className="text-muted-foreground">
                  {AI_CONTENT_BLOCKS.filter((b) => !aiChecked[b])
                    .map((b) => blockLibrary.find((x) => x.id === b)?.label ?? b)
                    .join(", ") || "nothing"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <span className="mr-auto text-[0.65rem] text-muted-foreground">
              {lines(draft.skills).length
                ? "Grounded in your screening requirements and vocabulary"
                : referenceSkillTerms.length
                  ? "Grounded in the Reference Data vocabulary — screening requirements get filled from it"
                  : "Grounded in your vocabulary"}
              {aiUsage ? ` · ${aiUsage.used_today} draft(s) today` : ""}
            </span>
            <Button variant="outline" onClick={() => setAiModalOpen(false)}>
              Close
            </Button>
            <Button
              disabled={
                generatingDraft || !AI_CONTENT_BLOCKS.some((b) => aiChecked[b])
              }
              onClick={() => void runGenerateDraft()}
            >
              {generatingDraft ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {generatingDraft ? "Generating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REMOVE BLOCK CONFIRMATION — only when the block holds user content */}
      <Dialog
        open={pendingRemoveBlock !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoveBlock(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Remove {blockLibrary.find((b) => b.id === pendingRemoveBlock)?.label ?? "block"}?
            </DialogTitle>
            <DialogDescription>
              This component has text in it. Removing it will also delete that text. To keep the
              text, cancel and copy it elsewhere first.
            </DialogDescription>
          </DialogHeader>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground hover:border-primary/40">
            <Checkbox checked={removeForAll} onCheckedChange={(v) => setRemoveForAll(v === true)} />
            Do this for all deletes this session (don&apos;t ask again until reload)
          </label>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingRemoveBlock(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveBlock}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove & clear text
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REPLACE DETAILS CONFIRMATION (resume upload over existing data) */}
      <Dialog
        open={replaceOpen}
        onOpenChange={(o) => {
          if (!o) {
            setPendingResume(null);
            setReplaceOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="min-w-0">
            <DialogTitle>Replace applicant details?</DialogTitle>
            <DialogDescription
              className="min-w-0 max-w-full break-words"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
              The form already has details entered. Using "
              <span
                className="break-words"
                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
              >
                {pendingResume?.name ?? "this resume"}
              </span>
              " — recognized as a resume — will overwrite Full name, Email, Contact number and
              Address with the values extracted from it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPendingResume(null);
                setReplaceOpen(false);
              }}
            >
              Keep current details
            </Button>
            <Button
              onClick={() => {
                const file = pendingResume;
                setPendingResume(null);
                setReplaceOpen(false);
                if (file) applyResumeFile(file);
              }}
            >
              Replace details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM EXIT STEP 2 WITH FILLED DATA — Back/X with unsaved fill-up */}
      <Dialog
        open={confirmStep2ExitOpen}
        onOpenChange={(o) => {
          if (!o) handleConfirmStep2Stay();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard filled information?</DialogTitle>
            <DialogDescription>
              You have unsaved information in Full name, Email, Contact number or Address
              {addFileName ? ` (file "${addFileName}")` : ""}. If you exit, your fill-up will be
              removed. Stay will keep your data and stay in Step 1.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleConfirmStep2Stay}>
              Stay
            </Button>
            <Button variant="destructive" onClick={handleConfirmStep2Discard}>
              Discard & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SCREENING SETUP DIALOG — moved from Applicant Management header */}
      <Dialog open={screeningOpen} onOpenChange={setScreeningOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-4xl">
          <Tabs
            value={screeningTab}
            onValueChange={setScreeningTab}
            className="flex min-h-0 w-full flex-1 flex-col"
          >
            {/* Header + live NLP service status */}
            <div className="border-b border-border px-6 pb-4 pt-6">
              <DialogHeader className="space-y-0 text-left">
                <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                  <div className="min-w-0">
                    <DialogTitle className="flex items-center gap-2 font-display text-2xl">
                      <ScanLine className="h-5 w-5 text-primary" /> Screening Setup
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      Requirements, scoring and vocabulary used by every screening run.
                    </DialogDescription>
                  </div>
                  <span
                    title={
                      nlpStatus === null
                        ? "Checking the NLP service…"
                        : nlpStatus.online
                          ? `NLP service: ${nlpStatus.base_model ?? "spaCy"}${nlpStatus.custom_ner_loaded ? " · custom NER loaded" : " · custom NER not loaded"}`
                          : "Resume screening fails until the NLP service is running on port 8001."
                    }
                    className={cn(
                      "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium",
                      nlpStatus && !nlpStatus.online
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-border bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        nlpStatus === null
                          ? "bg-muted-foreground"
                          : nlpStatus.online
                            ? "bg-success"
                            : "bg-destructive animate-pulse",
                      )}
                    />
                    {nlpStatus === null
                      ? "Checking NLP…"
                      : nlpStatus.online
                        ? "NLP online"
                        : "NLP offline"}
                  </span>
                </div>
              </DialogHeader>

              <TabsList className="mt-4">
                {[
                  { value: "templates", label: "Requirement Templates", icon: ClipboardList },
                  { value: "scoring", label: "Scoring", icon: Sliders },
                  { value: "reference", label: "Reference Data", icon: Database },
                  { value: "reported", label: "Reported Entities", icon: Flag },
                ].map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="flex flex-1 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm cursor-pointer"
                  >
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Scrollable tab content */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <TabsContent value="scoring" className="mt-0">
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  {/* Criteria weights */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold">Criteria weights</h3>
                      <p className="text-xs text-muted-foreground">
                        How much each criterion contributes to the match score. Enabled weights must
                        total 100%.
                      </p>
                    </div>
                    {criteria.map((c, idx) => (
                      <div
                        key={c.name}
                        className={cn(
                          "rounded-md border p-3 transition-colors",
                          c.enabled ? "border-border" : "border-dashed border-border bg-muted/30",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex min-w-0 cursor-pointer items-center gap-2">
                            <Switch
                              checked={c.enabled}
                              onCheckedChange={(v) =>
                                setCriteria((prev) =>
                                  prev.map((x, i) => (i === idx ? { ...x, enabled: v } : x)),
                                )
                              }
                            />
                            <span
                              className={cn(
                                "truncate text-sm font-medium",
                                !c.enabled && "text-muted-foreground line-through",
                              )}
                            >
                              {c.name}
                            </span>
                          </label>
                          <span
                            className={cn(
                              "font-display text-base font-semibold tabular-nums",
                              c.enabled ? "text-primary" : "text-muted-foreground",
                            )}
                          >
                            {c.weight}%
                          </span>
                        </div>
                        <Slider
                          className="mt-2.5"
                          value={[c.weight]}
                          max={100}
                          step={5}
                          disabled={!c.enabled}
                          onValueChange={(v) =>
                            setCriteria((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, weight: v[0] ?? x.weight } : x,
                              ),
                            )
                          }
                        />
                      </div>
                    ))}
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium",
                        totalWeight === 100
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-destructive/40 bg-destructive/10 text-destructive",
                      )}
                    >
                      <span>Total weight</span>
                      <span className="font-display text-sm tabular-nums">{totalWeight}%</span>
                    </div>
                  </div>

                  {/* Thresholds + preview */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold">Passing thresholds</h3>
                      <p className="text-xs text-muted-foreground">
                        Cut-offs that decide how a screened resume is classified.
                      </p>
                    </div>

                    <div className="space-y-2 rounded-md border border-border p-3">
                      <div className="flex items-baseline justify-between">
                        <Label className="text-xs">Passing score</Label>
                        <span className="font-display text-sm font-semibold text-primary tabular-nums">
                          {passing}%
                        </span>
                      </div>
                      <Slider
                        value={[passing]}
                        max={100}
                        step={1}
                        onValueChange={(v) => setPassing(v[0] ?? passing)}
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        At or above this score, a resume is “Perfect for the Job” when mandatory
                        requirements are met.
                      </p>
                    </div>

                    <div className="space-y-2 rounded-md border border-border p-3">
                      <div className="flex items-baseline justify-between">
                        <Label className="text-xs">Required-skills coverage</Label>
                        <span className="font-display text-sm font-semibold text-primary tabular-nums">
                          {coverageMin}%
                        </span>
                      </div>
                      <Slider
                        value={[coverageMin]}
                        max={100}
                        step={5}
                        onValueChange={(v) => setCoverageMin(v[0] ?? coverageMin)}
                      />
                      <p className="text-[0.7rem] text-muted-foreground">
                        Minimum share of the job post&apos;s required skills needed to pass.
                      </p>
                    </div>

                    {/* How scoring works — quick reference */}
                    <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">How a resume is scored</p>
                      <ol className="list-decimal space-y-1 pl-4">
                        <li>Text is extracted (PDF/DOCX/OCR) and entities are tagged.</li>
                        <li>Entities are matched against the job post&apos;s requirements.</li>
                        <li>Weighted criteria add up to the match score.</li>
                        <li>
                          Thresholds decide the result:{" "}
                          <span className="font-medium text-foreground">Perfect for the Job</span>,{" "}
                          <span className="font-medium text-foreground">Fit for other Job</span>,{" "}
                          <span className="font-medium text-foreground">Invalid credential</span> or{" "}
                          <span className="font-medium text-foreground">Not fitted to Job</span>.
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="mt-0">
                <RequirementTemplateManager
                  templates={requirementTemplates}
                  loading={templatesLoading}
                  error={templatesError}
                  positions={knownPositions}
                  refValues={refValues}
                  refOptions={refOptions}
                  busyId={templateBusyId}
                  onReload={loadRequirementTemplates}
                  onToggleActive={toggleRequirementTemplate}
                  onUseTemplate={applyRequirementTemplateToDraft}
                  onAddToVocabulary={addTermToVocabulary}
                />
              </TabsContent>

              <TabsContent value="reference" className="mt-0">
                <ScreeningReferenceManager />
              </TabsContent>

              <TabsContent value="reported" className="mt-0">
                <ReportedEntitiesManager />
              </TabsContent>
            </div>

            {/* Footer — sticky save bar, only where there is something to save */}
            {screeningTab === "scoring" && (
              <div className="border-t border-border bg-muted/30 px-6 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[0.7rem] text-muted-foreground">
                    Applies to every new screening after saving.
                  </p>
                  <Button
                    className="cursor-pointer"
                    disabled={savingConfig || totalWeight !== 100}
                    onClick={saveScreeningConfiguration}
                  >
                    {savingConfig ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Sliders className="mr-2 h-4 w-4" /> Save configuration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

    </div>
  );
}
