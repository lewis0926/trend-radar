import { useState } from 'react'

interface Props {
  content: string
  children?: React.ReactNode
}

export default function Tooltip({ content, children }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  function handleMouseEnter(e: React.MouseEvent<HTMLSpanElement>) {
    const rect: DOMRect = e.currentTarget.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
  }

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setPos(null)}
    >
      {children ?? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 13, height: 13, borderRadius: '50%',
          border: '1px solid #4b6070', color: '#4b6070',
          fontSize: 9, fontFamily: 'monospace', cursor: 'default',
          marginLeft: 5, flexShrink: 0, lineHeight: 1,
        }}>?</span>
      )}
      {pos && (
        <div style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y - 8,
          transform: 'translateX(-50%) translateY(-100%)',
          background: '#0d1520', border: '1px solid #06b6d4',
          borderRadius: 6, padding: '10px 12px',
          width: 220, zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          <div style={{ color: '#c9d4e0', fontSize: 12, lineHeight: 1.6, fontFamily: 'sans-serif', fontWeight: 400 }}>
            {content}
          </div>
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
            width: 8, height: 8, background: '#0d1520',
            borderRight: '1px solid #06b6d4', borderBottom: '1px solid #06b6d4',
          }} />
        </div>
      )}
    </span>
  )
}
