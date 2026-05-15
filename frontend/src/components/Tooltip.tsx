import { useState } from 'react'

interface Props {
  content: string
  children?: React.ReactNode
}

const ORANGE = '#ff8c00'

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
          width: 13, height: 13,
          border: `1px solid ${ORANGE}`, color: ORANGE,
          fontSize: 9, fontFamily: 'monospace', cursor: 'default',
          marginLeft: 5, flexShrink: 0, lineHeight: 1, fontWeight: 700,
        }}>?</span>
      )}
      {pos && (
        <div style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y - 8,
          transform: 'translateX(-50%) translateY(-100%)',
          background: 'var(--card)',
          border: `1px solid ${ORANGE}`,
          borderTop: `2px solid ${ORANGE}`,
          padding: '10px 12px',
          width: 240,
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          <div style={{
            color: 'var(--white)',
            fontSize: 12,
            lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
          }}>
            {content}
          </div>
        </div>
      )}
    </span>
  )
}
