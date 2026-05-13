import json
from dataclasses import dataclass
from pathlib import Path

CONFIG_PATH = Path(__file__).parent.parent / "config.json"


@dataclass
class ETF:
    ticker: str
    name: str
    sector: str


@dataclass
class AppConfig:
    etfs: list[ETF]
    lookback_periods: list[int]
    notable_mover_threshold: float
    recipient_email: str
    top_n: int
    resend_api_key: str
    from_email: str

    @property
    def tickers(self) -> list[str]:
        return [e.ticker for e in self.etfs]

    def sector_for(self, ticker: str) -> str:
        for e in self.etfs:
            if e.ticker == ticker:
                return e.sector
        return ticker

    def name_for(self, ticker: str) -> str:
        for e in self.etfs:
            if e.ticker == ticker:
                return e.name
        return ticker


def load_config(path: Path = CONFIG_PATH) -> AppConfig:
    with open(path) as f:
        raw = json.load(f)
    return AppConfig(
        etfs=[ETF(**e) for e in raw["etfs"]],
        lookback_periods=raw["lookbackPeriods"],
        notable_mover_threshold=raw["notableMoverThreshold"],
        recipient_email=raw["recipientEmail"],
        top_n=raw["topN"],
        resend_api_key=raw["resendApiKey"],
        from_email=raw["fromEmail"],
    )
