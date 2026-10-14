import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CheckCircle2, FileText, ThumbsDown, ThumbsUp, Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * ISOLATED accuracy test page for the single-dropzone document classifier.
 * Route: /test-doc-recognition
 *
 * Does NOT touch the real apply flow (jobs.$jobId.tsx). Drag resume + COE +
 * certificates in ANY order with NO tags — the backend reads file CONTENT
 * (POST /api/v1/landing/classify-document -> NLP /classify-document) and
 * predicts Resume | COE | Certificate | Credential | Others.
 *
 * Use this to judge accuracy before we merge the real apply form into 1 box.
 */
export const Route = createFileRoute("/test-doc-recognition")({
  component: TestDocRecognition,
});

type ClassifyResult = {
  predicted_type: string;
  confidence: number;
  scores: Record<string, number>;
  reasons: string[];
  signals: { has_email: boolean; has_phone: boolean; sections: string[]; char_count: number };
  text_preview?: string;
  text_extraction?: { method?: string; pages?: number; extension?: string; character_count?: number };
  diagnostics?: Record<string, number | boolean>;
  classifier_version?: string;
};

type Item = {
  id: string;
  file: File;
  status: "pending" | "classifying" | "done" | "error";
  result?: ClassifyResult;
  error?: string;
  verdict?: "correct" | "wrong";
};

const TYPE_COLOR: Record<string, string> = {
  Resume: "bg-primary text-primary-foreground",
  COE: "bg-sky-600 text-white",
  Certificate: "bg-emerald-600 text-white",
  Credential: "bg-violet-600 text-white",
  Others: "bg-muted text-muted-foreground",
};

async function classifyOne(file: File, isFirst: boolean): Promise<ClassifyResult> {
  const fd = new FormData();
  fd.append("file", file);
  // Order prior: first upload is EXPECTED to be the resume (+2 resume hint),
  // but content always decides — a COE uploaded first still scores COE.
  fd.append("is_first", isFirst ? "true" : "false");
  let res: Response;
  try {
    // Accept: application/json forces Laravel to answer validation failures
    // as JSON (422) instead of an HTML redirect the browser would follow and
    // misread as an empty result.
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
  // Normalize ANY backend shape so render can never crash (docx/odd files).
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
    text_extraction:
      json.text_extraction && typeof json.text_extraction === "object" ? json.text_extraction : undefined,
    diagnostics:
      json.diagnostics && typeof json.diagnostics === "object" ? json.diagnostics : undefined,
    classifier_version: typeof json.classifier_version === "string" ? json.classifier_version : undefined,
  };
}

