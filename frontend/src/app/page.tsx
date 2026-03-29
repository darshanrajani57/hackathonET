import { HeatMap } from "@/components/dashboard/HeatMap";
import { MarketPulse } from "@/components/dashboard/MarketPulse";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { SignalFeed } from "@/components/dashboard/SignalFeed";
import { CandleChart } from "@/components/charts/CandleChart";
import { mockChartData } from "@/lib/mock/prices";

export default function Home() {
  return (
    <div className="h-full">
      <MarketPulse />
      <section className="grid h-[calc(100%-40px)] grid-cols-12 gap-4 p-4">
        <div className="col-span-8 space-y-4">
          <div className="panel p-2">
            <CandleChart data={mockChartData.NIFTY50} />
          </div>
          <div>
            <h2 className="mb-2 text-xs uppercase text-[var(--text-secondary)]">Signal Feed</h2>
            <SignalFeed />
          </div>
        </div>
        <div className="col-span-4 space-y-4">
          <QuickStats />
          <HeatMap />
        </div>
      </section>
    </div>
  );
}
