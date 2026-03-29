# FintelOS Frontend - Complete Structure & Integration Guide

**Project**: FintelOS Frontend MVP  
**Framework**: Next.js 14.2.5 + React 18 + TypeScript  
**State Management**: Zustand 5.0.12  
**Data Fetching**: @tanstack/react-query 5.95.2 + WebSocket  
**Styling**: Tailwind CSS 3.4.1  
**Charting**: lightweight-charts 5.1.0  

---

## 1. DIRECTORY STRUCTURE

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (Sidebar | TopBar + main + StatusBar)
│   │   ├── page.tsx                  # Dashboard (/)
│   │   ├── globals.css               # Global theme & styles (dark terminal aesthetic)
│   │   ├── favicon.ico
│   │   ├── charts/
│   │   │   └── page.tsx              # Chart Intelligence (/charts)
│   │   ├── chat/
│   │   │   └── page.tsx              # Chat Interface (/chat)
│   │   ├── radar/
│   │   │   └── page.tsx              # Opportunity Radar (/radar)
│   │   ├── portfolio/
│   │   │   └── page.tsx              # Portfolio (/portfolio)
│   │   └── video/
│   │       └── page.tsx              # Video Status (/video)
│   │
│   ├── components/                   # React components (all client-side)
│   │   ├── layout/
│   │   │   ├── AppProviders.tsx      # QueryClient + WebSocket + prefetch
│   │   │   ├── Sidebar.tsx           # Navigation (hover-expand)
│   │   │   ├── TopBar.tsx            # Header (time, market status, search)
│   │   │   └── StatusBar.tsx         # Footer (WS status, latency, model)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── MarketPulse.tsx       # Auto-scrolling ticker ribbon
│   │   │   ├── SignalFeed.tsx        # 8-item signal list (expandable)
│   │   │   ├── HeatMap.tsx           # 12-sector grid
│   │   │   └── QuickStats.tsx        # FII/DII flow, VIX gauge
│   │   │
│   │   ├── charts/
│   │   │   ├── CandleChart.tsx       # lightweight-charts wrapper (dual API v5 support)
│   │   │   ├── PatternCard.tsx       # Expandable pattern detail
│   │   │   └── PatternOverlay.tsx    # Pattern labels on chart
│   │   │
│   │   ├── radar/
│   │   │   ├── SignalCard.tsx        # Reusable signal card
│   │   │   ├── FilingAlert.tsx       # Filing source pill
│   │   │   └── InsiderTradeRow.tsx   # Trade record row
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx     # Main chat container (thread sidebar + messages)
│   │   │   ├── ThinkingStream.tsx    # "AI is reasoning..." box (collapsible)
│   │   │   ├── MessageBubble.tsx     # User/Assistant message bubble
│   │   │   ├── ToolCallVisualization.tsx # Expandable tool call JSON
│   │   │   └── InlineSparkline.tsx   # Mini SVG chart for stock mentions
│   │   │
│   │   ├── portfolio/
│   │   │   └── PortfolioTable.tsx    # Portfolio holdings table
│   │   │
│   │   ├── shared/
│   │   │   ├── NeonButton.tsx        # Primary/danger/ghost variants (neon glow)
│   │   │   ├── AnimatedNumber.tsx    # Framer motion number transitions
│   │   │   ├── SignalBadge.tsx       # BULLISH/BEARISH/WATCH badge
│   │   │   ├── LivePriceBadge.tsx    # Price + % change animated
│   │   │   ├── SkeletonLoader.tsx    # Shimmer placeholder
│   │   │   └── DataTable.tsx         # Generic sortable table
│   │   │
│   │   └── ui/
│   │       ├── tooltip.tsx           # Radix tooltip primitive (dark theme)
│   │       └── select.tsx            # Radix select primitive (dark theme)
│   │
│   └── lib/                          # Utilities & core logic
│       ├── types.ts                  # TypeScript interfaces (Signal, Pattern, etc.)
│       ├── api.ts                    # Typed API functions (mock fallback)
│       ├── utils.ts                  # Helpers (formatINR, formatPct, relativeTime)
│       ├── websocket.ts              # WebSocket client (exponential backoff reconnect)
│       │
│       ├── store/
│       │   └── market-store.ts       # Zustand store (signals, pulse, connection)
│       │
│       └── mock/
│           ├── signals.ts            # 20 mock signals (TATA, RELIANCE, HDFC, etc.)
│           ├── prices.ts             # OHLCV candles + market pulse tickers
│           ├── patterns.ts           # 5 detected patterns with backtest results
│           └── chat-responses.ts     # 5 pre-built chat threads with thinking
│
├── public/                           # Static assets
├── package.json                      # Dependencies (see below)
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript strict mode
└── tailwind.config.ts                # Tailwind CSS custom theme

