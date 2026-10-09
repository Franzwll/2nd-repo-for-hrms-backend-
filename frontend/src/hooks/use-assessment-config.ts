import * as React from "react";
import { assessmentsApi } from "@/lib/api";

export interface AssessmentConfig {
  assessment_test_enabled: boolean;
  practical_test_enabled: boolean;
}

/**
 * Reads the Core HCM-owned global switches. Applicant Management
 * only consumes this — switches live in Core HCM.
 */
export function useAssessmentConfig() {
  const [config, setConfig] = React.useState<AssessmentConfig>({
    assessment_test_enabled: true,
    practical_test_enabled: true,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    assessmentsApi
      .getConfig()
      .then((r) => {
        if (alive && r.data) setConfig(r.data);
      })
      .catch(() => {
        /* offline → default enabled */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { config, loading };
}
