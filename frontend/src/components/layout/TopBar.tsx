"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Tooltip } from "@/components/ui/tooltip";

function getMarketOpen() {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  const hour = ist.getHours();
  const minute = ist.getMinutes();
  const totalMinutes = hour * 60 + minute;
  return day >= 1 && day <= 5 && totalMinutes >= 555 && totalMinutes <= 930;
}

export function TopBar() {
  const [time, setTime] = useState("");
  const marketOpen = getMarketOpen();

  useEffect(() => {
    const update = () => {
      const ist = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(ist);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border-dim)] bg-[var(--bg-surface)] px-4">
      <div className="flex items-center gap-3">
        <div className="font-data text-xs text-[var(--text-data)]">IST {time}</div>
        <Tooltip content={marketOpen ? "NSE trading session active" : "NSE currently outside trading session"}>
          <span
            className={`rounded-full border px-2 py-0.5 font-data text-[10px] ${
              marketOpen
                ? "border-[var(--accent-green-dim)] bg-[var(--accent-green-dim)] text-[var(--accent-green)]"
                : "border-[var(--accent-red-dim)] bg-[var(--accent-red-dim)] text-[var(--accent-red)]"
            }`}
          >
            {marketOpen ? "MARKET OPEN" : "MARKET CLOSED"}
          </span>
        </Tooltip>
      </div>

      <label className="flex w-[420px] items-center gap-2 rounded-md border border-[var(--border-dim)] bg-[var(--bg-card)] px-3 py-1.5 focus-within:border-[var(--border-bright)]">
        <Search className="size-4 text-[var(--text-secondary)]" />
        <input
          className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
          placeholder="Search stocks by name/symbol"
        />
      </label>
    </header>
  );
}
