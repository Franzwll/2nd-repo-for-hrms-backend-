import { useState, useMemo, useEffect } from "react";
import { Info, Check, Search, ArrowUpDown, Circle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { myProfile } from "@/data/ess";
import { newHiresApi, onboardingItemsApi, type ApiNewHire } from "@/lib/api";

type ChecklistItem = {
  id: string;
  title: string;
  date: string;
  isoDate: string;
  done: boolean;
  rank: number;
  actionLabel: string;
  /** Database onboarding item id — used to toggle completion via the API. */
  dbId?: number;
};

export function EmployeeOnboarding() {
  // The current user's new hire record + checklist come from the database.
  const [newHire, setNewHire] = useState<ApiNewHire | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    newHiresApi
      .list({ per_page: 100 })
      .then((res) => {
        const mine =
          res.data.find((h) => h.name === myProfile.name) ?? res.data[0] ?? null;
        setNewHire(mine);
        return mine;
      })
      .then((mine) => {
        if (!mine) return;
        return onboardingItemsApi
          .listForNewHire(mine.new_hire_id)
          .then((apiItems) => {
            setItems(
              apiItems.map((i, index) => ({
                id: `chk-${i.employee_onboarding_item_id}`,
                dbId: i.employee_onboarding_item_id,
                title: i.item_text,
                date: i.done && i.completed_at
                  ? `Completed ${new Date(i.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "Pending your action",
                isoDate: i.done && i.completed_at ? i.completed_at.slice(0, 10) : "2026-08-01",
                done: Boolean(i.done),
                rank: i.done ? 1 : 0,
                actionLabel: i.done ? "" : "Mark Complete",
              })),
            );
          });
      })
      .catch((err) => {
        console.warn("Could not load onboarding checklist from API:", err);
        toast.error("Could not load your onboarding checklist");
      })
      .finally(() => setLoading(false));
  }, []);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("recent");

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleComplete = (id: string, title: string) => {
    const target = items.find((i) => i.id === id);
    const todayIso = new Date().toISOString().slice(0, 10);
    const updateLocal = () =>
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          return {
            ...i,
            done: true,
            rank: 1,
            date: "Completed just now",
            isoDate: todayIso,
            actionLabel: "",
          };
        }),
      );
    updateLocal();
    toast.success(`"${title}" step completed!`);

    if (target?.dbId) {
      onboardingItemsApi
        .toggle(target.dbId)
        .catch((e) => {
          console.warn("Could not toggle onboarding item on database API:", e);
          toast.error("Could not save completion — please retry.");
        });
    }

    if (completedCount + 1 >= totalCount) {
      setTimeout(() => {
        toast.success("Onboarding checklist complete! Awaiting HR verification.");
      }, 500);
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === "completed") return i.done;
        if (filter === "pending") return !i.done;
        return true;
      })
      .sort((a, b) => {
        if (filter === "recent") return b.isoDate.localeCompare(a.isoDate);
        if (filter === "pending") return a.rank - b.rank;
        return 0;
      });
  }, [items, search, filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Employee Portal"
        title="New Hire Onboarding"
        description="Complete these requirements to finish your onboarding. This menu disappears once HR marks onboarding as complete."
      />

      {/* Yellow HR Notice Alert */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p className="text-sm">
          Employee activation is performed by the HR Admin after all requirements below have been verified.
        </p>
      </div>

      <div className="grid gap-6">
        {/* NEW HIRE ONBOARDING Header & Progress Card */}
        <Card className="border-border/70 overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="eyebrow text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  NEW HIRE ONBOARDING
                </p>
                <h2 className="text-2xl font-bold font-display text-foreground mt-1">
                  {myProfile.name}
                </h2>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  Employee ID: <span className="text-foreground font-mono font-semibold">{myProfile.employeeId}</span>
                </p>
              </div>

              {/* Prominent Employment Status */}
              <div className="flex flex-col sm:items-end">
                <Badge
                  variant="outline"
                  className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 text-base sm:text-lg px-4 py-1.5 font-bold uppercase tracking-widest self-start sm:self-auto shadow-xs"
                >
                  {myProfile.employmentType.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground mt-1 font-medium">Employment Status</span>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="text-primary font-bold">{pct}% Complete</span>
              </div>
              <Progress value={pct} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* ONBOARDING CHECKLIST Card */}
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
            <CardTitle className="font-display text-xl font-semibold">ONBOARDING CHECKLIST</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search checklist..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-[150px] sm:w-[180px]"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-9 w-[130px]">
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading your onboarding checklist...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {totalCount === 0
                    ? "No onboarding checklist assigned yet — your HR admin will assign requirements once you start."
                    : "No checklist items match the current filter."}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                    <div className="flex items-start gap-3">
                      {item.done ? (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white mt-0.5">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 text-amber-500 mt-0.5">
                          <Circle className="h-3 w-3 fill-amber-500" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <Badge
                            variant="outline"
                            className={
                              item.done
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px]"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px]"
                            }
                          >
                            {item.done ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
                      </div>
                    </div>

                    {!item.done && item.actionLabel && (
                      <Button
                        size="sm"
                        className="sm:ml-auto"
                        onClick={() => handleComplete(item.id, item.title)}
                      >
                        {item.actionLabel}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

