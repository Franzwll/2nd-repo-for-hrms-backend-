import { useState, useEffect } from "react";
import { Award, BookOpen, Building, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    </div>
  );
}
