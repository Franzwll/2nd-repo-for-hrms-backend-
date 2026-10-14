import * as React from "react";
import { ClipboardList, Hammer } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CardSkeleton } from "@/components/ui/loading-skeletons";
import { assessmentsApi, settingsApi } from "@/lib/api";

/**
 * Core HCM-owned switches for Assessment Test + Practical Test.
 * This is the ONLY place the switches exist — Applicant Management
 * reads them via useAssessmentConfig() and hides/disables sections.
 */
export function AssessmentSettingsCard() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<"assessment" | "practical" | null>(null);
  const [assessment, setAssessment] = React.useState(true);
  const [practical, setPractical] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    assessmentsApi
      .getConfig()
      .then((r) => {
        if (!alive || !r.data) return;
        setAssessment(r.data.assessment_test_enabled);
        setPractical(r.data.practical_test_enabled);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const save = async (key: "assessment" | "practical", next: boolean) => {
    setSaving(key);
    if (key === "assessment") setAssessment(next);
    else setPractical(next);
    try {
      await settingsApi.bulkUpsert([
        {
          key:
            key === "assessment"
              ? "assessments.assessment_test_enabled"
              : "assessments.practical_test_enabled",
          value: next,
        },
      ]);
      toast.success(
        key === "assessment"
          ? next
            ? "Assessment Test enabled in Applicant Management."
            : "Assessment Test hidden from Applicant Management."
          : next
            ? "Practical Test enabled in Applicant Management."
            : "Practical Test hidden from Applicant Management.",
      );
    } catch {
      if (key === "assessment") setAssessment(!next);
      else setPractical(!next);
      toast.error("Could not save. Check your Settings:Edit permission.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <CardSkeleton rows={3} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assessment Stages</CardTitle>
        <p className="text-xs text-muted-foreground">
          Turning a stage off hides it in Applicant Management and blocks new records via the API.
          Historical records are kept.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 p-3">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Assessment Test</p>
              <p className="text-xs text-muted-foreground">
                Written test + applicant self-service links in Applicant Management.
              </p>
            </div>
          </div>
          <Switch
            checked={assessment}
            disabled={saving !== null}
            onCheckedChange={(v) => save("assessment", v)}
            aria-label="Enable Assessment Test in Applicant Management"
          />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 p-3">
          <div className="flex items-start gap-3">
            <Hammer className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Practical Test</p>
              <p className="text-xs text-muted-foreground">
                Hands-on exam for designated positions. Per-job flags still apply when enabled.
              </p>
            </div>
          </div>
          <Switch
            checked={practical}
            disabled={saving !== null}
            onCheckedChange={(v) => save("practical", v)}
            aria-label="Enable Practical Test in Applicant Management"
          />
        </div>
      </CardContent>
    </Card>
  );
}
