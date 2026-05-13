from datetime import date
import pandas as pd

from .config import AppConfig


def _pct(val: float) -> str:
    sign = "+" if val >= 0 else ""
    return f"{sign}{val:.2f}%"


def _color(val: float) -> str:
    return "#16a34a" if val >= 0 else "#dc2626"


def _medal(rank: int) -> str:
    return {1: "🥇", 2: "🥈", 3: "🥉"}.get(rank, f"{rank}.")


def build_email(
    returns_df: pd.DataFrame,
    notable_movers: list[dict],
    config: AppConfig,
    as_of: date | None = None,
) -> tuple[str, str]:
    """Return (subject, html_body) for the weekly trend radar email."""
    as_of = as_of or date.today()
    week_str = as_of.strftime("%B %d, %Y")

    periods = config.lookback_periods  # e.g. [5, 21, 63]
    period_labels = {5: "1W", 21: "1M", 63: "3M"}

    # ── Top trending sectors ──────────────────────────────────────────────────
    top_rows = ""
    for rank, (ticker, row) in enumerate(returns_df.head(config.top_n).iterrows(), 1):
        r1w = row.get("return_5d", float("nan"))
        r1m = row.get("return_21d", float("nan"))
        r3m = row.get("return_63d", float("nan"))
        sector = config.sector_for(ticker)
        name = config.name_for(ticker)
        top_rows += f"""
        <tr>
          <td style="padding:10px 12px;font-size:18px">{_medal(rank)}</td>
          <td style="padding:10px 12px">
            <strong style="font-size:15px">{sector}</strong><br>
            <span style="color:#6b7280;font-size:12px">{ticker} · {name}</span>
          </td>
          <td style="padding:10px 12px;text-align:right;font-weight:bold;color:{_color(r1w)}">{_pct(r1w)}</td>
          <td style="padding:10px 12px;text-align:right;color:{_color(r1m)}">{_pct(r1m)}</td>
          <td style="padding:10px 12px;text-align:right;color:{_color(r3m)}">{_pct(r3m)}</td>
        </tr>"""

    # ── Notable movers ────────────────────────────────────────────────────────
    if notable_movers:
        mover_rows = ""
        for m in notable_movers:
            ticker = m["ticker"]
            arrow = "▲" if m["direction"] == "up" else "▼"
            clr = _color(m["return_pct"])
            mover_rows += f"""
        <tr>
          <td style="padding:8px 12px;font-weight:bold">{ticker}</td>
          <td style="padding:8px 12px">{config.sector_for(ticker)}</td>
          <td style="padding:8px 12px;text-align:right;color:{clr};font-weight:bold">{arrow} {_pct(m['return_pct'])}</td>
          <td style="padding:8px 12px;text-align:right;color:#6b7280">{m['z_score']:+.1f}σ</td>
        </tr>"""
        notable_section = f"""
      <h2 style="font-size:16px;font-weight:700;color:#111827;margin:32px 0 8px">⚡ Notable Movers</h2>
      <p style="color:#6b7280;font-size:13px;margin:0 0 12px">Sectors with unusually large 1-week moves relative to their own history.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
        <thead>
          <tr style="background:#f9fafb;color:#6b7280;font-size:12px;text-transform:uppercase">
            <th style="padding:8px 12px;text-align:left">Ticker</th>
            <th style="padding:8px 12px;text-align:left">Sector</th>
            <th style="padding:8px 12px;text-align:right">1W Return</th>
            <th style="padding:8px 12px;text-align:right">Z-Score</th>
          </tr>
        </thead>
        <tbody>{mover_rows}
        </tbody>
      </table>"""
    else:
        notable_section = """
      <h2 style="font-size:16px;font-weight:700;color:#111827;margin:32px 0 8px">⚡ Notable Movers</h2>
      <p style="color:#6b7280;font-size:13px">No sectors with unusual moves this week.</p>"""

    # ── Full sector table ─────────────────────────────────────────────────────
    all_rows = ""
    for i, (ticker, row) in enumerate(returns_df.iterrows()):
        bg = "#f9fafb" if i % 2 == 0 else "#ffffff"
        cols = ""
        for n in periods:
            val = row.get(f"return_{n}d", float("nan"))
            cols += f'<td style="padding:8px 12px;text-align:right;color:{_color(val)}">{_pct(val)}</td>'
        all_rows += f"""
        <tr style="background:{bg}">
          <td style="padding:8px 12px;font-weight:bold">{ticker}</td>
          <td style="padding:8px 12px;color:#374151">{config.sector_for(ticker)}</td>
          {cols}
        </tr>"""

    period_headers = "".join(
        f'<th style="padding:8px 12px;text-align:right">{period_labels.get(n, f"{n}d")}</th>'
        for n in periods
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px 32px">
          <p style="margin:0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Weekly Report</p>
          <h1 style="margin:4px 0 0;color:#f8fafc;font-size:26px;font-weight:800">📡 Trend Radar</h1>
          <p style="margin:6px 0 0;color:#64748b;font-size:13px">Week of {week_str}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:28px 32px">

          <!-- Top trending -->
          <h2 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px">🏆 Top Trending Industries</h2>
          <p style="color:#6b7280;font-size:13px;margin:0 0 12px">Ranked by composite momentum across 1W, 1M, and 3M returns.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
            <thead>
              <tr style="background:#f9fafb;color:#6b7280;font-size:12px;text-transform:uppercase">
                <th style="padding:8px 12px;text-align:left" colspan="2">Sector</th>
                <th style="padding:8px 12px;text-align:right">1W</th>
                <th style="padding:8px 12px;text-align:right">1M</th>
                <th style="padding:8px 12px;text-align:right">3M</th>
              </tr>
            </thead>
            <tbody>{top_rows}
            </tbody>
          </table>

          {notable_section}

          <!-- Full table -->
          <h2 style="font-size:16px;font-weight:700;color:#111827;margin:32px 0 8px">📊 Full Sector Performance</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
            <thead>
              <tr style="background:#f9fafb;color:#6b7280;font-size:12px;text-transform:uppercase">
                <th style="padding:8px 12px;text-align:left">Ticker</th>
                <th style="padding:8px 12px;text-align:left">Sector</th>
                {period_headers}
              </tr>
            </thead>
            <tbody>{all_rows}
            </tbody>
          </table>

          <!-- Footer -->
          <p style="color:#9ca3af;font-size:11px;margin:28px 0 0;text-align:center">
            Data sourced from Yahoo Finance via yfinance. Returns are price-based and do not include dividends.<br>
            This is not financial advice.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    subject = f"📡 Trend Radar — {week_str}"
    return subject, html
