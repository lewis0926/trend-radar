import RadarIcon from './RadarIcon'
import './Header.css'

interface Props {
  asOf: string
}

export default function Header({ asOf }: Props) {
  return (
    <header className="header">
      <div className="header-brand">
        <RadarIcon />
        <div>
          <div className="header-logo">
            <span className="header-logo-trend">TREND</span>
            <span className="header-logo-radar">RADAR</span>
          </div>
          <div className="header-subtitle">Sector Momentum</div>
        </div>
      </div>
      <div className="header-meta">
        <div className="header-live">
          <span className="header-live-dot" />
          <span className="header-live-label">LIVE</span>
        </div>
        <div className="header-date mono">{asOf}</div>
      </div>
    </header>
  )
}
