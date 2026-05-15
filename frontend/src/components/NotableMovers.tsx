import type { NotableMover } from '../types'
import { pct } from '../utils'
import SectionTitle from './SectionTitle'
import './NotableMovers.css'

function MoverCard({ ticker, return_pct, z_score, direction }: NotableMover) {
  return (
    <div className={`mover-card mover-card--${direction}`}>
      <div className="mover-ticker mono">{ticker}</div>
      <div className={`mover-return mono tabular ${direction === 'up' ? 'positive' : 'negative'}`}>
        {pct(return_pct)}
      </div>
      <div className="mover-zscore mono">z = {z_score.toFixed(2)}</div>
    </div>
  )
}

interface Props {
  movers: NotableMover[]
}

export default function NotableMovers({ movers }: Props) {
  if (movers.length === 0) return null
  return (
    <section>
      <SectionTitle>Notable Movers</SectionTitle>
      <div className="movers-grid">
        {movers.map(m => <MoverCard key={m.ticker} {...m} />)}
      </div>
    </section>
  )
}
