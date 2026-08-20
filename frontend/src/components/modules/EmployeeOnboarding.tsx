import { useState, useMemo, useEffect } from "react";
import {
  Info,
  Check,
  Search,
  ArrowUpDown,
  Circle,
  ChevronDown,
  ListChecks,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { newHiresApi, onboardingItemsApi, essApi, type ApiNewHire, type ApiEssOverview } from "@/lib/api";
import { getUser } from "@/lib/auth";

type Phase = "Pre-onboarding" | "Probationary";

type ChecklistItem = {
  id: string;
  title: string;
  date: string;
  isoDate: string;
  done: boolean;
  rank: number;
  actionLabel: string;
  phase: Phase;
  /** Database onboarding item id — used to toggle completion via the API. */
  dbId?: number;
  /** Template item id — virtual items are materialized on first completion. */
  templateItemId?: number | null;
};

function ChecklistRow({ item }: { item: ChecklistItem }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
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
              {item.done ? "Completed" : "Pending Admin Verification"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
        </div>
      </div>
    </div>
  );
}

export function EmployeeOnboarding() {
  const user = getUser();
  const [overview, setOverview] = useState<ApiEssOverview | null>(null);
  const [newHire, setNewHire] = useState<ApiNewHire | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    essApi.overview().then(setOverview).catch(() => {});
  }, []);

  const profileName = overview?.employee?.name || user?.full_name || myProfile.name;
  const profileEmail = overview?.employee?.email || user?.email;
  const profileEmpCode = overview?.employee?.code || myProfile.employeeId;
  const profilePosition = overview?.employee?.position || myProfile.position;
  const profileDepartment = overview?.employee?.department || user?.department_name || myProfile.department;
  const employmentType =
    overview?.employee?.employment_type ||
    newHire?.stage ||
    myProfile.employmentType;

  useEffect(() => {
    newHiresApi
      .list({ per_page: 100 })
      .then((res) => {
        const mine =
          res.data.find(
            (h) =>
              (user?.employee_id && h.employee_id === user.employee_id) ||
              h.name.toLowerCase() === profileName.toLowerCase() ||
              (profileEmail && h.email === profileEmail)
          ) ??
          res.data[0] ??
          null;

        setNewHire(mine);
        return mine;
      })
      .then((mine) => {
        if (!mine) return;
        return onboardingItemsApi
          .listForNewHire(mine.new_hire_id)
          .then((apiItems) => {
            setItems(
              apiItems.map((i) => ({
                id: i.employee_onboarding_item_id
                  ? `chk-${i.employee_onboarding_item_id}`
                  : `virt-${i.template_item_id}`,
                dbId: i.employee_onboarding_item_id ?? undefined,
                templateItemId: i.template_item_id ?? null,
                title: i.item_text,
                date: i.done && i.completed_at
                  ? `Completed ${new Date(i.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "Pending your action",
                isoDate: i.done && i.completed_at ? i.completed_at.slice(0, 10) : "2026-08-01",
                done: Boolean(i.done),
                rank: i.done ? 1 : 0,
                actionLabel: i.done ? "" : "Mark Complete",
                phase: i.phase === "Pre-onboarding" ? "Pre-onboarding" : "Probationary",
              })),
            );
          });
      })
      .catch((err) => {
        console.warn("Could not load onboarding checklist from API:", err);
        toast.error("Could not load your onboarding checklist");
      })
      .finally(() => setLoading(false));
  }, [profileName, profileEmail, user?.employee_id]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("recent");

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

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

  // The onboarding responds to the hire's current stage: the ACTIVE phase is
  // always shown as a plain (non-collapsible) list, while the OTHER phase —
  // e.g. the old finished pre-onboarding checklist once the hire is in
  // probation — is tucked inside the collapsible section.
  const currentPhase =
    newHire?.stage === "Probationary" ? "Probationary" : "Pre-onboarding";

  const activeItems = filteredItems.filter(
    (i) => (i.phase === "Pre-onboarding") === (currentPhase === "Pre-onboarding"),
  );
  const archivedItems = filteredItems.filter(
    (i) => (i.phase === "Pre-onboarding") !== (currentPhase === "Pre-onboarding"),
  );
  const archivedDoneCount = items.filter(
    (i) => (i.phase === "Pre-onboarding") !== (currentPhase === "Pre-onboarding") && i.done,
  ).length;
  const archivedTotalCount = items.filter(
    (i) => (i.phase === "Pre-onboarding") !== (currentPhase === "Pre-onboarding"),
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow={<span className="uppercase font-semibold tracking-wider">{profilePosition} · {profileDepartment}</span>}
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
                  {profileName}
                </h2>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  Employee ID: <span className="text-foreground font-mono font-semibold">{profileEmpCode}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profilePosition} · {profileDepartment}
                </p>
              </div>

              {/* Prominent Employment Status */}
              <div className="flex flex-col sm:items-end gap-2">
                <Badge
                  variant="outline"
                  className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 text-base sm:text-lg px-4 py-1.5 font-bold uppercase tracking-widest self-start sm:self-auto shadow-xs"
                >
                  {employmentType.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">Employment Status</span>
                {newHire?.stage && (
                  <Badge
                    variant="outline"
                    className={
                      newHire.stage === "Pre-onboarding"
                        ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40 text-xs px-3 py-1 font-semibold uppercase tracking-widest self-start sm:self-auto"
                        : "bg-gold/15 text-gold-foreground border-gold/40 text-xs px-3 py-1 font-semibold uppercase tracking-widest self-start sm:self-auto"
                    }
                  >
                    {newHire.stage}
                  </Badge>
                )}
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
            <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              ONBOARDING CHECKLIST
            </CardTitle>
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
              <div className="space-y-6">
                {/* Current-stage checklist — always visible, no collapsible */}
                <div className="divide-y divide-border">
                  {activeItems.map((item) => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                    />
                  ))}
                  {activeItems.length === 0 && filteredItems.length > 0 && (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No {currentPhase.toLowerCase()} tasks.
                    </div>
                  )}
                </div>

                {/* Other phase (e.g. old finished pre-onboarding checklist
                    while in probation) — collapsible */}
                {archivedItems.length > 0 && (
                  <Collapsible className="border-t border-border pt-4">
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs font-medium transition-colors hover:bg-muted/50">
                      <span className="flex items-center gap-1.5">
                        <ChevronDown className="h-3.5 w-3.5" />
                        {currentPhase === "Probationary"
                          ? "Finished pre-onboarding checklist"
                          : "Probationary tasks"}
                      </span>
                      <span className="text-muted-foreground">
                        {archivedDoneCount}/{archivedTotalCount} done
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                      <div className="divide-y divide-border pl-1.5">
                        {archivedItems.map((item) => (
                          <ChecklistRow
                            key={item.id}
                            item={item}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}