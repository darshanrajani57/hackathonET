# API Schema & Type Definitions

## Core Data Models (JSON/TypeScript)

### Signal
```json
{
  "id": "sig-uuid",
  "company": "RELIANCE",
  "symbol": "RELIANCE",
  "trend": "BULLISH|BEARISH|WATCH|NEUTRAL",
  "type": "INSIDER BUY|BULK DEAL|FILING ALERT|PATTERN|BREAKOUT|EARNINGS SURPRISE|NARRATIVE SHIFT",
  "reason": "Short 1-line summary",
  "fullReason": "Detailed explanation with context",
  "confidence": 75,
  "minutesAgo": 15
}
```

### MarketTickerItem
```json
{
  "id": "t-uuid",
  "name": "NIFTY 50",
  "price": 25432.15,
  "changePct": 1.23
}
```

### OhlcvCandle
```json
{
  "time": "2026-03-29T10:00:00Z",
  "open": 2940.0,
  "high": 2960.5,
  "low": 2935.0,
  "close": 2954.1,
  "volume": 1250000
}
```

### Pattern
```json
{
  "id": "pat-uuid",
  "symbol": "RELIANCE",
  "name": "Bull Flag|Cup & Handle|Ascending Triangle|Range Breakdown|H&S",
  "detectedAgo": "2 hours ago",
  "confidence": 78,
  "explanation": "Pattern formation description",
  "backtest": {
    "winRate": 0.72,
    "avgGainPct": 2.15,
    "instances": 50,
    "wins": 36,
    "losses": 14
  }
}
```

### ChatMessage
```json
{
  "id": "msg-uuid",
  "role": "user|assistant",
  "content": "Message text content",
  "model": "qwen3:8b",
  "thinking": "Optional: AI reasoning process",
  "toolCall": {
    "name": "get_market_pulse|search_filings|analyze_pattern",
    "input": { "key": "value" },
    "output": "Tool result string"
  },
  "citations": [
    {
      "label": "Source label",
      "href": "https://source-url.com"
    }
  ]
}
```

### PortfolioHolding
```json
{
  "symbol": "RELIANCE",
  "quantity": 18,
  "avgPrice": 2740.50,
  "ltp": 2954.10
}
```

### MarketPulse
```json
{
  "tickers": [
    { "id": "t1", "name": "NIFTY 50", "price": 25432.15, "changePct": 1.23 },
    { "id": "t2", "name": "SENSEX", "price": 83245.50, "changePct": 1.10 },
    { "id": "t3", "name": "BANK", "price": 45678.25, "changePct": -0.45 },
    { "id": "t4", "name": "IT", "price": 32145.60, "changePct": 2.10 },
    { "id": "t5", "name": "PHARMA", "price": 18234.50, "changePct": 0.25 }
  ],
  "fiiNet": 450000000,
  "diiNet": -120000000,
  "indiaVix": 18.25
}
```

---

## REST API Endpoints

### 1. GET /api/signals
**Description**: Fetch all active market signals  
**Query Params**: None  
**Response**: 
```json
{
  "signals": [Signal, ...]
}
```
**Status Codes**: 200 OK | 500 Server Error  
**Max Size**: 20-50 signals recommended  

---

### 2. GET /api/chart/{symbol}
**Description**: Fetch candlestick data + detected patterns for a symbol  
**Path Params**: 
- `symbol`: string (e.g., "RELIANCE", "TCS", "NIFTY50")

**Query Params** (optional):
- `interval`: "1m|5m|15m|1h|1d" (default: 15m)
- `count`: number (default: 100, max: 300)

**Response**:
```json
{
  "candles": [OhlcvCandle, ...],
  "patterns": [Pattern, ...]
}
```
**Status Codes**: 200 OK | 404 Not Found | 500 Server Error  

---

### 3. POST /api/chat
**Description**: Send message to AI, get response with reasoning + tool calls  
**Content-Type**: application/json  
**Request Body**:
```json
{
  "message": "What stocks should I watch today?",
  "threadId": "optional-thread-uuid",
  "portfolioContext": true
}
```

**Response**: ChatMessage  
**Status Codes**: 200 OK | 400 Bad Request | 500 Server Error  
**Notes**: Can implement streaming via SSE or chunked response  

---

### 4. GET /api/portfolio
**Description**: Fetch user's portfolio holdings  
**Query Params**: None  
**Response**:
```json
{
  "holdings": [PortfolioHolding, ...]
}
```
**Status Codes**: 200 OK | 401 Unauthorized | 500 Server Error  

---

### 5. GET /api/market/pulse
**Description**: Fetch market tickers + FII/DII flow + India VIX  
**Query Params**: None  
**Response**: MarketPulse  
**Status Codes**: 200 OK | 500 Server Error  
**Update Frequency**: Should return latest, call via WebSocket for real-time  

---

## WebSocket API

### Connection
```
ws://localhost:8000/ws/market
wss://api.example.com/ws/market (production)
```

### Message Format (Server → Client)
Sent periodically (e.g., every 5 seconds or on data change):

```json
{
  "signals": [Signal, ...],
  "pulse": MarketPulse,
  "latencyMs": 42,
  "timestamp": "2026-03-29T10:15:30Z"
}
```

### Connection Lifecycle
1. Client connects → WS opens
2. Server sends initial MarketPulse + Signals
3. Server sends updates on interval or on data change
4. On disconnect → Client auto-reconnects with exponential backoff
5. Max reconnect delay: 30 seconds

