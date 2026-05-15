import yfinance as yf
import pandas as pd


def fetch_prices(tickers: list[str], period: str = "1y") -> pd.DataFrame:
    raw: pd.DataFrame = yf.download(tickers, period=period, auto_adjust=True, progress=False)
    if isinstance(raw.columns, pd.MultiIndex):
        prices: pd.DataFrame = raw["Close"]
    else:
        prices = raw[["Close"]].rename(columns={"Close": tickers[0]})
    prices = prices.dropna(how="all")
    prices = prices.ffill().dropna()
    return prices
