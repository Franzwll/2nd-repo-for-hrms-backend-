import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import oxfordMarkWhite from "@/assets/oxford-mark-white.png";
import interior1 from "@/assets/oxford-suite-makati-interior1.png";
import suiteb from "@/assets/o-suiteb.png";
import loginDining from "@/assets/login-dining.png";
import interior3b from "@/assets/oxford-suite-makati-interior3b.png";
import suite1b from "@/assets/o-suite(1)b.png";
import suite2b from "@/assets/o-suite(2)b.png";

import { Logo } from "@/components/brand/Logo";
import { LoginFooter } from "@/components/brand/LoginFooter";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Turnstile, TURNSTILE_SITE_KEY } from "@/components/ui/turnstile";
import { cn } from "@/lib/utils";

import { authApi } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { useLightOnly } from "@/lib/theme";

const LOGIN_CONTEXT_KEY = "oxford_hrms_login";

export function persistLoginContext(ctx: {
  login_token: string;
  email: string;
  expires_in: number;
  mfa_method?: "email_otp" | "totp";
  debug_otp?: string;
}) {
  try {
    sessionStorage.setItem(LOGIN_CONTEXT_KEY, JSON.stringify({ ...ctx, issued_at: Date.now() }));
  } catch {
    // storage unavailable
  }
}

export function getLoginContext(): {
  login_token: string;
  email: string;
  expires_in: number;
  mfa_method?: "email_otp" | "totp";
  debug_otp?: string;
} | null {
  try {
    const raw = sessionStorage.getItem(LOGIN_CONTEXT_KEY);
    if (!raw) return null;
    const ctx = JSON.parse(raw) as {
      login_token: string;
      email: string;
      expires_in: number;
      mfa_method?: "email_otp" | "totp";
      debug_otp?: string;
      issued_at: number;
    };
    if (Date.now() - ctx.issued_at > ctx.expires_in * 1000) {
      sessionStorage.removeItem(LOGIN_CONTEXT_KEY);
      return null;
    }
    return ctx;
  } catch {
    return null;
  }
}

export function clearLoginContext() {
  try {
    sessionStorage.removeItem(LOGIN_CONTEXT_KEY);
  } catch {
    // storage unavailable
  }
}

export const Route = createFileRoute("/_login/login")({
  head: () => ({
    meta: [
      { title: "Portal Login — Oxford Suites Makati HRMS" },
      {
        name: "description",
        content:
          "Sign in to the Oxford Suites Makati HRMS portal as Super Admin, Admin, or Employee to manage recruitment, HR records, and self-service.",
      },
      { property: "og:title", content: "Portal Login — Oxford Suites Makati HRMS" },
      { property: "og:description", content: "Sign in to the Oxford Suites Makati HRMS portal." },
    ],
  }),
  component: LoginPage,
});

const montageImages = [
  {
    src: interior1,
    title: "Grand Lobby",
    alt: "Oxford Suites Makati grand interior hall with elegant ambient lighting",
    animation: "animate-[kenburns-1_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: suiteb,
    title: "Executive Suite",
    alt: "Oxford Suites Makati executive suite room",
    animation: "animate-[kenburns-2_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: loginDining,
    title: "Fine Dining",
    alt: "Oxford Suites Makati fine dining restaurant",
    animation: "animate-[kenburns-3_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: interior3b,
    title: "Suite Lounge",
    alt: "Oxford Suites Makati suite lounge area",
    animation: "animate-[kenburns-1_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: suite1b,
    title: "Premier Suite",
    alt: "Oxford Suites Makati premier suite living area",
    animation: "animate-[kenburns-2_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: suite2b,
    title: "Deluxe King",
    alt: "Oxford Suites Makati deluxe king bedroom view",
    animation: "animate-[kenburns-3_20s_infinite_alternate_ease-in-out]",
  },
];

