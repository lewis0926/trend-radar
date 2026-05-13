import numpy as np
import pandas as pd


def calculate_returns(prices: pd.DataFrame, periods: list[int]) -> pd.DataFrame:
    """
    Return a DataFrame indexed by ticker with columns: return_Nd for each period,
    plus a composite_score column (average percentile rank across periods).
    """
    records = {}
    for ticker in prices.columns:
        s = prices[ticker].dropna()
        row: dict[str, float] = {}
        for n in periods:
            if len(s) > n:
                row[f"return_{n}d"] = (s.iloc[-1] / s.iloc[-(n + 1)] - 1) * 100
            else:
                row[f"return_{n}d"] = np.nan
        records[ticker] = row

    df = pd.DataFrame.from_dict(records, orient="index")
    return_cols = [f"return_{n}d" for n in periods]

    # Composite score: average percentile rank across all periods (higher = more momentum)
    ranks = df[return_cols].rank(pct=True)
    df["composite_score"] = ranks.mean(axis=1)
    df = df.sort_values("composite_score", ascending=False)
    return df


def get_notable_movers(
    prices: pd.DataFrame, threshold: float, period: int = 5
) -> list[dict]:
    """
    Find tickers whose most-recent `period`-day return is more than `threshold`
    standard deviations from their own rolling distribution over the past year.
    """
    movers = []
    for ticker in prices.columns:
        s = prices[ticker].dropna()
        if len(s) < 52:  # need at least a year of data
            continue

        # Rolling period-day returns over the full history
        rolling_returns = s.pct_change(period).dropna() * 100
        if len(rolling_returns) < 2:
            continue

        recent = rolling_returns.iloc[-1]
        mean = rolling_returns[:-1].mean()
        std = rolling_returns[:-1].std()
        if std == 0:
            continue

        z = (recent - mean) / std
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
