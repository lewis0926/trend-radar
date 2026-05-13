import sys
from datetime import date

import resend

from .config import load_config
from .data import fetch_prices
from .analysis import calculate_returns, get_notable_movers
from .email_builder import build_email


def run() -> None:
    config = load_config()

    if config.resend_api_key.startswith("re_xxx"):
        print("Error: set resendApiKey in config.json before running.")
        sys.exit(1)

    resend.api_key = config.resend_api_key

    print(f"Fetching prices for {len(config.tickers)} tickers…")
    prices = fetch_prices(config.tickers)
    print(f"Fetched {len(prices)} trading days of data.")

    returns_df = calculate_returns(prices, config.lookback_periods)
    notable_movers = get_notable_movers(prices, threshold=config.notable_mover_threshold)

    subject, html = build_email(
        returns_df=returns_df,
        notable_movers=notable_movers,
        config=config,
        as_of=date.today(),
    )

    print(f"Sending report to {config.recipient_email}…")
    params: resend.Emails.SendParams = {
        "from": config.from_email,
        "to": [config.recipient_email],
        "subject": subject,
        "html": html,
    }
    response = resend.Emails.send(params)
    print(f"Sent! Email ID: {response['id']}")


if __name__ == "__main__":
    run()
