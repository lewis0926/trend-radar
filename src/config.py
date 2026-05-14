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
class Index:
    ticker: str
    name: str


@dataclass
class AppConfig:
    etfs: list[ETF]
    indices: list[Index]
    lookback_periods: list[int]
    notable_mover_threshold: float
    recipient_email: str
    top_n: int
    resend_api_key: str
    from_email: str

    @property
    def tickers(self) -> list[str]:
        return [e.ticker for e in self.etfs]

    @property
    def index_tickers(self) -> list[str]:
        return [i.ticker for i in self.indices]

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

    def index_name_for(self, ticker: str) -> str:
        for i in self.indices:
            if i.ticker == ticker:
                return i.name
        return ticker


def load_config(path: Path = CONFIG_PATH) -> AppConfig:
    with open(path) as f:
        raw = json.load(f)
    return AppConfig(
        etfs=[ETF(**e) for e in raw["etfs"]],
        indices=[Index(**i) for i in raw["indices"]],
        lookback_periods=raw["lookbackPeriods"],
        notable_mover_threshold=raw["notableMoverThreshold"],
        recipient_email=raw["recipientEmail"],
        top_n=raw["topN"],
        resend_api_key=raw["resendApiKey"],
        from_email=raw["fromEmail"],
    )
