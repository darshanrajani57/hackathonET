"use client";

import { useEffect, useMemo, useState } from "react";

import { DataSourceMode } from "@/lib/api";
import { useMarketStore } from "@/lib/store/market-store";

function SourceBadge({ label, mode }: { label: string; mode: DataSourceMode }) {
  const modeStyle =
    mode === "LIVE"
      ? "border-[var(--accent-green)] bg-[var(--accent-green-dim)] text-[var(--accent-green)]"
      : mode === "FALLBACK"
        ? "border-[var(--accent-amber)] bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]"
        : "border-[var(--border-bright)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]";

  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] leading-none ${modeStyle}`}>
      {label}:{mode}
    </span>
  );
}

export function StatusBar() {
  const { connectionStatus, lastUpdateAt, latencyMs, modelName, sourceStatus } = useMarketStore((state) => state);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const formattedTime = useMemo(
    () =>
      new Date(lastUpdateAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [lastUpdateAt],
  );

  return (
    <footer className="flex h-[22px] items-center justify-between bg-[var(--status-bar)] px-3 font-data text-[10px] text-white">
      <div className="flex items-center gap-4">
        <span>WS: {connectionStatus.toUpperCase()}</span>
        <span>Last update: {isHydrated ? formattedTime : "--:--:--"}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>NSE LIVE</span>
        <div className="flex items-center gap-1">
          <SourceBadge label="S" mode={sourceStatus.signals} />
          <SourceBadge label="P" mode={sourceStatus.marketPulse} />
          <SourceBadge label="C" mode={sourceStatus.chart} />
        </div>
        <span>{modelName}</span>
        <span>{latencyMs}ms</span>
      </div>
    </footer>
  );
}
