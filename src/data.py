import yfinance as yf
import pandas as pd


def fetch_prices(tickers: list[str], period: str = "1y") -> pd.DataFrame:
    """Return daily closing prices for all tickers as a DataFrame (dates x tickers)."""
    raw = yf.download(tickers, period=period, auto_adjust=True, progress=False)
    if isinstance(raw.columns, pd.MultiIndex):
        prices = raw["Close"]
    else:
        prices = raw[["Close"]].rename(columns={"Close": tickers[0]})
    prices = prices.dropna(how="all")
    # Forward-fill then drop any remaining NaNs (handles staggered listing dates)
    prices = prices.ffill().dropna()
    return prices
