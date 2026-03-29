"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { CandleChart } from "@/components/charts/CandleChart";
import { PatternCard } from "@/components/charts/PatternCard";
import { PatternOverlay } from "@/components/charts/PatternOverlay";
import { getChart, getDataSourceStatus } from "@/lib/api";
import { mockPatterns } from "@/lib/mock/patterns";
import { mockChartData } from "@/lib/mock/prices";
import { useMarketStore } from "@/lib/store/market-store";

const symbols = ["RELIANCE", "TCS", "HDFC", "NIFTY50"];

export default function ChartsPage() {
  const [symbol, setSymbol] = useState("RELIANCE");
  const [search, setSearch] = useState("");
  const setSourceStatus = useMarketStore((state) => state.setSourceStatus);

  const { data, isFetching } = useQuery({
    queryKey: ["chart", symbol],
    queryFn: () => getChart(symbol),
  });

  const candles = data?.candles ?? mockChartData[symbol] ?? mockChartData.NIFTY50;
  const patterns = useMemo(() => data?.patterns ?? mockPatterns.filter((pattern) => pattern.symbol === symbol), [data?.patterns, symbol]);
  const filteredSymbols = useMemo(() => symbols.filter((item) => item.toLowerCase().includes(search.toLowerCase())), [search]);

  useEffect(() => {
    if (!data) return;
    const source = getDataSourceStatus();
    setSourceStatus({ chart: source.chart });
  }, [data, setSourceStatus]);

  return (
    <div className="grid h-full grid-cols-[240px_1fr_320px] gap-4 p-4">
      <aside className="panel p-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-3 w-full rounded-md border border-[var(--border-dim)] bg-[var(--bg-surface)] px-2 py-1 text-sm"
          placeholder="Search NSE symbols"
        />
        <div className="space-y-1 text-xs">
          {filteredSymbols.map((item) => (
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
        {isFetching && <p className="absolute right-3 top-2 z-10 text-[10px] text-[var(--text-secondary)]">Refreshing live chart...</p>}
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
