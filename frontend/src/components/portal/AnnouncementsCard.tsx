import { Megaphone, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AnnouncementDialog } from "@/components/portal/AnnouncementDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isVisibleTo, usePortalState } from "@/components/portal/portal-state";
import type { Role } from "@/lib/nav";

export function AnnouncementsCard({ role }: { role: Role }) {
  const { announcements, removeAnnouncement } = usePortalState();
  const canManage = role === "superadmin";
  const [publishOpen, setPublishOpen] = useState(false);

  const visible = announcements.filter((a) => isVisibleTo(a.audience, role));

  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold">Announcements</h2>
            <p className="text-xs text-muted-foreground">
              Company-wide updates posted by HR.
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {visible.length}
          </Badge>
          {canManage && (
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => setPublishOpen(true)}
              id="publish-announcement-btn"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {visible.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No announcements yet.
            </p>
          )}
          {visible.map((a) => (
            <div key={a.id} className="rounded-lg border border-border/70 bg-muted/30 p-4">
              <div className="flex items-start gap-2">
                <p className="font-medium">{a.title}</p>
                <Badge variant="outline" className="ml-auto shrink-0 text-[0.65rem]">
                  {a.audience}
                </Badge>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground"
                    aria-label={`Remove announcement ${a.title}`}
                    onClick={() => removeAnnouncement(a.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {a.author} · {a.createdAt}
              </p>
            </div>
          ))}
        </div>
      </CardContent>

      {canManage && (
        <AnnouncementDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          author="Bullseur Santiago"
        />
      )}
    </Card>
  );
}
