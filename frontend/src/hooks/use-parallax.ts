import * as React from "react";

/**
 * Landing-only scroll parallax. Returns a ref + translateY offset.
 * Disabled on prefers-reduced-motion and small screens (static fallback).
 */
export function useParallax(speed = 0.3): {
  ref: React.RefObject<HTMLDivElement | null>;
  offset: number;
} {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) return;
    if (window.innerWidth < 768) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Only animate while in/near viewport.
        if (rect.bottom < -400 || rect.top > window.innerHeight + 400) return;
        setOffset(window.scrollY * speed);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return { ref, offset };
}
