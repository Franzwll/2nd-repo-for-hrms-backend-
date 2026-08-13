import { SearchX } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Turns a search input placeholder into the matching empty-state sentence.
 * "Search departments…" -> "No departments match your search"
 */
export function emptyMessageFromPlaceholder(placeholder?: string, subject?: string) {
  const noun =
    subject ??
    (placeholder ?? "")
      .replace(/^search\s+/i, "")
      .replace(/[.…]+$/g, "")
      .split(",")[0]
      ?.trim() ??
    "";
  return `No ${noun || "records"} match your search`;
}

/**
 * Shared empty row/body used by every list so the card keeps its height when a
 * search returns nothing.
 */
export function ListEmptyState({
  placeholder,
  subject,
  className,
}: {
  placeholder?: string;
  /** Overrides the noun derived from the placeholder (for multi-field placeholders). */
  subject?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-2 py-10 text-center",
        className,
      )}
    >
      <SearchX className="h-6 w-6 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">
        {emptyMessageFromPlaceholder(placeholder, subject)}
      </p>
    </div>
  );
}
