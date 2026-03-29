"use client";

import { useMemo, useState } from "react";

import { CandleChart } from "@/components/charts/CandleChart";
import { PatternCard } from "@/components/charts/PatternCard";
import { PatternOverlay } from "@/components/charts/PatternOverlay";
import { mockPatterns } from "@/lib/mock/patterns";
import { mockChartData } from "@/lib/mock/prices";

const symbols = ["RELIANCE", "TCS", "HDFC", "NIFTY50"];

export default function ChartsPage() {
  const [symbol, setSymbol] = useState("RELIANCE");
  const candles = mockChartData[symbol] ?? mockChartData.NIFTY50;
  const patterns = useMemo(() => mockPatterns.filter((pattern) => pattern.symbol === symbol), [symbol]);

  return (
    <div className="grid h-full grid-cols-[240px_1fr_320px] gap-4 p-4">
      <aside className="panel p-3">
        <input
          className="mb-3 w-full rounded-md border border-[var(--border-dim)] bg-[var(--bg-surface)] px-2 py-1 text-sm"
          placeholder="Search NSE symbols"
        />
        <div className="space-y-1 text-xs">
          {symbols.map((item) => (
            <button
              key={item}
              onClick={() => setSymbol(item)}
              className={`w-full rounded px-2 py-1 text-left ${symbol === item ? "bg-[var(--accent-blue-dim)] text-[var(--accent-blue)]" : "text-[var(--text-secondary)]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <section className="panel relative p-2">
        <CandleChart data={candles} />
        <PatternOverlay patterns={patterns} />
      </section>

      <aside className="scrollbar-terminal space-y-2 overflow-auto pr-1">
        {patterns.length === 0 ? (
          <div className="panel p-3 text-xs text-[var(--text-secondary)]">No active patterns detected</div>
        ) : (
          patterns.map((pattern) => <PatternCard key={pattern.id} pattern={pattern} />)
        )}
      </aside>
    </div>
  );
}
