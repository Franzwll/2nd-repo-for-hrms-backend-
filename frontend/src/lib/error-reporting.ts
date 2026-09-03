/**
 * Generic runtime error reporting utility.
 * Reports errors to the browser console in development.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  if (import.meta.env.DEV) {
    console.error("[ErrorBoundary]", message, { ...context, stack });
  }
}
