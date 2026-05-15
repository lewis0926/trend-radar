import './PriceChart.css'

interface PricePoint {
  date: string
  value: number
}

interface Props {
  prices: PricePoint[]
}

export default function PriceChart({ prices }: Props) {
  if (prices.length < 2) return null

  const W = 800
  const H = 200
  const PAD = { top: 16, right: 8, bottom: 4, left: 48 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const values = prices.map(p => p.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const valRange = maxVal - minVal || 1

  const xScale = (i: number) => PAD.left + (i / (prices.length - 1)) * innerW
  const yScale = (v: number) => PAD.top + innerH - ((v - minVal) / valRange) * innerH

  const linePath = prices
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(p.value).toFixed(1)}`)
    .join(' ')

  const areaPath = [
    `M${xScale(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)}`,
    linePath.replace(/^M/, 'L'),
    `L${xScale(prices.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)}`,
    'Z',
  ].join(' ')

  const baseline100Y = yScale(100)
  const show100Line = baseline100Y >= PAD.top && baseline100Y <= PAD.top + innerH

  const yTicks = 4
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    minVal + (valRange / yTicks) * i
  )

  const labelIndices = [0, Math.floor(prices.length / 2), prices.length - 1]

  return (
    <div className="price-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* Y-axis grid + labels */}
        {yTickValues.map((v, i) => {
          const y = yScale(v)
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="var(--border)" strokeWidth="1" />
              <text x={PAD.left - 6} y={y} textAnchor="end" dominantBaseline="middle"
                className="price-chart-axis-label">{v.toFixed(0)}</text>
            </g>
          )
        })}

        {/* Baseline at 100 */}
        {show100Line && (
          <line x1={PAD.left} y1={baseline100Y} x2={W - PAD.right} y2={baseline100Y}
            className="price-chart-baseline" />
        )}

        {/* Area fill */}
        <path d={areaPath} className="price-chart-area" />

        {/* Price line */}
        <path d={linePath} className="price-chart-line" />
      </svg>

      <div className="price-chart-labels">
        {labelIndices.map(i => (
          <span key={i} className="price-chart-date">{prices[i].date}</span>
        ))}
      </div>
    </div>
  )
}
