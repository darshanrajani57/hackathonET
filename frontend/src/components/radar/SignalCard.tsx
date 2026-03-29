import { NeonButton } from "@/components/shared/NeonButton";
import { SignalBadge } from "@/components/shared/SignalBadge";
import { Signal } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

export function SignalCard({
  signal,
  onChat,
  onViewFiling,
  onToggleWatchlist,
  watchlisted = false,
}: {
  signal: Signal;
  onChat?: () => void;
  onViewFiling?: () => void;
  onToggleWatchlist?: () => void;
  watchlisted?: boolean;
}) {
  return (
    <article className="panel p-3">
      <div className="mb-2 flex items-center justify-between">
        <SignalBadge trend={signal.trend} />
        <span className="font-data text-[10px] text-[var(--text-secondary)]">{relativeTime(signal.minutesAgo)} • {signal.confidence}%</span>
      </div>
      <p className="font-display text-sm">{signal.type}</p>
      <p className="mt-2 text-sm font-medium">{signal.company}</p>
      <p className="font-data text-[10px] text-[var(--text-secondary)]">{signal.symbol}</p>
      <p className="mt-2 text-xs text-[var(--text-data)]">{signal.reason}</p>
      <div className="mt-3 flex gap-2">
        <NeonButton variant="ghost" type="button" onClick={onViewFiling}>
          View Filing
        </NeonButton>
        <NeonButton variant="ghost" type="button" onClick={onToggleWatchlist}>
          {watchlisted ? "Watchlisted" : "Add to Watchlist"}
        </NeonButton>
        <NeonButton type="button" onClick={onChat}>
          Chat
        </NeonButton>
      </div>
    </article>
  );
}
