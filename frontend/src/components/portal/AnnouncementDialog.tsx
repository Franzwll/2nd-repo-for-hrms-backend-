import { useState } from "react";
import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  audienceOptions,
  usePortalState,
  type Announcement,
} from "@/components/portal/portal-state";
import { toast } from "sonner";

export function AnnouncementDialog({
  open,
  onOpenChange,
  author,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  author: string;
}) {
  const { addAnnouncement } = usePortalState();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("All");

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Add a title and message before posting.");
      return;
    }
    setSubmitting(true);
    try {
      await addAnnouncement({ title: title.trim(), body: body.trim(), audience, author });
      toast.success("Announcement posted to the dashboards.");
      setTitle("");
      setBody("");
      setAudience("All");
      onOpenChange(false);
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : "Could not post the announcement. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Megaphone className="h-5 w-5 text-primary" /> New Announcement
          </DialogTitle>
          <DialogDescription>
            Announcements appear on the dashboard of everyone in the selected audience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ann-title">Title</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Payroll cut-off moved to Aug 5"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ann-body">Message</Label>
            <Textarea
              id="ann-body"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the announcement details..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <Select
              value={audience}
              onValueChange={(v) => setAudience(v as Announcement["audience"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Posting…" : "Post announcement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
