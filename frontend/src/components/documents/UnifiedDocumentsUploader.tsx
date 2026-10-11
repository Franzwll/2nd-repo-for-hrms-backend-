/**
 * Shared 1-box document uploader used by BOTH:
 *  - Landing job apply  (Find Job > Job > Apply for this job card)
 *  - Recruitment > Add Applicant wizard (Step 2)
 *
 * Mirrors the proven test-doc-recognition flow:
 *   rule (first upload = expected resume) + filename hint + CONTENT check.
 */

import { useMemo, useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UnifiedDocType = "Resume" | "COE" | "Certificate" | "Credential" | "Others";

export interface UnifiedDocClassify {
  predicted_type: string;
  confidence: number;
  scores: Record<string, number>;
  reasons: string[];
  signals: { has_email: boolean; has_phone: boolean; sections: string[]; char_count: number };
  text_preview?: string;
  diagnostics?: Record<string, number | boolean>;
  classifier_version?: string;
}

export interface UnifiedDoc {
  id: string;
  file: File;
  status: "pending" | "classifying" | "done" | "error";
  result?: UnifiedDocClassify;
  error?: string;
  /** Effective type = manual override when set, else the classifier guess. */
  manualType?: UnifiedDocType;
}

export const DOC_TYPES: UnifiedDocType[] = ["Resume", "COE", "Certificate", "Credential", "Others"];

export const TYPE_COLOR: Record<string, string> = {
  Resume: "bg-primary text-primary-foreground",
  COE: "bg-sky-600 text-white",
  Certificate: "bg-emerald-600 text-white",
  Credential: "bg-violet-600 text-white",
  Others: "bg-muted text-muted-foreground",
};

export const UNIFIED_ACCEPT =
  ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.heic,.heif,.bmp,.gif,.tiff,.tif,.avif,.svg,.txt";

export const isAcceptedDocFile = (file: File) =>
  /\.(pdf|docx?|png|jpe?g|webp|heic|heif|bmp|gif|tiff?|avif|svg|txt)$/i.test(file.name);

export async function classifyOneDoc(file: File, isFirst: boolean): Promise<UnifiedDocClassify> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("is_first", isFirst ? "true" : "false");
  let res: Response;
  try {
    res = await fetch("/api/v1/landing/classify-document", {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Cannot reach backend (:8000). Is `php artisan serve` running?");
  }
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error_message || json.message || `Classify failed (${res.status})`);
  }
  const scores: Record<string, number> =
    json.scores && typeof json.scores === "object" ? json.scores : {};
  for (const t of ["Resume", "COE", "Certificate", "Credential", "Others"]) {
    const v = Number(scores[t]);
    scores[t] = Number.isFinite(v) ? v : 0;
  }
  const signals = json.signals && typeof json.signals === "object" ? json.signals : {};
  return {
    predicted_type:
      typeof json.predicted_type === "string" && json.predicted_type ? json.predicted_type : "Others",
    confidence: Number.isFinite(Number(json.confidence)) ? Number(json.confidence) : 0,
    scores,
    reasons: Array.isArray(json.reasons) ? json.reasons.map(String) : ["No signals returned."],
    signals: {
      has_email: signals.has_email === true,
      has_phone: signals.has_phone === true,
      sections: Array.isArray(signals.sections) ? signals.sections.map(String) : [],
      char_count: Number.isFinite(Number(signals.char_count)) ? Number(signals.char_count) : 0,
    },
    text_preview: typeof json.text_preview === "string" ? json.text_preview : undefined,
    diagnostics: json.diagnostics && typeof json.diagnostics === "object" ? json.diagnostics : undefined,
    classifier_version: typeof json.classifier_version === "string" ? json.classifier_version : undefined,
  };
}

/** Effective type: manual override wins, else the classifier guess (whitelisted). */
export function effectiveDocType(d: UnifiedDoc): UnifiedDocType {
  if (d.manualType) return d.manualType;
  const p = d.result?.predicted_type;
  return p === "Resume" ||
    p === "COE" ||
    p === "Certificate" ||
    p === "Credential" ||
    p === "Others"
    ? p
    : "Others";
}

/** Highest Resume-score doc (manual Resume overrides count as +inf). */
export function pickResumeDoc(docs: UnifiedDoc[]): UnifiedDoc | null {
  let best: UnifiedDoc | null = null;
  let bestScore = 0;
  for (const d of docs) {
    if (d.status !== "done" || !d.result) {
      if (d.manualType === "Resume") return d;
      continue;
    }
    const s = d.manualType === "Resume" ? Number.POSITIVE_INFINITY : (d.result.scores?.["Resume"] ?? 0);
    if (s > bestScore) {
      bestScore = s;
      best = d;
    }
  }
  return bestScore > 0 ? best : null;
}

export interface UnifiedDocumentsUploaderProps {
  docs: UnifiedDoc[];
  onChange: (docs: UnifiedDoc[]) => void;
  onResumePick?: (file: File | null) => void;
  maxBytes?: number;
  title?: string;
  hint?: string;
  showSplitPreview?: boolean;
  compact?: boolean;
}

let uidCounter = 0;
export const nextUnifiedDocId = () =>
  `${Date.now()}-${uidCounter++}-${Math.random().toString(36).slice(2, 8)}`;

