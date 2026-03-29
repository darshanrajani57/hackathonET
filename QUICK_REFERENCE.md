# Quick Reference - File Locations & Component Imports

## 📁 Project Root Structure

```
hackathone_ET/
├── frontend/                          # React/Next.js app
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.local                     # Create this with your env vars
├── FRONTEND_STRUCTURE.md              # Complete UI documentation
├── API_SCHEMA.md                      # API specifications
└── QUICK_REFERENCE.md                 # This file
```

---

## 🔧 Key File Paths

### Type Definitions
- **Location**: `src/lib/types.ts`
- **Exports**: Signal, Pattern, ChatMessage, MarketPulse, OhlcvCandle, etc.
- **Usage**: Import these for backend response validation

```typescript
import { Signal, Pattern, ChatMessage } from '@/lib/types';
```

### API Layer
- **Location**: `src/lib/api.ts`
- **Functions**: 
  - `getSignals()` 
  - `getChart(symbol)` 
  - `sendChat(message)` 
  - `getPortfolio()` 
  - `getMarketPulse()`
- **Mock Fallback**: Enabled by default

```typescript
import { getSignals, getChart, sendChat } from '@/lib/api';
```

### State Management
- **Location**: `src/lib/store/market-store.ts`
- **Store**: `useMarketStore`
- **Updates via**: WebSocket → `updateFromSocket(payload)`

```typescript
import { useMarketStore } from '@/lib/store/market-store';

// In components (client-side):
const signals = useMarketStore((state) => state.signals);
const pulse = useMarketStore((state) => state.pulse);
const status = useMarketStore((state) => state.connectionStatus);
```

### WebSocket Client
- **Location**: `src/lib/websocket.ts`
- **Function**: `connectMarketWebSocket()`
- **Endpoint**: `ws://localhost:8000/ws/market`
- **Auto-reconnect**: Yes, with exponential backoff

```typescript
import { connectMarketWebSocket } from '@/lib/websocket';
```

### Global Styles
- **Location**: `src/app/globals.css`
- **Theme**: Dark terminal aesthetic
- **CSS Variables**: `--bg-base`, `--accent-green`, `--accent-red`, etc.

---

## 🖼️ Page Components

### Dashboard (/)
- **File**: `src/app/page.tsx`
- **Sub-components**: 
  - `MarketPulse` → `src/components/dashboard/MarketPulse.tsx`
  - `SignalFeed` → `src/components/dashboard/SignalFeed.tsx`
  - `QuickStats` → `src/components/dashboard/QuickStats.tsx`
  - `HeatMap` → `src/components/dashboard/HeatMap.tsx`

### Charts (/charts)
- **File**: `src/app/charts/page.tsx`
- **Sub-components**:
  - `CandleChart` → `src/components/charts/CandleChart.tsx`
  - `PatternCard` → `src/components/charts/PatternCard.tsx`
  - `PatternOverlay` → `src/components/charts/PatternOverlay.tsx`

### Radar (/radar)
- **File**: `src/app/radar/page.tsx`
- **Sub-components**:
  - `SignalCard` → `src/components/radar/SignalCard.tsx`
  - `FilingAlert` → `src/components/radar/FilingAlert.tsx`
  - `InsiderTradeRow` → `src/components/radar/InsiderTradeRow.tsx`

### Chat (/chat)
- **File**: `src/app/chat/page.tsx`
- **Sub-components**:
  - `ChatInterface` → `src/components/chat/ChatInterface.tsx`
  - `ThinkingStream` → `src/components/chat/ThinkingStream.tsx`
  - `MessageBubble` → `src/components/chat/MessageBubble.tsx`
  - `ToolCallVisualization` → `src/components/chat/ToolCallVisualization.tsx`
  - `InlineSparkline` → `src/components/chat/InlineSparkline.tsx`

### Portfolio (/portfolio)
- **File**: `src/app/portfolio/page.tsx`
- **Sub-components**:
  - `PortfolioTable` → `src/components/portfolio/PortfolioTable.tsx`

### Video (/video)
- **File**: `src/app/video/page.tsx`
- **Note**: Placeholder for video integration

---

## 🎨 Shared Components

### Layout Components
```
src/components/layout/
├── AppProviders.tsx     # QueryClient + WebSocket setup
├── Sidebar.tsx          # Navigation (hover-expand)
├── TopBar.tsx           # Header with time + market status
└── StatusBar.tsx        # Footer with connection status
```

### UI Primitives
```
src/components/shared/
├── NeonButton.tsx       # Button with neon glow effects
├── AnimatedNumber.tsx   # Number transitions (framer-motion)
├── SignalBadge.tsx      # BULLISH/BEARISH badge
├── LivePriceBadge.tsx   # Price + % change
├── SkeletonLoader.tsx   # Shimmer placeholder
└── DataTable.tsx        # Generic sortable table

src/components/ui/
├── tooltip.tsx          # Radix tooltip primitive
└── select.tsx           # Radix select primitive
```

---

## 📦 Dependencies to Know

```json
{
  "react": "^18.3.1",
  "next": "14.2.5",
  "zustand": "5.0.12",          // State management
  "@tanstack/react-query": "^5.95.2",  // Data fetching
  "framer-motion": "12.38.0",   // Animations
  "lightweight-charts": "5.1.0", // Charting
  "lucide-react": "1.7.0",      // Icons
  "@radix-ui/react-tooltip": "^1.106.1",
  "@radix-ui/react-select": "^2.159.1"
}
```

---

## 🔌 Environment Variables (.env.local)

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE=http://localhost:8000

# Mock data flag (set to false when backend ready)
NEXT_PUBLIC_USE_MOCK_DATA=true

