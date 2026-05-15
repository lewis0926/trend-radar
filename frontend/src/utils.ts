export function pct(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}
