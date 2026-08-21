import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Trash2,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import type { Announcement, Audience } from "@/components/portal/portal-state";
import { isVisibleTo, usePortalState } from "@/components/portal/portal-state";
import type { Role } from "@/lib/nav";

interface AnnouncementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

const ITEMS_PER_PAGE = 4;

export function AnnouncementsModal({
  open,
  onOpenChange,
  role,
}: AnnouncementsModalProps) {
  const { announcements, removeAnnouncement } = usePortalState();
  const canManage = role === "superadmin";

  const [search, setSearch] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Role visibility filter
  const visibleToRole = useMemo(() => {
    return announcements.filter((a) => isVisibleTo(a.audience, role));
  }, [announcements, role]);

  // 2. Search and Audience filter
  const filtered = useMemo(() => {
    return visibleToRole.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.body.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase());

      const matchAudience =
        selectedAudience === "All" || a.audience === selectedAudience;

      return matchSearch && matchAudience;
    }).sort((a, b) => {
      if (sortOrder === "newest") {
        return (b.id > a.id ? 1 : -1);
      }
      return (a.id > b.id ? 1 : -1);
    });
  }, [visibleToRole, search, selectedAudience, sortOrder]);

  // 3. Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 on search / filter change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleAudienceChange = (val: string) => {
    setSelectedAudience(val);
    setCurrentPage(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] p-0 gap-0 overflow-hidden bg-background border-border/80 shadow-2xl flex flex-col rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-semibold flex items-center gap-2">
                Company Announcements
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                  {visibleToRole.length} Total
                </Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Official updates and bulletins from Oxford Suites Makati HR.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="p-4 sm:p-5 border-b border-border/60 bg-card space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements by title, keyword, or author..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-8 text-xs sm:text-sm h-9 rounded-xl"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Audience Filter Select */}
            <div className="flex items-center gap-2">
              <Select value={selectedAudience} onValueChange={handleAudienceChange}>
                <SelectTrigger className="w-[140px] sm:w-[155px] h-9 text-xs rounded-xl">
                  <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Audiences</SelectItem>
                  <SelectItem value="Employee">Employees</SelectItem>
                  <SelectItem value="Admin">Admins</SelectItem>
                  <SelectItem value="Super Admin">Super Admins</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order Select */}
              <Select value={sortOrder} onValueChange={(v: "newest" | "oldest") => setSortOrder(v)}>
                <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
                  <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Announcement List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 min-h-[260px]">
          {paginatedItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center">
                <Megaphone className="h-6 w-6" />
              </div>
              <p className="font-semibold text-sm text-foreground">No announcements found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No matching announcements found for your current search or filter criteria.
              </p>
              {(search || selectedAudience !== "All") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedAudience("All");
                  }}
                  className="text-xs mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            paginatedItems.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:bg-muted/10 transition-all space-y-2.5 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-display text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-primary" /> {a.author}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {a.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold px-2 py-0.5 ${
                        a.audience === "All"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : a.audience === "Employee"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                      }`}
                    >
                      {a.audience}
                    </Badge>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        aria-label={`Remove announcement ${a.title}`}
                        onClick={() => removeAnnouncement(a.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/40 pt-2.5">
                  {a.body}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer & Pagination Controls */}
        <div className="px-6 py-3.5 border-t border-border/70 bg-card/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length > 0 ? startIndex + 1 : 0}</span> to{" "}
            <span className="font-semibold text-foreground">{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}</span> of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span> announcements
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs rounded-lg ${pageNum === currentPage ? "font-bold shadow-xs" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
