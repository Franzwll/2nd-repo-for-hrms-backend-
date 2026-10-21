import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Download, FileText, Paperclip, Search, Send, Upload } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListBody } from "@/components/portal/ListBody";
import { ListEmptyState } from "@/components/portal/ListEmptyState";
import { SortHead, useSort } from "@/components/portal/sortable";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ermApi, type ApiDocumentRequest } from "@/lib/api";

const statusClass: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  "Under Review": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  Approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "For Fulfillment": "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  Rejected: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  Cancelled: "bg-slate-500/10 text-slate-600 border-slate-500/30",
};

function formatSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Employee Records fulfilment inbox for ESS document requests.
 *
 * The employee asks for a document in ESS; it shows up here. Records staff
 * attach the file (fresh upload or an existing archived document) and the
 * request is Completed — closing the ESS <-> ERM loop.
 */
export function DocumentRequestInbox({
  statusFilter = "all",
  onStatusFilterChange,
  onCountsChange,
}: {
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  onCountsChange?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ApiDocumentRequest[]>([]);
  const [search, setSearch] = useState("");

  const [fulfilRow, setFulfilRow] = useState<ApiDocumentRequest | null>(null);
  const [archiveOptions, setArchiveOptions] = useState<
    NonNullable<ApiDocumentRequest["archive_options"]>
  >([]);
  const [source, setSource] = useState<"upload" | "archive">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string>("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ermApi.documentRequests();
      setRows(res.requests ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load document requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter === "pending") {
        if (!["For Fulfillment", "Approved"].includes(r.status)) return false;
      } else if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return [r.employee, r.employeeId, r.type, r.details, r.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const requestSort = useSort<
    ApiDocumentRequest,
    "request" | "employee" | "document" | "filed" | "status" | "attachment"
  >(filtered, {
    request: (r) => r.id,
    employee: (r) => r.employee,
    document: (r) => r.type,
    filed: (r) => r.filed,
    status: (r) => r.status,
    attachment: (r) => {
      if (r.attachments?.some((a) => a.direction === "hr")) return 2;
      return r.attachments?.length ? 1 : 0;
    },
  });

  const openFulfil = async (row: ApiDocumentRequest) => {
    setFulfilRow(row);
    setSource("upload");
    setFile(null);
    setDocumentId("");
    setNote("");
    setArchiveOptions([]);
    try {
      const res = await ermApi.documentRequest(row.id);
      setArchiveOptions(res.request.archive_options ?? []);
    } catch {
      setArchiveOptions([]);
    }
  };

  const submitFulfil = async () => {
    if (!fulfilRow) return;
    if (source === "upload" && !file) {
      toast.error("Choose a file to attach.");
      return;
    }
    if (source === "archive" && !documentId) {
      toast.error("Select an archived document to attach.");
      return;
    }
    setSaving(true);
    try {
      await ermApi.fulfill(fulfilRow.id, {
        ...(source === "upload" && file ? { file } : {}),
        ...(source === "archive" && documentId ? { document_id: Number(documentId) } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      toast.success("Request fulfilled — the employee has been notified.");
      setFulfilRow(null);
      await load();
      onCountsChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fulfil request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Send className="h-5 w-5 text-primary" /> Document Requests
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-56 pl-9"
                placeholder="Search employee or request…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange?.(v)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Awaiting fulfilment</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="For Fulfillment">For Fulfillment</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Requests filed by employees in the Employee Self-Service portal. Attach the document they
          asked for to complete the request.
        </p>

        <div className="mt-4 overflow-x-auto">
          <ListBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHead sortKey="request" sort={requestSort.sort} onSort={requestSort.toggle}>
                    Request
                  </SortHead>
                  <SortHead sortKey="employee" sort={requestSort.sort} onSort={requestSort.toggle}>
                    Employee
                  </SortHead>
                  <SortHead sortKey="document" sort={requestSort.sort} onSort={requestSort.toggle}>
                    Document
                  </SortHead>
                  <SortHead sortKey="filed" sort={requestSort.sort} onSort={requestSort.toggle}>
                    Filed
                  </SortHead>
                  <SortHead sortKey="status" sort={requestSort.sort} onSort={requestSort.toggle}>
                    Status
                  </SortHead>
                  <SortHead
                    sortKey="attachment"
                    sort={requestSort.sort}
                    onSort={requestSort.toggle}
                  >
                    Attachment
                  </SortHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && <TableRowsSkeleton cols={7} rows={5} />}
                {!loading &&
                  requestSort.sorted.map((r) => {
                    const hr = r.attachments?.find((a) => a.direction === "hr");
                    const empFiles = r.attachments?.filter((a) => a.direction === "employee") ?? [];
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.id}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{r.employee}</div>
                          <div className="text-xs text-muted-foreground">{r.employeeId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{r.type}</div>
                          {r.details && (
                            <div className="max-w-xs truncate text-xs text-muted-foreground">
                              {r.details}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.filed}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusClass[r.status] ?? ""}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hr ? (
                            <a
                              href={ermApi.attachmentFileUrl(r.id, hr.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {hr.original_name ?? "Fulfilment file"}
                              <span className="text-muted-foreground">
                                ({formatSize(hr.file_size_bytes)})
                              </span>
                            </a>
                          ) : empFiles.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Paperclip className="h-3.5 w-3.5" /> {empFiles.length} from employee
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {["For Fulfillment", "Approved"].includes(r.status) ? (
                            <Button size="sm" variant="outline" onClick={() => void openFulfil(r)}>
                              {hr ? "Replace" : "Fulfil"}
                            </Button>
                          ) : r.status === "Completed" && hr ? (
                            <Button size="sm" variant="outline" onClick={() => void openFulfil(r)}>
                              Replace
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8">
                      <ListEmptyState placeholder="No document requests found." />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ListBody>
        </div>
      </CardContent>

      <Dialog open={!!fulfilRow} onOpenChange={(open) => !open && setFulfilRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Fulfil {fulfilRow?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              <div className="font-medium">{fulfilRow?.employee}</div>
              <div className="text-xs text-muted-foreground">
                {fulfilRow?.type} · {fulfilRow?.details}
              </div>
            </div>

            <RadioGroup
              value={source}
              onValueChange={(v) => setSource(v as "upload" | "archive")}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="upload" id="src-upload" />
                <Label htmlFor="src-upload" className="flex items-center gap-1.5">
                  <Upload className="h-4 w-4" /> Upload a new file
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  value="archive"
                  id="src-archive"
                  disabled={archiveOptions.length === 0}
                />
                <Label htmlFor="src-archive" className="flex items-center gap-1.5">
                  <Archive className="h-4 w-4" /> Attach from archive
                  {archiveOptions.length === 0 && (
                    <span className="text-xs text-muted-foreground">(none on file)</span>
                  )}
                </Label>
              </div>
            </RadioGroup>

            {source === "upload" ? (
              <div className="space-y-2">
                <Label htmlFor="fulfil-file">File</Label>
                <Input
                  id="fulfil-file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Archived document</Label>
                <Select value={documentId} onValueChange={setDocumentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {archiveOptions.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.code} — {d.title} ({d.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fulfil-note">Note to employee (optional)</Label>
              <Textarea
                id="fulfil-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Attached your Certificate of Employment as requested."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFulfilRow(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void submitFulfil()} disabled={saving}>
              <Download className="mr-2 h-4 w-4" /> Fulfil &amp; notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
