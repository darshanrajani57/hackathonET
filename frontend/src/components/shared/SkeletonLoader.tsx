import { cn } from "@/lib/utils";

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-md bg-[var(--bg-elevated)]", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--bg-elevated) 0%, rgba(255,255,255,0.05) 50%, var(--bg-elevated) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}
