import { useState } from "react";
import { CheckCircle2, Cookie, Globe, LifeBuoy, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Trust footer for the staff portal login (cf. typical SaaS login footers):
 * Support · Privacy Notice · Terms of Service · Cookie Preferences,
 * language indicator, and the bot-protection attribution.
 *
 * Content is written for an internal Philippine hotel HRMS:
 * Data Privacy Act of 2012 (RA 10173) framing, authorized-staff-only
 * terms, and Cloudflare Turnstile (not hCaptcha) attribution.
 */

const HR_EMAIL = "hr@oxfordsuites.com.ph";
const HR_PHONE = "+63 2 8888 8688";

type Doc = "support" | "privacy" | "terms" | "cookies" | null;

const COOKIE_ACK_KEY = "oxford_hrms_cookie_ack";

export function LoginFooter() {
  const [doc, setDoc] = useState<Doc>(null);
  const [cookieAck, setCookieAck] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COOKIE_ACK_KEY) === "1";
    } catch {
      return false;
    }
  });

  const ackCookies = () => {
    try {
      localStorage.setItem(COOKIE_ACK_KEY, "1");
    } catch {
      /* ignore */
    }
    setCookieAck(true);
    setDoc(null);
  };

  const linkCls =
    "transition-colors hover:text-foreground hover:underline cursor-pointer";

  return (
    <>
      <footer className="mt-10 border-t border-border/60 pt-4 text-[11px] leading-relaxed text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <button type="button" onClick={() => setDoc("support")} className={linkCls}>
            <span className="inline-flex items-center gap-1">
              <LifeBuoy className="h-3 w-3" /> Support
            </span>
          </button>
          <button type="button" onClick={() => setDoc("privacy")} className={linkCls}>
            Privacy Notice
          </button>
          <button type="button" onClick={() => setDoc("terms")} className={linkCls}>
            Terms of Service
          </button>
          <button type="button" onClick={() => setDoc("cookies")} className={linkCls}>
            <span className="inline-flex items-center gap-1">
              <Cookie className="h-3 w-3" /> Cookie Preferences
              {cookieAck && <CheckCircle2 className="h-3 w-3 text-success" />}
            </span>
          </button>
          <span className="inline-flex cursor-default items-center gap-1" title="More languages coming soon">
            <Globe className="h-3 w-3" /> English
          </span>
        </div>
        <p className="mt-2 text-center">
          This site is protected by Cloudflare Turnstile and the{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noreferrer"
            className={linkCls}
          >
            Cloudflare Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://www.cloudflare.com/website-terms/"
            target="_blank"
            rel="noreferrer"
            className={linkCls}
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
        <p className="mt-1 text-center">
          © {new Date().getFullYear()} Oxford Suites Makati · Authorized staff only
        </p>
      </footer>

      {/* Support */}
      <Dialog open={doc === "support"} onOpenChange={(o) => !o && setDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" /> Support
            </DialogTitle>
            <DialogDescription>
              Locked out or seeing an error? Contact the HR office — include your
              employee ID and a screenshot if you can.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">HR helpdesk: </span>
              <a href={`mailto:${HR_EMAIL}`} className="font-medium text-primary hover:underline">
                {HR_EMAIL}
              </a>
            </p>
            <p>
              <span className="text-muted-foreground">24-hour front desk: </span>
              <a href={`tel:${HR_PHONE.replace(/\s/g, "")}`} className="font-medium text-primary hover:underline">
                {HR_PHONE}
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              Forgot your password? Use “Forgot password?” on the sign-in form — the
              reset link expires in 60 minutes.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Notice */}
      <Dialog open={doc === "privacy"} onOpenChange={(o) => !o && setDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Privacy Notice
            </DialogTitle>
            <DialogDescription>
              How Oxford Suites Makati handles your personal data in this HRMS, in
              line with the Data Privacy Act of 2012 (RA 10173).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 space-y-2 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">What we collect.</span>{" "}
              Account identity (name, work email, username), employment records
              (201 file, position, attendance, payroll), and system activity
              (sign-in history, audit logs).
            </p>
            <p>
              <span className="font-semibold text-foreground">Why.</span> HR
              administration only — recruitment, records, payroll, and keeping this
              portal secure. We do not sell personal data or use it for marketing.
            </p>
            <p>
              <span className="font-semibold text-foreground">Protection.</span>{" "}
              Role-based access, encrypted secrets, audited sessions, and bot
              protection on sign-in. Access is limited to authorized HR personnel
              and your direct records.
            </p>
            <p>
              <span className="font-semibold text-foreground">Your rights.</span>{" "}
              You may request access or correction of your records through the HR
              office, or file a complaint with the National Privacy Commission.
            </p>
            <p>
              Questions: <span className="font-medium text-foreground">{HR_EMAIL}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service */}
      <Dialog open={doc === "terms"} onOpenChange={(o) => !o && setDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              Rules for using the Oxford Suites Makati staff portal.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 space-y-2 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">1. Authorized staff only.</span>{" "}
              This portal is for Oxford Suites Makati employees and administrators.
              If you don't work here, do not attempt to sign in.
            </p>
            <p>
              <span className="font-semibold text-foreground">2. Keep your account yours.</span>{" "}
              Never share your password, OTP codes, authenticator setup, or recovery
              codes. You are responsible for activity under your account.
            </p>
            <p>
              <span className="font-semibold text-foreground">3. Use data properly.</span>{" "}
              Employee records you can see are confidential — view only what your
              role needs, and never copy or disclose them outside the hotel.
            </p>
            <p>
              <span className="font-semibold text-foreground">4. Sessions are monitored.</span>{" "}
              Sign-ins, changes, and approvals are logged for security and audit.
              Misuse may lead to account suspension and disciplinary action.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cookie Preferences */}
      <Dialog open={doc === "cookies"} onOpenChange={(o) => !o && setDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-4 w-4 text-primary" /> Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              What this portal stores on your device. No advertising trackers, ever.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-start justify-between gap-3 rounded-md border border-border/60 p-3">
              <div>
                <p className="font-semibold text-foreground">Strictly necessary — always on</p>
                <p>
                  Sign-in token, login-step state, and UI preferences in your
                  browser's local storage, plus Cloudflare Turnstile's security
                  check when you sign in or reset your password.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success">
                On
              </span>
            </div>
            <p>
              Clearing your browser data signs you out — that's expected. There are
              no optional or marketing cookies to toggle.
            </p>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={ackCookies}>
              {cookieAck ? "Preferences saved" : "Got it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
