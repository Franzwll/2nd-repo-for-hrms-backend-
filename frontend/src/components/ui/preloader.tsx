import { useEffect, useState } from "react";
import oxfordMarkWhite from "@/assets/oxford-mark-white.png";

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setHidden(true);
          onComplete?.();
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 15;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (hidden) return null;

  return (
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
            <div
              className="h-full bg-gold transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
