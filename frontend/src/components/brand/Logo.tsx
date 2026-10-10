import { cn } from "@/lib/utils";
import oxfordMarkWhite from "@/assets/oxford-mark-white.png";
import oxfordMarkMaroon from "@/assets/oxford-mark-maroon.png";

/**
 * Oxford Suites Makati mark + wordmark lockup.
 */
export function Logo({
  className,
  variant = "full",
  tone = "primary",
  mark,
}: {
  className?: string;
  variant?: "full" | "mark";
  tone?: "primary" | "invert";
  mark?: "white" | "maroon";
}) {
  const chosenMark = mark
    ? mark === "white"
      ? oxfordMarkWhite
      : oxfordMarkMaroon
    : tone === "invert"
      ? oxfordMarkWhite
      : oxfordMarkMaroon;

  // The maroon mark + crimson wordmark vanish on dark surfaces (org chart,
  // dialogs, dark cards). Swap to the white mark + ivory wordmark under
  // `.dark`, but keep print output on white paper unchanged.
  const maroonChosen = chosenMark === oxfordMarkMaroon;

  const text =
    tone === "invert" ? "text-sidebar-foreground" : "text-primary dark:text-primary-foreground print:text-primary";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {maroonChosen ? (
        <>
          <img
            src={oxfordMarkMaroon}
            alt=""
            aria-hidden="true"
            className="h-9 w-auto shrink-0 object-contain dark:hidden print:block"
          />
          <img
            src={oxfordMarkWhite}
            alt=""
            aria-hidden="true"
            className="hidden h-9 w-auto shrink-0 object-contain dark:block print:hidden"
          />
        </>
      ) : (
        <img
          src={chosenMark}
          alt=""
          aria-hidden="true"
          className="h-9 w-auto shrink-0 object-contain"
        />
      )}
      {variant === "full" && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[0.95rem] font-bold uppercase tracking-[0.14em]",
              text,
            )}
          >
            Oxford Suites
          </span>
          <span
            className={cn(
              "font-display text-[0.8rem] font-semibold uppercase tracking-[0.3em] opacity-80",
              text,
            )}
          >
            Makati
          </span>
        </span>
      )}
      <span className="sr-only">Oxford Suites Makati</span>
    </span>
  );
}
