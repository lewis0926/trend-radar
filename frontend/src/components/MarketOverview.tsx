import { useEffect, useState } from 'react'
import type { CandleData, CommodityItem, IndexItem } from '../types'
import { pct } from '../utils'
import SectionTitle from './SectionTitle'
import CandlestickChart from './CandlestickChart'
import './MarketOverview.css'

type ChartState = CandleData[] | 'loading' | 'error'

interface CardProps {
  ticker: string
  name: string
  returns: { '5d': number; '21d': number; '63d': number }
  onClick: () => void
}

function MarketCard({ name, returns, onClick }: CardProps) {
  const isUp = returns['5d'] >= 0
  return (
    <div className={`index-card ${isUp ? 'index-card--up' : 'index-card--down'}`} onClick={onClick}>
      <div className="index-card-name">{name}</div>
      <div className="index-card-main">
        <span className="index-card-stat-label">1W</span>
        <div className={`index-card-value mono tabular ${isUp ? 'positive' : 'negative'}`}>
          {pct(returns['5d'])}
        </div>
      </div>
      <div className="index-card-stats">
        {([['1M', returns['21d']], ['3M', returns['63d']]] as [string, number][]).map(([label, val]) => (
          <div key={label} className="index-card-stat">
            <span className="index-card-stat-label">{label}</span>
            <span className={`index-card-stat-value mono tabular ${val >= 0 ? 'positive' : 'negative'}`}>
              {pct(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  indices: IndexItem[]
  commodities: CommodityItem[]
}

export default function MarketOverview({ indices, commodities }: Props) {
  const us      = indices.filter(i => i.region === 'us')
  const global_ = indices.filter(i => i.region === 'global')

  const [modal, setModal] = useState<{ ticker: string; name: string } | null>(null)
  const [chartCache, setChartCache] = useState<Record<string, ChartState>>({})

  function openChart(ticker: string, name: string) {
    setModal({ ticker, name })
    if (chartCache[ticker]) return
    setChartCache(c => ({ ...c, [ticker]: 'loading' }))
    fetch(`/api/chart/${encodeURIComponent(ticker)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setChartCache(c => ({ ...c, [ticker]: data.candles })))
      .catch(() => setChartCache(c => ({ ...c, [ticker]: 'error' })))
  }

  useEffect(() => {
    if (!modal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal])

  const chart = modal ? chartCache[modal.ticker] : null

  return (
    <section>
      <SectionTitle>Market Overview</SectionTitle>
      <div className="market-groups">
        <div className="market-group">
          <div className="market-group-label">US</div>
          <div className="market-grid">
            {us.map(idx => <MarketCard key={idx.ticker} ticker={idx.ticker} name={idx.name} returns={idx.returns} onClick={() => openChart(idx.ticker, idx.name)} />)}
          </div>
        </div>
        <div className="market-group">
          <div className="market-group-label">Global</div>
          <div className="market-grid">
            {global_.map(idx => <MarketCard key={idx.ticker} ticker={idx.ticker} name={idx.name} returns={idx.returns} onClick={() => openChart(idx.ticker, idx.name)} />)}
          </div>
        </div>
        <div className="market-group">
          <div className="market-group-label">Commodities</div>
          <div className="market-grid">
            {commodities.map(c => <MarketCard key={c.ticker} ticker={c.ticker} name={c.name} returns={c.returns} onClick={() => openChart(c.ticker, c.name)} />)}
          </div>
        </div>
      </div>

      {modal && (
        <div className="chart-modal-overlay" onClick={() => setModal(null)}>
          <div className="chart-modal" onClick={e => e.stopPropagation()}>
            <div className="chart-modal-header">
              <span className="chart-modal-title">{modal.name}</span>
              <button className="chart-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            {chart === 'loading' && (
              <div className="chart-modal-loading">
                <div className="chart-modal-dot" />
                Loading {modal.ticker}...
              </div>
            )}
            {chart === 'error' && (
              <div className="chart-modal-error">
                <span className="chart-modal-err-prefix">ERR </span>Failed to load chart data
              </div>
            )}
            {Array.isArray(chart) && <CandlestickChart candles={chart} ticker={modal.ticker} />}
          </div>
        </div>
      )}
    </section>
  )
}
