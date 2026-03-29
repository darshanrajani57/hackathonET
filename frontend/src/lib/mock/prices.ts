import { MarketPulse, OhlcvCandle } from "@/lib/types";

function generateCandles(base: number, symbol: string): OhlcvCandle[] {
  const now = Date.now();
  const candles: OhlcvCandle[] = [];
  let last = base;

  for (let i = 100; i > 0; i--) {
    const drift = Math.sin(i / 7) * 5;
    const noise = (Math.random() - 0.5) * 12;
    const open = last;
    const close = Math.max(1, open + drift + noise);
    const high = Math.max(open, close) + Math.random() * 6;
    const low = Math.min(open, close) - Math.random() * 6;
    const volume = Math.round(1_000_000 + Math.random() * 3_000_000 + (symbol === "NIFTY50" ? 2_000_000 : 0));
    candles.push({
      time: new Date(now - i * 15 * 60 * 1000).toISOString(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
    last = close;
  }

  return candles;
}

export const mockChartData: Record<string, OhlcvCandle[]> = {
  RELIANCE: generateCandles(2940, "RELIANCE"),
  TCS: generateCandles(4010, "TCS"),
  HDFC: generateCandles(1630, "HDFC"),
  NIFTY50: generateCandles(22420, "NIFTY50"),
};

export const mockMarketPulse: MarketPulse = {
  tickers: [
    { id: "t1", name: "NIFTY 50", price: 22438.2, changePct: 0.86 },
    { id: "t2", name: "SENSEX", price: 73890.45, changePct: 0.74 },
    { id: "t3", name: "NIFTY BANK", price: 48119.7, changePct: 1.12 },
    { id: "t4", name: "INDIA VIX", price: 13.08, changePct: -2.66 },
    { id: "t5", name: "RELIANCE", price: 2954.1, changePct: 1.42 },
    { id: "t6", name: "TCS", price: 3986.4, changePct: -0.83 },
    { id: "t7", name: "HDFCBANK", price: 1642.8, changePct: 0.39 },
    { id: "t8", name: "SBIN", price: 820.35, changePct: 1.74 },
    { id: "t9", name: "INFY", price: 1499.9, changePct: -1.02 },
  ],
  fiiNet: -1245.4,
  diiNet: 1687.9,
  indiaVix: 13.08,
};
