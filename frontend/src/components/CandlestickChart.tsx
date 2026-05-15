import { useState, useRef } from 'react'
import type { CandleData } from '../types'
import './CandlestickChart.css'

const MA_CONFIG = [
  { key: 'ma20' as const,  label: '20 MA',  color: '#c084fc', width: 1   },
  { key: 'ma50' as const,  label: '50 MA',  color: '#38bdf8', width: 1   },
  { key: 'ma200' as const, label: '200 MA', color: '#ff8c00', width: 1.5 },
]

const PERIOD_MARKS = [
  { label: '3M', offset: 63 },
  { label: '1M', offset: 21 },
  { label: '1W', offset: 5  },
]

interface Props {
  candles: CandleData[]
}

export default function CandlestickChart({ candles }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>({ ma20: true, ma50: true, ma200: true })
  const [hovered, setHovered] = useState<{ idx: number; x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (candles.length < 2) return null

  const W = 900
  const H = 210
  const PAD = { top: 22, right: 62, bottom: 0, left: 4 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const n = candles.length
  const slotW = innerW / n
  const bodyW = Math.max(1, slotW * 0.65)

  // Include visible MA values in the price range so lines never clip outside the chart
  const maValues = candles.flatMap(c =>
    ([c.ma20, c.ma50, c.ma200] as (number | null)[]).filter((v): v is number => v !== null)
  )
  const allPrices = [...candles.flatMap(c => [c.high, c.low]), ...maValues]
  const rawMin = Math.min(...allPrices)
  const rawMax = Math.max(...allPrices)
  const rawRange = rawMax - rawMin || 1
  const minP = rawMin - rawRange * 0.04
  const maxP = rawMax + rawRange * 0.04
  const priceRange = maxP - minP

  const xMid = (i: number) => PAD.left + (i + 0.5) * slotW
  const yScale = (v: number) => PAD.top + innerH - ((v - minP) / priceRange) * innerH
  const fmtPrice = (v: number) => v >= 100 ? v.toFixed(0) : v.toFixed(2)

  function maPath(key: 'ma20' | 'ma50' | 'ma200'): string {
    const parts: string[] = []
    let penDown = false
    candles.forEach((c, i) => {
      const v = c[key]
      if (v === null) { penDown = false; return }
      parts.push(`${penDown ? 'L' : 'M'}${xMid(i).toFixed(1)},${yScale(v).toFixed(1)}`)
      penDown = true
    })
    return parts.join(' ')
  }

  function handleMouseMove(e: React.MouseEvent<SVGRectElement>) {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    const idx = Math.max(0, Math.min(n - 1, Math.round((svgX - PAD.left) / slotW - 0.5)))
    setHovered({ idx, x: e.clientX, y: e.clientY })
  }

  const N_TICKS = 5
  const tickValues = Array.from({ length: N_TICKS }, (_, i) =>
    minP + (priceRange / (N_TICKS - 1)) * i
  )
  const dateIndices = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor(n * 3 / 4), n - 1]
  const hc = hovered !== null ? candles[hovered.idx] : null

  return (
    <div className="candlestick-chart">
      <div className="candlestick-controls">
        {MA_CONFIG.map(({ key, label, color }) => (
          <button
            key={key}
            className={`ma-toggle ${visible[key] ? 'ma-toggle--active' : ''}`}
            style={{ '--ma-color': color } as React.CSSProperties}
            onClick={e => { e.stopPropagation(); setVisible(p => ({ ...p, [key]: !p[key] })) }}
          >
            <span className="ma-toggle-dot" />
            {label}
          </button>
        ))}
      </div>

      {/* Scroll wrapper keeps the chart at full fidelity on narrow screens */}
      <div className="candlestick-scroll">
        <svg
          ref={svgRef}
          className="candlestick-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHovered(null)}
        >
          {/* Grid + price labels */}
          {tickValues.map((v, i) => (
            <g key={i}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yScale(v)} y2={yScale(v)} className="candlestick-grid" />
              <text x={W - PAD.right + 5} y={yScale(v)} className="candlestick-label" dominantBaseline="middle" textAnchor="start">
                {fmtPrice(v)}
              </text>
            </g>
          ))}

          {/* Period markers */}
          {PERIOD_MARKS.map(({ label, offset }) => {
            const idx = n - offset
            if (idx < 0 || idx >= n) return null
            const x = xMid(idx)
            return (
              <g key={label}>
                <line x1={x} x2={x} y1={PAD.top} y2={PAD.top + innerH} className="candlestick-period-line" />
                <text x={x} y={PAD.top - 6} textAnchor="middle" className="candlestick-period-label">{label}</text>
              </g>
            )
          })}

          {/* Candles */}
          {candles.map((c, i) => {
            const x = xMid(i)
            const isUp = c.close >= c.open
            const bodyTop = yScale(Math.max(c.open, c.close))
            const bodyBot = yScale(Math.min(c.open, c.close))
            const color = isUp ? 'var(--green)' : 'var(--red)'
            return (
              <g key={c.date}>
                <line x1={x} x2={x} y1={yScale(c.high)} y2={yScale(c.low)} stroke={color} strokeWidth="0.8" />
                <rect x={x - bodyW / 2} y={bodyTop} width={bodyW} height={Math.max(1, bodyBot - bodyTop)} fill={color} />
              </g>
            )
          })}

          {/* MA lines */}
          {MA_CONFIG.map(({ key, color, width }) =>
            visible[key] ? (
              <path key={key} d={maPath(key)} stroke={color} strokeWidth={width} fill="none" strokeLinejoin="round" />
            ) : null
          )}

          {/* Hover crosshair */}
          {hovered !== null && (
            <line
              x1={xMid(hovered.idx)} x2={xMid(hovered.idx)}
              y1={PAD.top} y2={PAD.top + innerH}
              className="candlestick-crosshair"
              pointerEvents="none"
            />
          )}

          {/* Mouse capture overlay — last so it's on top */}
          <rect
            x={PAD.left} y={PAD.top} width={innerW} height={innerH}
            fill="transparent"
            onMouseMove={handleMouseMove}
          />
        </svg>

        <div className="candlestick-dates">
          {dateIndices.map(i => (
            <span key={i} className="candlestick-date">{candles[i]?.date}</span>
          ))}
        </div>
      </div>

      {hc && hovered && (
        <div className="candlestick-tooltip" style={{ left: hovered.x + 14, top: hovered.y - 72 }}>
          <div className="candlestick-tooltip-date">{hc.date}</div>
          <div className="candlestick-tooltip-grid">
            <span className="candlestick-tooltip-key">O</span><span className="candlestick-tooltip-val">{hc.open.toFixed(2)}</span>
            <span className="candlestick-tooltip-key">H</span><span className="candlestick-tooltip-val">{hc.high.toFixed(2)}</span>
            <span className="candlestick-tooltip-key">L</span><span className="candlestick-tooltip-val">{hc.low.toFixed(2)}</span>
            <span className="candlestick-tooltip-key">C</span>
            <span className={`candlestick-tooltip-val ${hc.close >= hc.open ? 'positive' : 'negative'}`}>{hc.close.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
