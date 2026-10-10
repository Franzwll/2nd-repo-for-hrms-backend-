import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Briefcase, Search, Tag, User, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchApi, type GlobalSearchResult } from "@/lib/api";
import { cn } from "@/lib/utils";

const EMPTY: GlobalSearchResult = {
  departments: [],
  positions: [],
  jobs: [],
  statuses: [],
  employees: [],
  employees_hidden: false,
};

/** Global non-confidential site search (Cmd+K). Employees group is role-gated server-side. */
export function GlobalSearch({ base }: { base: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult>(EMPTY);
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
    if (term.length < 2) {
      setResults(EMPTY);
      setOpen(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      searchApi
        .global(term)
        .then((res) => {
          setResults(res.data);
          setOpen(true);
        })
        .catch(() => setResults(EMPTY))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const go = (to: string) => {
    setOpen(false);
    setQ("");
    navigate({ to });
  };

  const groups: {
    label: string;
    icon: React.ElementType;
    items: { title: string; subtitle: string | null; to: string }[];
  }[] = [
    {
      label: "Departments",
      icon: Building2,
      items: results.departments.map((d) => ({
        title: d.title,
        subtitle: d.subtitle,
        to: `${base}/dept-pos`,
      })),
    },
    {
      label: "Positions",
      icon: Briefcase,
      items: results.positions.map((p) => ({
        title: p.title,
        subtitle: p.subtitle,
        to: `${base}/dept-pos`,
      })),
    },
    {
      label: "Open jobs",
      icon: Search,
      items: results.jobs.map((j) => ({
        title: j.title,
        subtitle: j.subtitle,
        to: `${base}/recruitment`,
      })),
    },
    {
      label: "Statuses",
      icon: Tag,
      items: results.statuses.map((s) => ({
        title: s.title,
        subtitle: s.subtitle,
        to: `${base}/employees`,
      })),
    },
    {
      label: "People",
      icon: User,
      items: results.employees.map((e) => ({
        title: e.title,
        subtitle: e.subtitle,
        to: `${base}/employees`,
      })),
    },
  ].filter((g) => g.items.length > 0);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div ref={boxRef} className="relative hidden w-64 md:block lg:w-80">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => total > 0 && setOpen(true)}
        placeholder="Search departments, positions… (Ctrl+K)"
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
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-md border border-border bg-popover p-1.5 shadow-lg">
          {loading && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">Searching…</p>
          )}
          {!loading && total === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No matches. Try a department, position, or job title.
              {results.employees_hidden && " People results need HR access."}
            </p>
          )}
          {groups.map((g) => (
            <div key={g.label} className="mb-1 last:mb-0">
              <p className="px-2.5 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                {g.label}
              </p>
              {g.items.slice(0, 6).map((item, i) => (
                <button
                  key={`${g.label}-${i}`}
                  type="button"
                  onClick={() => go(item.to)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted",
                  )}
                >
                  <g.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.title}</span>
                    {item.subtitle && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
