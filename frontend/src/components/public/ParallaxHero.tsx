import * as React from "react";
import { cn } from "@/lib/utils";
import { useParallax } from "@/hooks/use-parallax";

export function ParallaxHero({
  image,
  imageAlt,
  eyebrow,
  title,
  body,
  actions,
  className,
}: {
  image: string;
  imageAlt: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const far = useParallax(0.28);
  const near = useParallax(-0.04);

  const dynamicScale = 1.06 + Math.min(Math.max(far.offset, 0) * 0.00025, 0.06);

  return (
    <section
      ref={far.ref}
      className={cn(
        "relative isolate flex min-h-[78vh] items-end overflow-hidden bg-neutral-800 text-white md:min-h-[84vh]",
        className,
      )}
      aria-label={typeof eyebrow === "string" ? eyebrow : "Featured"}
    >
      {/* Brightened Full-Color Hotel Photography */}
      <div className="absolute inset-0 -z-20 parallax-will-change" aria-hidden="true">
        <img
          src={image}
          alt=""
          role="presentation"
          fetchPriority="high"
          decoding="async"
          className="h-[118%] w-full object-cover object-center brightness-[0.9] contrast-[1.02] saturate-[1.05] will-change-transform"
          style={{
            transform: `translate3d(0, ${far.offset * 0.35}px, 0) scale(${dynamicScale})`,
          }}
        />
      </div>
      <span className="sr-only">{imageAlt}</span>

      {/* Lighter Left-to-Right Editorial Scrim (keeps right side bright & airy) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950/65 via-neutral-950/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-neutral-950/45 to-transparent"
      />

      {/* Foreground Content */}
      <div
        ref={near.ref}
        className="relative mx-auto w-full min-w-0 max-w-7xl px-4 pt-28 pb-24 sm:pt-32 sm:pb-28 md:px-8 md:pt-40 md:pb-32 parallax-will-change"
        style={{
          transform: `translate3d(0, ${near.offset * 0.25}px, 0)`,
        }}
      >
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center text-xs font-medium tracking-wider text-white/95">
              {eyebrow}
            </div>
          )}

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance text-white drop-shadow-xs sm:text-5xl md:text-7xl">
            {title}
          </h1>

          {body && (
            <div className="mt-5 max-w-xl text-base leading-relaxed text-white/95 drop-shadow-xs md:text-lg [&_p]:text-white/95 [&_span]:text-white/95">
              {body}
            </div>
          )}

          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
}