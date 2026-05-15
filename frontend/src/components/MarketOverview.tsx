import type { IndexItem } from '../types'
import { pct } from '../utils'
import SectionTitle from './SectionTitle'
import './MarketOverview.css'

function IndexCard({ name, returns }: IndexItem) {
  const isUp = returns['5d'] >= 0
  return (
    <div className={`index-card ${isUp ? 'index-card--up' : 'index-card--down'}`}>
      <div className="index-card-name">{name}</div>
      <div className={`index-card-value mono tabular ${isUp ? 'positive' : 'negative'}`}>
        {pct(returns['5d'])}
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
}

export default function MarketOverview({ indices }: Props) {
  return (
    <section>
      <SectionTitle>Market Overview</SectionTitle>
      <div className="market-grid">
        {indices.map(idx => <IndexCard key={idx.ticker} {...idx} />)}
      </div>
    </section>
  )
}
