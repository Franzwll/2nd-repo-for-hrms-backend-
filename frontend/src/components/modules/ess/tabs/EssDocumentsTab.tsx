import { useState, useMemo, useEffect } from "react";
import { FileCheck, Download, Upload, Plus, Search, ArrowUpDown, Send, FileText, LayoutGrid, List, AlertTriangle, Clock, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import { EssStatusBadge, docCategoryTint, ON_FILE_STATUSES } from "@/components/modules/ess/shared/EssStatusBadge";
import { myEmployeeDocuments } from "@/data/ess";
import { DocumentRequestModal } from "@/components/modules/ess/modals/DocumentRequestModal";
import { DocumentUploadModal } from "@/components/modules/ess/modals/DocumentUploadModal";
import { DocumentViewerModal } from "@/components/modules/ess/modals/DocumentViewerModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi } from "@/lib/api";
import { toast } from "sonner";

/** Map a raw EssRequest (create-request response) to the flat shape this tab renders. */
function toDocRequestItem(raw: any) {
  const filed =
    raw?.filed_at ?? raw?.filed ?? raw?.created_at ?? raw?.isoDate ?? new Date().toISOString();
  const dateLabel =
    raw?.filed ??
    raw?.date ??
    (() => {
      try {
        return new Date(filed).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {
        return String(filed ?? "");
      }
    })();
  const status = String(raw?.status ?? "Pending");
  return {
    id: raw?.request_code ?? raw?.id ?? `REQ-${Date.now()}`,
    date: dateLabel,
    isoDate: raw?.date_from ?? (typeof filed === "string" ? filed : String(filed ?? "")),
    type: raw?.request_type ?? raw?.type ?? "HR Document",
    status,
    statusRank: status === "Approved" || status === "Completed" ? 1 : 2,
    purpose: raw?.details ?? raw?.purpose ?? "",
  };
}

export function EssDocumentsTab() {
  const [documents, setDocuments] = useState(myEmployeeDocuments);
  const [docRequests, setDocRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Database Fetch
  useEffect(() => {
    const docsPromise = essApi
      .myDocuments()
      .then((res) => {
        if (res?.documents?.length) {
          setDocuments(
            res.documents.map((d) => ({
              id: d.code || `DOC-${d.id}`,
              dbId: d.id,
              title: d.title,
              category: d.category,
              status: d.status,
              date: d.issuedDate,
              size: d.fileSize,
              expiry: (d as any).expiryDate ?? null,
              downloadUrl: d.downloadUrl,
            }))
          );
        }
      })
      .catch(() => {});

    const reqPromise = essApi
      .myRequests()
      .then((res) => {
        if (res?.requests?.length) {
          const docItems = res.requests
            .filter((r) => r.category.toLowerCase().includes("doc") || r.type.toLowerCase().includes("coe") || r.type.toLowerCase().includes("cert"))
            .map((r) => ({
              id: r.id,
              date: r.filed,
              isoDate: r.date_from || r.filed,
              type: r.type,
              status: r.status,
              statusRank: r.status === "Approved" || r.status === "Completed" ? 1 : 2,
              purpose: r.details,
            }));
          if (docItems.length > 0) {
            setDocRequests(docItems);
          }
        }
      })
      .catch(() => {});

    Promise.allSettled([docsPromise, reqPromise]).finally(() => setLoading(false));
  }, []);

  const [activeTab, setActiveTab] = useState<"documents" | "requests">("documents");
  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("date-desc");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetTitle, setUploadTargetTitle] = useState("Updated NBI Clearance (2026)");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  // TRY: card-grid view — remove block to revert to table-only
  const [docViewMode, setDocViewMode] = useState<"grid" | "list">("grid");
  const [docStatusFilter, setDocStatusFilter] = useState("all");
  const [docCardSearch, setDocCardSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const filteredDocRequests = useMemo(() => {
    return docRequests
      .filter(
        (r) =>
          !docSearch ||
          String(r?.type ?? "")
            .toLowerCase()
            .includes(docSearch.toLowerCase()) ||
          String(r?.status ?? "")
            .toLowerCase()
            .includes(docSearch.toLowerCase())
      )
      .sort((a, b) => {
        if (docSort === "date-desc") return String(b?.isoDate ?? "").localeCompare(String(a?.isoDate ?? ""));
        if (docSort === "date-asc") return String(a?.isoDate ?? "").localeCompare(String(b?.isoDate ?? ""));
        if (docSort === "status") return (a?.statusRank ?? 2) - (b?.statusRank ?? 2);
        return 0;
      });
  }, [docRequests, docSearch, docSort]);

  const docPage = usePagination(filteredDocRequests);

  const handleDocRequestSuccess = (newReq: any) => {
    if (!newReq) {
      setActiveTab("requests");
      return;
    }
    // Modal already normalizes to the flat shape; keep this as a second guard.
    const alreadyFlat = newReq?.type && newReq?.isoDate !== undefined;
    setDocRequests((prev) => [alreadyFlat ? newReq : toDocRequestItem(newReq), ...prev]);
    setActiveTab("requests");
  };

  const handleUploadSuccess = (uploadedDoc: any) => {
    // Replace or add document
    setDocuments((prev) =>
      prev.map((d) => (d.title === uploadedDoc.title ? { ...d, status: "Submitted", size: uploadedDoc.size } : d))
    );
  };

  const openUploadForDoc = (title: string) => {
    setUploadTargetTitle(title);
    setUploadModalOpen(true);
  };

  const handleDownloadDoc = (doc: any) => {
    if (doc.downloadUrl && doc.downloadUrl !== "#") {
      window.open(doc.downloadUrl, "_blank");
      toast.success(`Opening ${doc.title}...`);
    } else {
      const content = `OXFORD SUITES MAKATI\nOfficial Employment Record\n\nDocument: ${doc.title}\nCategory: ${doc.category}\nStatus: Verified\nDate on File: ${doc.date}\nSystem Verification ID: ${doc.id}\n`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${doc.title}`);
    }
  };

  const handleRowClick = (req: any) => {
    setSelectedRequest({
      id: req.id,
      type: req.type,
      category: "HR Document",
      date: req.date,
      status: req.status,
      assignedTo: "Maria Lim (HR Records)",
      details: req.purpose ? `Purpose: ${req.purpose}` : "Official employment record request.",
    });
    setTimelineOpen(true);
  };

  const missingDocs = documents.filter((d) => d.status === "Missing");
  const pendingDocRequests = docRequests.filter((r) =>
    ["Pending", "Under Review", "In Progress"].includes(r.status)
  );
  const expiringDocs = documents.filter((d) => {
    if (d.status === "Missing" || !(d as any).expiry) return false;
    const exp = new Date((d as any).expiry);
    if (isNaN(exp.getTime())) return false;
    const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 60;
  });

  const scrollToDocRequests = () => {
    setActiveTab("requests");
    requestAnimationFrame(() => {
      document.getElementById("doc-request-history")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Documents on File</p>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 font-bold font-display text-emerald-600 dark:text-emerald-400">
              <span className="text-4xl">{documents.filter((d) => ON_FILE_STATUSES.includes(d.status)).length}</span>{" "}
              <span className="text-base">File(s)</span>
            </p>
          </CardContent>
        </Card>
        <button
          type="button"
          onClick={() => setDocStatusFilter((f) => (f === "Missing" ? "all" : "Missing"))}
          title={docStatusFilter === "Missing" ? "Clear missing filter" : "Show missing documents"}
          className={`text-left rounded-xl outline-none transition-all cursor-pointer ${docStatusFilter === "Missing" ? "ring-2 ring-amber-500/70" : ""}`}
        >
          <Card className={`border-border/70 shadow-xs transition-all group hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-md ${docStatusFilter === "Missing" ? "border-amber-500/50" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Action Needed</p>
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-1 font-bold font-display text-amber-600 dark:text-amber-400">
                <span className="text-4xl">{missingDocs.length}</span>{" "}
                <span className="text-base">Missing</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {docStatusFilter === "Missing" ? "Filtered — click to clear" : "Click to view"}
              </p>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={scrollToDocRequests}
          title="Jump to document requests"
          className="text-left rounded-xl outline-none transition-all cursor-pointer"
        >
          <Card className="border-border/70 shadow-xs transition-all group hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Pending Requests</p>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-1 font-bold font-display text-foreground">
                <span className="text-4xl">{pendingDocRequests.length}</span>{" "}
                <span className="text-base font-medium text-muted-foreground">Awaiting HR</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Click to track</p>
            </CardContent>
          </Card>
        </button>
        <Card className="border-border/70 shadow-xs transition-all group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Expiring Soon</p>
              <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400">
                <CalendarClock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 font-bold font-display text-sky-600 dark:text-sky-400">
              <span className="text-4xl">{expiringDocs.length}</span>{" "}
              <span className="text-base">Within 60 days</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "documents" | "requests")}
        className="mt-2"
      >
      {/* Sub-navigation Tabs — Export lives in the page header top-right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
        <TabsList>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="documents"
          >
            <FileCheck className="h-3.5 w-3.5" /> My Documents
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-1.5 rounded-lg border-border/70 bg-card px-4 py-2 text-xs font-semibold shadow-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            value="requests"
          >
            <FileText className="h-3.5 w-3.5" /> My Requests
            {pendingDocRequests.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {pendingDocRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

        <TabsContent value="documents" className="mt-4">
      {/* Employment Documents — TRY: grid cards + viewer modal, list = old table fallback */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              My Employment Documents
            </CardTitle>
            <p className="text-xs text-muted-foreground">Compliance documents, statutory IDs, and official company clearances.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* TRY: view toggle — remove to revert */}
            <div className="flex items-center rounded-lg border border-border/70 bg-muted/20 p-0.5">
              <button
                type="button"
                onClick={() => setDocViewMode("grid")}
                aria-label="Grid view"
                className={`rounded-md p-1.5 transition-colors cursor-pointer ${docViewMode === "grid" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDocViewMode("list")}
                aria-label="List view"
                className={`rounded-md p-1.5 transition-colors cursor-pointer ${docViewMode === "list" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => setRequestModalOpen(true)}>
              <Plus className="h-4 w-4" /> Request Official Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* TRY: grid view — remove block to revert to table-only */}
          {docViewMode === "grid" ? (
            <div className="space-y-3">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={docCardSearch}
                  onChange={(e) => setDocCardSearch(e.target.value)}
                  placeholder="Search documents…"
                  className="pl-8 h-9"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {documents
                  .filter((d) => {
                    if (docStatusFilter !== "all" && d.status !== docStatusFilter) return false;
                    const q = docCardSearch.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      String(d.title ?? "").toLowerCase().includes(q) ||
                      String(d.category ?? "").toLowerCase().includes(q) ||
                      String(d.status ?? "").toLowerCase().includes(q)
                    );
                  })
                  .map((doc) => {
                    const missing = doc.status === "Missing";
                    const tint = docCategoryTint(doc.category);
                    const expiryRaw = (doc as any).expiry;
                    const expDate = expiryRaw && expiryRaw !== "No Expiry" ? new Date(expiryRaw) : null;
                    const isExpiring =
                      !missing &&
                      expDate != null &&
                      !isNaN(expDate.getTime()) &&
                      Math.ceil((expDate.getTime() - Date.now()) / 86400000) <= 60;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setViewerOpen(true);
                        }}
                        className={`group/doc relative flex flex-col justify-between rounded-xl border bg-card p-4 text-left shadow-2xs cursor-pointer ${missing ? "border-dashed border-amber-500/50" : "border-border/70"}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          {/* Doc icon like reference: white tile, folded corner, red doc glyph */}
                          <div className="relative shrink-0">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-xl border shadow-sm ${tint.tile}`}>
                              <span className="absolute right-0 top-0 h-3 w-3 rounded-bl-md rounded-tr-xl border-l border-b border-black/10 bg-muted" />
                              <FileText className={`h-6 w-6 ${tint.icon}`} strokeWidth={2} />
                            </div>
                            {missing && (
                              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                              </span>
                            )}
                          </div>
                          <EssStatusBadge status={doc.status} />
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-bold text-foreground leading-snug line-clamp-2 min-h-[2rem]">{doc.title}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{doc.category}</span>
                            <span className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                              {String((doc as any).fileType ?? "PDF Document").split(" ")[0]}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                          <span
                            className={`truncate ${isExpiring ? "font-semibold text-amber-600 dark:text-amber-400" : ""}`}
                            title={isExpiring ? `Renews ${expiryRaw}` : undefined}
                          >
                            {isExpiring ? `Renews ${expiryRaw}` : doc.date}
                          </span>
                          <span className="font-mono shrink-0 ml-2">{doc.size}</span>
                        </div>
                        <span className="mt-2 text-[11px] font-semibold text-primary/70">
                          Click to open →
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Filed / Verified</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents
                .filter((doc) => docStatusFilter === "all" || doc.status === docStatusFilter)
                .map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-semibold text-xs text-foreground">{doc.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{doc.category}</TableCell>
                  <TableCell>
                    <EssStatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{doc.date}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">{doc.size}</TableCell>
                  <TableCell className="text-right py-1 space-x-1">
                    {doc.status === "Missing" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 gap-1 font-medium"
                        onClick={() => openUploadForDoc(doc.title)}
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Now
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-primary hover:bg-primary/10 gap-1 font-medium"
                        onClick={() => handleDownloadDoc(doc)}
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="requests" className="mt-4">
      {/* Document Requests History */}
      <Card id="doc-request-history" className="border-border/70 shadow-xs scroll-mt-4">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              My Document Requests
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click row to track certificate issuance status.</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              className="h-8 w-[120px]"
            />
            <Select value={docSort} onValueChange={setDocSort}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Document Requested</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRowsSkeleton cols={5} rows={5} />}
              {!loading && docPage.pageItems.map((r, idx) => (
                <TableRow
                  key={idx}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleRowClick(r)}
                >
                  <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                  <TableCell className="text-xs font-semibold">{r.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                  <TableCell>
                    <EssStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right py-1">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary">
                      Timeline →
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            page={docPage.page}
            pageCount={docPage.pageCount}
            from={docPage.from}
            to={docPage.to}
            total={docPage.total}
            label="documents"
            showRangeLabel={false}
            onPageChange={docPage.setPage}
          />
        </CardContent>
      </Card>

        </TabsContent>
      </Tabs>

      {/* Modals */}
      <DocumentRequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        onRequestSuccess={handleDocRequestSuccess}
      />
      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        documentTitle={uploadTargetTitle}
        onUploadSuccess={handleUploadSuccess}
      />
      <RequestTimelineModal
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
        request={selectedRequest}
      />
      {/* TRY: viewer modal — remove to revert */}
      <DocumentViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        doc={selectedDoc}
        onDownload={handleDownloadDoc}
        onUpload={openUploadForDoc}
      />
    </div>
  );
}
