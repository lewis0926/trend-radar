import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pct } from '../utils'
import SectionTitle from '../components/SectionTitle'
import PriceChart from '../components/PriceChart'
import './SectorDetail.css'

interface PricePoint {
  date: string
  value: number
}

interface SectorData {
  ticker: string
  name: string
  sector: string
  returns: { '5d': number; '21d': number; '63d': number }
  composite_score: number
  prices: PricePoint[]
}

export default function SectorDetail() {
  const { ticker } = useParams<{ ticker: string }>()
  const [data, setData] = useState<SectorData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return
    setData(null)
    setError(null)
    fetch(`/api/sector/${ticker}`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch(() => setError(`Could not load data for ${ticker}`))
  }, [ticker])

  if (error) return (
    <div className="sector-detail-error">
      <span style={{ color: 'var(--gray)' }}>ERR </span>{error}
    </div>
  )

  if (!data) return (
    <div className="sector-detail-loading">
      <div className="sector-detail-loading-dot" />
      Loading {ticker}...
    </div>
  )

  const score = Math.round(data.composite_score * 100)

  return (
    <div className="sector-detail">
      <Link to="/" className="sector-detail-back">← Dashboard</Link>

      <div className="sector-detail-hero">
        <div>
          <div className="sector-detail-title">{data.sector}</div>
          <div className="sector-detail-ticker">{data.ticker} — {data.name}</div>
          <div className="sector-detail-score" style={{ marginTop: 12 }}>
            <span className="sector-detail-score-label">Momentum</span>
            <div className="sector-detail-score-bar">
              <div className="sector-detail-score-fill" style={{ width: `${score}%` }} />
            </div>
            <span className="sector-detail-score-value">{score}</span>
          </div>
        </div>
        <div className="sector-detail-returns">
          {([['1W', data.returns['5d']], ['1M', data.returns['21d']], ['3M', data.returns['63d']]] as [string, number][]).map(([label, val]) => (
            <div key={label} className="sector-detail-stat">
              <span className="sector-detail-stat-label">{label}</span>
              <span className={`sector-detail-stat-value mono ${val >= 0 ? 'positive' : 'negative'}`}>
                {pct(val)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="sector-detail-chart-section">
        <SectionTitle>1-Year Price (Normalised to 100)</SectionTitle>
        <PriceChart prices={data.prices} />
      </div>
    </div>
  )
}
