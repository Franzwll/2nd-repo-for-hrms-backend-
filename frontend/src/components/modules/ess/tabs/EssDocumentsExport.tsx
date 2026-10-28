import { useEffect, useState } from "react";
import { ReportMenu } from "@/components/ui/report-menu";
import { essApi } from "@/lib/api";

/** Standalone Export for the Company Documents page header (top-right end, above metric cards). */
export function EssDocumentsExport() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [docRequests, setDocRequests] = useState<any[]>([]);

  useEffect(() => {
    essApi
      .myDocuments()
      .then((res) => {
        setDocuments(
          (res?.documents ?? []).map((d: any) => ({
            id: d.code || `DOC-${d.id}`,
            title: d.title,
            category: d.category,
            status: d.status,
            date: d.issuedDate,
          })),
        );
      })
      .catch(() => setDocuments([]));
    essApi
      .myRequests()
      .then((res) => {
        setDocRequests(
          (res?.requests ?? [])
            .filter(
              (r: any) => {
                const category = String(r.category ?? "").toLowerCase();
                const type = String(r.type ?? "").toLowerCase();
                return (
                  category.includes("doc") || type.includes("coe") || type.includes("cert")
                );
              },
            )
            .map((r: any) => ({ id: r.id, type: r.type, status: r.status, date: r.filed })),
        );
      })
      .catch(() => setDocRequests([]));
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
