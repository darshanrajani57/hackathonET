import { mockChatThreads } from "@/lib/mock/chat-responses";
import { mockPatterns } from "@/lib/mock/patterns";
import { mockChartData, mockMarketPulse } from "@/lib/mock/prices";
import { mockSignals } from "@/lib/mock/signals";
import { VideoTemplateType } from "@/lib/mock/video-engine";
import { ChatMessage, MarketPulse, OhlcvCandle, Pattern, PortfolioHolding, Signal } from "@/lib/types";
import { useMockData } from "@/lib/utils";

export type DataSourceMode = "LIVE" | "FALLBACK" | "MOCK";

type DataSourceStatus = {
  signals: DataSourceMode;
  marketPulse: DataSourceMode;
  chart: DataSourceMode;
  chat: DataSourceMode;
};

const dataSourceStatus: DataSourceStatus = {
  signals: useMockData ? "MOCK" : "FALLBACK",
  marketPulse: useMockData ? "MOCK" : "FALLBACK",
  chart: useMockData ? "MOCK" : "FALLBACK",
  chat: useMockData ? "MOCK" : "FALLBACK",
};

function setSourceStatus(key: keyof DataSourceStatus, value: DataSourceMode) {
  dataSourceStatus[key] = value;
}

export function getDataSourceStatus(): DataSourceStatus {
  return { ...dataSourceStatus };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY ?? "";
const RAPIDAPI_HOST_YAHOO_FINANCE = (process.env.NEXT_PUBLIC_RAPIDAPI_HOST_YAHOO_FINANCE ?? "").trim();
const TWELVE_DATA_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY ?? "";

const LIVE_TICKER_CONFIG = [
  { id: "t1", name: "NIFTY 50", symbol: "^NSEI" },
  { id: "t2", name: "SENSEX", symbol: "^BSESN" },
  { id: "t3", name: "NIFTY BANK", symbol: "^NSEBANK" },
  { id: "t4", name: "INDIA VIX", symbol: "^INDIAVIX" },
  { id: "t5", name: "RELIANCE", symbol: "RELIANCE.NS" },
  { id: "t6", name: "TCS", symbol: "TCS.NS" },
  { id: "t7", name: "HDFCBANK", symbol: "HDFCBANK.NS" },
  { id: "t8", name: "SBIN", symbol: "SBIN.NS" },
  { id: "t9", name: "INFY", symbol: "INFY.NS" },
];

function asNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toTwelveDataSymbol(symbol: string): string {
  if (symbol.includes(":")) return symbol;
  if (symbol.endsWith(".NS") || symbol.endsWith(".BSE")) return symbol;
  if (symbol === "NIFTY50" || symbol === "NIFTY 50") return "NIFTY:NSE";
  return `${symbol}:NSE`;
}

async function fetchYahooQuotes(symbols: string[]) {
  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST_YAHOO_FINANCE) {
    throw new Error("RapidAPI Yahoo config missing");
  }

  const url = `https://${RAPIDAPI_HOST_YAHOO_FINANCE}/api/v1/markets/stock/quotes?ticker=${encodeURIComponent(symbols.join(","))}`;
  const response = await fetch(url, {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST_YAHOO_FINANCE,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Yahoo RapidAPI failed: ${response.status}`);
  }

  const payload = (await response.json()) as { body?: Array<Record<string, unknown>> };
  return payload.body ?? [];
}

async function fetchLiveMarketPulse(): Promise<MarketPulse> {
  const quotes = await fetchYahooQuotes(LIVE_TICKER_CONFIG.map((item) => item.symbol));

  const tickers = LIVE_TICKER_CONFIG.map((config) => {
    const quote = quotes.find((entry) => String(entry.symbol) === config.symbol) ?? {};
    return {
      id: config.id,
      name: config.name,
      price: asNumber((quote as Record<string, unknown>).regularMarketPrice),
      changePct: asNumber((quote as Record<string, unknown>).regularMarketChangePercent),
    };
  });

  const vixTicker = tickers.find((item) => item.name === "INDIA VIX");
  return {
    tickers,
    fiiNet: mockMarketPulse.fiiNet,
    diiNet: mockMarketPulse.diiNet,
    indiaVix: vixTicker?.price || mockMarketPulse.indiaVix,
  };
}

async function fetchLiveSignals(): Promise<Signal[]> {
  const quotes = await fetchYahooQuotes(["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "SBIN.NS", "INFY.NS", "AXISBANK.NS"]);

  const nowBucket = Math.floor(Date.now() / 60_000);
  return quotes.slice(0, 6).map((quote, index) => {
    const changePct = asNumber((quote as Record<string, unknown>).regularMarketChangePercent);
    const company = String((quote as Record<string, unknown>).shortName ?? (quote as Record<string, unknown>).symbol ?? `Stock ${index + 1}`);
    const symbolRaw = String((quote as Record<string, unknown>).symbol ?? company).replace(".NS", "");
    const trend: Signal["trend"] = changePct > 0.6 ? "BULLISH" : changePct < -0.6 ? "BEARISH" : "WATCH";

    return {
      id: `live-s-${nowBucket}-${index}`,
      company,
      symbol: `NSE:${symbolRaw}`,
      trend,
      type: trend === "BULLISH" ? "BREAKOUT" : trend === "BEARISH" ? "PATTERN" : "NARRATIVE SHIFT",
      reason: `${company} moved ${changePct.toFixed(2)}% in live market feed.`,
      fullReason: `Live quote ingestion detected ${changePct.toFixed(2)}% move with latest tick from Yahoo market stream. Signal auto-generated from momentum thresholds.`,
      confidence: Math.min(90, Math.max(55, Math.round(Math.abs(changePct) * 22 + 52))),
      minutesAgo: index + 1,
    };
  });
}

async function fetchLiveChart(symbol: string): Promise<{ candles: OhlcvCandle[]; patterns: Pattern[] }> {
  if (!TWELVE_DATA_API_KEY) {
    throw new Error("Twelve Data key missing");
  }

  const tdSymbol = toTwelveDataSymbol(symbol.replace("NSE:", ""));
  const endpoint = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(tdSymbol)}&interval=1min&outputsize=80&apikey=${TWELVE_DATA_API_KEY}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Twelve Data failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    values?: Array<Record<string, string>>;
    code?: number;
    message?: string;
  };

  if (!payload.values || payload.code) {
    throw new Error(payload.message ?? "No candle values returned");
  }

  const candles: OhlcvCandle[] = payload.values
    .map((value) => ({
      time: new Date(String(value.datetime)).toISOString(),
      open: asNumber(value.open),
      high: asNumber(value.high),
      low: asNumber(value.low),
      close: asNumber(value.close),
      volume: asNumber(value.volume),
    }))
    .reverse();

  return {
    candles,
    patterns: mockPatterns.filter((pattern) => pattern.symbol === symbol || symbol === "NIFTY50").slice(0, 3),
  };
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

async function fetchLocalJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export type GenerateVideoJobInput = {
  templateType: VideoTemplateType;
  title: string;
  durationSec: number;
  clientJobId?: string;
};

export type GenerateVideoJobResult = {
  id: string;
  title: string;
  templateType: VideoTemplateType;
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
  durationSec: number;
  frameLatencyMs: number;
  createdAt: string;
  outputUrl?: string;
  error?: string;
};

export async function generateVideoJob(payload: GenerateVideoJobInput): Promise<GenerateVideoJobResult> {
  return fetchLocalJson<GenerateVideoJobResult>("/api/video/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSignals(): Promise<Signal[]> {
  if (useMockData) {
    setSourceStatus("signals", "MOCK");
    return mockSignals;
  }
  try {
    const live = await fetchLiveSignals();
    setSourceStatus("signals", "LIVE");
    return live;
  } catch {
    try {
      const fallback = await fetchJson<Signal[]>("/api/signals");
      setSourceStatus("signals", "FALLBACK");
      return fallback;
    } catch {
      setSourceStatus("signals", "MOCK");
      return mockSignals;
    }
  }
}

export async function getChart(symbol: string): Promise<{ candles: OhlcvCandle[]; patterns: Pattern[] }> {
  if (useMockData) {
    setSourceStatus("chart", "MOCK");
    return {
      candles: mockChartData[symbol] ?? mockChartData.NIFTY50,
      patterns: mockPatterns.filter((pattern) => pattern.symbol === symbol || symbol === "NIFTY50"),
    };
  }
  try {
    const live = await fetchLiveChart(symbol);
    setSourceStatus("chart", "LIVE");
    return live;
  } catch {
    try {
      const fallback = await fetchJson<{ candles: OhlcvCandle[]; patterns: Pattern[] }>(`/api/chart/${symbol}`);
      setSourceStatus("chart", "FALLBACK");
      return fallback;
    } catch {
      setSourceStatus("chart", "MOCK");
      return {
        candles: mockChartData[symbol] ?? mockChartData.NIFTY50,
        patterns: mockPatterns.filter((pattern) => pattern.symbol === symbol || symbol === "NIFTY50"),
      };
    }
  }
}

export async function sendChat(payload: {
  message: string;
  threadId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  portfolioContext?: boolean;
}): Promise<ChatMessage> {
  if (useMockData) {
    setSourceStatus("chat", "MOCK");
    const thread = mockChatThreads[Math.floor(Math.random() * mockChatThreads.length)];
    const answer = thread.messages.find((entry) => entry.role === "assistant");
    return (
      answer ?? {
        id: "fallback",
        role: "assistant",
        content: `Mock response for: ${payload.message}`,
        model: "qwen3:8b",
      }
    );
  }

  try {
    const live = await fetchLocalJson<ChatMessage>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setSourceStatus("chat", "LIVE");
    return live;
  } catch {
    setSourceStatus("chat", "MOCK");
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      model: "fallback-chat",
      content: "Chat backend is temporarily unreachable. Please retry in a few seconds.",
    };
  }
}

export async function getPortfolio(): Promise<PortfolioHolding[]> {
  if (useMockData) {
    return [
      { symbol: "RELIANCE", quantity: 18, avgPrice: 2740.5, ltp: 2954.1 },
      { symbol: "TCS", quantity: 12, avgPrice: 4095.3, ltp: 3986.4 },
      { symbol: "HDFCBANK", quantity: 30, avgPrice: 1592.8, ltp: 1642.8 },
    ];
  }
  try {
    return await fetchJson<PortfolioHolding[]>("/api/portfolio");
  } catch {
    return [
      { symbol: "RELIANCE", quantity: 18, avgPrice: 2740.5, ltp: 2954.1 },
      { symbol: "TCS", quantity: 12, avgPrice: 4095.3, ltp: 3986.4 },
      { symbol: "HDFCBANK", quantity: 30, avgPrice: 1592.8, ltp: 1642.8 },
    ];
  }
}

export async function getMarketPulse(): Promise<MarketPulse> {
  if (useMockData) {
    setSourceStatus("marketPulse", "MOCK");
    return mockMarketPulse;
  }
  try {
    const live = await fetchLiveMarketPulse();
    setSourceStatus("marketPulse", "LIVE");
    return live;
  } catch {
    try {
      const fallback = await fetchJson<MarketPulse>("/api/market/pulse");
      setSourceStatus("marketPulse", "FALLBACK");
      return fallback;
    } catch {
      setSourceStatus("marketPulse", "MOCK");
      return mockMarketPulse;
    }
  }
}
