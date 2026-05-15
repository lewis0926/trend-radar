import type { SectorItem } from '../types'
import { pct } from '../utils'
import SectionTitle from './SectionTitle'
import Tooltip from './Tooltip'
import './SectorTable.css'

const MOMENTUM_TOOLTIP = 'Average percentile rank across 1W, 1M, and 3M returns. A score of 100 means this sector ranked highest across all three timeframes.'

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

function ReturnCell({ value }: { value: number }) {
  const cls = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
  return (
    <td className={`return-cell mono tabular ${cls}`}>{pct(value)}</td>
  )
}

function SectorRow({ sector, rank }: { sector: SectorItem; rank: number }) {
  return (
    <tr className="sector-row">
      <td>
        <div className="sector-row-name">
          <span className={`sector-rank mono ${rank <= 3 ? 'sector-rank--top' : ''}`}>
            {String(rank).padStart(2, '0')}
          </span>
          <span className="sector-name">{sector.sector}</span>
          <span className="sector-ticker mono">{sector.ticker}</span>
        </div>
      </td>
      <ReturnCell value={sector.returns['5d']} />
      <ReturnCell value={sector.returns['21d']} />
      <ReturnCell value={sector.returns['63d']} />
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
            {sectors.map((s, i) => <SectorRow key={s.ticker} sector={s} rank={i + 1} />)}
          </tbody>
        </table>
      </div>
    </section>
  )
}
