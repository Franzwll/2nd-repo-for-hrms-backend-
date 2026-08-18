import { useEffect, useState } from "react";
import oxfordMarkWhite from "@/assets/oxford-mark-white.png";

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Deliberately ease in: a calm start, then a quicker finish once the app is ready.
        const remaining = 100 - prev;
        const increment = prev < 20 ? 4 : prev < 60 ? 10 : Math.max(15, Math.ceil(remaining * 0.3));
        return Math.min(100, prev + increment);
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    if (progress !== 100) return;
    const fade = window.setTimeout(() => setLeaving(true), 150);
    const complete = window.setTimeout(() => onComplete?.(), 420);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(complete);
    };
  }, [progress, onComplete]);

  if (leaving) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#520c19] text-white transition-all duration-500 ease-out animate-in fade-in">
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
            <div
              className="h-full bg-gold transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
