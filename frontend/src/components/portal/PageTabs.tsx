import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface PageTabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Shared tab wrapper — consistent padding / active state everywhere.
 * Supports optional URL sync via `syncParam` (e.g. "?tab=leave").
 */
export function PageTabs({
  items,
  defaultValue,
  value,
  onValueChange,
  syncParam,
  listClassName,
  contentClassName,
}: {
  items: PageTabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  syncParam?: string;
  listClassName?: string;
  contentClassName?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.value ?? "");
  const controlled = value !== undefined;
  const active = controlled ? value! : internal;

  React.useEffect(() => {
    if (!syncParam || typeof window === "undefined") return;
    const v = new URLSearchParams(window.location.search).get(syncParam);
    if (v && items.some((i) => i.value === v)) {
      if (controlled) onValueChange?.(v);
      else setInternal(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncParam]);

  const handle = (v: string) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
    if (syncParam && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set(syncParam, v);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <Tabs value={active} onValueChange={handle}>
      <TabsList className={cn("bg-muted p-1 rounded-lg", listClassName)}>
        {items.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((t) => (
        <TabsContent
          key={t.value}
          value={t.value}
          className={cn("px-1 py-4 sm:px-2", contentClassName)}
        >
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
