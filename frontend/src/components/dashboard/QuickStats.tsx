"use client";

import { useState } from "react";

import { useMarketStore } from "@/lib/store/market-store";
import { formatINR } from "@/lib/utils";

export function QuickStats() {
  const pulse = useMarketStore((state) => state.pulse);
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");

  const sorted = [...pulse.tickers].sort((a, b) => (tab === "gainers" ? b.changePct - a.changePct : a.changePct - b.changePct));

  return (
    <div className="space-y-3">
      <section className="panel p-3">
        <h3 className="text-xs uppercase text-[var(--text-secondary)]">FII / DII Flow</h3>
        <p className="mt-2 font-data text-lg text-[var(--accent-green)]">{formatINR(pulse.diiNet - Math.abs(pulse.fiiNet))}</p>
        <div className="mt-3 space-y-2 text-[10px]">
          <div>
            <div className="mb-1 flex justify-between">
              <span>FII Net</span>
              <span>{formatINR(pulse.fiiNet)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-elevated)]">
              <div className="h-full w-2/5 rounded-full bg-[var(--accent-red)]" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between">
              <span>DII Net</span>
              <span>{formatINR(pulse.diiNet)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-elevated)]">
              <div className="h-full w-3/4 rounded-full bg-[var(--accent-green)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-3">
        <h3 className="text-xs uppercase text-[var(--text-secondary)]">India VIX</h3>
        <div className="mt-2 rounded-md border border-[var(--border-dim)] p-3">
          <p className="font-data text-xl text-[var(--accent-amber)]">{pulse.indiaVix.toFixed(2)}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Fear/Greed: Neutral to Low Fear</p>
        </div>
      </section>

      <section className="panel p-3">
        <div className="mb-2 flex gap-2 text-xs">
          <button
            onClick={() => setTab("gainers")}
            className={`rounded px-2 py-1 ${tab === "gainers" ? "bg-[var(--accent-green-dim)] text-[var(--accent-green)]" : "text-[var(--text-secondary)]"}`}
          >
            Top Gainers
          </button>
          <button
            onClick={() => setTab("losers")}
            className={`rounded px-2 py-1 ${tab === "losers" ? "bg-[var(--accent-red-dim)] text-[var(--accent-red)]" : "text-[var(--text-secondary)]"}`}
          >
            Top Losers
          </button>
        </div>
        <div className="space-y-1 text-xs">
          {sorted.slice(0, 5).map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span className={item.changePct >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}>
                {item.changePct > 0 ? "+" : ""}
                {item.changePct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
