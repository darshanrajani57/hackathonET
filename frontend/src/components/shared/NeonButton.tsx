"use client";

import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "danger" | "ghost";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function NeonButton({ variant = "primary", className, ...props }: NeonButtonProps) {
  return (
    <button
      className={cn(
        "rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150",
        variant === "primary" &&
          "border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[var(--accent-green-dim)] hover:shadow-[0_0_20px_var(--accent-green-dim)]",
        variant === "danger" &&
          "border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[var(--accent-red-dim)]",
        variant === "ghost" &&
          "border-[var(--border-bright)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        className,
      )}
      {...props}
    />
  );
}