# WebSocket URL (optional, auto-derived from API_BASE + /ws/market)
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/market
```

---

## 🚀 Running the App

```bash
# Install & setup
cd frontend
npm install

# Development (with hot reload)
npm run dev
# Opens http://localhost:3000

# Production build
npm run build
npm run start

# Type checking
npx tsc --noEmit

# Clean build
rm -rf .next
npm run build
```

---

## 📡 Backend Integration Checklist

### API Endpoints Required

```
GET  /api/signals              ✓ Returns Signal[]
GET  /api/chart/{symbol}       ✓ Returns { candles: OhlcvCandle[], patterns: Pattern[] }
POST /api/chat                 ✓ Returns ChatMessage
GET  /api/portfolio            ✓ Returns PortfolioHolding[]
GET  /api/market/pulse         ✓ Returns MarketPulse
WS   /ws/market                ✓ Streams {signals, pulse, latencyMs}
```

### Configuration
```
CORS Enabled                   ✓ Allow http://localhost:3000
Request Timeout                ✓ ~30 seconds
WebSocket Timeout              ✓ ~60 seconds
Rate Limiting                  ✓ Optional but recommended
```

### Data Validation
```
All timestamps ISO 8601        ✓ "2026-03-29T10:15:30Z"
Confidence 0-100               ✓ Not decimal
Prices in INR                  ✓ Indian market
FII/DII in INR (absolute)      ✓ Can be negative
Volume in shares               ✓ Integer
```

---

## 🔗 Component Import Examples

### Using Store in Components
```typescript
'use client';

import { useMarketStore } from '@/lib/store/market-store';

export function MyComponent() {
  const signals = useMarketStore((state) => state.signals);
  const pulse = useMarketStore((state) => state.pulse);
  const status = useMarketStore((state) => state.connectionStatus);
  
  return (
    <div>
      {signals.map(sig => <SignalCard key={sig.id} {...sig} />)}
    </div>
  );
}
```

### Using Shared Components
```typescript
import { NeonButton } from '@/components/shared/NeonButton';
import { SignalBadge } from '@/components/shared/SignalBadge';
import { DataTable } from '@/components/shared/DataTable';

export function MyPage() {
  return (
    <div>
      <NeonButton variant="primary">Send</NeonButton>
      <SignalBadge trend="BULLISH" label="BULLISH" />
      <DataTable columns={...} data={...} />
    </div>
  );
}
```

### Using API Functions
```typescript
import { getSignals, getChart, sendChat } from '@/lib/api';

// In a component or server action
const signals = await getSignals();
const chartData = await getChart('RELIANCE');
const response = await sendChat('What stocks to buy?');
```

### Using Utilities
```typescript
import { formatINR, formatPct, relativeTime } from '@/lib/utils';

const price = formatINR(2954.10);           // ₹2,954.10
const change = formatPct(1.23);             // +1.23%
const time = relativeTime(15);              // 15 min ago
```

---

## 🎯 Common Tasks

### Display Real-time Signals
```typescript
export function SignalList() {
  const signals = useMarketStore((state) => state.signals);
  
  return (
    <div>
      {signals.map(signal => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}
```

### Show Market Status
```typescript
export function StatusIndicator() {
  const status = useMarketStore((state) => state.connectionStatus);
  
  return (
    <div className={status === 'connected' ? 'bg-green-500' : 'bg-red-500'}>
      {status === 'connected' ? '🟢 Live' : '🔴 Offline'}
    </div>
  );
}
```

### Fetch & Display Chart
```typescript
export async function ChartView({ symbol }) {
  const { candles, patterns } = await getChart(symbol);
  
  return (
    <div>
      <CandleChart candles={candles} />
      {patterns.map(p => <PatternCard key={p.id} pattern={p} />)}
    </div>
  );
}
```

### Send & Receive Chat
```typescript
async function handleSendMessage(message: string) {
  const response = await sendChat(message);
  // response.content has the AI response
  // response.thinking has the reasoning
  // response.toolCall has any tool executions
}
```

---

## 🐛 Debugging Tips

### Check Zustand State
```javascript
// In browser console
import { useMarketStore } from '@/lib/store/market-store';
const store = useMarketStore.getState();
console.log(store); // See all state
console.log(store.connectionStatus); // Check connection
```

### Monitor Network Requests
- Open DevTools (F12)
- Go to Network tab
- Look for API calls to `http://localhost:8000`
- Check WebSocket in Network tab for `ws://localhost:8000/ws/market`

### View Component Structure
- Install React DevTools browser extension
- Open DevTools → Components tab
- Inspect component tree
- Check props and hooks state in real-time

---

## 📝 File Naming Convention

- **Pages**: `page.tsx` (Next.js convention)
- **Components**: `ComponentName.tsx` (PascalCase)
- **Utilities**: `function-name.ts` (camelCase)
- **Types**: `types.ts` or `interface.ts`
- **Store**: `store-name.ts` (kebab-case)

---

## 🔐 Security Notes

- Mock data has placeholder credentials (demo only)
- No sensitive data in frontend code
- API calls use `cache: 'no-store'` to prevent caching
- WebSocket auto-reconnects safely
- All user input in chat is sent to backend

---

## 📊 Performance Metrics

Target First Load JS sizes:
- Dashboard: 87 kB
- Chat: 93 kB
- Charts: 128 kB
- Radar: 105 kB
- Portfolio: 89 kB

---

## 🤝 Support Resources

- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/

---

**Last Updated**: March 29, 2026  
**Frontend Version**: 1.0.0 MVP  
**Ready for**: Backend integration & deployment
