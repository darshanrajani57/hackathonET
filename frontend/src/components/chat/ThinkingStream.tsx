"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export function ThinkingStream({ active, sourceText }: { active: boolean; sourceText: string }) {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!active) {
      setText("");
      setExpanded(true);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setText(sourceText.slice(0, index));
      if (index >= sourceText.length) {
        clearInterval(timer);
      }
    }, 12);

    return () => clearInterval(timer);
  }, [active, sourceText]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="rounded-md border border-[var(--border-dim)] bg-[var(--bg-surface)] p-3 text-xs italic text-[var(--text-secondary)]"
        >
          <button
            onClick={() => setExpanded((value) => !value)}
            className="mb-2 inline-flex items-center gap-1 text-[10px] uppercase text-[var(--text-tertiary)]"
          >
            FintelOS is reasoning...
            <ChevronDown className={`size-3 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="leading-relaxed"
              >
                {text}
                <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-[var(--text-secondary)]" />
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
