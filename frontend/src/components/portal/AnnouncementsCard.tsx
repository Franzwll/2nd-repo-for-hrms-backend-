import { Megaphone, Plus, Trash2, ArrowUpRight, ChevronRight } from "lucide-react";
import { useState } from "react";

import { AnnouncementDialog } from "@/components/portal/AnnouncementDialog";
import { AnnouncementsModal } from "@/components/portal/AnnouncementsModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isVisibleTo, usePortalState } from "@/components/portal/portal-state";
import { getUser } from "@/lib/auth";
import type { Role } from "@/lib/nav";

export function AnnouncementsCard({ role }: { role: Role }) {
  const { announcements, removeAnnouncement } = usePortalState();
  const canManage = role === "superadmin";
  const [publishOpen, setPublishOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const visible = announcements.filter((a) => isVisibleTo(a.audience, role));
  const previewItems = visible.slice(0, 3);

  return (
    <Card className="border-border/70">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center text-primary rounded-xl bg-primary/10">
              <Megaphone className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold flex items-center gap-2">
                Announcements
                <Badge variant="outline" className="text-xs">
                  {visible.length}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Company-wide updates and bulletins posted by HR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {visible.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1 font-semibold text-xs h-8 border-primary/30 hover:bg-primary/5 text-primary"
                onClick={() => setViewAllOpen(true)}
              >
                <span>View All</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {canManage && (
              <Button
                size="sm"
                className="shrink-0 h-8 text-xs gap-1"
                onClick={() => setPublishOpen(true)}
                id="publish-announcement-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                Publish
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {visible.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No announcements yet.
            </p>
          )}
          {previewItems.map((a) => (
            <div
              key={a.id}
              onClick={() => setViewAllOpen(true)}
              className="rounded-xl border border-border/70 bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/40 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-start gap-2">
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {a.title}
                </p>
                <Badge variant="outline" className="ml-auto shrink-0 text-[0.65rem] bg-primary/5 text-primary border-primary/20">
                  {a.audience}
                </Badge>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove announcement ${a.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnouncement(a.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {a.body}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{a.author} · {a.createdAt}</span>
                <span className="text-primary font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ChevronRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))}

          {visible.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewAllOpen(true)}
              className="w-full text-xs text-primary font-semibold hover:bg-primary/5 mt-2"
            >
              View all {visible.length} announcements →
            </Button>
          )}
        </div>
      </CardContent>

      {canManage && (
        <AnnouncementDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          author={getUser()?.full_name ?? "System"}
        />
      )}

      {/* View All & Details Modal with Search, Filter & Pagination */}
      <AnnouncementsModal
        open={viewAllOpen}
        onOpenChange={setViewAllOpen}
        role={role}
      />
    </Card>
  );
}