function TestDocRecognition() {
  const [items, setItems] = useState<Item[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const arr = Array.from(files);
    if (!arr.length) return;
    setItems((prev) => [
      ...prev,
      ...arr.map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        file,
        status: "pending" as const,
      })),
    ]);
  };

  const classifyAll = async () => {
    if (!items.length || running) return;
    setRunning(true);
    // First item in the list = first upload = expected resume slot.
    const firstPendingId = items.find((i) => i.status !== "done")?.id;
    for (const it of items) {
      if (it.status === "done") continue;
      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "classifying" as const, error: undefined as unknown as string } : p)));
      try {
        const result = await classifyOne(it.file, it.id === firstPendingId);
        setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "done", result } : p)));
      } catch (e: any) {
        setItems((prev) =>
          prev.map((p) => (p.id === it.id ? { ...p, status: "error", error: e?.message || "Failed" } : p)),
        );
      }
    }
    setRunning(false);
  };

  const done = items.filter((i) => i.status === "done" && i.result);
  const resumePick = (() => {
    let best: Item | null = null;
    let bestScore = 0;
    for (const it of done) {
      const s = it.result!.scores?.["Resume"] ?? 0;
      if (s > bestScore) {
        bestScore = s;
        best = it;
      }
    }
    return best && bestScore > 0 ? { item: best, score: bestScore } : null;
  })();
  const supporting = done.filter((d) => d.id !== resumePick?.item.id);

  const judged = items.filter((i) => i.verdict);
  const correct = judged.filter((i) => i.verdict === "correct").length;
  const accuracy = judged.length ? Math.round((correct / judged.length) * 100) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Document recognition test</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Isolated test only — the real Apply form is untouched. Drop <b>resume + COE + certificates</b> in{" "}
        <b>any order, no tags</b>. The system reads file content and guesses each type. Mark each guess Correct /
        Wrong to measure accuracy.
      </p>

      {/* Single dropzone — mirrors the proposed 1-box apply UX */}
      <label
        className={cn(
          "mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors",
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
        <Upload className={cn("h-9 w-9", dragActive ? "text-primary" : "text-muted-foreground")} />
        <span className="text-sm text-muted-foreground">
          Drag files here in any order or click to browse — PDF, DOC, DOCX, PNG, JPG (max 20MB each). Try renaming
          files to prove order/filename don't matter.
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.heic,.heif,.bmp,.gif,.tiff,.tif,.avif,.svg,.txt"
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={classifyAll} disabled={!items.length || running}>
          {running ? "Recognizing…" : `Recognize ${items.length ? `(${items.length} files)` : ""}`}
        </Button>
        <Button variant="outline" onClick={() => setItems([])} disabled={!items.length || running}>
          Clear
        </Button>
        {accuracy !== null && (
          <Badge variant="outline" className="ml-auto">
            Your accuracy check: {correct}/{judged.length} correct ({accuracy}%)
          </Badge>
        )}
      </div>

      {/* Auto-split summary — what the future 1-box apply would submit */}
      {done.length > 0 && (
        <Card className="mt-6 border-border/70 bg-muted/20">
          <CardContent className="p-4 text-sm">
            <p className="font-semibold">Auto-split preview (what 1-box apply would send):</p>
            <p className="mt-1">
              Resume → <b>{resumePick ? resumePick.item.file.name : "none detected"}</b>
              {resumePick && <span className="text-muted-foreground"> (resume score {resumePick.score})</span>}
            </p>
            <p>
              Supporting docs → <b>{supporting.length}</b>{" "}
              {supporting.length > 0 && (
                <span className="text-muted-foreground">
                  ({supporting.map((s) => `${s.file.name} = ${s.result!.predicted_type}`).join("; ")})
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {items.map((it) => (
          <Card key={it.id} className="border-border/70">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{it.file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(it.file.size / 1024).toFixed(0)} KB ·{" "}
                      {it.status === "pending" && "waiting"}
                      {it.status === "classifying" && "reading content…"}
                      {it.status === "error" && <span className="text-destructive">{it.error}</span>}
                      {it.status === "done" &&
                        it.result &&
                        `read ${it.result.signals.char_count} chars via ${it.result.text_extraction?.method ?? "text"} · sections: ${it.result.signals.sections.join(", ") || "none"} · engine: ${it.result.classifier_version ?? "OLD — restart NLP"}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {it.status === "done" && it.result && (
                    <Badge className={TYPE_COLOR[it.result.predicted_type] ?? TYPE_COLOR["Others"]}>
                      {it.result.predicted_type} · {Math.round(it.result.confidence * 100)}%
                    </Badge>
                  )}
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Confidence bar */}
              {it.status === "done" && it.result && (
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.round(it.result.confidence * 100)}%` }}
                  />
                </div>
              )}

              {/* Zero-text hint — file had nothing readable to classify */}
              {it.status === "done" &&
                it.result &&
                (it.result.signals.char_count ?? 0) === 0 && (
                  <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-200">
                    No readable text found in this file, so there's nothing to recognize yet. Quick check: open it in
                    Word — can you highlight/select the text? If not, it's images or fancy textboxes. Re-save as DOCX
                    or PDF with selectable text and try again.
                    {it.result.diagnostics && (
                      <span className="mt-1 block font-mono text-[11px]">
                        file inside: {it.result.diagnostics["paragraphs"] ?? 0} paragraphs (
                        {it.result.diagnostics["paragraphs_with_text"] ?? 0} with text),{" "}
                        {it.result.diagnostics["tables"] ?? 0} tables, {it.result.diagnostics["textboxes"] ?? 0}{" "}
                        textboxes, {it.result.diagnostics["embedded_images"] ?? 0} images — copy this line to me.
                      </span>
                    )}
                  </div>
                )}

              {/* Score breakdown */}
              {it.status === "done" && it.result && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  {Object.entries(it.result.scores)
                    .sort((a, b) => b[1] - a[1])
                    .map(([t, s]) => (
                      <span
                        key={t}
                        className={cn(
                          "rounded border px-1.5 py-0.5",
                          t === it.result!.predicted_type
                            ? "border-primary font-semibold"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {t}: {s}
                      </span>
                    ))}
                  <span className="text-muted-foreground">
                    · email {it.result.signals.has_email ? "yes" : "no"} · phone{" "}
                    {it.result.signals.has_phone ? "yes" : "no"}
                  </span>
                </div>
              )}

              {/* Why this guess — transparency for accuracy judging */}
              {it.status === "done" && it.result && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-primary hover:underline">
                    Why this guess? ({it.result.reasons.length} signals)
                  </summary>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                    {it.result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  {it.result.text_preview && (
                    <p className="mt-2 rounded bg-muted/60 p-2 font-mono text-[11px] whitespace-pre-wrap">
                      {it.result.text_preview}…
                    </p>
                  )}
                </details>
              )}

              {/* Manual accuracy vote */}
              {it.status === "done" && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Is this guess right?</span>
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 rounded border px-2 py-1",
                      it.verdict === "correct"
                        ? "border-emerald-600 bg-emerald-600/10 text-emerald-700"
                        : "border-border text-muted-foreground hover:border-emerald-600",
                    )}
                    onClick={() =>
                      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, verdict: "correct" } : p)))
                    }
                  >
                    <ThumbsUp className="h-3 w-3" /> Correct
                  </button>
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 rounded border px-2 py-1",
                      it.verdict === "wrong"
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border text-muted-foreground hover:border-destructive",
                    )}
                    onClick={() =>
                      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, verdict: "wrong" } : p)))
                    }
                  >
                    <ThumbsDown className="h-3 w-3" /> Wrong
                  </button>
                  {it.verdict && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" /> voted {it.verdict}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No files yet — drop a resume, a COE, and a training certificate to test.
          </p>
        )}
      </div>
    </div>
  );
}
