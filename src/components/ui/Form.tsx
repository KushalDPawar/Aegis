"use client";

import clsx from "clsx";
import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement> & {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-cream-100/85" {...rest}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-cream-100/45">{hint}</p>}
      {error && (
        <p className="text-xs text-signal-crimson flex items-center gap-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const baseInputClasses =
  "w-full rounded-xl bg-white/[0.04] border border-white/12 px-4 py-3 text-[15px] text-cream-100 placeholder:text-cream-100/30 outline-none transition-colors focus:border-signal-teal/60 focus-visible:outline-2 focus-visible:outline-signal-teal";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(baseInputClasses, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(baseInputClasses, "resize-none", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(baseInputClasses, "appearance-none", className)} {...rest}>
      {children}
    </select>
  );
}

export function Alert({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-signal-cyan/30 bg-signal-cyan/10 text-signal-cyan",
    warn: "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
    error: "border-signal-crimson/30 bg-signal-crimson/10 text-signal-crimson",
    success: "border-signal-jade/30 bg-signal-jade/10 text-signal-jade",
  }[tone];
  return (
    <div className={clsx("rounded-xl border px-4 py-3 text-sm leading-relaxed", styles)} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
