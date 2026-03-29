export type SignalTrend = "BULLISH" | "BEARISH" | "WATCH" | "NEUTRAL";

export type SignalType =
  | "INSIDER BUY"
  | "BULK DEAL"
  | "FILING ALERT"
  | "PATTERN"
  | "BREAKOUT"
  | "EARNINGS SURPRISE"
  | "NARRATIVE SHIFT";

export interface Signal {
  id: string;
  company: string;
  symbol: string;
  trend: SignalTrend;
  type: SignalType;
  reason: string;
  fullReason: string;
  confidence: number;
  minutesAgo: number;
}

export interface MarketTickerItem {
  id: string;
  name: string;
  price: number;
  changePct: number;
}

export interface OhlcvCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestResult {
  winRate: number;
  avgGainPct: number;
  instances: number;
  wins: number;
  losses: number;
}

export interface Pattern {
  id: string;
  symbol: string;
  name: string;
  detectedAgo: string;
  confidence: number;
  explanation: string;
  backtest: BacktestResult;
}

export interface ChatToolCall {
  name: string;
  input: Record<string, string | number | boolean>;
  output: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  thinking?: string;
  toolCall?: ChatToolCall;
  citations?: { label: string; href: string }[];
}

export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  ltp: number;
}

export interface MarketPulse {
  tickers: MarketTickerItem[];
  fiiNet: number;
  diiNet: number;
  indiaVix: number;
}
