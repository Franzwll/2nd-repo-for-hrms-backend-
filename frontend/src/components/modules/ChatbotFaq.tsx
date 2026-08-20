import { useCallback, useEffect, useState } from "react";
import { Bot, Edit3, MessageCircleQuestion, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { chatbotFaqApi, type ApiChatbotFaq } from "@/lib/api";

type Draft = {
  faq_id: number | null;
  question: string;
  answer: string;
  keywords: string;
  enabled: boolean;
  sort_order: number;
};

const EMPTY_DRAFT: Draft = {
  faq_id: null,
  question: "",
  answer: "",
  keywords: "",
  enabled: true,
  sort_order: 0,
};

function keywordsFromChips(raw: string): string[] {
  return raw
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
}

export function ChatbotFaqPage({ role }: { role: "superadmin" | "admin" }) {
  const [faqs, setFaqs] = useState<ApiChatbotFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiChatbotFaq | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    chatbotFaqApi
      .list()
      .then((res) => setFaqs(res.data ?? []))
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Could not load chatbot FAQs.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setDialogOpen(true);
  };

  const openEdit = (faq: ApiChatbotFaq) => {
    setDraft({
      faq_id: faq.faq_id,
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords ?? "",
      enabled: faq.enabled,
      sort_order: faq.sort_order,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!draft.question.trim()) {
      toast.error("Question is required.");
      return;
    }
    if (!draft.answer.trim()) {
      toast.error("Answer is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        question: draft.question.trim(),
        answer: draft.answer.trim(),
        keywords: keywordsFromChips(draft.keywords).join(",") || null,
        enabled: draft.enabled,
        sort_order: Number(draft.sort_order) || 0,
      };
      if (draft.faq_id === null) {
        const res = await chatbotFaqApi.create(payload);
        toast.success(res.message);
      } else {
        const res = await chatbotFaqApi.update(draft.faq_id, payload);
        toast.success(res.message);
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (faq: ApiChatbotFaq) => {
    try {
      const res = await chatbotFaqApi.update(faq.faq_id, { enabled: !faq.enabled });
      toast.success(res.message);
      setFaqs((prev) =>
        prev.map((f) => (f.faq_id === faq.faq_id ? { ...f, enabled: !f.enabled } : f)),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the FAQ.");
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await chatbotFaqApi.remove(deleteTarget.faq_id);
      toast.success(res.message);
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the FAQ.");
    }
  };

  const enabledCount = faqs.filter((f) => f.enabled).length;

  return (
    <div>
      <PageHeader
        eyebrow={role === "superadmin" ? "Super Admin" : "Admin"}
        title="Chatbot FAQ"
        description="Curate the questions and answers the landing-page careers assistant uses to reply."
      />

      <div className="grid gap-5">
        <Card className="rounded-xl border-border/70 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
                  <MessageCircleQuestion className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">FAQ entries</h2>
                  <p className="text-xs text-muted-foreground">
                    {faqs.length} FAQ{faqs.length === 1 ? "" : "s"} · {enabledCount} active
                  </p>
                </div>
              </div>
              <Button onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> Add FAQ
              </Button>
            </div>

            <p className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
              <Bot className="mt-0.5 h-4 w-4 shrink-0" />
              Built-in answers (open jobs, how to apply, salary, documents, hiring timeline,
              contact) always win. This list adds custom knowledge the assistant falls back on for
              other questions. Match on keywords and question wording is scored; unmatched questions
              are logged for review.
            </p>

            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading FAQs…</p>
            ) : faqs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bot className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">No FAQs yet</p>
                <p className="text-xs text-muted-foreground">
                  Add your first entry — e.g. &ldquo;What should I wear to the interview?&rdquo;
                </p>
              </div>
            ) : (
              <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-border/70">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead className="w-28">Keywords</TableHead>
                      <TableHead className="w-16">Active</TableHead>
                      <TableHead className="w-28 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.faq_id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {faq.sort_order}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{faq.question}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                          {faq.answer}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(faq.keywords ?? "")
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((k) => (
                                <Badge key={k} variant="outline" className="text-[0.65rem]">
                                  {k}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            aria-label={`Toggle ${faq.question}`}
                            checked={faq.enabled}
                            onCheckedChange={() => toggleEnabled(faq)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Edit"
                              onClick={() => openEdit(faq)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={deleteTarget?.faq_id === faq.faq_id}
                              onOpenChange={(o) => !o && setDeleteTarget(null)}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Delete"
                                  onClick={() => setDeleteTarget(faq)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    &ldquo;{faq.question}&rdquo; will no longer be used by the
                                    careers assistant. This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {draft.faq_id === null ? "Add FAQ" : "Edit FAQ"}
            </DialogTitle>
            <DialogDescription>
              {draft.faq_id === null
                ? "Create a new question-and-answer entry for the careers assistant."
                : "Update this entry. Changes take effect immediately on the landing page."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={draft.question}
                onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
                placeholder="What should I wear to the interview?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea
                id="faq-answer"
                rows={4}
                value={draft.answer}
                onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))}
                placeholder="Write the assistant's reply…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-keywords">Keywords (comma-separated)</Label>
              <Input
                id="faq-keywords"
                value={draft.keywords}
                onChange={(e) => setDraft((d) => ({ ...d, keywords: e.target.value }))}
                placeholder="dress code, wear, attire, outfit"
              />
              <p className="text-xs text-muted-foreground">
                Words that should route a visitor&rsquo;s question to this answer. They are optional
                but strongly recommended for reliable matching.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faq-sort">Sort order</Label>
                <Input
                  id="faq-sort"
                  type="number"
                  min={0}
                  value={draft.sort_order}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, sort_order: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  id="faq-enabled"
                  checked={draft.enabled}
                  onCheckedChange={(v) => setDraft((d) => ({ ...d, enabled: v }))}
                />
                <Label htmlFor="faq-enabled">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              <Edit3 className="mr-1.5 h-4 w-4" />
              {saving ? "Saving…" : draft.faq_id === null ? "Create FAQ" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
