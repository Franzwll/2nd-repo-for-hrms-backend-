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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { authApi } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";

const LOGIN_CONTEXT_KEY = "oxford_hrms_login";

export function persistLoginContext(ctx: {
  login_token: string;
  email: string;
  expires_in: number;
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
} | null {
  try {
    const raw = sessionStorage.getItem(LOGIN_CONTEXT_KEY);
    if (!raw) return null;
    const ctx = JSON.parse(raw) as {
      login_token: string;
      email: string;
      expires_in: number;
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

const brigades = [
  "Front Office",
  "Housekeeping",
  "Food & Beverage Service",
  "Kitchen Brigade",
  "Banquets & Events",
];

const montageImages = [
  {
    src: interior1,
    alt: "Oxford Suites Makati grand interior hall with elegant ambient lighting",
    animation: "animate-[kenburns-1_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: suiteb,
    alt: "Oxford Suites Makati executive suite room",
    animation: "animate-[kenburns-2_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: loginDining,
    alt: "Oxford Suites Makati fine dining restaurant",
    animation: "animate-[kenburns-3_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: interior3b,
    alt: "Oxford Suites Makati suite lounge area",
    animation: "animate-[kenburns-1_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: suite1b,
    alt: "Oxford Suites Makati premier suite living area",
    animation: "animate-[kenburns-2_20s_infinite_alternate_ease-in-out]",
  },
  {
    src: suite2b,
    alt: "Oxford Suites Makati deluxe king bedroom view",
    animation: "animate-[kenburns-3_20s_infinite_alternate_ease-in-out]",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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

  // Montage slideshow transition
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % montageImages.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid work email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setSubmitting(true);
    setError("");
    try {
      const res = await authApi.login(email.trim(), password);

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

      persistLoginContext({
        login_token: res.login_token,
        email: email.trim(),
        expires_in: res.expires_in,
      });
      toast.success("One-time password sent to your work email.");
      navigate({ to: "/otp" });
    } catch (err: any) {
      const message =
        err?.message ||
        (err?.status === 401 ? "Invalid credentials." : "Unable to sign in. Please try again.");
      setError(message);
      if (err?.status === 401) toast.error("Invalid credentials.");
      if (err?.status === 403) toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
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
      <div className="relative hidden flex-col justify-between overflow-hidden px-12 py-10 text-primary-foreground lg:flex">
        {/* Montage Slideshow Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {montageImages.map((img, index) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out scale-110",
                index === currentSlide ? "opacity-100" : "opacity-0",
                img.animation,
              )}
            />
          ))}
        </div>

        {/* Lightened Maroon Foreshadow Background Overlay */}
        <div className="absolute inset-0 z-10 bg-primary/45 mix-blend-multiply transition-colors duration-700" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-foreground/80 via-foreground/25 to-foreground/45" />

        <div className="relative z-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="scale-170 origin-left">
              <Logo mark="white" tone="invert" />
            </div>
          </Link>
          <span className="rounded-full border border-primary-foreground/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary-foreground/90 backdrop-blur-sm bg-black/20">
            Est. 1995
          </span>
        </div>

        <div className="relative z-20 max-w-lg">
          <p className="eyebrow text-gold drop-shadow-md">
            Hotel &amp; Restaurant Human Resource System
          </p>
          <div className="mt-4 h-px w-16 bg-gold/70" />
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.08] drop-shadow-lg">
            The house is ready.
            <br />
            Welcome back to duty.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-primary-foreground/90 drop-shadow">
            One portal for the entire property — from the front desk and housekeeping floors to the
            kitchen brigade and banquet service. Hiring, 201 files, schedules and employee
            self-service, kept in a single register.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-primary-foreground/90">
            {brigades.map((b) => (
              <span key={b} className="flex items-center gap-2 drop-shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-20 flex items-center justify-between border-t border-primary-foreground/20 pt-5 text-xs text-primary-foreground/80">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            Role-based access · Audited sessions
          </span>
          <span>24-hour front desk · +63 2 8888 8888</span>
        </div>
      </div>

      {/* Credential panel */}
      <div className="flex items-center justify-center bg-background px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo mark="white" />
          </Link>

          <p className="eyebrow">Staff Portal Access</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with your work credentials.</p>
          <div className="gold-rule my-7" />

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                  Keep me signed in
                </Label>
              </div>
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
          </form>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Looking for work?{" "}
            <Link to="/jobs" className="font-medium text-primary hover:underline">
              Browse job openings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
