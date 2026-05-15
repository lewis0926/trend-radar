import { useEffect, useState } from 'react'
import type { Report, SectorItem } from './types'

const GREEN = '#22c55e'
const RED = '#ef4444'
const MUTED = '#6b7280'

function pct(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

function ReturnCell({ value }: { value: number }) {
  const color = value > 0 ? GREEN : value < 0 ? RED : MUTED
  return <td style={{ color, textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{pct(value)}</td>
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: '#2a2a2a', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${Math.round(score * 100)}%`, height: '100%', background: GREEN, borderRadius: 2 }} />
      </div>
      <span style={{ color: MUTED, fontSize: 12, width: 32, textAlign: 'right' }}>{Math.round(score * 100)}</span>
    </div>
  )
}

function IndexCard({ name, returns }: { name: string; returns: { '5d': number; '21d': number; '63d': number } }) {
  const color = returns['5d'] >= 0 ? GREEN : RED
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '16px 20px' }}>
      <div style={{ color: MUTED, fontSize: 12, marginBottom: 6 }}>{name}</div>
      <div style={{ color, fontSize: 22, fontWeight: 600, marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>{pct(returns['5d'])}</div>
      <div style={{ display: 'flex', gap: 16 }}>
        {([['1M', returns['21d']], ['3M', returns['63d']]] as [string, number][]).map(([label, val]) => (
          <div key={label}>
            <span style={{ color: MUTED, fontSize: 11 }}>{label} </span>
            <span style={{ color: val >= 0 ? GREEN : RED, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{pct(val)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/report')
      .then(r => r.json())
      .then(setReport)
      .catch(() => setError('Failed to load data. Is the API server running?'))
  }, [])

  if (error) return <div style={{ color: RED, padding: 40 }}>{error}</div>
  if (!report) return <div style={{ color: MUTED, padding: 40 }}>Loading...</div>

  const topSectors = [...report.sectors].sort((a, b) => b.composite_score - a.composite_score).slice(0, 5)
  const allSectors = [...report.sectors].sort((a, b) => b.composite_score - a.composite_score)

  const header: React.CSSProperties = { color: MUTED, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #2a2a2a' }
  const headerRight: React.CSSProperties = { ...header, textAlign: 'right' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Trend Radar</div>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Sector momentum dashboard</div>
        </div>
        <div style={{ color: MUTED, fontSize: 12 }}>As of {report.as_of}</div>
      </div>

      {/* Market Overview */}
      <section>
        <SectionTitle>Market Overview</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
          {report.indices.map(idx => <IndexCard key={idx.ticker} name={idx.name} returns={idx.returns} />)}
        </div>
      </section>

      {/* Top Trending */}
      <section>
        <SectionTitle>Top Trending Sectors</SectionTitle>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={header}>Sector</th>
                <th style={headerRight}>1W</th>
                <th style={headerRight}>1M</th>
                <th style={headerRight}>3M</th>
                <th style={{ ...header, textAlign: 'left', minWidth: 120 }}>Momentum Score</th>
              </tr>
            </thead>
            <tbody>
              {topSectors.map((s, i) => <SectorRow key={s.ticker} sector={s} rank={i + 1} />)}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notable Movers */}
      {report.notable_movers.length > 0 && (
        <section>
          <SectionTitle>Notable Movers</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {report.notable_movers.map(m => (
              <div key={m.ticker} style={{ background: '#1a1a1a', border: `1px solid ${m.direction === 'up' ? '#166534' : '#7f1d1d'}`, borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontWeight: 600 }}>{m.ticker}</div>
                <div style={{ color: m.direction === 'up' ? GREEN : RED, fontSize: 13, marginTop: 2 }}>
                  {pct(m.return_pct)} <span style={{ color: MUTED, fontSize: 11 }}>z={m.z_score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Table */}
      <section>
        <SectionTitle>All Sectors</SectionTitle>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={header}>Sector</th>
                <th style={headerRight}>1W</th>
                <th style={headerRight}>1M</th>
                <th style={headerRight}>3M</th>
                <th style={{ ...header, textAlign: 'left', minWidth: 120 }}>Momentum Score</th>
              </tr>
            </thead>
            <tbody>
              {allSectors.map((s, i) => <SectorRow key={s.ticker} sector={s} rank={i + 1} />)}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 13, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{children}</h2>
}

function SectorRow({ sector, rank }: { sector: SectorItem; rank: number }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <tr style={{ borderTop: '1px solid #2a2a2a' }}>
      <td style={{ padding: '10px 12px' }}>
        <span style={{ marginRight: 8 }}>{medals[rank - 1] ?? ''}</span>
        <span style={{ fontWeight: 500 }}>{sector.sector}</span>
        <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 8 }}>{sector.ticker}</span>
      </td>
      <ReturnCell value={sector.returns['5d']} />
      <ReturnCell value={sector.returns['21d']} />
      <ReturnCell value={sector.returns['63d']} />
      <td style={{ padding: '10px 12px', minWidth: 120 }}>
        <ScoreBar score={sector.composite_score} />
      </td>
    </tr>
  )
}
