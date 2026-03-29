import { appendTurn, getRecentTurns } from "@/lib/server/chat-memory";

type MemoryTurn = {
  role: "user" | "assistant";
  content: string;
  at: string;
};

type MarketTicker = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
};

type MarketContext = {
  fetchedAt: string;
  summary: string;
  topMovers: MarketTicker[];
  queryQuotes?: Array<{
    symbol: string;
    price: number;
    changePct?: number;
    minuteTrend?: string;
    source: "YAHOO" | "YAHOO_PUBLIC" | "TWELVE_DATA";
  }>;
  symbolFocus?: {
    symbol: string;
    lastPrice: number;
    changePct: number;
    minuteTrend?: string;
  };
};

type RetrievalChunk = {
  id: string;
  text: string;
  score: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type NvidiaResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type ChatRequestInput = {
  message: string;
  threadId: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  portfolioContext?: boolean;
};

const TICKERS: Array<{ symbol: string; name: string }> = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "^NSEBANK", name: "NIFTY BANK" },
  { symbol: "^INDIAVIX", name: "INDIA VIX" },
  { symbol: "RELIANCE.NS", name: "RELIANCE" },
  { symbol: "TCS.NS", name: "TCS" },
  { symbol: "HDFCBANK.NS", name: "HDFCBANK" },
  { symbol: "SBIN.NS", name: "SBIN" },
  { symbol: "INFY.NS", name: "INFY" },
];