export function UnifiedDocumentsUploader({
  docs,
  onChange,
  onResumePick,
  maxBytes = 10 * 1024 * 1024,
  title = "Documents",
  hint = "Drop your resume + COE + certificates in any order.",
  showSplitPreview = true,
  compact = false,
}: UnifiedDocumentsUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = (next: UnifiedDoc[]) => {
    onChange(next);
    if (onResumePick) {
      const pick = pickResumeDoc(next);
      onResumePick(pick ? pick.file : null);
    }
  };

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => isAcceptedDocFile(f) && f.size <= maxBytes);
    if (!arr.length) return;
    const mapped: UnifiedDoc[] = arr.map((file) => ({
      id: nextUnifiedDocId(),
      file,
      status: "pending" as const,
    }));
    emit([...docs, ...mapped]);
  };

  const classifyAll = async () => {
    const pending = docs.filter((d) => d.status !== "done");
    if (!pending.length || running) return;
    setRunning(true);
    const firstId = docs[0]?.id;
    let next = [...docs];
    for (const it of pending) {
      next = next.map((p) =>
        p.id === it.id
          ? { id: p.id, file: p.file, status: "classifying" as const, ...(p.manualType ? { manualType: p.manualType } : {}) }
          : p,
      );
      onChange(next);
      try {
        const result = await classifyOneDoc(it.file, it.id === firstId);
        next = next.map((p) =>
          p.id === it.id
            ? { id: p.id, file: p.file, status: "done" as const, result, ...(p.manualType ? { manualType: p.manualType } : {}) }
            : p,
        );
        onChange(next);
      } catch (e: any) {
        const message = e?.message || "Failed";
        next = next.map((p) =>
          p.id === it.id
            ? { id: p.id, file: p.file, status: "error" as const, error: message, ...(p.manualType ? { manualType: p.manualType } : {}) }
            : p,
        );
        onChange(next);
      }
    }
    emit(next);
    setRunning(false);
  };

  const done = docs.filter((d) => d.status === "done" && d.result);
  const resumePick = useMemo(() => pickResumeDoc(done), [done]);
  const supporting = done.filter((d) => d.id !== resumePick?.id);
  const pendingCount = docs.filter((d) => d.status !== "done").length;

  return (
    <div className="space-y-3">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-center transition-colors",
          compact ? "p-5" : "p-6",
          dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:bg-muted/60",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <Upload className={cn("h-8 w-8", dragActive ? "text-primary" : "text-muted-foreground")} />
        <span className="text-sm font-medium">{title}</span>
        <span className="max-w-md text-xs text-muted-foreground">{hint}</span>
        <span className="text-[11px] text-muted-foreground">
          PDF, DOC, DOCX, PNG, JPG (max {(maxBytes / 1024 / 1024).toFixed(0)}MB each)
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={UNIFIED_ACCEPT}
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {docs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={classifyAll} disabled={running || !pendingCount}>
            {running ? "Recognizing…" : pendingCount ? `Recognize files (${pendingCount} new)` : "Recognized"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => emit([])} disabled={!docs.length || running}>
            Clear
          </Button>
          {running && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Reading content…
            </span>
          )}
        </div>
      )}

      {showSplitPreview && done.length > 0 && (
        <div className="rounded-md border border-border/70 bg-muted/20 p-3 text-xs">
          <p className="font-semibold">Auto-split preview:</p>
          <p className="mt-1">
            Resume → <b>{resumePick ? resumePick.file.name : "none detected"}</b>
          </p>
          <p>
            Supporting docs → <b>{supporting.length}</b>{" "}
            {supporting.length > 0 && (
              <span className="text-muted-foreground">
                ({supporting.map((s) => `${s.file.name} = ${effectiveDocType(s)}`).join("; ")})
              </span>
            )}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {docs.map((it) => (
          <UnifiedDocRow key={it.id} doc={it} docs={docs} emit={emit} first={it.id === docs[0]?.id} />
        ))}
      </div>
    </div>
  );
}


function UnifiedDocRow({
  doc: it,
  docs,
  emit,
  first,
}: {
  doc: UnifiedDoc;
  docs: UnifiedDoc[];
  emit: (next: UnifiedDoc[]) => void;
  first: boolean;
}) {
  const eff = it.result ? effectiveDocType(it) : (it.manualType ?? null);
  return (
    <div className="rounded-md border border-border/70 bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-gold" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{it.file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {(it.file.size / 1024).toFixed(0)} KB ·{" "}
              {it.status === "pending" && "waiting — press Recognize files"}
              {it.status === "classifying" && "reading content…"}
              {it.status === "error" && <span className="text-destructive">{it.error}</span>}
              {it.status === "done" && it.result &&
                `read ${it.result.signals.char_count} chars`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {it.status === "done" && it.result && eff && (
            <Badge className={TYPE_COLOR[eff] ?? TYPE_COLOR["Others"]}>
              {eff}
              {eff === it.result.predicted_type ? ` · ${Math.round(it.result.confidence * 100)}%` : " · manual"}
            </Badge>
          )}
          {it.status === "pending" && first && (
            <Badge variant="outline" title="First upload — expected resume slot">
              1st · expected resume
            </Badge>
          )}
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => emit(docs.filter((p) => p.id !== it.id))}
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Type:</span>
        <select
          className="rounded border border-border bg-background px-1.5 py-1 text-xs"
          value={it.manualType ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            emit(
              docs.map((p) => {
                if (p.id !== it.id) return p;
                // Rebuild without ever assigning explicit `undefined`:
                // tsconfig `exactOptionalPropertyTypes` rejects
                // `manualType: undefined` on UnifiedDoc.
                const next: UnifiedDoc = { id: p.id, file: p.file, status: p.status };
                if (p.result) next.result = p.result;
                if (p.error !== undefined) next.error = p.error;
                if (v !== "") next.manualType = v as UnifiedDocType;
                return next;
              }),
            );
          }}
          title="Override the recognized type when the guess is wrong"
        >
          <option value="">Auto ({it.result?.predicted_type ?? "unrecognized"})</option>
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

