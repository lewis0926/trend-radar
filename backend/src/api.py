from datetime import date, datetime, timedelta
from typing import Any, Callable

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import AppConfig, load_config
from .data import fetch_prices
from .analysis import calculate_returns, get_notable_movers

app = FastAPI(title="Trend Radar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_PERIODS: list[int] = [5, 21, 63]

_INDICES: list[dict[str, str]] = [
    {"ticker": "^NDX",      "name": "NASDAQ 100",    "region": "us"},
    {"ticker": "^GSPC",     "name": "S&P 500",       "region": "us"},
    {"ticker": "^RUT",      "name": "Russell 2000",  "region": "us"},
    {"ticker": "^HSI",      "name": "Hang Seng",     "region": "global"},
    {"ticker": "^N225",     "name": "Nikkei 225",    "region": "global"},
    {"ticker": "^STOXX50E", "name": "Euro Stoxx 50", "region": "global"},
]

_COMMODITIES: list[dict[str, str]] = [
    {"ticker": "CL=F",    "name": "WTI Crude Oil"},
    {"ticker": "GC=F",    "name": "Gold"},
    {"ticker": "NG=F",    "name": "Natural Gas"},
    {"ticker": "HG=F",    "name": "Copper"},
    {"ticker": "BTC-USD", "name": "Bitcoin"},
]

_cache: dict[str, dict[str, Any]] = {}
_CACHE_TTL: timedelta = timedelta(hours=1)


def _stale(key: str) -> bool:
    if key not in _cache:
        return True
    return datetime.utcnow() - _cache[key]["ts"] > _CACHE_TTL


def _build_report() -> None:
    config: AppConfig = load_config()
    index_tickers: list[str] = [i["ticker"] for i in _INDICES]
    index_name: dict[str, str] = {i["ticker"]: i["name"] for i in _INDICES}
    index_region: dict[str, str] = {i["ticker"]: i["region"] for i in _INDICES}
    commodity_tickers: list[str] = [c["ticker"] for c in _COMMODITIES]
    commodity_name: dict[str, str] = {c["ticker"]: c["name"] for c in _COMMODITIES}

    etf_prices: pd.DataFrame = fetch_prices(config.tickers)
    index_prices: pd.DataFrame = fetch_prices(index_tickers)
    commodity_prices: pd.DataFrame = fetch_prices(commodity_tickers)

    returns_df: pd.DataFrame = calculate_returns(etf_prices, _PERIODS)
    index_returns_df: pd.DataFrame = calculate_returns(index_prices, _PERIODS).reindex(index_tickers)
    commodity_returns_df: pd.DataFrame = calculate_returns(commodity_prices, _PERIODS).reindex(commodity_tickers)
    notable_movers: list[dict[str, Any]] = get_notable_movers(etf_prices, threshold=config.notable_mover_threshold)

    def to_list(
        df: pd.DataFrame,
        name_fn: Callable[[str], str],
        extra: Callable[[str, pd.Series], dict[str, Any]] | None = None,
    ) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for ticker, row in df.iterrows():
            item: dict[str, Any] = {
                "ticker": ticker,
                "name": name_fn(ticker),
                "returns": {f"{n}d": round(row.get(f"return_{n}d", 0.0), 2) for n in _PERIODS},
            }
            if extra:
                item.update(extra(ticker, row))
            rows.append(item)
        return rows

    data: dict[str, Any] = {
        "as_of": date.today().isoformat(),
        "indices": to_list(
            index_returns_df,
            lambda t: index_name[t],
            lambda t, _: {"region": index_region[t]},
        ),
        "commodities": to_list(
            commodity_returns_df,
            lambda t: commodity_name[t],
        ),
        "sectors": to_list(
            returns_df,
            config.name_for,
            lambda t, r: {
                "sector": config.sector_for(t),
                "composite_score": round(float(r.get("composite_score", 0.0)), 4),
            },
        ),
        "notable_movers": notable_movers,
    }

    _cache["report"] = {"data": data, "ts": datetime.utcnow(), "etf_prices": etf_prices, "config": config}


@app.get("/api/report")
def get_report() -> dict[str, Any]:
    if _stale("report"):
        _build_report()
    return _cache["report"]["data"]


@app.get("/api/sector/{ticker}")
def get_sector(ticker: str) -> dict[str, Any]:
    if _stale("report"):
        _build_report()

    config: AppConfig = _cache["report"]["config"]
    etf_prices: pd.DataFrame = _cache["report"]["etf_prices"]

    if ticker not in etf_prices.columns:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found")

    report_sectors: list[dict[str, Any]] = _cache["report"]["data"]["sectors"]
    sector_meta: dict[str, Any] = next((s for s in report_sectors if s["ticker"] == ticker), {})

    series: pd.Series = etf_prices[ticker].dropna()
    normalised: pd.Series = (series / series.iloc[0] * 100).round(2)
    prices: list[dict[str, Any]] = [
        {"date": str(idx.date()), "value": float(val)}
        for idx, val in normalised.items()
    ]

    return {
        "ticker": ticker,
        "name": config.name_for(ticker),
        "sector": config.sector_for(ticker),
        "returns": sector_meta.get("returns", {}),
        "composite_score": sector_meta.get("composite_score", 0.0),
        "prices": prices,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