const SYMBOL_ALIASES: Record<string, string> = {
  NIFTY: "^NSEI",
  NIFTY50: "^NSEI",
  SENSEX: "^BSESN",
  BANKNIFTY: "^NSEBANK",
  RELIANCE: "RELIANCE.NS",
  TATA: "TATAMOTORS.NS",
  TCS: "TCS.NS",
  TATAMOTORS: "TATAMOTORS.NS",
  TATASTEEL: "TATASTEEL.NS",
  HDFCBANK: "HDFCBANK.NS",
  SBIN: "SBIN.NS",
  INFY: "INFY.NS",
};

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function expandQuerySymbolCandidates(symbol: string): string[] {
  const normalized = normalizeSymbol(symbol);
  const base = normalized.replace(/\.(NS|BO)$/i, "");
  const alias = SYMBOL_ALIASES[base];

  const candidates = [normalized];
  if (alias) candidates.push(normalizeSymbol(alias));

  if (!normalized.startsWith("^")) {
    candidates.push(base);
    candidates.push(`${base}.NS`);
    candidates.push(`${base}.BO`);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

function envValue(key: string, fallbackKey?: string): string {
  return (process.env[key] ?? (fallbackKey ? process.env[fallbackKey] : "") ?? "").trim();
}

function toNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function extractQuotePrice(row: Record<string, unknown>): number {
  const candidates = [
    row.regularMarketPrice,
    row.lastPrice,
    row.price,
    row.close,
    row.previousClose,
    row.ask,
    row.bid,
  ];

  for (const candidate of candidates) {
    const numeric = toNumber(candidate, NaN);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return 0;
}

function extractQuoteChangePct(row: Record<string, unknown>): number {
  const candidates = [
    row.regularMarketChangePercent,
    row.changePercent,
    row.pChange,
    row.percentChange,
  ];

  for (const candidate of candidates) {
    const numeric = toNumber(candidate, NaN);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return 0;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9^:.]+/)
    .filter((token) => token.length > 2);
}

function overlapScore(query: string, text: string): number {
  const queryTokens = new Set(tokenize(query));
  const docTokens = tokenize(text);
  let score = 0;
  for (const token of docTokens) {
    if (queryTokens.has(token)) score += 1;
  }
  return score;
}

function extractSymbolHint(message: string, history: Array<{ role: "user" | "assistant"; content: string }> = []): string | undefined {
  const merged = `${message} ${history.filter((item) => item.role === "user").map((item) => item.content).join(" ")}`.toUpperCase();
  const keys = Object.keys(SYMBOL_ALIASES).sort((a, b) => b.length - a.length);
  const match = keys.find((key) => merged.includes(key));
  return match ? SYMBOL_ALIASES[match] : undefined;
}

function extractQuerySymbols(message: string): string[] {
  const upper = message.toUpperCase();
  const fromAliases = Object.keys(SYMBOL_ALIASES).filter((key) => upper.includes(key)).map((key) => SYMBOL_ALIASES[key]);
  const tokens = upper.match(/\b[A-Z]{2,15}\b/g) ?? [];
  const mapped = tokens
    .filter((token) => !["WHAT", "WHATS", "PRICE", "SHARE", "STOCK", "TODAY", "LATEST", "FOR", "BUY", "SELL", "RISK"].includes(token))
    .map((token) => SYMBOL_ALIASES[token] ?? `${token}.NS`);
  return Array.from(new Set([...fromAliases, ...mapped])).slice(0, 4);
}

async function fetchYahooQuotes(symbols: string[]): Promise<Array<Record<string, unknown>>> {
  const rapidApiKey = envValue("RAPIDAPI_KEY", "NEXT_PUBLIC_RAPIDAPI_KEY");
  const host = envValue("RAPIDAPI_HOST_YAHOO_FINANCE", "NEXT_PUBLIC_RAPIDAPI_HOST_YAHOO_FINANCE") || "yahoo-finance15.p.rapidapi.com";

  if (!rapidApiKey || !host) {
    throw new Error("Yahoo provider env is missing");
  }

  const endpoint = `https://${host}/api/v1/markets/stock/quotes?ticker=${encodeURIComponent(symbols.join(","))}`;
  const response = await fetch(endpoint, {
    headers: {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": host,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Yahoo quote fetch failed (${response.status})`);
  }

  const payload = (await response.json()) as { body?: Array<Record<string, unknown>> };
  return payload.body ?? [];
}

async function fetchYahooQuotesResilient(symbols: string[]): Promise<Array<Record<string, unknown>>> {
  try {
    const bulk = await fetchYahooQuotes(symbols);
    if (bulk.length > 0) {
      return bulk;
    }
  } catch {
    // fall through to single-symbol retrieval
  }

  const settled = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const rows = await fetchYahooQuotes([symbol]);
      return rows[0];
    }),
  );

  const rows: Record<string, unknown>[] = [];
  for (const item of settled) {
    if (item.status !== "fulfilled") continue;
    if (!item.value) continue;
    rows.push(item.value);
  }
  return rows;
}

async function fetchSymbolMinuteTrend(symbol: string): Promise<string | undefined> {
  const tdKey = envValue("TWELVE_DATA_API_KEY", "NEXT_PUBLIC_TWELVE_DATA_API_KEY");
  if (!tdKey) return undefined;

  const twelveDataSymbol = symbol.startsWith("^")
    ? symbol === "^NSEI"
      ? "NIFTY:NSE"
      : symbol === "^BSESN"
        ? "SENSEX:BSE"
        : undefined
    : symbol.endsWith(".NS")
      ? `${symbol.replace(".NS", "")}:NSE`
      : symbol;

  if (!twelveDataSymbol) return undefined;

  const endpoint = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(twelveDataSymbol)}&interval=1min&outputsize=4&apikey=${tdKey}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return undefined;

  const payload = (await response.json()) as { values?: Array<{ close?: string }> };
  if (!payload.values || payload.values.length < 2) return undefined;

  const latest = toNumber(payload.values[0]?.close);
  const older = toNumber(payload.values[payload.values.length - 1]?.close, latest);
  if (!older) return undefined;

  const pct = ((latest - older) / older) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}% (last ${payload.values.length - 1}m)`;
}

async function fetchTwelveDataLastPrice(symbol: string): Promise<number | undefined> {
  const tdKey = envValue("TWELVE_DATA_API_KEY", "NEXT_PUBLIC_TWELVE_DATA_API_KEY");
  if (!tdKey) return undefined;

  const twelveDataSymbol = symbol.startsWith("^")
    ? symbol === "^NSEI"
      ? "NIFTY:NSE"
      : symbol === "^BSESN"
        ? "SENSEX:BSE"
        : undefined
    : symbol.endsWith(".NS")
      ? `${symbol.replace(".NS", "")}:NSE`
      : symbol;

  if (!twelveDataSymbol) return undefined;

  const endpoint = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(twelveDataSymbol)}&apikey=${tdKey}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return undefined;

  const payload = (await response.json()) as { price?: string; code?: number };
  if (payload.code) return undefined;

  const price = toNumber(payload.price, NaN);
  return Number.isFinite(price) && price > 0 ? price : undefined;
}

async function fetchYahooPublicLastQuote(symbol: string): Promise<{ price: number; changePct?: number } | undefined> {
  const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`;
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!response.ok) return undefined;

  const payload = (await response.json()) as {
    chart?: {
      result?: Array<{
        meta?: { regularMarketPrice?: number; previousClose?: number };
        indicators?: { quote?: Array<{ close?: Array<number | null> }> };
      }>;
    };
  };

  const result = payload.chart?.result?.[0];
  if (!result) return undefined;

  const metaPrice = toNumber(result.meta?.regularMarketPrice, NaN);
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const lastClose = [...closes].reverse().find((value): value is number => Number.isFinite(value ?? NaN) && Number(value) > 0);

  const price = Number.isFinite(metaPrice) && metaPrice > 0 ? metaPrice : toNumber(lastClose, NaN);
  if (!Number.isFinite(price) || price <= 0) return undefined;

  const previousClose = toNumber(result.meta?.previousClose, NaN);
  const changePct = Number.isFinite(previousClose) && previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : undefined;

  return { price, changePct };
}

