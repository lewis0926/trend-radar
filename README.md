# Trend Radar

Real-time dashboard identifying which market sectors are trending based on price action across 12 sector ETFs.

## Features

- **Sector momentum** — all sectors ranked by composite score across 1W, 1M, and 3M returns; click any row to expand an inline candlestick chart with 20/50/200-day moving averages
- **Notable movers** — sectors whose 1-week move is ≥2σ from their own 52-week distribution
- **Market overview** — US indices (Nasdaq 100, S&P 500, Russell 2000), global indices (Hang Seng, Nikkei 225, Euro Stoxx 50), and commodities (WTI Crude, Gold, Natural Gas, Copper, Bitcoin)
- **Light / dark theme** — persisted in localStorage
- **Mobile-responsive** — sector table reflows to a 2-line layout on narrow screens; charts scroll horizontally

## Setup

**1. Backend**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

**2. Config**

Install the [Pkl CLI](https://pkl-lang.org/main/current/pkl-cli/index.html), then generate `config.json`:
```bash
cd backend && pkl eval "config/dev.pkl" -f json -o "config.json"
```
`backend/config.json` is gitignored — it must be present before starting the backend.

**3. Frontend**
```bash
cd frontend && bun install
```

## Running

```bash
# Backend API — http://localhost:8000
source venv/bin/activate
cd backend && uvicorn src.api:app --reload

# Frontend — http://localhost:5173
cd frontend && bun run dev
```

## Configuration

Edit `backend/config/schema/Config.pkl` (or the env-specific override `backend/config/dev.pkl`), then regenerate `config.json`.

| Field | Default | Description |
|---|---|---|
| `notableMoverThreshold` | `2.0` | Z-score threshold to flag a notable mover |

Market indices and commodities shown in the Market Overview are hardcoded in `backend/src/api.py` (`_INDICES`, `_COMMODITIES`).

### Adding a sector ETF
1. Add the entry to `backend/config/schema/Config.pkl`
2. Regenerate: `cd backend && pkl eval "config/dev.pkl" -f json -o "config.json"`

## Deployment

Each service has its own Dockerfile. Images are pushed to GitHub Container Registry via GitHub Actions on every push.

**Backend** — mounts `config.json` at runtime (it is not baked into the image):
```bash
docker build -t trend-radar-backend ./backend
docker run -p 8000:8000 -v /path/to/config.json:/app/config.json trend-radar-backend
```

**Frontend** — static build served by nginx; proxies `/api/` to the backend service named `backend`:
```bash
docker build -t trend-radar-frontend ./frontend
docker run -p 80:80 trend-radar-frontend
```

CI builds both images and pushes to `ghcr.io/<owner>/trend-radar-{backend|frontend}-<branch>:<sha>`. The `latest` tag is only updated on pushes to `main`.

## Project structure

```
trend-radar/
├── .github/
│   └── workflows/
│       └── build.yml          # builds & pushes both Docker images
├── backend/
│   ├── config/
│   │   ├── schema/Config.pkl  # typed config schema
│   │   └── dev.pkl            # dev environment overrides
│   ├── src/
│   │   ├── api.py             # FastAPI app, hardcoded indices & commodities
│   │   ├── analysis.py        # momentum scoring, notable movers
│   │   ├── config.py          # config dataclasses & loader
│   │   └── data.py            # yfinance price fetching
│   ├── config.json            # gitignored — generated from Pkl
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/        # Header, MarketOverview, SectorTable,
│   │   │                      #   CandlestickChart, NotableMovers, …
│   │   ├── hooks/useTheme.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── App.tsx
│   ├── nginx.conf             # production nginx config with API proxy
│   └── Dockerfile
└── venv/
```

## Tech stack

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| API | FastAPI + uvicorn |
| Market data | yfinance (Yahoo Finance) |
| Config | Pkl |
| Data processing | pandas, numpy |
| Frontend | Vite + React + TypeScript |
| Package manager | Bun |
| Container runtime | Docker (nginx for frontend, uvicorn for backend) |
| CI/CD | GitHub Actions → GitHub Container Registry |
