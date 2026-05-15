from datetime import date, datetime, timedelta
from typing import Any, Callable

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import load_config, AppConfig
from .data import fetch_prices
from .analysis import calculate_returns, get_notable_movers

app = FastAPI(title="Trend Radar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_cache: dict[str, dict[str, Any]] = {}
_CACHE_TTL: timedelta = timedelta(hours=1)


def _stale(key: str) -> bool:
    if key not in _cache:
        return True
    return datetime.utcnow() - _cache[key]["ts"] > _CACHE_TTL


@app.get("/api/report")
def get_report() -> dict[str, Any]:
    if not _stale("report"):
        return _cache["report"]["data"]

    config: AppConfig = load_config()
    etf_prices: pd.DataFrame = fetch_prices(config.tickers)
    index_prices: pd.DataFrame = fetch_prices(config.index_tickers)

    returns_df: pd.DataFrame = calculate_returns(etf_prices, config.lookback_periods)
    index_returns_df: pd.DataFrame = calculate_returns(index_prices, config.lookback_periods)
    notable_movers: list[dict[str, Any]] = get_notable_movers(etf_prices, threshold=config.notable_mover_threshold)

    periods: list[int] = config.lookback_periods

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
                "returns": {f"{n}d": round(row.get(f"return_{n}d", 0.0), 2) for n in periods},
            }
            if extra:
                item.update(extra(ticker, row))
            rows.append(item)
        return rows

    data: dict[str, Any] = {
        "as_of": date.today().isoformat(),
        "indices": to_list(index_returns_df, config.index_name_for),
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

    _cache["report"] = {"data": data, "ts": datetime.utcnow()}
    return data


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
