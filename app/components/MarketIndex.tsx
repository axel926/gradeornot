'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'
import { MarketIndexSkeleton } from './Skeleton'

interface IndexData {
  current: { pokemon: number | null; global: number | null; calculatedAt: string; sampleSize: number }
  history: { global_index: number; pokemon_index: number; variation_7d: number | null; recorded_at: string }[]
}

export default function MarketIndex() {
  const [data, setData] = useState<IndexData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/market-index')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <MarketIndexSkeleton />

  if (!data?.current?.global) return null

  const variation = data.history[0]?.variation_7d
  const isUp = variation !== null && variation !== undefined && variation >= 0
  const TrendIcon = variation === null ? Minus : isUp ? TrendingUp : TrendingDown
  const trendColor = variation === null ? '#555' : isUp ? '#22C55E' : '#EF4444'

  // Mini sparkline SVG depuis l'historique
  const sparkPoints = data.history.slice(0, 14).reverse().map((h, i) => h.global_index)
  const minP = Math.min(...sparkPoints)
  const maxP = Math.max(...sparkPoints)
  const range = maxP - minP || 1
  const svgPoints = sparkPoints.map((p, i) => {
    const x = (i / (sparkPoints.length - 1)) * 200
    const y = 30 - ((p - minP) / range) * 28
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ padding: '20px 24px', borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <BarChart2 size={14} color="#F5B731" />
            <span style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>TCG MARKET INDEX</span>
          </div>
          <div style={{ fontSize: 32, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700, marginBottom: 4 }}>
            ${data.current.global?.toFixed(2)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendIcon size={13} color={trendColor} />
            <span style={{ fontSize: 12, color: trendColor, fontFamily: 'var(--font-mono)' }}>
              {variation !== null && variation !== undefined
                ? `${isUp ? '+' : ''}${variation}% 7d`
                : 'No trend data yet'}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        {sparkPoints.length > 1 && (
          <svg width="120" height="40" viewBox="0 0 200 40">
            <polyline
              points={svgPoints}
              fill="none"
              stroke={isUp ? '#22C55E' : '#EF4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>POKÉMON INDEX</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', color: '#F5B731', fontWeight: 700 }}>
            ${data.current.pokemon?.toFixed(2) || '—'}
          </div>
        </div>
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>SAMPLE SIZE</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', color: '#888', fontWeight: 700 }}>
            {data.current.sampleSize} cards
          </div>
        </div>
      </div>

      <p style={{ fontSize: 10, color: '#333', marginTop: 12, marginBottom: 0, fontFamily: 'var(--font-body)' }}>
        Weighted average of key TCG cards · Updated hourly
      </p>
    </div>
  )
}
