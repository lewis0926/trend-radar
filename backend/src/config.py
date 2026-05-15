import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

CONFIG_PATH: Path = Path(__file__).parent.parent / "config.json"


@dataclass
class ETF:
    ticker: str
    name: str
    sector: str


@dataclass
class AppConfig:
    etfs: list[ETF]
    notable_mover_threshold: float

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
        raw: dict[str, Any] = json.load(f)
    return AppConfig(
        etfs=[ETF(**e) for e in raw["etfs"]],
        notable_mover_threshold=raw["notableMoverThreshold"],
    )
