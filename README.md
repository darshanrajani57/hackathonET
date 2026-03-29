# FintelOS - AI for the Indian Investor

FintelOS is a hackathon prototype that helps retail investors convert fragmented market data into explainable, action-oriented decisions.

## What It Includes

1. Dashboard for market pulse and signal feed.
2. Opportunity Radar for ranked actionable signals.
3. Chart Intelligence with pattern overlays and backtest context.
4. Market Chat with reasoning/tool-call style responses.
5. Portfolio view for position-aware interpretation.

## Repository Structure

1. `frontend/` - Next.js + TypeScript application.
2. `API_SCHEMA.md` - API contracts.
3. `FRONTEND_STRUCTURE.md` - architecture and component structure.
4. `QUICK_REFERENCE.md` - fast navigation and setup notes.
5. `submission/` - pitch script, demo runbook, architecture, impact model.

## Setup Instructions

### A) Quick Demo (No backend required)

```bash
cd frontend
npm install
copy .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/market
```

Run:

```bash
npm run dev
```

Open: http://localhost:3000

### B) Live Mode (Backend + WebSocket)

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/market
```

Start your backend on port `8000`, then run:

```bash
cd frontend
npm run dev
```

### C) Optional Redis (for memory-enabled chat)

```bash
docker pull redis:7-alpine
docker rm -f fintel-redis
docker run -d --name fintel-redis -p 6379:6379 --restart unless-stopped redis:7-alpine
docker exec -it fintel-redis redis-cli ping
```

Expected output: `PONG`

## Submission Artifacts

1. `submission/PITCH_SCRIPT_3_MIN.md`
2. `submission/DEMO_RUNBOOK.md`
3. `submission/ARCHITECTURE_DOCUMENT.md`
4. `submission/IMPACT_MODEL.md`
5. `submission/SUBMISSION_CHECKLIST.md`

## Suggested Commit Trail (for judges)

1. `feat: scaffold frontend and layout shell`
2. `feat: add dashboard and radar modules`
3. `feat: add chart intelligence and pattern cards`
4. `feat: add chat interface and tool visualization`
5. `feat: add portfolio workflow`
6. `feat: websocket state and data source modes`
7. `fix: improve mock/live status handling`
8. `docs: add architecture, pitch script, and impact model`
