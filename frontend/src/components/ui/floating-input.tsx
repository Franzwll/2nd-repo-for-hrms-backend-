import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

/**
 * Facebook-style floating label input.
 * Label starts inside the box as placeholder; on focus or when the
 * input has a value it animates up to sit OUTSIDE the box (above it).
 */
const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, leftIcon, rightSlot, type, value, defaultValue, ...props }, ref) => {
    const inputId = id ?? React.useId();
    // Controlled or uncontrolled "has value" check so the label stays
    // floated when autofilled / prefilled (placeholder-shown alone
    // doesn't catch all autofill cases).
    const hasValue =
      (typeof value === "string" && value.length > 0) ||
      (typeof defaultValue === "string" && (defaultValue as string).length > 0);

    return (
      <div className="relative mt-2">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder=" "
          data-has-value={hasValue ? "true" : undefined}
          className={cn(
            "peer flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon ? "pl-9 pr-3" : "px-3",
            rightSlot && "pr-10",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-transparent px-0 text-sm text-muted-foreground transition-all duration-150 ease-out",
            leftIcon && "left-9",
            // Float OUTSIDE the box (above it) when focused, filled, or flagged via data attr
            "peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:bg-background peer-focus:px-1 peer-focus:text-[11px] peer-focus:text-primary",
            "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[11px]",
            "peer-data-[has-value=true]:-top-2 peer-data-[has-value=true]:translate-y-0 peer-data-[has-value=true]:bg-background peer-data-[has-value=true]:px-1 peer-data-[has-value=true]:text-[11px]",
          )}
        >
          {label}
        </label>
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    );
  },
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
