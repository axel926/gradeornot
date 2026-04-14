'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { detectOvervalue } from '../lib/overvalue-detector'
import type { OvervalueResult } from '../lib/overvalue-detector'

interface OvervalueAlertProps {
  cardName: string
  game: string
  currentPrice: number
}

export default function OvervalueAlert({ cardName, game, currentPrice }: OvervalueAlertProps) {
  const [result, setResult] = useState<OvervalueResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistoricalPrices()
  }, [cardName, game, currentPrice])

  const fetchHistoricalPrices = async () => {
    try {
      // On va chercher l'historique dans Supabase
      const res = await fetch('/api/price-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardName, game })
      })
      const data = await res.json()
      const prices = (data.history || []).map((h: { raw_avg: number }) => h.raw_avg).filter(Boolean)
      
      const analysis = detectOvervalue(currentPrice, prices)
      setResult(analysis)
    } catch {
      setResult(detectOvervalue(currentPrice, []))
    }
    setLoading(false)
  }

  if (loading || !result) return null
  if (result.signal === 'FAIR') return null // On n'affiche rien si le prix est normal

  const Icon = result.signal === 'OVERVALUED' ? TrendingDown
    : result.signal === 'UNDERVALUED' ? TrendingUp
    : Minus

  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      background: `rgba(${result.signal === 'OVERVALUED' ? '239,68,68' : '34,197,94'},0.06)`,
      border: `1px solid rgba(${result.signal === 'OVERVALUED' ? '239,68,68' : '34,197,94'},0.2)`,
      display: 'flex', alignItems: 'flex-start', gap: 12
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${result.signal === 'OVERVALUED' ? '239,68,68' : '34,197,94'},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {result.signal === 'OVERVALUED'
          ? <AlertTriangle size={16} color={result.color} />
          : <Icon size={16} color={result.color} />
        }
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: result.color, fontWeight: 700, letterSpacing: 1 }}>
            {result.signal === 'OVERVALUED' ? '⚠ OVERVALUED' : '✓ UNDERVALUED'}
          </span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: result.color }}>
            {result.deviation >= 0 ? '+' : ''}{result.deviation}% vs avg
          </span>
        </div>
        <p style={{ fontSize: 12, color: '#888', margin: 0, fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
          {result.advice}
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div>
            <span style={{ fontSize: 10, color: '#444', fontFamily: 'var(--font-mono)' }}>CURRENT </span>
            <span style={{ fontSize: 12, color: result.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${result.currentPrice}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: '#444', fontFamily: 'var(--font-mono)' }}>HIST. AVG </span>
            <span style={{ fontSize: 12, color: '#888', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${result.historicalAvg}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
