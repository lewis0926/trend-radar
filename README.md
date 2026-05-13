# Trend Radar

Weekly email report identifying which industries are trending based on past price action across 14 sector ETFs.

## What it does

Each run fetches one year of daily prices via Yahoo Finance and emails a report containing:

- **Top trending industries** — ranked by composite momentum across 1W, 1M, and 3M returns
- **Notable movers** — sectors whose 1-week move is ≥2σ from their own 52-week distribution
- **Full sector performance table** — all tracked ETFs with returns across all periods

## Setup

**1. Create and activate a virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate
```

**2. Install dependencies**
```bash
pip install -r requirements.txt
```

**3. Add your Resend credentials to `config.json`**

Edit `config.json` and fill in your [Resend](https://resend.com) API key and sender address:
```json
{
  "resendApiKey": "re_xxxxxxxxxxxxxxxxxxxx",
  "fromEmail": "you@yourdomain.com"
}
```
`config.json` is gitignored so secrets stay local.

## Running

```bash
source venv/bin/activate
python run.py
```

## Configuration

Run the following command to generate `config.json` from the PKL source file:

```bash
pkl eval "config/dev.pkl" -f json -o "config.json"
```

The committed `config.json` is used directly by the app — regenerate it whenever you change the `.pkl` source.

### Tracked ETFs

| Ticker | Sector |
|--------|--------|
| XLK | Technology |
| XLV | Healthcare |
| XLF | Financials |
| XLE | Energy |
| XLY | Consumer Discretionary |
| XLP | Consumer Staples |
| XLI | Industrials |
| XLB | Materials |
| XLRE | Real Estate |
| XLU | Utilities |
| XLC | Communication Services |
| QQQ | Large-Cap Tech (Nasdaq-100) |
| IBB | Biotechnology |
| IYR | Real Estate (Broad) |

### Config options (`config.pkl`)

| Field | Default | Description |
|-------|---------|-------------|
| `lookbackPeriods` | `[5, 21, 63]` | Return periods in trading days (1W, 1M, 3M) |
| `notableMoverThreshold` | `2.0` | Z-score threshold to flag a notable mover |
| `topN` | `5` | Number of top sectors to highlight |
| `recipientEmail` | `lewishum96@gmail.com` | Report recipient |

## Project structure

```
trend-radar/
├── config.json              # App config (generated from config.pkl)
├── config/
│   ├── config.pkl           # Source of truth for all settings
│   └── generate_config.sh  # Regenerates config.json from .pkl
├── src/
│   ├── config.py            # Loads config.json into typed dataclasses
│   ├── data.py              # Fetches prices via yfinance
│   ├── analysis.py          # Calculates returns, momentum, notable movers
│   ├── email_builder.py     # Builds the HTML email
│   └── main.py              # Entry point — fetch, analyse, send
├── run.py                   # Top-level runner
├── requirements.txt
└── .env.example
```

## Tech stack

- **Python 3.10+**
- **yfinance** — market data from Yahoo Finance
- **Resend** — transactional email
- **Pkl** — typed configuration (generates `config.json`)
- **pandas / numpy** — data processing
