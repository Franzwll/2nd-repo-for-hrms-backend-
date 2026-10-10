import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Briefcase,
  Search,
  Tag,
  User,
  X,
  FileText,
  Users,
  Shield,
  BriefcaseBusiness,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchApi, type UnifiedSearchGroup, type UnifiedSearchResult } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Module-to-icon mapping */
const MODULE_ICONS: Record<string, React.ElementType> = {
  "Employee Records": User,
  "Applicant Management": Users,
  "User Management": Shield,
  Recruitment: BriefcaseBusiness,
  "Core HCM": Building2,
};

/** Skeleton item for search results */
function SearchSkeletonItem() {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left animate-pulse"
      disabled
    >
      <div className="h-4 w-4 shrink-0 rounded bg-muted" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
      </div>
    </button>
  );
}

function SearchSkeletonGroup() {
  return (
    <div className="mb-1 last:mb-0">
      <p className="px-2.5 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground animate-pulse">
        <span className="bg-muted inline-block h-3 w-20 rounded" />
      </p>
      {Array.from({ length: 3 }).map((_, i) => (
        <SearchSkeletonItem key={i} />
      ))}
    </div>
  );
}

/** Unified cross-module global search (Cmd+K). */
export function GlobalSearch({ base }: { base: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<UnifiedSearchGroup[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        boxRef.current?.querySelector("input")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 1) {
      setGroups([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      searchApi
        .unified(term)
        .then((res) => {
          setGroups(res.data.results);
          setOpen(true);
        })
        .catch(() => setGroups([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const go = (to: string) => {
    setOpen(false);
    setQ("");
    navigate({ to });
  };

  const total = groups.reduce((n, g) => n + g.count, 0);
  const hasResults = total > 0;

  return (
    <div ref={boxRef} className="relative hidden w-64 md:block lg:w-80">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => (hasResults || loading) && setOpen(true)}
        placeholder="Search people, jobs, departments… (Ctrl+K)"
        className="pl-8 pr-8"
        aria-label="Global search"
      />
      {q && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQ("");
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {(open || loading) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-md border border-border bg-popover p-1.5 shadow-lg">
          {loading && (
            <>
              <SearchSkeletonGroup />
              <SearchSkeletonGroup />
              <SearchSkeletonGroup />
            </>
          )}
          {!loading && !hasResults && q.trim().length >= 1 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No matches for &ldquo;{q}&rdquo;. Try a name, job title, or department.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.module} className="mb-1 last:mb-0">
              <p className="px-2.5 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                {g.module} ({g.count})
              </p>
              {g.items.slice(0, 6).map((item, i) => {
                const Icon = MODULE_ICONS[g.module] ?? Search;
                return (
                  <button
                    key={`${g.module}-${item.id}`}
                    type="button"
                    onClick={() => go(item.url)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
