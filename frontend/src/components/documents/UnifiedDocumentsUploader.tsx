/**
 * Shared 1-box document uploader used by BOTH:
 *  - Landing job apply  (Find Job > Job > Apply for this job card)
 *  - Recruitment > Add Applicant wizard (Step 1)
 *
 * Every dropped file is auto-recognized on the spot — rule + filename +
 * CONTENT check against the NLP classifier. There is no "Recognize" button.
 *
 * The FIRST file that is actually recognized as a Resume (classifier says
 * Resume, or the user marks it as Resume) fires `onResumeRecognized` exactly
 * once so the parent can auto-fill the applicant details from the original
 * resume. Later uploads never re-trigger the fill; removing the recognized
 * resume re-arms the trigger for the next one.
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText, Loader2, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
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
    // Use the configured API origin, never a root-relative "/api/..." path:
    // in production the frontend is served by `vite preview` (no proxy), so a
    // relative URL hits the frontend host and 502s / returns HTML instead of
    // reaching Laravel on the API subdomain.
    res = await fetch(`${API_BASE_URL}/landing/classify-document`, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Could not reach the document recognition service.");
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
      typeof json.predicted_type === "string" && json.predicted_type
        ? json.predicted_type
        : "Others",
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
    diagnostics:
      json.diagnostics && typeof json.diagnostics === "object" ? json.diagnostics : undefined,
    classifier_version:
      typeof json.classifier_version === "string" ? json.classifier_version : undefined,
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
    const s =
      d.manualType === "Resume" ? Number.POSITIVE_INFINITY : (d.result.scores?.["Resume"] ?? 0);
    if (s > bestScore) {
      bestScore = s;
      best = d;
    }
  }
  return bestScore > 0 ? best : null;
}

/** True when this doc is recognized as THE resume: user override first, then classifier. */
function isRecognizedResume(d: UnifiedDoc): boolean {
  return d.manualType ? d.manualType === "Resume" : d.result?.predicted_type === "Resume";
}

