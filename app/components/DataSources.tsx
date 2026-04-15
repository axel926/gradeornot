'use client'

interface DataSourcesProps {
  sources: {
    name: string
    type: 'live' | 'estimated' | 'cached'
    detail?: string
  }[]
}

const SOURCE_CONFIG = {
  live: { color: '#22C55E', label: 'LIVE', dot: '#22C55E' },
  estimated: { color: '#F5B731', label: 'EST.', dot: '#F5B731' },
  cached: { color: '#888', label: 'CACHED', dot: '#888' },
}

export default function DataSources({ sources }: DataSourcesProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>DATA:</span>
      {sources.map((source, i) => {
        const config = SOURCE_CONFIG[source.type]
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 20,
            background: `rgba(${config.color === '#22C55E' ? '34,197,94' : config.color === '#F5B731' ? '245,183,49' : '136,136,136'},0.08)`,
            border: `1px solid rgba(${config.color === '#22C55E' ? '34,197,94' : config.color === '#F5B731' ? '245,183,49' : '136,136,136'},0.2)`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: config.dot }} />
            <span style={{ fontSize: 10, color: config.color, fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>
              {source.name}
            </span>
            <span style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)' }}>
              {config.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
