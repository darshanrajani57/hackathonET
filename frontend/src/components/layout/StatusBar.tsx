"use client";

import { useMemo } from "react";

import { useMarketStore } from "@/lib/store/market-store";

export function StatusBar() {
  const { connectionStatus, lastUpdateAt, latencyMs, modelName } = useMarketStore((state) => state);

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
        <span>Last update: {formattedTime}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>NSE LIVE</span>
        <span>{modelName}</span>
        <span>{latencyMs}ms</span>
      </div>
    </footer>
  );
}
