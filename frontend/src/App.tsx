import { useEffect, useState } from 'react'
import type { Report, SectorItem } from './types'
import RadarIcon from './components/RadarIcon'

const CYAN  = '#06b6d4'
const GREEN = '#22c55e'
const RED   = '#ef4444'
const MUTED = '#4b6070'
const CARD  = '#0d1520'
const BORDER = '#1a2535'

function pct(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

function ReturnCell({ value }: { value: number }) {
  const color = value > 0 ? GREEN : value < 0 ? RED : MUTED
  return (
    <td style={{ color, textAlign: 'right', padding: '11px 14px', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {pct(value)}
    </td>
  )
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 3, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${Math.round(score * 100)}%`, height: '100%', background: CYAN, borderRadius: 2, boxShadow: `0 0 6px ${CYAN}88` }} />
      </div>
      <span style={{ color: CYAN, fontSize: 11, width: 28, textAlign: 'right', fontFamily: 'monospace' }}>{Math.round(score * 100)}</span>
    </div>
  )
}

function IndexCard({ name, returns }: { name: string; returns: { '5d': number; '21d': number; '63d': number } }) {
  const isUp = returns['5d'] >= 0
  const color = isUp ? GREEN : RED
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderTop: `2px solid ${isUp ? GREEN : RED}`, borderRadius: 6, padding: '14px 16px' }}>
      <div style={{ color: '#8ba0b4', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{name}</div>
      <div style={{ color, fontSize: 20, fontWeight: 700, marginBottom: 10, fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>{pct(returns['5d'])}</div>
      <div style={{ display: 'flex', gap: 14 }}>
        {([['1M', returns['21d']], ['3M', returns['63d']]] as [string, number][]).map(([label, val]) => (
          <div key={label} style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
            <span style={{ color: MUTED, fontSize: 10, textTransform: 'uppercase' }}>{label}</span>
            <span style={{ color: val >= 0 ? GREEN : RED, fontSize: 12, fontFamily: 'monospace' }}>{pct(val)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 3, height: 14, background: CYAN, borderRadius: 2, boxShadow: `0 0 8px ${CYAN}` }} />
      <h2 style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{children}</h2>
    </div>
  )
}

function SectorRow({ sector, rank }: { sector: SectorItem; rank: number }) {
  const medals = ['01', '02', '03']
  const rankLabel = medals[rank - 1] ?? String(rank).padStart(2, '0')
  const isTop3 = rank <= 3
  return (
    <tr style={{ borderTop: `1px solid ${BORDER}` }}>
      <td style={{ padding: '11px 14px' }}>
        <span style={{ color: isTop3 ? CYAN : MUTED, fontSize: 11, fontFamily: 'monospace', marginRight: 12 }}>{rankLabel}</span>
        <span style={{ fontWeight: 500, color: '#c9d4e0' }}>{sector.sector}</span>
        <span style={{ color: MUTED, fontSize: 11, marginLeft: 8, fontFamily: 'monospace' }}>{sector.ticker}</span>
      </td>
      <ReturnCell value={sector.returns['5d']} />
      <ReturnCell value={sector.returns['21d']} />
      <ReturnCell value={sector.returns['63d']} />
      <td style={{ padding: '11px 14px', minWidth: 140 }}>
        <ScoreBar score={sector.composite_score} />
      </td>
    </tr>
  )
}

const thStyle: React.CSSProperties = {
  color: MUTED, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
  padding: '10px 14px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`,
  fontFamily: 'monospace', fontWeight: 500,
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

  if (error) return (
    <div style={{ color: RED, padding: 40, fontFamily: 'monospace' }}>
      <span style={{ color: MUTED }}>ERR </span>{error}
    </div>
  )

  if (!report) return (
    <div style={{ color: MUTED, padding: 40, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: CYAN, animation: 'pulse 1.2s infinite' }} />
      Fetching market data...
    </div>
  )

  const topSectors = [...report.sectors].sort((a, b) => b.composite_score - a.composite_score).slice(0, 5)
  const allSectors = [...report.sectors].sort((a, b) => b.composite_score - a.composite_score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RadarIcon />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'monospace', color: '#e8f0f8' }}>
              TREND<span style={{ color: CYAN }}>RADAR</span>
            </div>
            <div style={{ color: MUTED, fontSize: 11, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              Sector Momentum
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
            <span style={{ color: GREEN, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.08em' }}>LIVE</span>
          </div>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: 'monospace', marginTop: 4 }}>{report.as_of}</div>
        </div>
      </header>

      {/* Market Overview */}
      <section>
        <SectionTitle>Market Overview</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))', gap: 10 }}>
          {report.indices.map(idx => <IndexCard key={idx.ticker} name={idx.name} returns={idx.returns} />)}
        </div>
      </section>

      {/* Top Trending */}
      <section>
        <SectionTitle>Top Trending Sectors</SectionTitle>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Sector</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>1W</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>1M</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>3M</th>
                <th style={{ ...thStyle, minWidth: 140 }}>Momentum</th>
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
              <div key={m.ticker} style={{
                background: CARD,
                border: `1px solid ${m.direction === 'up' ? '#16432a' : '#431616'}`,
                borderLeft: `3px solid ${m.direction === 'up' ? GREEN : RED}`,
                borderRadius: 6, padding: '12px 16px', minWidth: 130,
              }}>
                <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{m.ticker}</div>
                <div style={{ color: m.direction === 'up' ? GREEN : RED, fontSize: 13, marginTop: 4, fontFamily: 'monospace' }}>
                  {pct(m.return_pct)}
                </div>
                <div style={{ color: MUTED, fontSize: 10, marginTop: 2, fontFamily: 'monospace' }}>z = {m.z_score.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Sectors */}
      <section>
        <SectionTitle>All Sectors</SectionTitle>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Sector</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>1W</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>1M</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>3M</th>
                <th style={{ ...thStyle, minWidth: 140 }}>Momentum</th>
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