### Error Handling
```json
{
  "error": "Connection lost",
  "code": "WS_ERROR",
  "timestamp": "2026-03-29T10:15:30Z"
}
```

---

## Authentication (Future)

If adding auth later:

```typescript
// Header
Authorization: Bearer {jwt_token}

// Cookie
Set-Cookie: auth_token={value}; Secure; HttpOnly
```

---

## Rate Limiting (Recommended)

- **GET /api/signals**: 10 req/sec per IP
- **POST /api/chat**: 5 req/sec per user
- **WebSocket**: 1 connection per user

---

## CORS Configuration

Frontend expects:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error description"
  },
  "timestamp": "2026-03-29T10:15:30Z"
}
```

---

## Sample Backend Responses

### Signals Response
```json
{
  "signals": [
    {
      "id": "sig-001",
      "company": "TATA MOTORS",
      "symbol": "TATAMOTORS",
      "trend": "BULLISH",
      "type": "INSIDER BUY",
      "reason": "Insider transaction: 100K shares",
      "fullReason": "Promoter bought 100,000 shares at ₹750/share in bulk deal. First buy in 6 months indicates strong confidence in company turnaround.",
      "confidence": 82,
      "minutesAgo": 12
    },
    {
      "id": "sig-002",
      "company": "RELIANCE",
      "symbol": "RELIANCE",
      "trend": "BULLISH",
      "type": "PATTERN",
      "reason": "Bull flag pattern detected",
      "fullReason": "15-min bull flag on RELIANCE breaking out from consolidation. Previous 10 patterns had 72% win rate.",
      "confidence": 78,
      "minutesAgo": 8
    }
  ]
}
```

### Chart Response
```json
{
  "candles": [
    {
      "time": "2026-03-29T09:15:00Z",
      "open": 2935.00,
      "high": 2950.25,
      "low": 2930.50,
      "close": 2945.75,
      "volume": 1050000
    },
    {
      "time": "2026-03-29T09:30:00Z",
      "open": 2946.00,
      "high": 2960.50,
      "low": 2942.00,
      "close": 2954.10,
      "volume": 1250000
    }
  ],
  "patterns": [
    {
      "id": "pat-001",
      "symbol": "RELIANCE",
      "name": "Bull Flag",
      "detectedAgo": "2 hours ago",
      "confidence": 78,
      "explanation": "Consolidating after 2.5% move up. Expecting breakout within 4 hours.",
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
```

### Chat Response
```json
{
  "id": "msg-20260329-001",
  "role": "assistant",
  "content": "Based on the latest market data, I recommend focusing on IT and Pharma sectors. FII has net bought ₹450 Cr today, and there's a bull flag forming on RELIANCE.\n\nTop signals:\n1. TATAMOTORS - Insider buy (82% confidence)\n2. RELIANCE - Bull flag pattern (78% confidence)\n\nCurrently, India VIX is at 18.25, indicating moderate volatility.",
  "model": "qwen3:8b",
  "thinking": "Let me analyze the current market conditions:\n- FII net: +450 Cr (positive)\n- VIX: 18.25 (moderate)\n- IT sector: +2.1%\n- Check for recent patterns...",
  "toolCall": {
    "name": "get_market_pulse",
    "input": { "limit": 5 },
    "output": "[NIFTY +1.23%, SENSEX +1.10%, VIX 18.25]"
  },
  "citations": [
    {
      "label": "FII Flow Report",
      "href": "https://example.com/fii-report"
    }
  ]
}
```

### Market Pulse Response
```json
{
  "tickers": [
    { "id": "t1", "name": "NIFTY 50", "price": 25432.15, "changePct": 1.23 },
    { "id": "t2", "name": "SENSEX", "price": 83245.50, "changePct": 1.10 },
    { "id": "t3", "name": "BANK NIFTY", "price": 50234.30, "changePct": 0.85 },
    { "id": "t4", "name": "IT NIFTY", "price": 45678.20, "changePct": 2.10 },
    { "id": "t5", "name": "PHARMA NIFTY", "price": 18234.50, "changePct": 0.25 }
  ],
  "fiiNet": 450000000,
  "diiNet": -120000000,
  "indiaVix": 18.25
}
```

### Portfolio Response
```json
{
  "holdings": [
    {
      "symbol": "RELIANCE",
      "quantity": 18,
      "avgPrice": 2740.50,
      "ltp": 2954.10
    },
    {
      "symbol": "TCS",
      "quantity": 12,
      "avgPrice": 4095.30,
      "ltp": 3986.40
    },
    {
      "symbol": "HDFCBANK",
      "quantity": 30,
      "avgPrice": 1592.80,
      "ltp": 1642.80
    }
  ]
}
```

---

## Testing the API

### Using cURL
```bash
# Get signals
curl http://localhost:8000/api/signals

# Get chart
curl "http://localhost:8000/api/chart/RELIANCE"

# Send chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What should I buy?"}'

# Get portfolio
curl http://localhost:8000/api/portfolio

# Get market pulse
curl http://localhost:8000/api/market/pulse
```

### Using WebSocket (Node.js)
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/market');

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Update:', JSON.parse(event.data));
ws.onerror = (error) => console.error('Error:', error);
ws.onclose = () => console.log('Disconnected');
```

---

## Migration Notes

- Store `minutesAgo` as relative time; convert on frontend if needed
- Confidence is 0-100 (not decimal)
- All prices in INR for Indian market
- Timestamps in ISO 8601 format
- FII/DII flow in INR (use absolute values)
- Volume in shares traded
