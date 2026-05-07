import siteContent from '@/data/site.json'
import homeContent from '@/data/home.json'

export const site = siteContent
export const home = homeContent

export function withBreaks(text: string): React.ReactNode {
  const parts = text.split('\n')
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i < parts.length - 1 ? (
      <span key={i}>
        {part}
        <br />
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export function withEmphasis(
  text: string,
  style: React.CSSProperties = { color: 'var(--color-dark)', fontWeight: 700 }
): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={style}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}
