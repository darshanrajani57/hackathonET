import { Pattern } from "@/lib/types";

export const mockPatterns: Pattern[] = [
  {
    id: "p1",
    symbol: "RELIANCE",
    name: "BULLISH FLAG",
    detectedAgo: "2h ago",
    confidence: 78,
    explanation:
      "Price formed a tight consolidation after a 12% rally. Volume dried up ~40% below average, matching historical bull-flag compression behavior.",
    backtest: { winRate: 71, avgGainPct: 6.2, instances: 15, wins: 11, losses: 4 },
  },
  {
    id: "p2",
    symbol: "SBIN",
    name: "ASCENDING TRIANGLE",
    detectedAgo: "53m ago",
    confidence: 74,
    explanation:
      "Flat resistance with higher lows and steady breadth participation. Breakout attempts now cluster with increased delivery share.",
    backtest: { winRate: 67, avgGainPct: 4.8, instances: 21, wins: 14, losses: 7 },
  },
  {
    id: "p3",
    symbol: "INFY",
    name: "HEAD & SHOULDERS",
    detectedAgo: "1h ago",
    confidence: 73,
    explanation:
      "Neckline break aligned with weak sector breadth and lower highs in momentum oscillators, increasing downside continuation probability.",
    backtest: { winRate: 64, avgGainPct: -5.1, instances: 19, wins: 12, losses: 7 },
  },
  {
    id: "p4",
    symbol: "TCS",
    name: "RANGE BREAKDOWN",
    detectedAgo: "34m ago",
    confidence: 69,
    explanation:
      "4-week range support failed on broad IT weakness. Follow-through depends on inability to reclaim midpoint in next two sessions.",
    backtest: { winRate: 62, avgGainPct: -3.9, instances: 26, wins: 16, losses: 10 },
  },
  {
    id: "p5",
    symbol: "HDFC",
    name: "CUP & HANDLE",
    detectedAgo: "3h ago",
    confidence: 76,
    explanation:
      "Rounded base with shallow handle and contracting volatility, a classic continuation template near prior highs.",
    backtest: { winRate: 70, avgGainPct: 5.7, instances: 17, wins: 12, losses: 5 },
  },
];
