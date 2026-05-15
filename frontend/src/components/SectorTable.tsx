import { Fragment, useState } from 'react'
import type { SectorItem, CandleData } from '../types'
import { pct } from '../utils'
import SectionTitle from './SectionTitle'
import Tooltip from './Tooltip'
import CandlestickChart from './CandlestickChart'
import './SectorTable.css'

const MOMENTUM_TOOLTIP = 'Average percentile rank across 1W, 1M, and 3M returns. A score of 100 means this sector ranked highest across all three timeframes.'

type ChartState = CandleData[] | 'loading' | 'error'

function ScoreBar({ score }: { score: number }) {
  const val = Math.round(score * 100)
  return (
    <div className="score-bar">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${val}%` }} />
      </div>
      <span className="score-bar-value mono">{val}</span>
    </div>
  )
}

function ReturnCell({ value, label }: { value: number; label: string }) {
  const cls = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
  return <td className={`return-cell mono tabular ${cls}`} data-label={label}>{pct(value)}</td>
}

interface RowProps {
  sector: SectorItem
  rank: number
  expanded: boolean
  onToggle: () => void
}

function SectorRow({ sector, rank, expanded, onToggle }: RowProps) {
  return (
    <tr className={`sector-row ${expanded ? 'sector-row--expanded' : ''}`} onClick={onToggle}>
      <td>
        <div className="sector-row-name">
          <span className={`sector-rank mono ${rank <= 3 ? 'sector-rank--top' : ''}`}>
            {String(rank).padStart(2, '0')}
          </span>
          <span className="sector-name">{sector.sector}</span>
          <span className="sector-ticker mono">{sector.ticker}</span>
          <span className={`sector-chevron ${expanded ? 'sector-chevron--open' : ''}`}>›</span>
        </div>
      </td>
      <ReturnCell value={sector.returns['5d']}  label="1W" />
      <ReturnCell value={sector.returns['21d']} label="1M" />
      <ReturnCell value={sector.returns['63d']} label="3M" />
      <td className="score-bar-cell">
        <ScoreBar score={sector.composite_score} />
      </td>
    </tr>
  )
}

interface Props {
  title: string
  sectors: SectorItem[]
}

export default function SectorTable({ title, sectors }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [chartCache, setChartCache] = useState<Record<string, ChartState>>({})

  function toggle(ticker: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(ticker) ? next.delete(ticker) : next.add(ticker)
      return next
    })
    if (chartCache[ticker]) return
    setChartCache(c => ({ ...c, [ticker]: 'loading' }))
    fetch(`/api/sector/${ticker}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setChartCache(c => ({ ...c, [ticker]: data.candles })))
      .catch(() => setChartCache(c => ({ ...c, [ticker]: 'error' })))
  }

  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="sector-table-wrapper">
        <table className="sector-table">
          <thead>
            <tr>
              <th>Sector</th>
              <th className="align-right">1W</th>
              <th className="align-right">1M</th>
              <th className="align-right">3M</th>
              <th className="col-momentum">
                Momentum <Tooltip content={MOMENTUM_TOOLTIP} />
              </th>
            </tr>
          </thead>
          <tbody>
            {sectors.map((s, i) => (
              <Fragment key={s.ticker}>
                <SectorRow
                  sector={s}
                  rank={i + 1}
                  expanded={expanded.has(s.ticker)}
                  onToggle={() => toggle(s.ticker)}
                />
                {expanded.has(s.ticker) && (
                  <tr className="sector-expand-row">
                    <td colSpan={5} className="sector-expand-cell">
                      {chartCache[s.ticker] === 'loading' && (
                        <div className="sector-expand-loading">
                          <div className="sector-expand-dot" />
                          Loading {s.ticker}...
                        </div>
                      )}
                      {chartCache[s.ticker] === 'error' && (
                        <div className="sector-expand-error">
                          <span style={{ color: 'var(--gray)' }}>ERR </span>Failed to load chart data
                        </div>
                      )}
                      {Array.isArray(chartCache[s.ticker]) && (
                        <CandlestickChart candles={chartCache[s.ticker] as CandleData[]} />
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
