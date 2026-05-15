const ORANGE = '#ff8c00'

interface Props {
  size?: number
}

export default function RadarIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" stroke={ORANGE} strokeWidth="1.2" strokeOpacity="0.4" />
      <circle cx="14" cy="14" r="7.5" stroke={ORANGE} strokeWidth="1.2" strokeOpacity="0.6" />
      <circle cx="14" cy="14" r="3" stroke={ORANGE} strokeWidth="1.2" />
      <line x1="14" y1="14" x2="23.5" y2="5.5" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21" cy="7" r="1.8" fill={ORANGE} />
      <circle cx="14" cy="14" r="1.5" fill={ORANGE} />
    </svg>
  )
}
