import type { ReactNode } from "react";

/**
 * Renders light markdown from chatbot replies: **bold**, *italic* and `code`.
 * Everything else passes through unchanged; line breaks are preserved by the
 * bubble's `whitespace-pre-line` styling.
 */
export function renderRichText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-muted px-1 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
