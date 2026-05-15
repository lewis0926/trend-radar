import RadarIcon from './RadarIcon'
import './Header.css'

interface Props {
  asOf: string
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function Header({ asOf, theme, onToggleTheme }: Props) {
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
        <div className="header-meta-top">
          <div className="header-live">
            <span className="header-live-dot" />
            <span className="header-live-label">LIVE</span>
          </div>
          <button className="theme-toggle mono" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6.34" y1="17.66" x2="4.22" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                LIGHT
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                DARK
              </>
            )}
          </button>
        </div>
        <div className="header-date mono">{asOf}</div>
      </div>
    </header>
  )
}
