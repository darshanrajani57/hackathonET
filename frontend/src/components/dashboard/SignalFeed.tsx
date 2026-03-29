"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { SignalBadge } from "@/components/shared/SignalBadge";
import { useMarketStore } from "@/lib/store/market-store";
import { cn, relativeTime } from "@/lib/utils";

export function SignalFeed() {
  const allSignals = useMarketStore((state) => state.signals);
  const signals = allSignals.slice(0, 8);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {signals.map((signal, index) => (
        <motion.article
          key={signal.id}
          initial={{ x: -18, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.04 }}
          onMouseEnter={() => setExpanded(signal.id)}
          onMouseLeave={() => setExpanded(null)}
          className="panel overflow-hidden"
        >
          <div className="flex">
            <div
              className={cn(
                "w-1 shrink-0",
                signal.trend === "BULLISH" && "bg-[var(--accent-green)]",
                signal.trend === "BEARISH" && "bg-[var(--accent-red)]",
                signal.trend === "WATCH" && "bg-[var(--accent-amber)]",
                signal.trend === "NEUTRAL" && "bg-[var(--text-secondary)]",
              )}
            />
            <div className="w-full p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{signal.company}</p>
                  <p className="font-data text-[10px] text-[var(--text-secondary)]">{signal.symbol}</p>
                </div>
                <SignalBadge trend={signal.trend} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{signal.type}</span>
                <span>{relativeTime(signal.minutesAgo)}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-data)]">{signal.reason}</p>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-elevated)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-green)]"
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <AnimatePresence>
                {expanded === signal.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-xs text-[var(--text-secondary)]"
                  >
                    {signal.fullReason}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