async function fetchQueryLiveQuotes(symbols: string[]): Promise<MarketContext["queryQuotes"]> {
  if (symbols.length === 0) return [];

  const allCandidates = Array.from(new Set(symbols.flatMap((symbol) => expandQuerySymbolCandidates(symbol))));
  const yahooRows = await fetchYahooQuotesResilient(allCandidates);
  const queryQuotes: NonNullable<MarketContext["queryQuotes"]> = [];

  for (const requestedSymbol of symbols) {
    const candidates = expandQuerySymbolCandidates(requestedSymbol);

    const row = candidates
      .map((candidate) =>
        yahooRows.find((item) => normalizeSymbol(String(item.symbol ?? "")) === normalizeSymbol(candidate)),
      )
      .find(Boolean);

    const yahooPrice = row ? extractQuotePrice(row as Record<string, unknown>) : 0;
    const resolvedSymbol = row ? normalizeSymbol(String((row as Record<string, unknown>).symbol ?? requestedSymbol)) : requestedSymbol;

    if (yahooPrice > 0) {
      queryQuotes.push({
        symbol: resolvedSymbol,
        price: yahooPrice,
        changePct: row ? extractQuoteChangePct(row as Record<string, unknown>) : 0,
        minuteTrend: await fetchSymbolMinuteTrend(resolvedSymbol),
        source: "YAHOO",
      });
      continue;
    }

    let publicResolved = false;
    for (const candidate of candidates) {
      const publicQuote = await fetchYahooPublicLastQuote(candidate);
      if (!publicQuote) continue;

      queryQuotes.push({
        symbol: candidate,
        price: publicQuote.price,
        changePct: publicQuote.changePct,
        minuteTrend: await fetchSymbolMinuteTrend(candidate),
        source: "YAHOO_PUBLIC",
      });
      publicResolved = true;
      break;
    }

    if (publicResolved) {
      continue;
    }

    for (const candidate of candidates) {
      const tdPrice = await fetchTwelveDataLastPrice(candidate);
      if (tdPrice && tdPrice > 0) {
        queryQuotes.push({
          symbol: candidate,
          price: tdPrice,
          minuteTrend: await fetchSymbolMinuteTrend(candidate),
          source: "TWELVE_DATA",
        });
        break;
      }
    }
  }

  return queryQuotes;
}

async function buildLiveMarketContext(input: ChatRequestInput): Promise<MarketContext> {
  const quoteRows = await fetchYahooQuotesResilient(TICKERS.map((item) => item.symbol));

  const mapped = TICKERS.map((config) => {
    const row = quoteRows.find((item) => String(item.symbol) === config.symbol) ?? {};
    return {
      symbol: config.symbol,
      name: config.name,
      price: extractQuotePrice(row as Record<string, unknown>),
      changePct: extractQuoteChangePct(row as Record<string, unknown>),
    } satisfies MarketTicker;
  });

  const movers = [...mapped]
    .filter((item) => item.price > 0)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 4);

  const advances = mapped.filter((item) => item.changePct > 0).length;
  const declines = mapped.filter((item) => item.changePct < 0).length;

  const symbolHint = extractSymbolHint(input.message, input.history);
  const querySymbols = extractQuerySymbols(input.message);
  const queryQuotes = await fetchQueryLiveQuotes(querySymbols);
  const focusTicker = symbolHint ? mapped.find((item) => item.symbol === symbolHint) : undefined;
  const fallbackFocusPrice = symbolHint && (!focusTicker || focusTicker.price <= 0)
    ? (await fetchYahooPublicLastQuote(symbolHint))?.price ?? (await fetchTwelveDataLastPrice(symbolHint))
    : undefined;
  const minuteTrend = symbolHint ? await fetchSymbolMinuteTrend(symbolHint) : undefined;

  return {
    fetchedAt: new Date().toISOString(),
    summary:
      movers.length > 0 || (queryQuotes?.length ?? 0) > 0
        ? `Breadth snapshot: ${advances} advancing, ${declines} declining across tracked instruments.`
        : "Live quote provider returned limited data; using best-effort market context.",
    topMovers: movers,
    queryQuotes,
    symbolFocus: focusTicker
      ? {
          symbol: focusTicker.name,
          lastPrice: focusTicker.price > 0 ? focusTicker.price : fallbackFocusPrice ?? 0,
          changePct: focusTicker.changePct,
          minuteTrend,
        }
      : undefined,
  };
}

