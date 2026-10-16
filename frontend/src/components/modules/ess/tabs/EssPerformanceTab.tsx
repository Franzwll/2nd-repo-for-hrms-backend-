import { useState, useEffect, useMemo } from "react";
import { Award, BookOpen, Building, CheckCircle2, TrendingUp, Sparkles, Send, ShieldCheck, Clock, LayoutDashboard, ScrollText, Menu, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { myPerformance, myLearningCourses, myProfile } from "@/data/ess";
import { LmsCertificateModal } from "@/components/modules/ess/modals/LmsCertificateModal";
import { PromotionRequestModal } from "@/components/modules/ess/modals/PromotionRequestModal";
import { essApi } from "@/lib/api";
import { toast } from "sonner";

// Card visuals matching LMS reference (Big Data / Capstone / IT Elective / OJT):
// dark geometric gradient tiles, white title, category subtitle, bottom % bar.
const COURSE_THEMES = [
  "from-[#6b5320] via-[#4a3a16] to-[#2a230f]", // gold/brown
  "from-[#4b5563] via-[#374151] to-[#1f2937]", // graphite
  "from-[#7a2f4a] via-[#5c2238] to-[#3a1624]", // magenta/maroon
  "from-[#2f6b6b] via-[#234f4f] to-[#163333]", // teal
];

function courseTheme(index: number) {
  return COURSE_THEMES[index % COURSE_THEMES.length];
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
  if (URGENT_CATEGORIES.some((k) => cat.includes(k))) return "Time-bound requirement — complete before deadline";
  if (status.includes("assign")) return "Not yet started";
  if (courseProgress(c) === 0) return "Not yet started";
  return null;
}

function isCourseUrgent(c: any): boolean {
  return urgentReason(c) !== null;
}

export function EssPerformanceTab() {
  const [courses, setCourses] = useState(myLearningCourses);
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
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [activePromotionRequest, setActivePromotionRequest] = useState<any | null>(null);
  // Tabbed bottom section — promotion card above stays in place
  const [activeTab, setActiveTab] = useState<"overview" | "materials" | "assessment" | "audit">("overview");
  const [perfAudit, setPerfAudit] = useState<any[]>([]);
  const [startingCourseId, setStartingCourseId] = useState<string | null>(null);
  // Top-right filtering for Materials + Assessment cards
  const [materialsSearch, setMaterialsSearch] = useState("");
  const [materialsStatus, setMaterialsStatus] = useState("all");
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentStatus, setAssessmentStatus] = useState("all");

  const filterCourses = (list: any[], query: string, statusFilter: string) => {
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      if (statusFilter === "urgent" && !isCourseUrgent(c)) return false;
      if (statusFilter !== "all" && statusFilter !== "urgent") {
        if (String(c?.status ?? "").toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      if (!q) return true;
      return (
        String(c?.title ?? "").toLowerCase().includes(q) ||
        String(c?.category ?? "").toLowerCase().includes(q) ||
        String(c?.status ?? "").toLowerCase().includes(q)
      );
    });
  };

  const filteredMaterials = useMemo(
    () => filterCourses(courses, materialsSearch, materialsStatus),
    [courses, materialsSearch, materialsStatus]
  );
  const filteredAssessments = useMemo(
    () => filterCourses(courses, assessmentSearch, assessmentStatus),
    [courses, assessmentSearch, assessmentStatus]
  );

  useEffect(() => {
    // Check if there are active promotion requests on file
    essApi
      .myRequests()
      .then((res) => {
        if (res?.requests?.length) {
          const promo = res.requests.find((r) =>
            r.type?.toLowerCase().includes("promotion") ||
            r.category?.toLowerCase().includes("career")
          );
          if (promo) {
            setActivePromotionRequest(promo);
          }
          const perfItems = res.requests
            .filter((r) =>
              r.category?.toLowerCase().includes("performance") ||
              r.category?.toLowerCase().includes("career") ||
              r.category?.toLowerCase().includes("learning") ||
              r.type?.toLowerCase().includes("promotion") ||
              r.type?.toLowerCase().includes("course") ||
              r.type?.toLowerCase().includes("training")
            )
            .map((r) => ({
              id: r.id,
              date: r.filed,
              type: r.type,
              status: r.status,
              details: r.details,
            }));
          if (perfItems.length > 0) setPerfAudit(perfItems);
        }
      })
      .catch(() => {});
  }, []);

  // Canonical backend mapping, reused by the initial load and refetches.
  // Nulls mean "no record yet" (never reviewed / never scored) — the UI
  // renders placeholders instead of mock figures in that case.
  const applyPerformance = (res: any) => {
    if (!res) return;
    setCourses(
      (res.courses ?? []).map((c: any) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        progress: c.progress,
        status: c.status as any,
        score: c.score != null ? `${c.score} / 100` : "—",
        duration: c.duration,
        completedDate: c.completedDate || "In progress",
      }))
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
      .catch(() => {});
  }, []);

  // Start / resume a course — real write (Assigned -> In Progress), then refetch.
  // Completion itself is HR-verified on the Admin side.
  const handleStartCourse = async (course: any) => {
    if (!course?.id || startingCourseId) return;
    setStartingCourseId(course.id);
    try {
      await essApi.updateLearningProgress({ course_code: course.id });
      const res = await essApi.myPerformance().catch(() => null);
      applyPerformance(res);
      toast.success(`"${course.title}" marked as in progress.`);
    } catch (err: any) {
      toast.error(err?.message || "Could not update course status — please retry.");
    } finally {
      setStartingCourseId(null);
    }
  };

  const handleOpenCert = (course: any) => {
    setSelectedCourse(course);
    setCertModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Performance Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Last Performance Review
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">Annual Review 2026</p>
            <p className="text-xs text-muted-foreground mt-1">Next scheduled review: <strong className="text-foreground">Dec 15, 2026</strong></p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" /> Competency Rating
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">{perfData.competencyLevel ?? "Not yet rated"}</p>
            <p className="text-xs text-muted-foreground mt-1">Average Evaluation Score: <strong className="text-emerald-600 dark:text-emerald-400">{perfData.averageScore != null ? `${perfData.averageScore} / 100` : "—"}</strong></p>
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
            <Progress value={(perfData.completedCount / Math.max(1, perfData.totalCount)) * 100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-primary" /> Salary Grade &amp; Step
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">{myPerformance.salaryGrade} · {myPerformance.salaryStep}</p>
            <p className="text-xs text-muted-foreground mt-1">Current: {myProfile.position}</p>
          </CardContent>
        </Card>
      </div>

      {/* Career Advancement & Promotion Application Card */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Career Advancement &amp; Promotion Application
              </CardTitle>
            </div>
            <Button
              size="sm"
              className="gap-1.5 shrink-0 shadow-sm"
              onClick={() => setPromotionModalOpen(true)}
            >
              <Send className="h-3.5 w-3.5" /> Apply for Promotion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 pt-1 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-muted-foreground">Appraisal Eligibility:</span>{" "}
                <strong className="text-foreground">
                  {perfData.averageScore == null
                    ? "Awaiting assessment data"
                    : perfData.averageScore >= 85
                      ? "Qualified (Score ≥ 85%)"
                      : `Developing (Score ${perfData.averageScore}%)`}
                </strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-muted-foreground">Required Training:</span>{" "}
                <strong className="text-foreground">{perfData.completedCount} Modules Completed</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="text-muted-foreground">Active Request:</span>{" "}
                {activePromotionRequest ? (
                  <Badge variant="outline" className="ml-1 text-[10px] font-semibold">
                    {activePromotionRequest.status} ({activePromotionRequest.id})
                  </Badge>
                ) : (
                  <span className="text-muted-foreground font-medium">None pending</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab buttons — overview | materials | assessment | audit logs */}
      <div className="flex h-auto flex-wrap justify-start gap-2 border-0 bg-transparent p-0 shadow-none">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
              : "hover:border-primary/40 hover:shadow-md"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Overview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "materials"
              ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
              : "hover:border-primary/40 hover:shadow-md"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Materials</span>
          {courses.some(isCourseUrgent) && (
            <span className="relative flex h-2 w-2" title="Urgent module needs attention">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
          )}
          <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none ${activeTab === "materials" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground border border-border/60"}`}>
            {courses.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assessment")}
          className={`flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "assessment"
              ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
              : "hover:border-primary/40 hover:shadow-md"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Assessment</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
              : "hover:border-primary/40 hover:shadow-md"
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          <span>Audit Logs</span>
          {perfAudit.length > 0 && (
            <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none ${activeTab === "audit" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground border border-border/60"}`}>
              {perfAudit.length}
            </span>
          )}
        </button>
      </div>

      {/* Bottom container — full-width tab content */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-6">
            {/* Tab content */}
            <div className="rounded-xl border border-border/70 bg-muted/10 p-4 min-h-[320px]">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-primary" /> Performance Overview
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Snapshot of rating, training and promotion readiness.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="rounded-lg border border-border/70 bg-background p-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Competency</p>
                      <p className="mt-1 font-bold text-foreground text-sm">{perfData.competencyLevel ?? "Not yet rated"}</p>
                      <p className="text-muted-foreground mt-0.5">Avg: <strong className="text-emerald-600">{perfData.averageScore != null ? `${perfData.averageScore} / 100` : "—"}</strong></p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background p-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">LMS Progress</p>
                      <p className="mt-1 font-bold text-foreground text-sm">{perfData.completedCount} of {perfData.totalCount} Completed</p>
                      <Progress value={(perfData.completedCount / Math.max(1, perfData.totalCount)) * 100} className="mt-2 h-1.5" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background p-3 text-xs">
                    <p className="font-semibold text-foreground">Recent learning</p>
                    <div className="mt-2 space-y-1.5">
                      {courses.slice(0, 2).map((c) => (
                        <div key={c.id} className="flex items-center justify-between gap-2">
                          <span className="truncate text-muted-foreground">{c.title}</span>
                          <EssStatusBadge status={c.status} />
                        </div>
                      ))}
                      {courses.length === 0 && <p className="text-muted-foreground">No courses assigned yet.</p>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "materials" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" /> Learning Materials
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {filteredMaterials.length === courses.length
                          ? `${courses.length} assigned modules — click a card to start, continue, or view certificate.`
                          : `${filteredMaterials.length} of ${courses.length} modules — click a card to start, continue, or view certificate.`}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                      {courses.some(isCourseUrgent) && (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                          </span>
                          {courses.filter(isCourseUrgent).length} urgent
                        </span>
                      )}
                      <div className="relative w-44">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={materialsSearch}
                          onChange={(e) => setMaterialsSearch(e.target.value)}
                          placeholder="Search modules…"
                          className="h-8 pl-8 text-xs"
                        />
                      </div>
                      <Select value={materialsStatus} onValueChange={setMaterialsStatus}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue placeholder="All status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All status</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Assigned">Assigned</SelectItem>
                          <SelectItem value="urgent">Urgent only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {courses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                      No training courses assigned yet — HR will assign your learning plan.
                    </div>
                  ) : filteredMaterials.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                      No modules match “{materialsSearch}”{materialsStatus !== "all" ? ` with status “${materialsStatus}”` : ""}.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMaterialsSearch("");
                          setMaterialsStatus("all");
                        }}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {filteredMaterials.map((c) => {
                        const i = courses.indexOf(c);
                        const pct = courseProgress(c);
                        const isDone = String(c.status).toLowerCase().includes("complet");
                        const urgent = urgentReason(c);
                        return (
                          <div
                            key={c.id}
                            className={`group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${courseTheme(i)} p-4 text-white shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${urgent ? "ring-2 ring-red-500/80" : ""}`}
                          >
                            {urgent && (
                              <span title={urgent} aria-label={`Urgent: ${urgent}`} className="absolute left-3 top-3 z-10 flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white/80 bg-red-600" />
                              </span>
                            )}
                            {/* geometric overlay */}
                            <div className="pointer-events-none absolute inset-0 opacity-25">
                              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[10px] border-white/15" />
                              <div className="absolute right-10 top-16 h-16 w-16 rotate-45 border-[6px] border-white/10" />
                              <div className="absolute -left-6 bottom-10 h-24 w-24 rotate-12 bg-white/[0.06]" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
                            </div>
                            <div className={`relative flex items-start justify-between gap-2 ${urgent ? "pl-5" : ""}`}>
                              <span className="inline-flex items-center rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                                {c.status}
                              </span>
                              <button
                                type="button"
                                aria-label="Course options"
                                onClick={() => (isDone ? handleOpenCert(c) : handleStartCourse(c))}
                                className="rounded-md bg-black/30 p-1.5 backdrop-blur-xs transition-colors hover:bg-black/50 cursor-pointer"
                              >
                                <Menu className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="relative">
                              <p className="text-lg font-extrabold leading-tight tracking-tight">{c.title}</p>
                              <p className="mt-1 text-[11px] font-medium text-white/75">{c.category}</p>
                            </div>
                            <div className="relative space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>{pct}% complete</span>
                                <span className="ml-auto font-mono opacity-80">{c.score}</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/50">
                                <div className="h-full rounded-full bg-white/90 transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <button
                                type="button"
                                disabled={startingCourseId === c.id}
                                onClick={() => (isDone ? handleOpenCert(c) : handleStartCourse(c))}
                                className="mt-1 w-full rounded-lg bg-white/15 py-1.5 text-[11px] font-bold backdrop-blur-xs transition-colors hover:bg-white/25 disabled:opacity-50 cursor-pointer"
                              >
                                {startingCourseId === c.id ? "Saving…" : isDone ? "View Certificate" : String(c.status) === "Assigned" ? "Start Course →" : "Continue →"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "assessment" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" /> Assessment
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {perfData.averageScore == null
                          ? "Awaiting assessment data"
                          : perfData.averageScore >= 85
                            ? `Qualified (Score ${perfData.averageScore}%) · ${perfData.completedCount} modules`
                            : `Developing (Score ${perfData.averageScore}%) · ${perfData.completedCount} modules`}
                        {filteredAssessments.length !== courses.length && ` · showing ${filteredAssessments.length} of ${courses.length}`}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                      {activePromotionRequest ? (
                        <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                          {activePromotionRequest.status} ({activePromotionRequest.id})
                        </Badge>
                      ) : null}
                      <div className="relative w-44">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={assessmentSearch}
                          onChange={(e) => setAssessmentSearch(e.target.value)}
                          placeholder="Search assessments…"
                          className="h-8 pl-8 text-xs"
                        />
                      </div>
                      <Select value={assessmentStatus} onValueChange={setAssessmentStatus}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue placeholder="All status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All status</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Assigned">Assigned</SelectItem>
                          <SelectItem value="urgent">Urgent only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {courses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                      No assessments yet — complete a learning module to generate a score.
                    </div>
                  ) : filteredAssessments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                      No assessments match “{assessmentSearch}”{assessmentStatus !== "all" ? ` with status “${assessmentStatus}”` : ""}.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAssessmentSearch("");
                          setAssessmentStatus("all");
                        }}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {filteredAssessments.map((c) => {
                        const i = courses.indexOf(c);
                        const pct = courseProgress(c);
                        const isDone = String(c.status).toLowerCase().includes("complet");
                        const urgent = urgentReason(c);
                        return (
                          <div
                            key={c.id}
                            className={`group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${courseTheme(i)} p-4 text-white shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md ${urgent ? "ring-2 ring-red-500/80" : ""}`}
                          >
                            {urgent && (
                              <span title={urgent} aria-label={`Urgent: ${urgent}`} className="absolute left-3 top-3 z-10 flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white/80 bg-red-600" />
                              </span>
                            )}
                            <div className="pointer-events-none absolute inset-0 opacity-25">
                              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[10px] border-white/15" />
                              <div className="absolute right-10 top-16 h-16 w-16 rotate-45 border-[6px] border-white/10" />
                              <div className="absolute -left-6 bottom-10 h-24 w-24 rotate-12 bg-white/[0.06]" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
                            </div>
                            <div className={`relative flex items-start justify-between gap-2 ${urgent ? "pl-5" : ""}`}>
                              <span className="inline-flex items-center rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                                {c.status}
                              </span>
                              <button
                                type="button"
                                aria-label="Assessment options"
                                onClick={() => (isDone ? handleOpenCert(c) : handleStartCourse(c))}
                                className="rounded-md bg-black/30 p-1.5 backdrop-blur-xs transition-colors hover:bg-black/50 cursor-pointer"
                              >
                                <Menu className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="relative">
                              <p className="text-lg font-extrabold leading-tight tracking-tight">{c.title}</p>
                              <p className="mt-1 text-[11px] font-medium text-white/75">{c.category}{c.completedDate && c.completedDate !== "—" ? ` · ${c.completedDate}` : ""}</p>
                            </div>
                            <div className="relative space-y-1.5">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                                <Award className="h-3.5 w-3.5" />
                                <span>{isDone ? c.score : `${pct}% complete`}</span>
                              </div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/50">
                                <div className="h-full rounded-full bg-white/90 transition-all" style={{ width: `${isDone ? 100 : pct}%` }} />
                              </div>
                              <button
                                type="button"
                                disabled={startingCourseId === c.id}
                                onClick={() => (isDone ? handleOpenCert(c) : handleStartCourse(c))}
                                className="mt-1 w-full rounded-lg bg-white/15 py-1.5 text-[11px] font-bold backdrop-blur-xs transition-colors hover:bg-white/25 disabled:opacity-50 cursor-pointer"
                              >
                                {startingCourseId === c.id ? "Saving…" : isDone ? "View Result" : "Take Assessment →"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "audit" && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
                      <ScrollText className="h-4 w-4 text-primary" /> Audit Logs
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Performance, career and learning requests trail.</p>
                  </div>
                  <div className="rounded-lg border border-border/70 overflow-hidden bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {perfAudit.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-xs">
                              No performance audit trail yet — promotion and training requests will appear here.
                            </TableCell>
                          </TableRow>
                        ) : (
                          perfAudit.map((r, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                              <TableCell className="text-xs font-medium">{r.type}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                              <TableCell>
                                <EssStatusBadge status={r.status} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
        </CardContent>
      </Card>

      {/* Certificate Modal */}
      {selectedCourse && (
        <LmsCertificateModal
          open={certModalOpen}
          onOpenChange={setCertModalOpen}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          category={selectedCourse.category}
          completedDate={selectedCourse.completedDate}
          score={selectedCourse.score}
        />
      )}

      {/* Promotion Request Modal */}
      <PromotionRequestModal
        open={promotionModalOpen}
        onOpenChange={setPromotionModalOpen}
        competencyScore={
          perfData.averageScore != null ? `${perfData.averageScore} / 100` : undefined
        }
        lmsCompletedCount={perfData.completedCount}
        onSubmitSuccess={(req) => {
          if (req) setActivePromotionRequest(req);
        }}
      />
    </div>
  );
}
