"use client";

import { motion } from "framer-motion";

import { useMarketStore } from "@/lib/store/market-store";
import { formatPct } from "@/lib/utils";

export function MarketPulse() {
  const tickers = useMarketStore((state) => state.pulse.tickers);

  return (
    <div className="overflow-hidden border-y border-[var(--border-dim)] bg-[var(--bg-surface)] py-2">
      <motion.div
        className="flex w-max gap-6"
        animate={{ x: [0, -800] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...tickers, ...tickers].map((ticker, index) => (
          <div key={`${ticker.id}-${index}`} className="flex items-center gap-2 text-xs">
            <span className="font-medium text-[var(--text-secondary)]">{ticker.name}</span>
            <span className="font-data text-[var(--text-data)]">{ticker.price.toFixed(2)}</span>
            <span className={ticker.changePct >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}>
              {formatPct(ticker.changePct)}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
