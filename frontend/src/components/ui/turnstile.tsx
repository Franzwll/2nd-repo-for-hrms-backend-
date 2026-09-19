import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    __turnstileScriptPromise?: Promise<void>;
  }
}

export const TURNSTILE_SITE_KEY =
  (import.meta.env["VITE_TURNSTILE_SITE_KEY"] as string | undefined) ?? "";

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!window.__turnstileScriptPromise) {
    window.__turnstileScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Turnstile script failed to load"));
      document.head.appendChild(script);
    });
  }
  return window.__turnstileScriptPromise;
}

/**
 * Cloudflare Turnstile bot check (Managed mode).
 * Emits a single-use token via onVerify; parent resets it after submit.
 */
export function Turnstile({
  onVerify,
  onExpire,
  resetKey,
  className,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  resetKey?: number | string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const verifyRef = useRef(onVerify);
  verifyRef.current = onVerify;
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => verifyRef.current(token),
          "expired-callback": () => expireRef.current?.(),
          "error-callback": () => expireRef.current?.(),
          theme: "auto",
        });
      })
      .catch(() => {
        /* offline dev — backend fails open only when unconfigured;
           with keys set the form will surface the missing token */
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Parent bumps resetKey after each submit so a fresh token is minted.
  useEffect(() => {
    if (resetKey == null) return;
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        /* ignore */
      }
    }
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;

  return <div ref={containerRef} className={className} />;
}