```

---

## 2. TYPESCRIPT INTERFACES (lib/types.ts)

### Core Types

```typescript
// Signal type (market intelligence)
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
  trend: SignalTrend;                 // Market direction
  type: SignalType;                   // Signal category
  reason: string;                     // Short summary (1 line)
  fullReason: string;                 // Detailed explanation
  confidence: number;                 // 0-100%
  minutesAgo: number;                 // Time since detection
}

// Market ticker (for pulse ribbon)
export interface MarketTickerItem {
  id: string;
  name: string;                       // E.g., "NIFTY 50"
  price: number;
  changePct: number;                  // +1.23 or -0.45
}

// Candlestick data (OHLCV)
export interface OhlcvCandle {
  time: string;                       // ISO timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Chart pattern with backtest analysis
export interface BacktestResult {
  winRate: number;                    // 0-1 (60% = 0.6)
  avgGainPct: number;                 // Average gain when signal wins
  instances: number;                  // Total pattern occurrences
  wins: number;                        // Winning instances
  losses: number;                     // Losing instances
}

export interface Pattern {
  id: string;
  symbol: string;
  name: string;                       // "Bull Flag", "Cup & Handle", etc.
  detectedAgo: string;                // "2 hours ago"
  confidence: number;                 // 0-100%
  explanation: string;                // Pattern details
  backtest: BacktestResult;           // Historical performance
}

// AI Chat message
export interface ChatToolCall {
  name: string;                       // Tool name ("get_market_pulse", etc.)
  input: Record<string, string | number | boolean>;  // Tool arguments
  output: string;                     // Tool result
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;                    // Message text
  model?: string;                     // AI model name (e.g., "qwen3:8b")
  thinking?: string;                  // Chain of thought reasoning
  toolCall?: ChatToolCall;            // Tool execution (if any)
  citations?: { label: string; href: string }[];  // Source links
}

// Portfolio holding
export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  avgPrice: number;                   // Purchase average
  ltp: number;                        // Last traded price
}

// Market pulse aggregator
export interface MarketPulse {
  tickers: MarketTickerItem[];        // 9+ ticker items
  fiiNet: number;                     // FII net flow (INR)
  diiNet: number;                     // DII net flow (INR)
  indiaVix: number;                   // India VIX value
}
```

---

## 3. API ENDPOINTS (lib/api.ts)

All API functions support **mock fallback** (see `NEXT_PUBLIC_USE_MOCK_DATA` env var).

### Backend Required Endpoints

```typescript
// 1. Get all active signals
GET http://localhost:8000/api/signals
Response: Signal[]
{
  "signals": [
    {
      "id": "sig-1",
      "company": "TATA MOTORS",
      "symbol": "TATAMOTORS",
      "trend": "BULLISH",
      "type": "INSIDER BUY",
      "reason": "Insider bought 100K shares",
      "fullReason": "Promoter insider transaction detected...",
      "confidence": 82,
      "minutesAgo": 15
    }
  ]
}

// 2. Get chart data with patterns for a symbol
GET http://localhost:8000/api/chart/{symbol}
Response: { candles: OhlcvCandle[], patterns: Pattern[] }
{
  "candles": [
    {
      "time": "2026-03-29T10:00:00Z",
      "open": 2940.0,
      "high": 2960.5,
      "low": 2935.0,
      "close": 2954.1,
      "volume": 1250000
    }
  ],
  "patterns": [
    {
      "id": "pat-1",
      "symbol": "RELIANCE",
      "name": "Bull Flag",
      "detectedAgo": "2 hours ago",
      "confidence": 78,
      "explanation": "Flag formation on 15-min chart...",
      "backtest": {
        "winRate": 0.72,
        "avgGainPct": 2.15,
        "instances": 50,
        "wins": 36,
        "losses": 14
      }
    }
  ]
}

