import type { CommodityItem, IndexItem } from '../types'
import { pct } from '../utils'
import SectionTitle from './SectionTitle'
import './MarketOverview.css'

interface CardProps {
  name: string
  returns: { '5d': number; '21d': number; '63d': number }
}

function MarketCard({ name, returns }: CardProps) {
  const isUp = returns['5d'] >= 0
  return (
    <div className={`index-card ${isUp ? 'index-card--up' : 'index-card--down'}`}>
      <div className="index-card-name">{name}</div>
      <div className="index-card-main">
        <span className="index-card-stat-label">1W</span>
        <div className={`index-card-value mono tabular ${isUp ? 'positive' : 'negative'}`}>
          {pct(returns['5d'])}
        </div>
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
  commodities: CommodityItem[]
}

export default function MarketOverview({ indices, commodities }: Props) {
  const us      = indices.filter(i => i.region === 'us')
  const global_ = indices.filter(i => i.region === 'global')

  return (
    <section>
      <SectionTitle>Market Overview</SectionTitle>
      <div className="market-groups">
        <div className="market-group">
          <div className="market-group-label">US</div>
          <div className="market-grid">
            {us.map(idx => <MarketCard key={idx.ticker} name={idx.name} returns={idx.returns} />)}
          </div>
        </div>
        <div className="market-group">
          <div className="market-group-label">Global</div>
          <div className="market-grid">
            {global_.map(idx => <MarketCard key={idx.ticker} name={idx.name} returns={idx.returns} />)}
          </div>
        </div>
        <div className="market-group">
          <div className="market-group-label">Commodities</div>
          <div className="market-grid">
            {commodities.map(c => <MarketCard key={c.ticker} name={c.name} returns={c.returns} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
