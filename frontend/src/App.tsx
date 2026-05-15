import { useEffect, useState } from 'react'
import type { Report } from './types'
import Header from './components/Header'
import MarketOverview from './components/MarketOverview'
import SectorTable from './components/SectorTable'
import NotableMovers from './components/NotableMovers'

export default function App() {
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/report')
      .then(r => r.json())
      .then(setReport)
      .catch(() => setError('Failed to load data. Is the API server running?'))
  }, [])

  if (error) return (
    <div style={{ color: 'var(--red)', padding: 40, fontFamily: 'var(--font-mono)' }}>
      <span style={{ color: 'var(--gray)' }}>ERR </span>{error}
    </div>
  )

  if (!report) return (
    <div style={{ color: 'var(--gray)', padding: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 5, height: 5, background: 'var(--orange)', animation: 'pulse 1.2s infinite' }} />
      Fetching market data...
    </div>
  )

  const sorted = [...report.sectors].sort((a, b) => b.composite_score - a.composite_score)

  return (
    <div className="page">
      <Header asOf={report.as_of} />
      <MarketOverview indices={report.indices} />
      <SectorTable title="Top Trending Sectors" sectors={sorted.slice(0, 5)} />
      <NotableMovers movers={report.notable_movers} />
      <SectorTable title="All Sectors" sectors={sorted} />
    </div>
  )
}