// 3. Send chat message (streaming or immediate response)
POST http://localhost:8000/api/chat
Body: { "message": string }
Response: ChatMessage
{
  "id": "msg-1",
  "role": "assistant",
  "content": "Based on the recent filing...",
  "model": "qwen3:8b",
  "thinking": "Let me analyze the filing data...",
  "toolCall": {
    "name": "get_market_pulse",
    "input": { "sector": "IT" },
    "output": "FII net +450 Cr"
  },
  "citations": [
    { "label": "Filing", "href": "https://..." }
  ]
}

// 4. Get portfolio holdings
GET http://localhost:8000/api/portfolio
Response: PortfolioHolding[]
{
  "holdings": [
    {
      "symbol": "RELIANCE",
      "quantity": 18,
      "avgPrice": 2740.50,
      "ltp": 2954.10
    }
  ]
}

// 5. Get market pulse (tickers + FII/DII + VIX)
GET http://localhost:8000/api/market/pulse
Response: MarketPulse
{
  "tickers": [
    { "id": "t1", "name": "NIFTY 50", "price": 25432.15, "changePct": 1.23 },
    { "id": "t2", "name": "SENSEX", "price": 83245.50, "changePct": 1.10 }
  ],
  "fiiNet": 450000000,  // INR (450 Cr)
  "diiNet": -120000000,  // INR (-120 Cr)
  "indiaVix": 18.25
}
```

### WebSocket (Real-time Updates)

```typescript
// Connect to WebSocket
ws://localhost:8000/ws/market

// Message Format (sent from backend)
{
  "signals": [ /* updated Signal[] */ ],
  "pulse": { /* updated MarketPulse */ },
  "latencyMs": 42
}

// Reconnect Behavior
- Automatic retry with exponential backoff
- Max delay: 30 seconds
- Updates Zustand store on each message
```

---

## 4. ZUSTAND STATE STORE (lib/store/market-store.ts)

```typescript
// State shape
interface MarketStore {
  // Real-time data
  signals: Signal[];                  // Market opportunities
  pulse: MarketPulse;                 // Tickers + FII/DII + VIX
  
  // Connection state
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  lastUpdateAt: string;               // ISO timestamp of last update
  latencyMs: number;                  // Network latency ms
  modelName: string;                  // AI model name for display
  
  // Actions
  setConnectionStatus: (status) => void;
  updateFromSocket: (payload) => void;  // Called on WS message
}

// Usage in components
import { useMarketStore } from "@/lib/store/market-store";

function MyComponent() {
  const signals = useMarketStore((state) => state.signals);
  const pulse = useMarketStore((state) => state.pulse);
  const status = useMarketStore((state) => state.connectionStatus);
  
  return (
    <div>
      {signals.map(sig => <SignalCard key={sig.id} signal={sig} />)}
    </div>
  );
}
```

---

## 5. ROUTES & PAGE STRUCTURE

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` + DashboardComponents | Main dashboard with ticker, signals, charts, stats |
| `/charts` | `app/charts/page.tsx` | Chart analysis with pattern detection |
| `/radar` | `app/radar/page.tsx` | Opportunity radar with filters (Radix Select) |
| `/chat` | `app/chat/page.tsx` | AI chat with ThinkingStream + tool visualization |
| `/portfolio` | `app/portfolio/page.tsx` | Holdings table with P&L |
| `/video` | `app/video/page.tsx` | Placeholder for video integration |

---

## 6. COMPONENT HIERARCHY

### Dashboard (/)
```
Dashboard
├── MarketPulse (ticker ribbon)
├── Grid (12 col)
│   ├── Left (8 cols)
│   │   ├── CandleChart
│   │   └── SignalFeed
│   └── Right (4 cols)
│       ├── QuickStats
│       │   ├── FII/DII flow bars
│       │   ├── India VIX gauge
│       │   └── Gainers/Losers toggle
│       └── HeatMap (12 sectors)
```

### Chart Intelligence (/charts)
```
ChartPage
├── LeftPanel (Symbol list)
├── Center (CandleChart + PatternOverlay)
└── RightPanel (PatternCard list)
```

### Opportunity Radar (/radar)
```
RadarPage
├── LeftPanel (Filters)
│   ├── Type checkboxes
│   ├── Confidence slider
│   └── Radix Select (Sector + Time Range)
├── Center (SignalCard grid)
└── RightPanel (Detail: Filing Alerts + Insider Trades)
```