function LoginPage() {
  useLightOnly();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ready, setReady] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  /** OS "reduce motion" preference — softens the entrance animation (not the slideshow). */
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // The montage only renders at lg+ — below that there's nothing to wait for,
    // so phones/tablets skip the preloader entirely.
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setReady(true);
      return;
    }
    let cancelled = false;
    const first = new Image();
    first.src = montageImages[0]!.src;
    const done = () => !cancelled && setReady(true);
    first.decode?.().then(done).catch(done) ?? done();
    first.onload = done;
    montageImages.slice(1).forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
    const safety = window.setTimeout(done, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, []);

  // The OS "reduce motion" preference only skips the copy's staggered entrance;
  // the slideshow interval and Ken Burns zoom always run, like the original.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Montage slideshow — classic auto-advance, same as the original page:
  // one interval that swaps the slide every 6 seconds, no conditions.
  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % montageImages.length);
    }, 6000);
    return () => window.clearInterval(slideTimer);
  }, []);

  /** Staggered entrance for the hero copy — starts only once the preloader clears. */
  const enter = (delay: string) =>
    ready && !reducedMotion
      ? cn("animate-in fade-in slide-in-from-bottom-8 duration-700", delay)
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid work email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      return setError("Please complete the security check first.");
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await authApi.login(email.trim(), password, captchaToken || undefined);

      // OTP disabled for this role — the server signed us straight in.
      if (res.otp_required === false && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        clearLoginContext();
        toast.success("Welcome back! Signing you in…");
        const target =
          res.user.role === "Super Admin"
            ? "/superadmin"
            : res.user.role === "Admin"
              ? "/admin"
              : "/employee";
        navigate({ to: target });
        return;
      }

      // Development bypass: if OTP is required but debug_otp is provided,
      // authenticate directly without navigating to the OTP page.
      if (
        import.meta.env.DEV &&
        res.otp_required === true &&
        res.token &&
        res.user &&
        res.debug_otp
      ) {
        setToken(res.token);
        setUser(res.user);
        clearLoginContext();
        toast.success("Welcome back! OTP bypassed (development mode).");
        const target =
          res.user.role === "Super Admin"
            ? "/superadmin"
            : res.user.role === "Admin"
              ? "/admin"
              : "/employee";
        navigate({ to: target });
        return;
      }

      persistLoginContext({
        login_token: res.login_token,
        email: email.trim(),
        expires_in: res.expires_in,
        mfa_method: res.mfa_method ?? "email_otp",
        debug_otp: res.debug_otp,
      });
      toast.success(
        res.mfa_method === "totp"
          ? "Enter the code from your authenticator app."
          : "One-time password sent to your work email.",
      );
      navigate({ to: "/otp" });
    } catch (err: any) {
      const message =
        err?.message ||
        (err?.status === 401 ? "Invalid credentials." : "Unable to sign in. Please try again.");
      setError(message);
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
      if (err?.status === 401) toast.error("Invalid credentials.");
      if (err?.status === 403) toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-[1.1fr_1fr] lg:grid-rows-none">
      {/* Preloader screen until first image frame decodes */}
      {!ready && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#520c19] text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 px-6">
            {/* Logo Mark on Left */}
            <img
              src={oxfordMarkWhite}
              alt="Oxford Suites Makati"
              className="h-24 sm:h-28 md:h-32 w-auto object-contain shrink-0"
            />

            {/* Text and Progress on Right */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
              <div className="flex flex-col leading-tight font-display font-semibold uppercase tracking-[0.15em] text-2xl sm:text-3xl text-white">
                <span>Oxford Suites</span>
                <span>Makati</span>
              </div>

              <div className="h-px w-full max-w-[220px] bg-white/25 my-1" />

              <p className="text-[11px] sm:text-xs tracking-[0.22em] font-semibold text-gold uppercase">
                Preparing your workspace
              </p>

              {/* Clean Gold Progress Bar */}
              <div className="mt-1 h-1.5 w-52 sm:w-60 overflow-hidden rounded-full bg-white/20">
                <span className="hero-progress block h-full w-1/3 bg-gold" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property panel with omni-directional slow-motion montage edit */}
      <div className="login-hero relative flex flex-col justify-between gap-4 overflow-hidden bg-primary px-5 py-3 text-primary-foreground lg:gap-0 lg:px-12 lg:py-10">
        {/* Montage Slideshow Container — desktop (lg+) only; smaller screens get the logo strip */}
        <div className="absolute inset-0 z-0 hidden overflow-hidden lg:block">
          {montageImages.map((img, index) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              aria-hidden={index !== currentSlide}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out scale-110",
                index === currentSlide ? "opacity-100" : "opacity-0",
                img.animation,
              )}
            />
          ))}
        </div>

        {/* Lightened Maroon Foreshadow Background Overlay (image frames only) */}
        <div className="absolute inset-0 z-10 hidden bg-primary/45 mix-blend-multiply transition-colors duration-700 lg:block" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-foreground/80 via-foreground/25 to-foreground/45" />
        {/* Localized vignette keeps the headline legible over bright frames */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(78%_62%_at_18%_58%,rgb(0_0_0/0.55),transparent_72%)]" />

        <div
          className={cn(
            "relative z-20 flex items-center justify-between gap-4",
            enter("delay-100"),
          )}
        >
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="origin-left scale-100 lg:scale-170">
              <Logo mark="white" tone="invert" />
            </div>
          </Link>
          <span className="hidden shrink-0 rounded-full border border-primary-foreground/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary-foreground/90 backdrop-blur-sm bg-black/20 lg:block">
            Est. 1995
          </span>
        </div>

        {/* Hero copy — lg+ only (smaller screens show just the logo strip) */}
        <div className="relative z-20 hidden max-w-2xl lg:block">
          <p
            className={cn(
              "text-sm font-medium uppercase leading-none tracking-[0.2em] text-gold drop-shadow-md",
              enter("delay-100"),
            )}
          >
            Staff Portal
          </p>
          <div className={cn("mt-5 h-0.5 w-24 origin-left bg-gold/70", enter("delay-200"))} />
          <h1
            className={cn(
              "mt-7 font-display text-[3.75rem] font-semibold leading-[1.05] drop-shadow-lg lg:text-[4.25rem]",
              enter("delay-200"),
            )}
          >
            Welcome back<span className="text-gold">.</span>
          </h1>
          <p
            className={cn(
              "mt-5 max-w-xl font-display text-2xl italic leading-snug text-primary-foreground/90 drop-shadow",
              enter("delay-300"),
            )}
          >
            The pleasure is ours.
          </p>
        </div>

        <div
          className={cn(
            "relative z-20 hidden flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-primary-foreground/20 pt-5 text-xs text-primary-foreground/80 lg:flex",
            enter("delay-700"),
          )}
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            Authorized staff only
          </span>

          {/* Slide progress dots */}
          <div className="flex items-center gap-1.5">
            {montageImages.map((img, index) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show ${img.title}`}
                aria-current={index === currentSlide}
                className="group cursor-pointer rounded-full p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
              >
                <span
                  className={cn(
                    "block h-1 rounded-full transition-all duration-500 ease-out",
                    index === currentSlide
                      ? "w-8 bg-gold"
                      : "w-3 bg-primary-foreground/30 group-hover:bg-primary-foreground/60",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Credential panel */}
      <div className="flex items-center justify-center bg-background px-5 py-9 sm:px-10 sm:py-12">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-md">
          <p className="eyebrow">Staff Portal Access</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with your work credentials.</p>
          <div className="gold-rule my-7" />

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <FloatingInput
                id="email"
                type="email"
                label="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <FloatingInput
                id="password"
                type={show ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                autoComplete="current-password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                onClick={() => navigate({ to: "/forgot-password" })}
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>

            <div className="flex justify-center">
              <Turnstile
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken("")}
                resetKey={captchaReset}
              />
            </div>
          </form>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Looking for work?{" "}
            <Link to="/jobs" className="font-medium text-primary hover:underline">
              Browse job openings
            </Link>
          </p>

          <LoginFooter />
        </div>
      </div>
    </div>
  );
}
