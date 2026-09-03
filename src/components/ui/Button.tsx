"use client";

import clsx from "clsx";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-signal-teal text-ink-950 hover:bg-signal-teal/90 shadow-glow disabled:bg-signal-teal/40 disabled:shadow-none",
  secondary: "bg-ink-700 text-cream-100 hover:bg-ink-600 border border-white/10",
  outline: "bg-transparent text-cream-100 border border-white/20 hover:border-signal-teal/60 hover:text-signal-teal",
  ghost: "bg-transparent text-cream-100/70 hover:text-cream-100 hover:bg-white/5",
  danger: "bg-signal-crimson text-cream-100 hover:bg-signal-crimson/90 shadow-glowCrimson",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 min-h-[36px]",
  md: "text-sm px-5 py-2.5 min-h-[44px]",
  lg: "text-base px-7 py-3.5 min-h-[52px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-teal",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...rest}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