/** Opens a staged local file in a new tab (object URL revoked after a while). */
function openLocalFile(file: File) {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export interface UnifiedDocumentsUploaderProps {
  docs: UnifiedDoc[];
  onChange: (docs: UnifiedDoc[]) => void;
  /**
   * Fired ONCE, the first time a file is actually recognized as a resume
   * (content classifier says Resume, or the user marks a file as Resume).
   * Removing that resume re-arms the trigger for the next recognized one.
   */
  onResumeRecognized?: (file: File) => void;
  maxBytes?: number;
  title?: string;
  hint?: string;
  compact?: boolean;
}

let uidCounter = 0;
export const nextUnifiedDocId = () =>
  `${Date.now()}-${uidCounter++}-${Math.random().toString(36).slice(2, 8)}`;

export function UnifiedDocumentsUploader({
  docs,
  onChange,
  onResumeRecognized,
  maxBytes = 10 * 1024 * 1024,
  title = "Documents",
  hint = "Drop your resume + COE + certificates in any order.",
  compact = false,
}: UnifiedDocumentsUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [recognizedResumeId, setRecognizedResumeId] = useState<string | null>(null);
  /** null = follow the default (auto-expand when few supporting docs). */
  const [showSupporting, setShowSupporting] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Latest docs mirror — async recognition patches this without racing React state. */
  const docsRef = useRef<UnifiedDoc[]>(docs);
  /** Doc id of the resume already used for auto-fill ("only once" guard). */
  const recognizedResumeIdRef = useRef<string | null>(null);
  /** Auto-recognition queue (ids), drained sequentially. */
  const queueRef = useRef<string[]>([]);
  const drainingRef = useRef(false);

  useEffect(() => {
    docsRef.current = docs;
    // Parent cleared the list — forget the recognized resume so the next
    // uploaded resume can fill the details again.
    if (!docs.length && recognizedResumeIdRef.current) {
      recognizedResumeIdRef.current = null;
      setRecognizedResumeId(null);
    }
  }, [docs]);

  const patchDoc = (id: string, patch: Partial<UnifiedDoc>) => {
    const next = docsRef.current.map((d) => (d.id === id ? { ...d, ...patch } : d));
    docsRef.current = next;
    onChange(next);
  };

  const setRecognized = (id: string | null) => {
    recognizedResumeIdRef.current = id;
    setRecognizedResumeId(id);
  };

  /** Fires onResumeRecognized only for the FIRST recognized original resume. */
  const maybeRecognizeResume = (id: string) => {
    const doc = docsRef.current.find((d) => d.id === id);
    if (!doc || !isRecognizedResume(doc)) return;
    const current = recognizedResumeIdRef.current;
    // A resume was already used for auto-fill and is still staged — never
    // re-fill from a later upload ("only once" rule).
    if (current && docsRef.current.some((d) => d.id === current)) return;
    setRecognized(id);
    onResumeRecognized?.(doc.file);
  };

  /** Sequential recognizer — every uploaded file goes through this on add. */
  const drainQueue = async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    setRunning(true);
    try {
      while (queueRef.current.length) {
        const id = queueRef.current.shift();
        if (!id) continue;
        const doc = docsRef.current.find((d) => d.id === id);
        if (!doc || doc.status === "done") continue;
        // First file in the list still carries the small "expected resume"
        // prior — content always outvotes it. Not shown as a badge.
        const isFirst = docsRef.current[0]?.id === id;
        patchDoc(id, { status: "classifying" });
        try {
          const result = await classifyOneDoc(doc.file, isFirst);
          patchDoc(id, { status: "done", result });
          maybeRecognizeResume(id);
        } catch (e: any) {
          patchDoc(id, { status: "error", error: e?.message || "Recognition failed" });
        }
      }
    } finally {
      drainingRef.current = false;
      setRunning(false);
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
    const next = [...docsRef.current, ...mapped];
    docsRef.current = next;
    onChange(next);
    // Auto-recognize right away — no button to press.
    queueRef.current.push(...mapped.map((d) => d.id));
    void drainQueue();
  };

  const removeDoc = (id: string) => {
    const next = docsRef.current.filter((d) => d.id !== id);
    docsRef.current = next;
    onChange(next);
    queueRef.current = queueRef.current.filter((q) => q !== id);
    if (recognizedResumeIdRef.current === id) setRecognized(null);
  };

  const clearAll = () => {
    queueRef.current = [];
    docsRef.current = [];
    onChange([]);
    setRecognized(null);
  };

  const retryFailed = () => {
    const ids = docsRef.current.filter((d) => d.status === "error").map((d) => d.id);
    if (!ids.length) return;
    queueRef.current.push(...ids);
    void drainQueue();
  };

  const setManualType = (id: string, value: UnifiedDocType | "") => {
    const next = docsRef.current.map((p) => {
      if (p.id !== id) return p;
      // Rebuild without ever assigning explicit `undefined`:
      // tsconfig `exactOptionalPropertyTypes` rejects it.
      const rebuilt: UnifiedDoc = { id: p.id, file: p.file, status: p.status };
      if (p.result) rebuilt.result = p.result;
      if (p.error !== undefined) rebuilt.error = p.error;
      if (value !== "") rebuilt.manualType = value;
      return rebuilt;
    });
    docsRef.current = next;
    onChange(next);
    const doc = next.find((d) => d.id === id);
    if (!doc) return;
    if (doc.manualType === "Resume") {
      // Explicit user designation — treat as the recognized original resume.
      if (recognizedResumeIdRef.current !== id) {
        setRecognized(null);
        maybeRecognizeResume(id);
      }
    } else if (recognizedResumeIdRef.current === id) {
      // Demoted — re-arm the trigger for the next recognized resume.
      setRecognized(null);
    }
  };

  const recognizedDoc = recognizedResumeId
    ? (docs.find((d) => d.id === recognizedResumeId) ?? null)
    : null;
  const supportingDocs = docs.filter((d) => d.id !== recognizedDoc?.id);
  const supportingOpen = showSupporting ?? supportingDocs.length <= 2;
  const busyCount = docs.filter((d) => d.status === "pending" || d.status === "classifying").length;
  const errorCount = docs.filter((d) => d.status === "error").length;
  const hasDocs = docs.length > 0;

  return (
    <div className="space-y-2">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors",
          compact ? "p-5" : "p-6",
          dragActive
            ? "border-primary bg-primary/10"
            : "border-border bg-muted/40 hover:bg-muted/60",
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
        {/* Dropzone keeps the same large size before and after files are
            added — only the title swaps to invite more files. */}
        <>
          <Upload
            className={cn("h-7 w-7", dragActive ? "text-primary" : "text-muted-foreground")}
          />
          <span className="text-sm font-medium">
            {hasDocs ? "Add more files — auto-recognized" : title}
          </span>
          <span className="max-w-md text-xs text-muted-foreground">{hint}</span>
          <span className="text-[10px] text-muted-foreground">
            PDF, DOC, DOCX, PNG, JPG — max {(maxBytes / 1024 / 1024).toFixed(0)} MB each
          </span>
        </>
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

      {hasDocs && (
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
            {running ? (
              <>
                <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                Recognizing {busyCount || 1} file{(busyCount || 1) === 1 ? "" : "s"}…
              </>
            ) : recognizedDoc ? (
              <>
                <FileText className="h-3 w-3 shrink-0 text-success" />
                Resume recognized — supporting files ride along automatically.
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 shrink-0" />
                No resume recognized yet — mark one as Resume to fill the details.
              </>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-0.5">
            {errorCount > 0 && !running && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px] text-destructive hover:text-destructive"
                onClick={retryFailed}
              >
                Retry {errorCount}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[11px] text-muted-foreground"
              onClick={clearAll}
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      {recognizedDoc && (
        <UnifiedDocRow
          doc={recognizedDoc}
          accent
          onRemove={() => removeDoc(recognizedDoc.id)}
          onType={(v) => setManualType(recognizedDoc.id, v)}
        />
      )}

      {supportingDocs.length > 0 && (
        <div className="overflow-hidden rounded-md border border-border/60">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 bg-muted/30 px-2.5 py-1.5 text-left"
            onClick={() => setShowSupporting(!supportingOpen)}
          >
            <span className="text-[11px] font-medium">
              {recognizedDoc
                ? `Supporting documents (${supportingDocs.length})`
                : `Files (${supportingDocs.length})`}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                supportingOpen && "rotate-180",
              )}
            />
          </button>
          {supportingOpen && (
            <div className="max-h-60 space-y-1 overflow-y-auto border-t border-border/60 p-1.5">
              {supportingDocs.map((it) => (
                <UnifiedDocRow
                  key={it.id}
                  doc={it}
                  onRemove={() => removeDoc(it.id)}
                  onType={(v) => setManualType(it.id, v)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** One compact line per file: open · name · size · recognized type · override · remove. */
function UnifiedDocRow({
  doc,
  accent = false,
  onRemove,
  onType,
}: {
  doc: UnifiedDoc;
  accent?: boolean;
  onRemove: () => void;
  onType: (value: UnifiedDocType | "") => void;
}) {
  const eff = doc.result ? effectiveDocType(doc) : (doc.manualType ?? null);
  const busy = doc.status === "pending" || doc.status === "classifying";
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-2.5 py-1.5",
        accent ? "border-primary/40 bg-primary/[0.04]" : "border-border/60 bg-background",
      )}
    >
      <FileText className={cn("h-3.5 w-3.5 shrink-0", accent ? "text-primary" : "text-gold")} />
      <button
        type="button"
        onClick={() => openLocalFile(doc.file)}
        title={`Open ${doc.file.name}`}
        className={cn(
          "min-w-0 flex-1 truncate text-left text-xs hover:underline hover:underline-offset-2",
          accent ? "font-semibold" : "font-medium",
        )}
      >
        {doc.file.name}
      </button>
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {(doc.file.size / 1024).toFixed(0)} KB
      </span>
      {busy ? (
        <Loader2
          className="h-3 w-3 shrink-0 animate-spin text-muted-foreground"
          aria-label="Reading content"
        />
      ) : doc.status === "error" ? (
        <span
          className="shrink-0 text-[10px] font-semibold text-destructive"
          title={doc.error ?? "Recognition failed"}
        >
          Error
        </span>
      ) : eff ? (
        <Badge
          className={cn(
            "shrink-0 px-1.5 py-0 text-[10px] font-semibold",
            TYPE_COLOR[eff] ?? TYPE_COLOR["Others"],
          )}
          title={`Recognized ${eff}${
            doc.result ? ` · ${Math.round(doc.result.confidence * 100)}% confidence` : " · manual"
          }`}
        >
          {eff}
        </Badge>
      ) : null}
      <select
        className={cn(
          "shrink-0 rounded border border-border/70 bg-background px-1 py-0.5 text-[10px]",
          doc.manualType ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
        value={doc.manualType ?? ""}
        onChange={(e) => onType(e.target.value as UnifiedDocType | "")}
        title="Override the recognized type when the guess is wrong"
      >
        <option value="">Auto</option>
        {DOC_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        title="Remove file"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