function buildChunks(params: {
  input: ChatRequestInput;
  market: MarketContext;
  memory: MemoryTurn[];
}): RetrievalChunk[] {
  const chunks: RetrievalChunk[] = [];

  chunks.push({
    id: "market-summary",
    text: `Market summary @ ${params.market.fetchedAt}: ${params.market.summary}`,
    score: 0,
  });

  for (const mover of params.market.topMovers) {
    chunks.push({
      id: `mover-${mover.symbol}`,
      text: `${mover.name} (${mover.symbol}) last ${mover.price.toFixed(2)} and moved ${mover.changePct.toFixed(2)}% in latest live feed.`,
      score: 0,
    });
  }

  for (const quote of params.market.queryQuotes ?? []) {
    const displaySymbol = quote.symbol.replace(".NS", "");
    chunks.push({
      id: `query-${quote.symbol}`,
      text: `Requested symbol ${displaySymbol} latest price ${quote.price.toFixed(2)} from ${quote.source}${quote.changePct !== undefined ? `, change ${quote.changePct.toFixed(2)}%` : ""}${quote.minuteTrend ? `, minute trend ${quote.minuteTrend}` : ""}.`,
      score: 0,
    });
  }

  if (params.market.symbolFocus) {
    chunks.push({
      id: "symbol-focus",
      text: `Focus symbol ${params.market.symbolFocus.symbol}: price ${params.market.symbolFocus.lastPrice.toFixed(2)}, change ${params.market.symbolFocus.changePct.toFixed(2)}%, minute trend ${params.market.symbolFocus.minuteTrend ?? "not available"}.`,
      score: 0,
    });
  }

  params.memory
    .slice(-12)
    .filter((turn) => {
      if (turn.role === "user") return true;
      const text = turn.content.toLowerCase();
      return !text.includes("running in fallback mode") && !text.includes("debug:") && !text.includes("tip: add");
    })
    .slice(-8)
    .forEach((turn, index) => {
      const compact = turn.content.replace(/\s+/g, " ").trim().slice(0, 320);
      chunks.push({
        id: `memory-${index}`,
        text: `Past ${turn.role} note: ${compact}`,
        score: 0,
      });
    });

  if (params.input.portfolioContext) {
    chunks.push({
      id: "portfolio-mode",
      text: "User requested portfolio-aware advice mode. Prefer risk-adjusted, position-sizing aware responses.",
      score: 0,
    });
  }

  return chunks.map((chunk) => ({
    ...chunk,
    score: overlapScore(params.input.message, chunk.text),
  }));
}

function renderPrompt(params: {
  input: ChatRequestInput;
  market: MarketContext;
  retrieved: RetrievalChunk[];
}): string {
  const contextBlock = params.retrieved.map((chunk) => `- ${chunk.text}`).join("\n");

  return [
    "You are FintelOS Assistant, an India-market trading copilot.",
    "Use MARKET_CONTEXT first. If data is missing, explicitly say what is unavailable and do NOT invent prices.",
    "Keep answers concise, practical, and include a clear thesis with risk notes.",
    "If user asks a price, return the exact fetched price with source and fetched time when available.",
    "Never claim guaranteed returns.",
    "",
    `MARKET_FETCHED_AT: ${params.market.fetchedAt}`,
    "MARKET_CONTEXT:",
    contextBlock,
    "",
    "USER_QUESTION:",
    params.input.message,
  ].join("\n");
}

