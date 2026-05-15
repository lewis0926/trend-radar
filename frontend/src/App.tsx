import { useEffect, useState } from 'react'
import type { Report } from './types'
import { useTheme } from './hooks/useTheme'
import Header from './components/Header'
import MarketOverview from './components/MarketOverview'
import SectorTable from './components/SectorTable'
import NotableMovers from './components/NotableMovers'

function Dashboard({ report, error }: { report: Report | null; error: string | null }) {
  if (error) return (
    <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
      <span style={{ color: 'var(--gray)' }}>ERR </span>{error}
    </div>
  )
  if (!report) return (
    <div style={{ color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 5, height: 5, background: 'var(--orange)', animation: 'pulse 1.2s infinite' }} />
      Fetching market data...
    </div>
  )
  const sorted = [...report.sectors].sort((a, b) => b.composite_score - a.composite_score)
  return (
    <>
      <MarketOverview indices={report.indices} commodities={report.commodities} />
      <NotableMovers movers={report.notable_movers} />
      <SectorTable title="Sectors" sectors={sorted} />
    </>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/report')
      .then(r => r.json())
      .then(setReport)
      .catch(() => setError('Failed to load data. Is the API server running?'))
  }, [])

  return (
    <div className="page">
      <Header asOf={report?.as_of ?? ''} theme={theme} onToggleTheme={toggle} />
      <Dashboard report={report} error={error} />
    </div>
  )
}
