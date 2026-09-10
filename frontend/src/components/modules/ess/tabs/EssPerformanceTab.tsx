import { useState, useEffect } from "react";
import { Award, BookOpen, Building, CheckCircle2, TrendingUp, Sparkles, Send, ShieldCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export function EssPerformanceTab() {
  const [courses, setCourses] = useState(myLearningCourses);
  const [perfData, setPerfData] = useState({
    rating: 4.8,
    competencyLevel: "Proficient (Exceeding Expectations)",
    averageScore: "95 / 100",
    completedCount: 3,
    totalCount: 4,
  });
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [activePromotionRequest, setActivePromotionRequest] = useState<any | null>(null);

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
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    essApi
      .myPerformance()
      .then((res) => {
        if (res?.courses?.length) {
          setCourses(
            res.courses.map((c) => ({
              id: c.id,
              title: c.title,
              category: c.category,
              progress: c.progress,
              status: c.status as any,
              score: c.score ? `${c.score} / 100` : "—",
              duration: c.duration,
              completedDate: c.completedDate || "In progress",
            }))
          );
        }
        if (res?.stats && res?.employee) {
          setPerfData({
            rating: res.employee.overall_rating || 4.8,
            competencyLevel: res.employee.competency_level || "Proficient",
            averageScore: `${res.stats.average_score} / 100`,
            completedCount: res.stats.completed_courses,
            totalCount: res.stats.completed_courses + res.stats.in_progress_courses,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenCert = (course: any) => {
    setSelectedCourse(course);
    setCertModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Performance Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Last Performance Review
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">Annual Review 2026</p>
            <p className="text-xs text-muted-foreground mt-1">Next scheduled review: <strong className="text-foreground">Dec 15, 2026</strong></p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" /> Competency Rating
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">{perfData.competencyLevel}</p>
            <p className="text-xs text-muted-foreground mt-1">Average Evaluation Score: <strong className="text-emerald-600 dark:text-emerald-400">{perfData.averageScore}</strong></p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
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

        <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
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
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Career Advancement &amp; Promotion Application
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Apply for a position upgrade, merit promotion, or rank progression. Submissions feed into Core HCM and initiate an HR3 performance evaluation.
              </p>
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
                <strong className="text-foreground">Qualified (Score &ge; 85%)</strong>
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

      {/* Learning Modules Table */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Learning Management System (LMS) Modules
          </CardTitle>
          <p className="text-xs text-muted-foreground">Assigned corporate training programs and certification test scores.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date Completed</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-sm text-foreground">{c.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.category}</TableCell>
                  <TableCell>
                    <EssStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{c.score}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.completedDate}</TableCell>
                  <TableCell className="text-right">
                    {c.status === "Completed" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1"
                        onClick={() => handleOpenCert(c)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Certificate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => toast.info(`Resuming ${c.title}...`)}
                      >
                        Continue Course
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Certificate Modal */}
      {selectedCourse && (
        <LmsCertificateModal
          open={certModalOpen}
          onOpenChange={setCertModalOpen}
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
        competencyScore={perfData.averageScore}
        lmsCompletedCount={perfData.completedCount}
        onSubmitSuccess={(req) => {
          if (req) setActivePromotionRequest(req);
        }}
      />
    </div>
  );
}
