"use client";

import { useMemo, useState } from "react";

import { FilingAlert } from "@/components/radar/FilingAlert";
import { InsiderTradeRow } from "@/components/radar/InsiderTradeRow";
import { SignalCard } from "@/components/radar/SignalCard";
import { Select } from "@/components/ui/select";
import { mockSignals } from "@/lib/mock/signals";

export default function RadarPage() {
  const [selectedId, setSelectedId] = useState(mockSignals[0].id);
  const [sector, setSector] = useState("all");
  const [timeRange, setTimeRange] = useState("today");
  const selected = useMemo(() => mockSignals.find((signal) => signal.id === selectedId) ?? mockSignals[0], [selectedId]);

  return (
    <div className="grid h-full grid-cols-[260px_1fr_340px] gap-4 p-4">
      <aside className="panel p-3 text-xs">
        <h3 className="mb-3 font-display uppercase text-[var(--text-secondary)]">Filters</h3>
        <div className="space-y-2">
          {[
            "Insider Trade",
            "Bulk Deal",
            "Filing Alert",
            "Pattern Breakout",
            "Earnings Surprise",
            "Narrative Shift",
          ].map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              {item}
            </label>
          ))}
        </div>
        <div className="mt-3 border-t border-[var(--border-dim)] pt-3">
          <p>Confidence threshold</p>
          <input type="range" min={0} max={100} defaultValue={60} className="mt-2 w-full" />
        </div>
        <div className="mt-3 border-t border-[var(--border-dim)] pt-3 space-y-2">
          <p>Sector</p>
          <Select
            value={sector}
            onValueChange={setSector}
            placeholder="Select sector"
            options={[
              { label: "All Sectors", value: "all" },
              { label: "Banking", value: "banking" },
              { label: "IT", value: "it" },
              { label: "Auto", value: "auto" },
              { label: "Energy", value: "energy" },
            ]}
          />
          <p className="mt-2">Time Range</p>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={[
              { label: "Today", value: "today" },
              { label: "This Week", value: "week" },
              { label: "This Month", value: "month" },
            ]}
          />
        </div>
      </aside>

      <section className="scrollbar-terminal space-y-3 overflow-auto pr-2">
        {mockSignals.slice(0, 10).map((signal) => (
          <button key={signal.id} onClick={() => setSelectedId(signal.id)} className="block w-full text-left">
            <SignalCard signal={signal} />
          </button>
        ))}
      </section>

      <aside className="panel p-3">
        <h3 className="font-display text-sm">{selected.company}</h3>
        <p className="text-xs text-[var(--text-secondary)]">{selected.symbol} • Auto & Industrials</p>
        <p className="mt-3 text-xs text-[var(--text-data)]">{selected.fullReason}</p>

        <div className="mt-4 space-y-2">
          <h4 className="text-xs uppercase text-[var(--text-secondary)]">Related Filings</h4>
          <FilingAlert title="Director transaction disclosure filed" source="BSE Filing" />
          <FilingAlert title="Promoter pledge update" source="SEBI Disclosure" />
        </div>

        <div className="mt-4 space-y-2">
          <h4 className="text-xs uppercase text-[var(--text-secondary)]">Insider Trades</h4>
          <InsiderTradeRow name="Director Buy" value="₹4.2Cr" date="29 Mar" />
          <InsiderTradeRow name="Promoter Buy" value="₹1.8Cr" date="16 Mar" />
        </div>

        <div className="mt-4 text-xs text-[var(--accent-blue)]">
          <a href="https://www.bseindia.com" target="_blank" rel="noreferrer">
            BSE Filing
          </a>{" "}
          •{" "}
          <a href="https://www.sebi.gov.in" target="_blank" rel="noreferrer">
            SEBI Disclosure
          </a>{" "}
          •{" "}
          <a href="https://www.screener.in" target="_blank" rel="noreferrer">
            Screener.in
          </a>
        </div>
      </aside>
    </div>
  );
}
