# FintelOS Frontend

FintelOS is an AI-assisted interface for Indian investors, combining market pulse, opportunity radar, chart intelligence, chat-based reasoning, and portfolio context.

## Prerequisites

1. Node.js 18+
2. npm 9+
3. Optional for memory-enabled chat: Docker Desktop (for Redis)

## Quick Start (Mock Mode)

Use this mode for the fastest demo without a backend.

```bash
cd frontend
npm install
copy .env.example .env.local
```

Set in `.env.local`:

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

## Live Mode (Backend + WebSocket)

Use this when your backend is available on port `8000`.

Set in `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/market
```

Then run:

```bash
npm run dev
```

Expected backend endpoints:

1. `GET /api/signals`
2. `GET /api/chart/{symbol}`
3. `GET /api/market/pulse`
4. `POST /api/chat`
5. `GET /api/portfolio`
6. `WS /ws/market`

## Redis Setup (Optional: Chat Memory)

```bash
docker pull redis:7-alpine
docker rm -f fintel-redis
docker run -d --name fintel-redis -p 6379:6379 --restart unless-stopped redis:7-alpine
docker exec -it fintel-redis redis-cli ping
```

Set in `.env.local` (only if needed):

```env
REDIS_URL=redis://127.0.0.1:6379
REDIS_MEMORY_TTL_SECONDS=604800
REDIS_MEMORY_MAX_TURNS=40
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## Troubleshooting

1. `WS disconnected`:
- Ensure backend WebSocket is running at `ws://localhost:8000/ws/market`.
- For demo-only mode, set `NEXT_PUBLIC_USE_MOCK_DATA=true`.

2. Docker errors while running Redis:
- Start Docker Desktop and wait until engine is healthy.
- Verify with `docker version` and `docker info`.

3. API 404/500:
- Confirm `NEXT_PUBLIC_API_BASE_URL` points to the running backend.

## Submission Documents

See hackathon-ready artifacts in:

1. `../submission/PITCH_SCRIPT_3_MIN.md`
2. `../submission/DEMO_RUNBOOK.md`
3. `../submission/ARCHITECTURE_DOCUMENT.md`
4. `../submission/IMPACT_MODEL.md`
5. `../submission/SUBMISSION_CHECKLIST.md`
