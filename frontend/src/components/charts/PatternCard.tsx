"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Pattern } from "@/lib/types";

export function PatternCard({ pattern }: { pattern: Pattern }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="panel p-3"
    >
      <h4 className="font-display text-sm text-[var(--text-primary)]">{pattern.name}</h4>
      <p className="mt-1 text-[10px] text-[var(--text-secondary)]">Detected: {pattern.detectedAgo}</p>
      <p className="mt-1 text-xs text-[var(--text-data)]">Confidence: {pattern.confidence}%</p>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">{pattern.explanation}</p>
      <button onClick={() => setOpen((v) => !v)} className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--accent-blue)]">
        Back-test Results <ChevronDown className={`size-3 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1 text-xs text-[var(--text-data)]"
          >
            <p>Win rate: {pattern.backtest.winRate}% ({pattern.backtest.instances} instances)</p>
            <p>Avg gain: {pattern.backtest.avgGainPct}%</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              <div className="h-full bg-[var(--accent-green)]" style={{ width: `${pattern.backtest.winRate}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