function isSmallTalk(message: string): boolean {
  const normalized = message.toLowerCase().trim();
  return /^(hi|hello|hey|yo|how are you|how r u|what's up|whats up|good morning|good afternoon|good evening)\b/.test(normalized);
}

function smallTalkReply(message: string): string {
  const normalized = message.toLowerCase().trim();
  if (normalized.includes("how are you") || normalized.includes("how r u")) {
    return "I’m doing well—ready to help. Ask me about any stock, sector, portfolio risk, or market event and I’ll keep it concise.";
  }
  return "Hey! I’m here and ready. Ask me about any stock, sector, portfolio, or market event.";
}

async function askGemini(prompt: string): Promise<{ text: string; model: string }> {
  const apiKey = envValue("GEMINI_API_KEY");
  const configuredModel = envValue("GEMINI_MODEL") || "gemini-1.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const modelCandidates = Array.from(
    new Set([configuredModel, "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"]),
  );

  let lastError = "Unknown Gemini error";

  for (const model of modelCandidates) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: 700,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      lastError = `Gemini API failed (${response.status}) on ${model}: ${body.slice(0, 240)}`;
      if (response.status === 404 || response.status === 400) {
        continue;
      }
      throw new Error(lastError);
    }

    const payload = (await response.json()) as GeminiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim();
    if (!text) {
      lastError = `Gemini returned empty content on ${model}`;
      continue;
    }

    return { text, model };
  }

  throw new Error(lastError);
}

async function askNvidia(prompt: string): Promise<{ text: string; model: string }> {
  const apiKey = envValue("NVIDIA_API_KEY");
  const model = envValue("NVIDIA_MODEL") || "meta/llama-3.1-8b-instruct";
  const baseUrl = envValue("NVIDIA_BASE_URL") || "https://integrate.api.nvidia.com/v1";

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is missing");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are FintelOS Assistant, an India-market trading copilot. Use market context first, stay concise, and include risk notes. Never claim guaranteed returns.",
        },
        { role: "user", content: prompt },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`NVIDIA API failed (${response.status}) on ${model}: ${body.slice(0, 240)}`);
  }

  const payload = (await response.json()) as NvidiaResponse;
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("NVIDIA returned empty content");
  }

  return { text, model: `nvidia:${model}` };
}

function fallbackReply(input: ChatRequestInput, market?: MarketContext, reason?: string) {
  const movers = market?.topMovers
    ?.map((item) => `${item.name} ${item.changePct >= 0 ? "+" : ""}${item.changePct.toFixed(2)}%`)
    .join(", ");

  const lines = [
    "I’m running in fallback mode right now.",
    market ? `Live snapshot (${market.fetchedAt}): ${market.summary}` : "Live market snapshot is unavailable.",
    movers ? `Top movers: ${movers}.` : "Top movers unavailable.",
    `Your question: ${input.message}`,
    "Tip: add GEMINI_API_KEY or NVIDIA_API_KEY in .env.local to enable full AI responses with memory.",
  ];

  if (reason) {
    lines.push(`Debug: ${reason}`);
  }

  return lines.join("\n");
}

export async function generateAssistantReply(input: ChatRequestInput): Promise<{ content: string; model: string }> {
  const threadId = input.threadId || "default-thread";
  const memory = await getRecentTurns(threadId, 24);

  await appendTurn(threadId, { role: "user", content: input.message, at: new Date().toISOString() });

  if (isSmallTalk(input.message)) {
    const content = smallTalkReply(input.message);
    await appendTurn(threadId, { role: "assistant", content, at: new Date().toISOString() });
    return { content, model: "nvidia:smalltalk" };
  }

  let market: MarketContext | undefined;
  try {
    market = await buildLiveMarketContext(input);
  } catch {
    market = {
      fetchedAt: new Date().toISOString(),
      summary: "Live quote provider currently unavailable.",
      topMovers: [],
    };
  }

  const retrieved = buildChunks({ input, market, memory }).sort((a, b) => b.score - a.score).slice(0, 8);
  const prompt = renderPrompt({ input, market, retrieved });

  try {
    const llm = await askGemini(prompt);
    await appendTurn(threadId, { role: "assistant", content: llm.text, at: new Date().toISOString() });
    return { content: llm.text, model: llm.model };
  } catch (geminiError) {
    try {
      const llm = await askNvidia(prompt);
      await appendTurn(threadId, { role: "assistant", content: llm.text, at: new Date().toISOString() });
      return { content: llm.text, model: llm.model };
    } catch (nvidiaError) {
      const geminiReason = geminiError instanceof Error ? geminiError.message : "unknown gemini error";
      const nvidiaReason = nvidiaError instanceof Error ? nvidiaError.message : "unknown nvidia error";
      const content = fallbackReply(input, market, `Gemini: ${geminiReason} | NVIDIA: ${nvidiaReason}`);
      await appendTurn(threadId, { role: "assistant", content, at: new Date().toISOString() });
      return { content, model: "fallback-live-rag" };
    }
  }
}
