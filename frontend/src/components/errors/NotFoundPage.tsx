import { Link } from "@tanstack/react-router";
import { House, RefreshCw } from "lucide-react";

const actionBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0";

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="error-orb absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full bg-primary opacity-[0.12] blur-[80px] dark:opacity-[0.08]" />
        <div
          className="error-orb absolute -bottom-20 -left-16 h-[300px] w-[300px] rounded-full bg-gold opacity-[0.12] blur-[80px] dark:opacity-[0.08]"
          style={{ animationDelay: "-7s", animationDuration: "25s" }}
        />
        <div
          className="error-orb absolute left-[60%] top-[40%] h-[200px] w-[200px] rounded-full bg-accent opacity-[0.12] blur-[80px] dark:opacity-[0.08]"
          style={{ animationDelay: "-14s", animationDuration: "22s" }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-15"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="error-content-entry relative z-10 flex w-full max-w-[500px] flex-col items-center px-4 text-center">
        <div className="relative mb-3 flex h-[155px] w-[200px] shrink-0 items-center justify-center overflow-visible sm:h-[195px] sm:w-[250px]">
          <svg
            className="h-full w-full overflow-visible"
            viewBox="-20 -20 320 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <ellipse cx="140" cy="200" rx="90" ry="10" fill="var(--color-muted)" opacity="0.5" />

            <g className="error-float-slow" style={{ animationDelay: "-1s" }}>
              <rect
                x="60"
                y="70"
                width="160"
                height="110"
                rx="4"
                fill="var(--color-card)"
                stroke="var(--color-border)"
                strokeWidth="1.5"
              />
              <line
                x1="60"
                y1="97"
                x2="220"
                y2="97"
                stroke="var(--color-border)"
                strokeWidth="0.8"
              />
              <line
                x1="60"
                y1="124"
                x2="220"
                y2="124"
                stroke="var(--color-border)"
                strokeWidth="0.8"
              />
              <line
                x1="60"
                y1="151"
                x2="220"
                y2="151"
                stroke="var(--color-border)"
                strokeWidth="0.8"
              />
              <line
                x1="110"
                y1="70"
                x2="110"
                y2="180"
                stroke="var(--color-border)"
                strokeWidth="0.8"
              />
              <line
                x1="160"
                y1="70"
                x2="160"
                y2="180"
                stroke="var(--color-border)"
                strokeWidth="0.8"
              />

              <path
                className="error-dash"
                d="M80 160 Q100 130 120 140 T160 110 T200 90"
                stroke="var(--color-primary)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />

              <g transform="translate(195, 75)">
                <path
                  d="M0 18 C0 18 -12 6 -12 -2 C-12 -8.6 -6.6 -14 0 -14 C6.6 -14 12 -8.6 12 -2 C12 6 0 18 0 18Z"
                  fill="var(--color-primary)"
                />
                <circle cx="0" cy="-3" r="4" fill="var(--color-primary-foreground)" />
              </g>
            </g>

            <g transform="translate(90, 30)">
              <g className="error-float-med" style={{ animationDelay: "-3s" }}>
                <circle
                  cx="0"
                  cy="0"
                  r="22"
                  fill="var(--color-card)"
                  stroke="var(--color-gold)"
                  strokeWidth="1.5"
                />
                <g className="error-spin-slow">
                  <polygon points="0,-14 4,0 0,4 -4,0" fill="var(--color-primary)" />
                  <polygon
                    points="0,14 4,0 0,-4 -4,0"
                    fill="var(--color-muted-foreground)"
                    opacity="0.4"
                  />
                </g>
                <circle cx="0" cy="0" r="3" fill="var(--color-gold)" />
              </g>
            </g>

            <g transform="translate(220, 45)">
              <g className="error-float-fast" style={{ animationDelay: "-2s" }}>
                <text
                  fontFamily="var(--font-display-family)"
                  fontSize="36"
                  fontWeight="700"
                  fill="var(--color-gold)"
                  opacity="0.6"
                >
                  ?
                </text>
              </g>
            </g>
          </svg>
        </div>

        <p
          className="error-code-shimmer mb-1.5 inline-block bg-clip-text px-5 py-1 font-display text-[3.75rem] font-bold leading-none tracking-[0.01em] text-transparent sm:text-[5.25rem]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-primary) 20%, var(--color-gold) 85%)",
          }}
        >
          404
        </p>

        <div className="mb-[18px] mt-1.5 h-px w-[70px] bg-[linear-gradient(to_right,transparent,var(--color-gold)_30%,var(--color-gold)_70%,transparent)] opacity-60" />

        <h1 className="mb-2.5 text-balance font-display text-[1.55rem] font-semibold leading-tight text-foreground sm:text-[1.95rem]">
          We can't find that page
        </h1>
        <p className="mb-7 max-w-[420px] text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`${actionBase} bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30`}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            to="/"
            className={`${actionBase} border border-border bg-card text-foreground hover:-translate-y-0.5 hover:bg-muted hover:shadow-md`}
          >
            <House className="h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
