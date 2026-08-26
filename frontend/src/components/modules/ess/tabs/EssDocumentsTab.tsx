import { useState, useMemo, useEffect } from "react";
import { FileCheck, Download, Upload, Plus, Search, ArrowUpDown, Send, AlertCircle, FileText } from "lucide-react";
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
import { usePagination } from "@/hooks/usePagination";
import { EssStatusBadge } from "@/components/modules/ess/shared/EssStatusBadge";
import { myEmployeeDocuments } from "@/data/ess";
import { DocumentRequestModal } from "@/components/modules/ess/modals/DocumentRequestModal";
import { DocumentUploadModal } from "@/components/modules/ess/modals/DocumentUploadModal";
import { RequestTimelineModal, type RequestItem } from "@/components/modules/ess/modals/RequestTimelineModal";
import { essApi } from "@/lib/api";
import { toast } from "sonner";

export function EssDocumentsTab() {
  const [documents, setDocuments] = useState(myEmployeeDocuments);
  const [docRequests, setDocRequests] = useState<any[]>([]);

  // Live Database Fetch
  useEffect(() => {
    essApi
      .myDocuments()
      .then((res) => {
        if (res?.documents?.length) {
          setDocuments(
            res.documents.map((d) => ({
              id: d.code || `DOC-${d.id}`,
              title: d.title,
              category: d.category,
              status: d.status,
              date: d.issuedDate,
              size: d.fileSize,
            }))
          );
        }
      })
      .catch(() => {});

    essApi
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
  }, []);

  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("date-desc");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetTitle, setUploadTargetTitle] = useState("Updated NBI Clearance (2026)");
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const filteredDocRequests = useMemo(() => {
    return docRequests
      .filter((r) => !docSearch || r.type.toLowerCase().includes(docSearch.toLowerCase()) || r.status.toLowerCase().includes(docSearch.toLowerCase()))
      .sort((a, b) => {
        if (docSort === "date-desc") return b.isoDate.localeCompare(a.isoDate);
        if (docSort === "date-asc") return a.isoDate.localeCompare(b.isoDate);
        if (docSort === "status") return a.statusRank - b.statusRank;
        return 0;
      });
  }, [docRequests, docSearch, docSort]);

  const docPage = usePagination(filteredDocRequests);

  const handleDocRequestSuccess = (newReq: any) => {
    setDocRequests([newReq, ...docRequests]);
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

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Submitted &amp; Verified</p>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {documents.filter((d) => d.status === "Submitted" || d.status === "Available" || d.status === "Released").length} File(s)
            </p>
            <p className="text-xs text-muted-foreground mt-1">Verified by HR Administration</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Missing Action Item</p>
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold font-display text-rose-600 dark:text-rose-400">
              {documents.filter((d) => d.status === "Missing").length} Action Item
            </p>
            <p className="text-xs text-muted-foreground mt-1">Please submit missing compliance requirement</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Available for Download</p>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Download className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold font-display text-primary">
              {documents.filter((d) => d.status === "Available" || d.status === "Released").length} Records
            </p>
            <p className="text-xs text-muted-foreground mt-1">COE, BIR 2316 &amp; Certifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Employment Documents Table */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-3">
          <div>
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              My Employment Documents
            </CardTitle>
            <p className="text-xs text-muted-foreground">Compliance documents, statutory IDs, and official company clearances.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                setUploadTargetTitle("Additional Employment Document");
                setUploadModalOpen(true);
              }}
            >
              <Upload className="h-3.5 w-3.5" /> Upload File
            </Button>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => setRequestModalOpen(true)}>
              <Plus className="h-4 w-4" /> Request Official Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Filed / Verified</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-semibold text-sm text-foreground">{doc.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{doc.category}</TableCell>
                  <TableCell>
                    <EssStatusBadge status={doc.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{doc.date}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{doc.size}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {doc.status === "Missing" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 gap-1"
                        onClick={() => openUploadForDoc(doc.title)}
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Now
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium pr-2">On File ✓</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Requests History */}
      <Card className="border-border/70 shadow-xs">
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
              {docPage.pageItems.map((r, idx) => (
                <TableRow
                  key={idx}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(r)}
                >
                  <TableCell className="text-xs font-mono font-medium text-foreground">{r.id}</TableCell>
                  <TableCell className="text-sm font-semibold">{r.type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                  <TableCell>
                    <EssStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
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
            onPageChange={docPage.setPage}
          />
        </CardContent>
      </Card>

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
    </div>
  );
}
