/**
 * Shared legal / help content — single source of truth for the public
 * landing pages (/support, /privacy, /terms, /cookies) and the login footer links.
 *
 * Content is written for the internal Philippine hotel HRMS:
 * Data Privacy Act of 2012 (RA 10173) framing, authorized-staff-only terms.
 */

export const HR_EMAIL = "hr@oxfordsuites.com.ph";
export const HR_PHONE = "+63 2 8888 8688";
export const COOKIE_ACK_KEY = "oxford_hrms_cookie_ack";

export interface LegalSection {
  heading: string;
  body: string;
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    body: "Account identity (name, work email, username), employment records (201 file, position, attendance, payroll), and system activity (sign-in history, audit logs).",
  },
  {
    heading: "Why",
    body: "HR administration only — recruitment, records, payroll, and keeping this portal secure. We do not sell personal data or use it for marketing.",
  },
  {
    heading: "Protection",
    body: "Role-based access, encrypted secrets, audited sessions, and bot protection on sign-in. Access is limited to authorized HR personnel and your direct records.",
  },
  {
    heading: "Your rights",
    body: "You may request access or correction of your records through the HR office, or file a complaint with the National Privacy Commission.",
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "1. Authorized staff only",
    body: "This portal is for Oxford Suites Makati employees and administrators. If you don't work here, do not attempt to sign in.",
  },
  {
    heading: "2. Keep your account yours",
    body: "Never share your password, OTP codes, authenticator setup, or recovery codes. You are responsible for activity under your account.",
  },
  {
    heading: "3. Use data properly",
    body: "Employee records you can see are confidential — view only what your role needs, and never copy or disclose them outside the hotel.",
  },
  {
    heading: "4. Sessions are monitored",
    body: "Sign-ins, changes, and approvals are logged for security and audit. Misuse may lead to account suspension and disciplinary action.",
  },
];

export function isCookieAcknowledged(): boolean {
  try {
    return localStorage.getItem(COOKIE_ACK_KEY) === "1";
  } catch {
    return false;
  }
}

export function acknowledgeCookies(): void {
  try {
    localStorage.setItem(COOKIE_ACK_KEY, "1");
  } catch {
    /* ignore */
  }
}
