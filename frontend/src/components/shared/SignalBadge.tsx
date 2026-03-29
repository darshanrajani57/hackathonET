import { SignalTrend } from "@/lib/types";

const map: Record<SignalTrend, string> = {
  BULLISH: "text-[var(--accent-green)] border-[var(--accent-green-dim)] bg-[var(--accent-green-dim)]",
  BEARISH: "text-[var(--accent-red)] border-[var(--accent-red-dim)] bg-[var(--accent-red-dim)]",
  WATCH: "text-[var(--accent-amber)] border-[var(--accent-amber-dim)] bg-[var(--accent-amber-dim)]",
  NEUTRAL: "text-[var(--text-secondary)] border-[var(--border-dim)] bg-[var(--bg-elevated)]",
};

export function SignalBadge({ trend }: { trend: SignalTrend }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-data text-[10px] ${map[trend]}`}>
      <span className="inline-block size-1.5 rounded-full bg-current" />
      {trend}
    </span>
  );
}
