import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Reads ?highlight=<target_id> from the URL (set by notification deep-links).
 * Returns the id to flash + a stable key for styling table rows.
 */
export function useHighlightId(): { id: string | null; tab: string | null } {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const [highlight, setHighlight] = useState<{ id: string | null; tab: string | null }>({
    id: null,
    tab: null,
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(searchStr || "");
      const id = params.get("highlight");
      const tab = params.get("tab");
      setHighlight({ id, tab });
      if (!id) return;
      // Scroll the exact row into view, then clear after 6s.
      const t1 = setTimeout(() => {
        const el = document.querySelector(`[data-highlight-id="${CSS.escape(id)}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
      const t2 = setTimeout(() => setHighlight({ id: null, tab: null }), 6000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } catch {
      setHighlight({ id: null, tab: null });
    }
  }, [searchStr]);

  return highlight;
}

/** Tailwind classes to flash a table row targeted by a notification. */
export function highlightRowClass(active: boolean): string {
  return active ? "bg-gold/20 ring-1 ring-gold/60 animate-pulse" : "";
}
