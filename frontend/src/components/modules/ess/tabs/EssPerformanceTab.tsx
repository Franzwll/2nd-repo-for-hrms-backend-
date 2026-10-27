import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Lock,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CardSkeleton, StatCardsSkeleton } from "@/components/ui/loading-skeletons";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { myPerformance, myLearningCourses, myProfile } from "@/data/ess";
import { LmsCertificateModal } from "@/components/modules/ess/modals/LmsCertificateModal";
import { LmsActivityPlayer } from "@/components/modules/ess/modals/LmsActivityPlayer";
import { essApi } from "@/lib/api";

// Card visuals: soft tinted tiles in light mode, dark geometric tiles in dark mode.
const COURSE_THEMES = [
  "border-amber-200/80 from-amber-50 via-orange-50 to-yellow-100 dark:border-transparent dark:from-[#6b5320] dark:via-[#4a3a16] dark:to-[#2a230f]", // gold/brown
  "border-slate-200/80 from-slate-50 via-slate-100 to-slate-200 dark:border-transparent dark:from-[#4b5563] dark:via-[#374151] dark:to-[#1f2937]", // graphite
  "border-rose-200/80 from-rose-50 via-pink-50 to-fuchsia-100 dark:border-transparent dark:from-[#7a2f4a] dark:via-[#5c2238] dark:to-[#3a1624]", // magenta/maroon
  "border-teal-200/80 from-teal-50 via-emerald-50 to-cyan-100 dark:border-transparent dark:from-[#2f6b6b] dark:via-[#234f4f] dark:to-[#163333]", // teal
];

function courseTheme(index: number) {
  return COURSE_THEMES[index % COURSE_THEMES.length];
}

// Stable, human-readable category IDs for the LMS cards.
const CATEGORY_IDS: Record<string, string> = {
  "culinary & safety": "cul101",
  "service quality": "ser101",
  compliance: "com101",
};

function categoryId(category: unknown): string {
  const key = String(category ?? "")
    .trim()
    .toLowerCase();
  if (!key) return "gen101";
  return (
    CATEGORY_IDS[key] ??
    `${key.replace(/[^a-z0-9]/g, "").slice(0, 3) || "gen"}101`
  );
}

function courseProgress(c: any): number {
  if (typeof c?.progress === "number") return Math.max(0, Math.min(100, c.progress));
  const s = String(c?.status ?? "").toLowerCase();
  if (s.includes("complet")) return 100;
  if (s.includes("progress") || s.includes("continu")) return 45;
  return 0;
}

// Specific time-bound categories — compliance-type modules must be taken in a fixed window.
const URGENT_CATEGORIES = ["compliance", "safety", "mandatory", "certification", "haccp", "fire"];

function urgentReason(c: any): string | null {
  const status = String(c?.status ?? "").toLowerCase();
  if (status.includes("complet")) return null;
  const cat = String(c?.category ?? "").toLowerCase();
  if (URGENT_CATEGORIES.some((k) => cat.includes(k)))
    return "Time-bound requirement — complete before deadline";
  if (status.includes("assign")) return "Not yet started";
  if (courseProgress(c) === 0) return "Not yet started";
  return null;
}

function isCourseUrgent(c: any): boolean {
  return urgentReason(c) !== null;
}

