import { Link } from "@tanstack/react-router";
import { CheckCircle2, Cookie, Globe, LifeBuoy } from "lucide-react";
import { useState } from "react";

import { COOKIE_ACK_KEY } from "@/data/legal";

/**
 * Trust footer for the staff portal login (cf. typical SaaS login footers):
 * Support · Privacy Notice · Terms of Service · Cookie Preferences,
 * language indicator, and the bot-protection attribution.
 *
 * Each item links to its full landing page — no modals.
 */

export function LoginFooter() {
  const [cookieAck] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COOKIE_ACK_KEY) === "1";
    } catch {
      return false;
    }
  });

  const linkCls = "transition-colors hover:text-foreground hover:underline cursor-pointer";

  /** Cloudflare attribution links — bold + foreground so they read as clickable. */
  const attributionLinkCls =
    "font-semibold text-foreground underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary hover:text-primary cursor-pointer";

  return (
    <footer className="mt-10 border-t border-border/60 pt-4 text-[11px] leading-relaxed text-muted-foreground">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        <Link to="/support" className={linkCls}>
          <span className="inline-flex items-center gap-1">
            <LifeBuoy className="h-3 w-3" /> Support
          </span>
        </Link>
        <Link to="/privacy" className={linkCls}>
          Privacy Notice
        </Link>
        <Link to="/terms" className={linkCls}>
          Terms of Service
        </Link>
        <Link to="/cookies" className={linkCls}>
          <span className="inline-flex items-center gap-1">
            <Cookie className="h-3 w-3" /> Cookie Preferences
            {cookieAck && <CheckCircle2 className="h-3 w-3 text-success" />}
          </span>
        </Link>
        <span
          className="inline-flex cursor-default items-center gap-1"
          title="More languages coming soon"
        >
          <Globe className="h-3 w-3" /> English
        </span>
      </div>
      <p className="mt-2 text-center">
        This site is protected by Cloudflare Turnstile and the{" "}
        <a
          href="https://www.cloudflare.com/privacypolicy/"
          target="_blank"
          rel="noreferrer"
          className={attributionLinkCls}
        >
          Cloudflare Privacy Policy
        </a>{" "}
        and{" "}
        <a
          href="https://www.cloudflare.com/website-terms/"
          target="_blank"
          rel="noreferrer"
          className={attributionLinkCls}
        >
          Terms of Service
        </a>{" "}
        apply.
      </p>
      <p className="mt-1 text-center">
        © {new Date().getFullYear()} Oxford Suites Makati · Authorized staff only
      </p>
    </footer>
  );
}
