import { useState } from "react";
import { Award, BookOpen, Building, CheckCircle2, Send, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

export function EssPerformanceTab() {
  const [courses, setCourses] = useState(myLearningCourses);
  const [promoPosition, setPromoPosition] = useState("");
  const [promoJustification, setPromoJustification] = useState("");
  const [lastPromo, setLastPromo] = useState(myPerformance.lastPromotionRequest);

  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoPosition) return;
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setLastPromo({ position: promoPosition, status: "Pending", date: todayStr });
    toast.success("Promotion request submitted successfully to Department Head and HR.");
    setPromoPosition("");
    setPromoJustification("");
  };

  const handleOpenCert = (course: any) => {
    setSelectedCourse(course);
    setCertModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Performance Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Last Performance Review
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">{myPerformance.lastReview}</p>
            <p className="text-xs text-muted-foreground mt-1">Next scheduled review: <strong className="text-foreground">{myPerformance.nextReview}</strong></p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" /> Competency Rating
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">{myPerformance.competencyLevel}</p>
            <p className="text-xs text-muted-foreground mt-1">Average Evaluation Score: <strong className="text-emerald-600 dark:text-emerald-400">{myPerformance.averageScore}</strong></p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> LMS Training Progress
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">
              {myPerformance.lmsCoursesCompleted} of {myPerformance.lmsCoursesAssigned} Completed
            </p>
            <Progress value={(myPerformance.lmsCoursesCompleted / myPerformance.lmsCoursesAssigned) * 100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
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

      {/* Promotion Request Application Card */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Apply for Career Promotion / Salary Step Reclassification
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Submit a formal promotion application endorsed by your direct supervisor and reviewed by HR.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromoSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Position Applied For</Label>
                <Input
                  placeholder="e.g., Senior Line Cook / Chef de Partie"
                  value={promoPosition}
                  onChange={(e) => setPromoPosition(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Current Position</Label>
                <Input value={myProfile.position} disabled className="bg-muted text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Key Accomplishments &amp; Justification</Label>
              <Textarea
                rows={3}
                placeholder="Highlight your notable milestones, certifications, and leadership contributions..."
                value={promoJustification}
                onChange={(e) => setPromoJustification(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="gap-1.5">
              <Send className="h-4 w-4" /> Submit Promotion Application
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Last Promotion Application Record:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{lastPromo.position}</span>
              <EssStatusBadge status={lastPromo.status} />
              <span className="text-muted-foreground">— Filed on {lastPromo.date}</span>
            </div>
          </div>
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
