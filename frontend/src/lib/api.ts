import { mockChatThreads } from "@/lib/mock/chat-responses";
import { mockPatterns } from "@/lib/mock/patterns";
import { mockChartData, mockMarketPulse } from "@/lib/mock/prices";
import { mockSignals } from "@/lib/mock/signals";
import { ChatMessage, MarketPulse, OhlcvCandle, Pattern, PortfolioHolding, Signal } from "@/lib/types";
import { useMockData } from "@/lib/utils";

const API_BASE = "http://localhost:8000";

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

export async function getSignals(): Promise<Signal[]> {
  if (useMockData) {
    return mockSignals;
  }
  try {
    return await fetchJson<Signal[]>("/api/signals");
  } catch {
    return mockSignals;
  }
}

export async function getChart(symbol: string): Promise<{ candles: OhlcvCandle[]; patterns: Pattern[] }> {
  if (useMockData) {
    return {
      candles: mockChartData[symbol] ?? mockChartData.NIFTY50,
      patterns: mockPatterns.filter((pattern) => pattern.symbol === symbol || symbol === "NIFTY50"),
    };
  }
  try {
    return await fetchJson<{ candles: OhlcvCandle[]; patterns: Pattern[] }>(`/api/chart/${symbol}`);
  } catch {
    return {
      candles: mockChartData[symbol] ?? mockChartData.NIFTY50,
      patterns: mockPatterns.filter((pattern) => pattern.symbol === symbol || symbol === "NIFTY50"),
    };
  }
}

export async function sendChat(message: string): Promise<ChatMessage> {
  if (useMockData) {
    const thread = mockChatThreads[Math.floor(Math.random() * mockChatThreads.length)];
    const answer = thread.messages.find((entry) => entry.role === "assistant");
    return (
      answer ?? {
        id: "fallback",
        role: "assistant",
        content: `Mock response for: ${message}`,
        model: "qwen3:8b",
      }
    );
  }

  try {
    return await fetchJson<ChatMessage>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  } catch {
    const thread = mockChatThreads[0];
    return thread.messages[1];
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
    return mockMarketPulse;
  }
  try {
    return await fetchJson<MarketPulse>("/api/market/pulse");
  } catch {
    return mockMarketPulse;
  }
}
