import { useEffect, useState } from "react";
import { ReportMenu } from "@/components/ui/report-menu";
import { essApi } from "@/lib/api";
import { myEmployeeDocuments } from "@/data/ess";

/** Standalone Export for the Company Documents page header (top-right end, above metric cards). */
export function EssDocumentsExport() {
  const [documents, setDocuments] = useState<any[]>(myEmployeeDocuments);
  const [docRequests, setDocRequests] = useState<any[]>([]);

  useEffect(() => {
    essApi
      .myDocuments()
      .then((res) => {
        if (res?.documents?.length) {
          setDocuments(
            res.documents.map((d: any) => ({
              id: d.code || `DOC-${d.id}`,
              title: d.title,
              category: d.category,
              status: d.status,
              date: d.issuedDate,
            }))
          );
        }
      })
      .catch(() => {});
    essApi
      .myRequests()
      .then((res) => {
        if (res?.requests?.length) {
          setDocRequests(
            res.requests
              .filter(
                (r: any) =>
                  r.category.toLowerCase().includes("doc") ||
                  r.type.toLowerCase().includes("coe") ||
                  r.type.toLowerCase().includes("cert")
              )
              .map((r: any) => ({ id: r.id, type: r.type, status: r.status, date: r.filed }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ReportMenu
      size="sm"
      label="Export documents"
      showPrint={false}
      recordCount={documents.length + docRequests.length}
      report={() => ({
        title: "My Employment Documents Report",
        subtitle: `Employee Self-Service · Company Documents · ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
        columns: [
          { header: "Document / Request", key: "title" },
          { header: "Category / Type", key: "category" },
          { header: "Status", key: "status" },
          { header: "Date Filed / Verified", key: "date" },
        ],
        rows: [
          ...documents.map((d) => ({
            title: d.title,
            category: d.category,
            status: d.status,
            date: d.date,
          })),
          ...docRequests.map((r) => ({
            title: `${r.id} — ${r.type}`,
            category: "Document Request",
            status: r.status,
            date: r.date,
          })),
        ],
        summary: [
          { label: "Documents", value: documents.length },
          { label: "Document Requests", value: docRequests.length },
        ],
      })}
    />
  );
}
