from typing import Any

import numpy as np
import pandas as pd


def calculate_returns(prices: pd.DataFrame, periods: list[int]) -> pd.DataFrame:
    records: dict[str, dict[str, float]] = {}
    for ticker in prices.columns:
        s: pd.Series = prices[ticker].dropna()
        row: dict[str, float] = {}
        for n in periods:
            if len(s) > n:
                row[f"return_{n}d"] = (s.iloc[-1] / s.iloc[-(n + 1)] - 1) * 100
            else:
                row[f"return_{n}d"] = np.nan
        records[ticker] = row

    df: pd.DataFrame = pd.DataFrame.from_dict(records, orient="index")
    return_cols: list[str] = [f"return_{n}d" for n in periods]

    ranks: pd.DataFrame = df[return_cols].rank(pct=True)
    df["composite_score"] = ranks.mean(axis=1)
    df = df.sort_values("composite_score", ascending=False)
    return df


def get_notable_movers(
    prices: pd.DataFrame, threshold: float, period: int = 5
) -> list[dict[str, Any]]:
    movers: list[dict[str, Any]] = []
    for ticker in prices.columns:
        s: pd.Series = prices[ticker].dropna()
        if len(s) < 52:
            continue

        rolling_returns: pd.Series = s.pct_change(period).dropna() * 100
        if len(rolling_returns) < 2:
            continue

        recent: float = rolling_returns.iloc[-1]
        mean: float = rolling_returns[:-1].mean()
        std: float = rolling_returns[:-1].std()
        if std == 0:
            continue

        z: float = (recent - mean) / std
        if abs(z) >= threshold:
            movers.append(
                {
                    "ticker": ticker,
                    "return_pct": round(recent, 2),
                    "z_score": round(z, 2),
                    "direction": "up" if recent > 0 else "down",
                }
            )

    movers.sort(key=lambda x: abs(x["z_score"]), reverse=True)
    return movers
