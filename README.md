# Trend Radar

Real-time dashboard identifying which industries are trending based on past price action across 14 sector ETFs.

## What it does

- **Top trending sectors** — ranked by composite momentum across 1W, 1M, and 3M returns
- **Notable movers** — sectors whose 1-week move is ≥2σ from their own 52-week distribution
- **Market overview** — major indices (S&P 500, Nasdaq, Russell 2000, Nikkei, Hang Seng, Euro Stoxx)

## Setup

**1. Backend**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

**2. Config**
```bash
cd backend && pkl eval "config/dev.pkl" -f json -o "config.json"
```
`backend/config.json` is gitignored.

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

| Field | Default | Description |
|-------|---------|-------------|
| `lookbackPeriods` | `[5, 21, 63]` | Return periods in trading days (1W, 1M, 3M) |
| `notableMoverThreshold` | `2.0` | Z-score threshold to flag a notable mover |
| `topN` | `5` | Number of top sectors to highlight |

### Adding a new ETF
1. Add the entry to `backend/config/schema/Config.pkl`
2. Regenerate: `cd backend && pkl eval "config/dev.pkl" -f json -o "config.json"`

## Deployment

Build and deploy as a Docker container:
```bash
docker build -t trend-radar ./backend
```

## Project structure

```
trend-radar/
├── backend/
│   ├── config.json          # gitignored
│   ├── config/
│   │   ├── schema/Config.pkl
│   │   └── dev.pkl
│   ├── src/
│   │   ├── config.py
│   │   ├── data.py
│   │   ├── analysis.py
│   │   └── api.py
│   └── requirements.txt
├── frontend/                # Vite + React + TypeScript
├── venv/
└── README.md
```

## Tech stack

- **Python 3.10+** — backend
- **FastAPI + uvicorn** — API server
- **yfinance** — market data from Yahoo Finance
- **Pkl** — typed configuration
- **pandas / numpy** — data processing
- **Vite + React + TypeScript** — frontend dashboard
- **Bun** — frontend package manager
