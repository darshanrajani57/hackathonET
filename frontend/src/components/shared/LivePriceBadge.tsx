import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { formatPct } from "@/lib/utils";

export function LivePriceBadge({ price, changePct }: { price: number; changePct: number }) {
  const positive = changePct >= 0;
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border-dim)] bg-[var(--bg-card)] px-2 py-1 text-xs">
      <span className="font-data text-[var(--text-data)]">
        <AnimatedNumber value={price} formatter={(value) => value.toFixed(2)} />
      </span>
      <span className={`font-data ${positive ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
        {formatPct(changePct)}
      </span>
    </div>
  );
}
