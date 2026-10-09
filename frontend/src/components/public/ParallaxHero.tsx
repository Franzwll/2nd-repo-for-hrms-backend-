import * as React from "react";
import { cn } from "@/lib/utils";
import { useParallax } from "@/hooks/use-parallax";

/**
 * Landing-only immersive 3D hero. Three depth layers:
 * far bg image (0.3x) / mid overlay+orbs (0.15x) / near content (-0.08x).
 * Login + portals intentionally excluded.
 */
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
  const far = useParallax(0.3);
  const mid = useParallax(0.15);
  const near = useParallax(-0.08);

  return (
    <section
      className={cn("relative overflow-hidden perspective-1000", className)}
      aria-label={typeof eyebrow === "string" ? eyebrow : "Featured"}
    >
      <div ref={far.ref} className="absolute inset-0 parallax-will-change" aria-hidden="true">
        <img
          src={image}
          alt=""
          role="presentation"
          className="h-[115%] w-full object-cover"
          style={{ transform: `translate3d(0, ${far.offset * 0.4}px, 0) scale(1.08)` }}
        />
      </div>
      {/* Accessible image description for screen readers */}
      <span className="sr-only">{imageAlt}</span>
      <div
        ref={mid.ref}
        className="absolute inset-0 bg-foreground/70 parallax-will-change"
        aria-hidden="true"
        style={{ transform: `translate3d(0, ${mid.offset * 0.4}px, 0)` }}
      />
      {/* Floating glass orbs for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl parallax-will-change"
        style={{ transform: `translate3d(0, ${mid.offset * 0.6}px, 60px)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl parallax-will-change"
        style={{ transform: `translate3d(0, ${mid.offset * 0.5}px, 40px)` }}
      />
      <div
        ref={near.ref}
        className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32 preserve-3d parallax-will-change"
        style={{ transform: `translate3d(0, ${near.offset * 0.4}px, 80px)` }}
      >
        {eyebrow}
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold text-primary-foreground md:text-7xl">
          {title}
        </h1>
        {body}
        {actions}
      </div>
    </section>
  );
}