### Chat (/chat)
```
ChatInterface
├── Sidebar (Thread list with timestamps)
├── MainArea
│   ├── ScrollableMessages
│   │   ├── MessageBubble (user/assistant)
│   │   ├── ThinkingStream (during streaming)
│   │   ├── ToolCallVisualization
│   │   └── InlineSparkline (for stock mentions)
│   ├── Textarea + NeonButton send
│   ├── QuickActionPills
│   └── PortfolioContextToggle
```

---

## 7. ENVIRONMENT VARIABLES

```bash
# .env.local (at frontend/ root)

# API Base URL
NEXT_PUBLIC_API_BASE=http://localhost:8000

# Use mock data (fallback when backend unavailable)
NEXT_PUBLIC_USE_MOCK_DATA=true

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/market
```

---

## 8. KEY DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "14.2.5",
    "typescript": "^5.5.4",
    "tailwindcss": "3.4.1",
    "zustand": "5.0.12",
    "@tanstack/react-query": "^5.95.2",
    "framer-motion": "12.38.0",
    "lightweight-charts": "5.1.0",
    "lucide-react": "1.7.0",
    "@radix-ui/react-tooltip": "^1.106.1",
    "@radix-ui/react-select": "^2.159.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "next-font": "^1.0.0"
  }
}
```

---

## 9. STYLING & THEME

**CSS Variables** (lib/globals.css):
```css
--bg-base: #0D1117          /* Dark background */
--bg-secondary: #161E2A     /* Secondary bg */
--text-primary: #E6EAED     /* Primary text */
--text-secondary: #8B95A5   /* Secondary text */
--accent-green: #00FFA3     /* Bullish/accent */
--accent-red: #FF4560       /* Bearish */
--accent-amber: #F5A623     /* Warning */
--border-color: #21262D     /* Subtle borders */
```

**Fonts**:
- Display: DM_Mono
- Body: IBM_Plex_Sans
- Data/Monospace: Roboto_Mono

---

## 10. HOW TO CONNECT BACKEND

### Step 1: Implement Backend API Endpoints

Your backend should expose (on `http://localhost:8000`):

```
GET  /api/signals              → Signal[]
GET  /api/chart/{symbol}       → { candles: OhlcvCandle[], patterns: Pattern[] }
POST /api/chat                 → ChatMessage
GET  /api/portfolio            → PortfolioHolding[]
GET  /api/market/pulse         → MarketPulse

WS   /ws/market                → JSON streaming (signals, pulse, latencyMs)
```

### Step 2: Implement WebSocket Message Format

Backend sends periodic updates (e.g., every 5s):

```json
{
  "signals": [
    {
      "id": "sig-xxx",
      "company": "RELIANCE",
      "symbol": "RELIANCE",
      "trend": "BULLISH",
      "type": "INSIDER BUY",
      "reason": "Short reason",
      "fullReason": "Full detailed reason",
      "confidence": 82,
      "minutesAgo": 15
    }
  ],
  "pulse": {
    "tickers": [
      { "id": "t1", "name": "NIFTY 50", "price": 25432.15, "changePct": 1.23 }
    ],
    "fiiNet": 450000000,
    "diiNet": -120000000,
    "indiaVix": 18.25
  },
  "latencyMs": 42
}
```

### Step 3: Remove Mock Data (Optional)

In `frontend/src/lib/utils.ts`, toggle:
```typescript
export const useMockData = false;  // Switch to false when backend ready
```

Or set env variable:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Step 4: Handle Streaming Chat (Optional)

For streaming responses, modify `sendChat()` in `lib/api.ts`:

```typescript
export async function* streamChat(message: string) {
  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        yield JSON.parse(line.slice(6));
      }
    }
  }
}
```

---

## 11. SAMPLE BACKEND IMPLEMENTATIONS

### Python (FastAPI + WebSocket)

