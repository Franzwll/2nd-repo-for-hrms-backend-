import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { MyRequestHistoryTable } from "./MyRequestHistoryTable";
import { AttendanceRequestModal } from "./modals/AttendanceRequestModal";
import { DocumentRequestModal } from "./modals/DocumentRequestModal";
import { PayrollRequestModal } from "./modals/PayrollRequestModal";
import { PromotionRequestModal } from "./modals/PromotionRequestModal";
import { MY_REQUEST_MODULES, type MyRequestModuleId } from "./myRequestModules";
import {
  myRequestsPath,
  type EssBasePath,
} from "@/components/modules/ess/EssPortalContext";

interface MyRequestModulePageProps {
  moduleId: MyRequestModuleId;
  basePath?: EssBasePath;
}

export function MyRequestModulePage({
  moduleId,
  basePath = "/employee",
}: MyRequestModulePageProps) {
  const config = MY_REQUEST_MODULES[moduleId];
  const myRequestsTo = myRequestsPath(basePath);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmitted = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-6">
      <Link
        to={myRequestsTo}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All requests
      </Link>

      <PageHeader eyebrow="My Request" title={config.label} description={config.description} />

      <MyRequestHistoryTable
        categories={config.categories}
        refreshKey={refreshKey}
        emptyMessage={config.emptyMessage}
        submitLabel={config.submitLabel}
        onSubmit={() => setModalOpen(true)}
      />

      {moduleId === "payroll" && (
        <PayrollRequestModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmitted={handleSubmitted}
        />
      )}
      {moduleId === "attendance" && (
        <AttendanceRequestModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmitted={handleSubmitted}
        />
      )}
      {moduleId === "promotion" && (
        <PromotionRequestModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmitted={handleSubmitted}
        />
      )}
      {moduleId === "documents" && (
        <DocumentRequestModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}