export function EssPerformanceTab() {
  const [courses, setCourses] = useState<any[]>(myLearningCourses);
  const [loading, setLoading] = useState(true);
  const [perfData, setPerfData] = useState<{
    rating: number | null;
    competencyLevel: string | null;
    averageScore: number | null;
    completedCount: number;
    totalCount: number;
  }>({
    rating: 4.8,
    competencyLevel: "Proficient (Exceeding Expectations)",
    averageScore: 95,
    completedCount: 3,
    totalCount: 4,
  });

  // The module detail replaces the materials grid, so handbook and quiz can be
  // presented as two separate destinations instead of tabs.
  const [detailCourse, setDetailCourse] = useState<any | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [certCourse, setCertCourse] = useState<any | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerCourse, setPlayerCourse] = useState<any | null>(null);
  const [playerMode, setPlayerMode] = useState<"handbook" | "quiz">("handbook");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filterCourses = (list: any[], query: string, filter: string) => {
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      if (filter === "urgent" && !isCourseUrgent(c)) return false;
      if (filter !== "all" && filter !== "urgent") {
        if (String(c?.status ?? "").toLowerCase() !== filter.toLowerCase()) return false;
      }
      if (!q) return true;
      return (
        String(c?.title ?? "")
          .toLowerCase()
          .includes(q) ||
        String(c?.category ?? "")
          .toLowerCase()
          .includes(q) ||
        String(c?.status ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  };

  const filteredCourses = useMemo(
    () => filterCourses(courses, search, statusFilter),
    [courses, search, statusFilter],
  );

  // The module detail only lists courses that belong to the same category as
  // the course the user opened.
  const detailModules = useMemo(() => {
    if (!detailCourse) return courses;
    const category = String(detailCourse.category ?? "")
      .trim()
      .toLowerCase();
    if (!category) return courses;
    return courses.filter(
      (c) => String(c.category ?? "").trim().toLowerCase() === category,
    );
  }, [courses, detailCourse]);

  // Canonical backend mapping, reused by the initial load and refetches.
  // Nulls mean "no record yet" (never reviewed / never scored) — the UI
  // renders placeholders instead of mock figures in that case.
  const mapCourses = (res: any) =>
    (res?.courses ?? []).map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      progress: c.progress,
      status: c.status as any,
      score: c.score != null ? `${c.score} / 100` : "—",
      duration: c.duration,
      completedDate: c.completedDate || "In progress",
      // Tier-1 LMS: reading gate + card parity (pages / read-time / mandatory).
      reading_completed_at: c.reading_completed_at ?? null,
      estimated_reading_minutes: c.estimated_reading_minutes ?? null,
      estimated_pages: c.estimated_pages ?? null,
      mandatory: Boolean(c.mandatory),
      // A failed quiz is final: the card must stop advertising "Ready to take".
      quiz_failed: Boolean(c.quiz_failed),
    }));

  const applyPerformance = (res: any) => {
    if (!res) return;
    const mapped = mapCourses(res);
    setCourses(mapped);
    setDetailCourse((prev: any | null) =>
      prev ? (mapped.find((c: any) => c.id === prev.id) ?? null) : null,
    );
    if (res.stats && res.employee) {
      setPerfData({
        rating: res.employee.overall_rating ?? null,
        competencyLevel: res.employee.competency_level ?? null,
        averageScore: res.stats.average_score ?? null,
        completedCount: res.stats.completed_courses ?? 0,
        totalCount: (res.courses ?? []).length,
      });
    }
  };

  useEffect(() => {
    essApi
      .myPerformance()
      .then(applyPerformance)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleOpenCert = (course: any) => {
    setCertCourse(course);
    setCertModalOpen(true);
  };

  const handleOpenPlayer = (course: any, mode: "handbook" | "quiz") => {
    setPlayerCourse(course);
    setPlayerMode(mode);
    setPlayerOpen(true);
  };

  const openModuleDetail = (course: any) => {
    setDetailCourse(course);
    setOpenModuleId(course.id);
  };

  const closeModuleDetail = () => {
    setDetailCourse(null);
    setOpenModuleId(null);
  };

  const handlePlayerCompleted = () => {
    essApi
      .myPerformance()
      .then(applyPerformance)
      .catch(() => {});
  };

  // Refetch first so the certificate renders the fresh score + completion date.
  const handleViewCertificate = async (courseCode: string) => {
    const res = await essApi.myPerformance().catch(() => null);
    if (res) applyPerformance(res);
    const fresh = (mapCourses(res) as any[]).find((c) => c.id === courseCode) ?? playerCourse;
    if (fresh) handleOpenCert(fresh);
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading performance">
        <StatCardsSkeleton count={4} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/70 shadow-xs">
              <CardContent className="p-5">
                <CardSkeleton rows={4} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Performance Metric Cards (hidden in the focused module view) */}
      {!detailCourse && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-4">
              <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> Last Performance Review
              </div>
              <p className="mt-1 text-sm font-bold text-foreground">Annual Review 2026</p>
              <p className="text-xs text-muted-foreground mt-1">
                Next scheduled review: <strong className="text-foreground">Dec 15, 2026</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-4">
              <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-primary" /> Competency Rating
              </div>
              <p className="mt-1 text-sm font-bold text-foreground">
                {perfData.competencyLevel ?? "Not yet rated"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average Evaluation Score:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {perfData.averageScore != null ? `${perfData.averageScore} / 100` : "—"}
                </strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-4">
              <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> LMS Training Progress
              </div>
              <p className="mt-1 text-sm font-bold text-foreground">
                {perfData.completedCount} of {perfData.totalCount} Completed
              </p>
              <Progress
                value={(perfData.completedCount / Math.max(1, perfData.totalCount)) * 100}
                className="mt-2 h-1.5"
              />
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-4">
              <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-primary" /> Salary Grade &amp; Step
              </div>
              <p className="mt-1 text-sm font-bold text-foreground">
                {myPerformance.salaryGrade} · {myPerformance.salaryStep}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Current: {myProfile.position}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {detailCourse ? (
        /* ---------------- Module list: each module expands to handbook + quiz ---------------- */
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={closeModuleDetail}
              className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-amber-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Learning Materials
            </button>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">{detailCourse.category}</span>
          </div>

          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Learning Modules
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {detailModules.length} {detailModules.length === 1 ? "module" : "modules"} in{" "}
              <span className="font-medium text-foreground">{detailCourse.category}</span>. Select a
              module to open its handbook or quiz.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
            <div className="divide-y divide-border/60">
              {detailModules.map((course) => {
                const isOpen = openModuleId === course.id;
                const done = String(course.status ?? "")
                  .toLowerCase()
                  .includes("complet");
                const read = Boolean(course.reading_completed_at);
                const quizFailed = Boolean(course.quiz_failed) && !done;

                return (
                  <div key={course.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => {
                        setOpenModuleId(isOpen ? null : course.id);
                        if (!isOpen) setDetailCourse(course);
                      }}
                      className="group flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30 sm:px-6"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isOpen
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border/70 bg-muted text-muted-foreground"
                        }`}
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground group-hover:text-primary">
                          {course.title}
                        </span>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border/60 bg-muted/10 px-5 pb-1 sm:px-6">
                        <div className="divide-y divide-border/60">
                          {/* Handbook */}
                          <button
                            type="button"
                            onClick={() => handleOpenPlayer(course, "handbook")}
                            className="group flex w-full cursor-pointer items-start gap-4 py-4 text-left transition-colors hover:bg-muted/30"
                          >
                            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary">
                                Handbook
                              </p>
                              <p className="mt-1 text-xs italic text-muted-foreground">
                                {read
                                  ? "Reading completed. Open the handbook anytime for review."
                                  : "Read the learning material to unlock the quiz."}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                {course.estimated_reading_minutes != null && (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> ~
                                    {course.estimated_reading_minutes} min read
                                  </span>
                                )}
                                {course.estimated_pages != null && (
                                  <span className="inline-flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> {course.estimated_pages} pages
                                  </span>
                                )}
                                {course.mandatory && (
                                  <span className="font-semibold text-red-600">Mandatory</span>
                                )}
                                {read && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                                    <CheckCircle2 className="h-3 w-3" /> Read
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </button>

                          {/* Quiz */}
                          <button
                            type="button"
                            disabled={!read && !done}
                            onClick={() => {
                              if (done) handleOpenCert(course);
                              else handleOpenPlayer(course, "quiz");
                            }}
                            title={!read && !done ? "Read the handbook first" : undefined}
                            className="group flex w-full cursor-pointer items-start gap-4 py-4 text-left transition-colors hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground group-hover:text-primary">
                                Quiz
                              </p>
                              <p className="mt-1 text-xs italic text-muted-foreground">
                                {done
                                  ? "Assessment completed. Open your result and certificate."
                                  : quizFailed
                                    ? "Assessment not passed. Retakes are not allowed — the handbook stays available for review."
                                    : read
                                      ? "Answer the assessment to complete this module."
                                      : "Locked — read the handbook first to unlock the quiz."}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                {done ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                                    <CheckCircle2 className="h-3 w-3" /> Passed
                                    {course.score !== "—" ? ` · ${course.score}` : ""}
                                  </span>
                                ) : quizFailed ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                                    <Lock className="h-3 w-3" /> Not passed · Retakes locked
                                  </span>
                                ) : read ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                                    <ShieldCheck className="h-3 w-3" /> Ready to take
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <Lock className="h-3 w-3" /> Locked
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ---------------- Learning materials list ---------------- */
        <Card className="border-border/70 shadow-xs">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" /> Learning Materials
                </h2>
                <p className="text-xs text-muted-foreground">
                  {filteredCourses.length} of {courses.length} modules · {perfData.completedCount}{" "}
                  completed
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[9rem] flex-1 sm:w-52 sm:flex-none">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search modules…"
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-[8.5rem] shrink-0 text-xs">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="urgent">Due soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                No training courses assigned yet — HR will assign your learning plan.
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                No modules match “{search}”
                {statusFilter !== "all"
                  ? ` with status “${statusFilter === "urgent" ? "Due soon" : statusFilter}”`
                  : ""}
                .{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((c) => {
                  const i = courses.indexOf(c);
                  const pct = courseProgress(c);
                  return (
                    <div
                      key={c.id}
                      className={`group relative flex min-h-[260px] flex-col justify-between rounded-xl border bg-gradient-to-br ${courseTheme(i)} p-5 text-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:text-white`}
                    >
                      {/* geometric overlay */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-50 dark:opacity-25">
                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[10px] border-foreground/10 dark:border-white/15" />
                        <div className="absolute right-10 top-16 h-16 w-16 rotate-45 border-[6px] border-foreground/[0.08] dark:border-white/10" />
                        <div
                          className="absolute -left-6 bottom-10 h-24 w-24 rotate-12 bg-foreground/[0.04] dark:bg-white/[0.06]"
                          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
                        />
                      </div>
                      <div className="relative">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground dark:text-white/60">
                          {c.status}
                        </p>
                      </div>
                      <div className="relative">
                        <p
                          className="text-xl font-extrabold leading-tight tracking-tight text-foreground dark:text-white"
                          title={c.title}
                        >
                          {c.category || "General"}
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground dark:text-white/75">
                          Category ID:{" "}
                          <span className="font-mono">{categoryId(c.category)}</span>
                        </p>
                      </div>
                      <div className="relative space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground/80 dark:text-white/90">
                          <span className="inline-flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                            <span>{pct}% complete</span>
                          </span>
                          <span className="font-mono text-muted-foreground dark:text-white/80">
                            {c.score}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10 dark:bg-black/50">
                          <div
                            className="h-full rounded-full bg-primary transition-all dark:bg-white/90"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => openModuleDetail(c)}
                          className="mt-1 w-full cursor-pointer rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
                        >
                          Open Module →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Single-stage LMS player: handbook and quiz open independently. */}
      {playerCourse && (
        <LmsActivityPlayer
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          courseId={playerCourse.id}
          courseTitle={playerCourse.title}
          category={playerCourse.category}
          mode={playerMode}
          onCompleted={handlePlayerCompleted}
          onViewCertificate={handleViewCertificate}
          onOpenHandbook={() => setPlayerMode("handbook")}
        />
      )}

      {/* Certificate Modal */}
      {certCourse && (
        <LmsCertificateModal
          open={certModalOpen}
          onOpenChange={setCertModalOpen}
          courseId={certCourse.id}
          courseTitle={certCourse.title}
          category={certCourse.category}
          completedDate={certCourse.completedDate}
          score={certCourse.score}
        />
      )}
    </div>
  );
}