```python
from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
from typing import List

app = FastAPI()

@app.get("/api/signals")
async def get_signals():
    return {
        "signals": [
            {
                "id": "sig-1",
                "company": "RELIANCE",
                "symbol": "RELIANCE",
                "trend": "BULLISH",
                "type": "INSIDER BUY",
                "reason": "Insider bought shares",
                "fullReason": "Detailed analysis...",
                "confidence": 82,
                "minutesAgo": 15
            }
        ]
    }

@app.get("/api/chart/{symbol}")
async def get_chart(symbol: str):
    return {
        "candles": [
            {
                "time": "2026-03-29T10:00:00Z",
                "open": 2940.0,
                "high": 2960.5,
                "low": 2935.0,
                "close": 2954.1,
                "volume": 1250000
            }
        ],
        "patterns": []
    }

@app.post("/api/chat")
async def send_chat(request: dict):
    message = request.get("message")
    return {
        "id": "msg-1",
        "role": "assistant",
        "content": f"Response to: {message}",
        "model": "qwen3:8b"
    }

@app.websocket("/ws/market")
async def websocket_market(websocket: WebSocket):
    await websocket.accept()
    while True:
        await websocket.send_json({
            "signals": [],
            "pulse": {
                "tickers": [],
                "fiiNet": 0,
                "diiNet": 0,
                "indiaVix": 0
            },
            "latencyMs": 42
        })
```

### Node.js (Express)

```javascript
app.get('/api/signals', (req, res) => {
  res.json({ signals: [...] });
});

app.get('/api/chart/:symbol', (req, res) => {
  res.json({ candles: [...], patterns: [...] });
});

app.post('/api/chat', express.json(), (req, res) => {
  res.json({
    id: 'msg-1',
    role: 'assistant',
    content: `Response to: ${req.body.message}`,
    model: 'qwen3:8b'
  });
});

app.ws('/ws/market', (ws, req) => {
  setInterval(() => {
    ws.send(JSON.stringify({
      signals: [],
      pulse: { tickers: [], fiiNet: 0, diiNet: 0, indiaVix: 0 },
      latencyMs: 42
    }));
  }, 5000);
});
```

---

## 12. RUNNING THE FRONTEND

```bash
cd frontend

# Install dependencies
npm install

# Development
npm run dev          # Runs on http://localhost:3000

# Production build
npm run build
npm run start        # Runs on http://localhost:3000

# Type check
npx tsc --noEmit
```

---

## 13. DEBUGGING & MONITORING

### Browser Console (DevTools)

- **Zustand Store**: `window.__ZUSTAND_DEVTOOLS__` (if installed)
- **React Query**: Prefix logs with `[React Query]`
- **Network**: Check `Network` tab for API calls & WS connection

### Debug Flags

In browser console:
```javascript
// Check Zustand state
import { useMarketStore } from '@/lib/store/market-store';
useMarketStore.getState()

// Check connection
useMarketStore.getState().connectionStatus
```

---

## 14. COMMON INTEGRATION ISSUES

| Issue | Solution |
|-------|----------|
| CORS error | Add `Access-Control-Allow-Origin: *` in backend |
| WebSocket times out | Check firewall, ensure WS endpoint is exposed |
| Mock data showing | Set `NEXT_PUBLIC_USE_MOCK_DATA=false` |
| 404 on API calls | Verify `NEXT_PUBLIC_API_BASE` env var |
| Chat not streaming | Implement SSE or chunked response format |
| State not updating | Verify Zustand selector (avoid creating new objects/arrays inside) |

---

## 15. FILE SIZES & PRODUCTION NOTES

**First Load (JS)**:
- `/`: 87 kB
- `/chat`: 93 kB
- `/charts`: 128 kB
- `/radar`: 105 kB
- `/portfolio`: 89 kB

**Recommended Optimizations**:
- Code splitting by route (Next.js automatic)
- Image optimization via `next/image`
- WebSocket connection pooling
- Query cache invalidation strategy

---

## 16. CONTACT INTEGRATION CHECKLIST

- [ ] Backend serves `/api/signals` endpoint
- [ ] Backend serves `/api/chart/{symbol}` endpoint
- [ ] Backend serves `/api/chat` POST endpoint
- [ ] Backend serves `/api/portfolio` endpoint
- [ ] Backend serves `/api/market/pulse` endpoint
- [ ] WebSocket available at `/ws/market`
- [ ] CORS headers configured
- [ ] Environment variables set in frontend
- [ ] Mock data disabled (`NEXT_PUBLIC_USE_MOCK_DATA=false`)
- [ ] Frontend + backend both running locally
- [ ] WebSocket connection status shows "connected" in StatusBar
- [ ] Dashboard displays live signals
- [ ] Chat responds with AI responses
- [ ] Market pulse ticker updates in real-time

---

**Created**: March 29, 2026  
**Frontend Version**: 1.0.0 MVP  
**Status**: Ready for backend integration
