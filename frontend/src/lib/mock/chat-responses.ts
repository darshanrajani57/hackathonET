import { ChatMessage } from "@/lib/types";

export const mockChatThreads: { id: string; title: string; messages: ChatMessage[] }[] = [
  {
    id: "c1",
    title: "Why is India VIX falling?",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Why is India VIX falling even when Nifty is flat today?",
      },
      {
        id: "m2",
        role: "assistant",
        model: "qwen3:8b",
        thinking:
          "Checking options positioning, recent realized volatility, and event risk compression around expiry...",
        toolCall: {
          name: "get_market_pulse",
          input: { symbol: "NIFTY50", lookback: "5d" },
          output: "IV rank 28th percentile, PCR moved from 0.89 to 1.04, realized vol down 13%.",
        },
        content:
          "India VIX is likely falling because implied volatility is mean-reverting after event-risk compression, while realized intraday swings stayed muted. In simple terms: options traders are pricing less near-term uncertainty, not necessarily a directional rally.",
        citations: [
          { label: "NSE India VIX", href: "https://www.nseindia.com" },
          { label: "Options chain snapshot", href: "https://www.nseindia.com/option-chain" },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "Top signals today",
    messages: [
      { id: "m3", role: "user", content: "Show me top bullish signals today" },
      {
        id: "m4",
        role: "assistant",
        model: "deepseek-r1:8b",
        thinking: "Filtering confidence > 75, sorting by recency and filing-backed events...",
        content:
          "Top bullish setups right now: Tata Motors (Insider Buy, 87%), Reliance (Breakout, 81%), and L&T (Order Filing, 83%). Tata Motors has the strongest event repeat signal quality.",
      },
    ],
  },
  {
    id: "c3",
    title: "Reliance pattern",
    messages: [
      { id: "m5", role: "user", content: "Is Reliance in a valid bull flag?" },
      {
        id: "m6",
        role: "assistant",
        model: "qwen3:8b",
        thinking: "Comparing recent consolidation slope, volume decay, and prior momentum leg magnitude...",
        content:
          "Yes, Reliance currently matches a high-quality bull flag profile: impulse leg + controlled pullback + volume contraction. Confirmation requires close above flag upper bound with breadth support.",
      },
    ],
  },
  {
    id: "c4",
    title: "Portfolio risk",
    messages: [
      { id: "m7", role: "user", content: "Analyse my portfolio risk if IT weakens further" },
      {
        id: "m8",
        role: "assistant",
        model: "deepseek-r1:8b",
        thinking: "Estimating concentration and beta exposure from portfolio context against IT index drawdown scenarios...",
        content:
          "Your portfolio has moderate IT concentration risk. A 3-5% additional Nifty IT drawdown could shave ~1.2% to 1.8% from portfolio NAV based on current holdings. Consider hedge or partial rotation.",
      },
    ],
  },
  {
    id: "c5",
    title: "Sector rotation",
    messages: [
      { id: "m9", role: "user", content: "Which sector is strongest today and why?" },
      {
        id: "m10",
        role: "assistant",
        model: "qwen3:8b",
        thinking: "Scanning breadth, volume participation, and intraday leadership persistence across sectors...",
        content:
          "Banking is currently leading with strong breadth and broad participation from private banks. Metals are improving, while IT is lagging on weaker momentum confirmation.",
      },
    ],
  },
];
