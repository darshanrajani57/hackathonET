import { mockChartData } from "@/lib/mock/prices";

function buildPoints(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const normalized = max === min ? 0.5 : (value - min) / (max - min);
      const y = height - normalized * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function InlineSparkline({ symbol }: { symbol: keyof typeof mockChartData }) {
  const closes = (mockChartData[symbol] ?? mockChartData.NIFTY50).slice(-24).map((candle) => candle.close);
  const first = closes[0] ?? 0;
  const last = closes[closes.length - 1] ?? 0;
  const positive = last >= first;

  return (
    <div className="mt-2 inline-flex items-center gap-2 rounded border border-[var(--border-dim)] bg-[var(--bg-surface)] px-2 py-1">
      <span className="font-data text-[10px] text-[var(--text-secondary)]">{symbol}</span>
      <svg width="80" height="24" viewBox="0 0 80 24" className="overflow-visible">
        <polyline
          fill="none"
          stroke={positive ? "#00FFA3" : "#FF4560"}
          strokeWidth="1.8"
          points={buildPoints(closes, 80, 24)}
        />
      </svg>
      <span className={`font-data text-[10px] ${positive ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
        {(last - first).toFixed(1)}
      </span>
    </div>
  );
}
