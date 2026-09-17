import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui/loading-skeletons";
import { essApi, hcmApi, type ApiPromotionRequest } from "@/lib/api";

/**
 * ESS Promotion tab — employees request status/position promotion.
 * HR reviews in Core HCM → Promotion Requests tab.
 */
export function EssPromotionTab() {
  const [rows, setRows] = useState<ApiPromotionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<{ position_id: number; title: string }[]>([]);
  const [targetId, setTargetId] = useState("");
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [mine, pos] = await Promise.allSettled([
        essApi.myPromotionRequests(),
        hcmApi.positions.list({ per_page: 100 }),
      ]);
      if (mine.status === "fulfilled") setRows(mine.value?.data ?? []);
      if (pos.status === "fulfilled") {
        setPositions(
          (pos.value?.data ?? []).map((p: any) => ({
            position_id: p.position_id,
            title: p.title,
          })),
        );
      }
    } catch {
      toast.error("Could not load promotion requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pending = rows.find((r) =>
    ["Pending", "Returned", "Under HR3 Review", "Pending HR Action"].includes(r.status),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (justification.trim().length < 10) {
      toast.error("Please explain why you deserve the promotion (min 10 characters).");
      return;
    }
    setSubmitting(true);
    try {
      await essApi.createPromotionRequest({
        requested_position_id: targetId ? Number(targetId) : null,
        justification: justification.trim(),
      });
      toast.success("Promotion request submitted for HR review.");
      setJustification("");
      setTargetId("");
      load();
    } catch (err: any) {
      if (err?.status === 409) {
        toast.warning(err?.message || "You already have a pending promotion request.");
      } else {
        toast.error(err?.message || "Could not submit promotion request.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-xl font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" /> Request Promotion
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Ask HR to review you for a higher position or salary grade. One active request at a
            time.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {pending && (
            <p className="mb-4 rounded-md border border-gold/40 bg-gold/10 p-3 text-xs">
              You have a {pending.status.toLowerCase()} request filed on{" "}
              {new Date(pending.created_at).toLocaleDateString()} —{" "}
              {pending.status === "Under HR3 Review"
                ? "HR forwarded it to performance evaluation (HR3)."
                : pending.status === "Pending HR Action"
                  ? "HR3 returned an evaluation — HR is making the final decision."
                  : "HR will review it in Core HCM."}{" "}
              You can file a new one after it is decided.
            </p>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Target position (optional — leave blank for HR recommendation)</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a position…" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.position_id} value={String(p.position_id)}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Why do you deserve this promotion? *</Label>
              <Textarea
                rows={4}
                placeholder="Achievements, tenure, skills, performance highlights…"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting || !!pending}>
              {submitting ? "Submitting…" : "Submit promotion request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="font-display text-xl font-semibold">My promotion requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <ListSkeleton items={3} />
          ) : rows.length === 0 ? (
            <p className="text-xs text-muted-foreground">No promotion requests filed yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.promotion_request_id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3 text-xs"
                >
                  <div>
                    <p className="font-semibold">
                      → {r.requested_position?.title ?? "For HR review"}
                    </p>
                    <p className="text-muted-foreground">
                      Filed {new Date(r.created_at).toLocaleDateString()}
                      {r.hr3_recommendation
                        ? ` · HR3: ${r.hr3_recommendation.evaluation_score}% (${r.hr3_recommendation.recommendation_type})`
                        : ""}
                      {r.review_notes ? ` · HR: ${r.review_notes}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      r.status === "Approved"
                        ? "border-success/40 bg-success/10 text-success"
                        : r.status === "Rejected"
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-gold/40 text-gold"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
