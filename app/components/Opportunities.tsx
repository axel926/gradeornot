'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, Zap, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Opportunity {
  id?: string
  card_name: string
  game: string
  set_name: string
  raw_value: number
  psa10_value: number
  estimated_roi: number
  investment_score: number
  reason: string
}

export default function Opportunities() {
  const [opps, setOpps] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/opportunities')
      .then(r => r.json())
      .then(d => { setOpps(d.opportunities || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#F5B731', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>SCANNING MARKET...</span>
      </div>
    </div>
  )

  if (opps.length === 0) return (
    <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)', margin: 0 }}>No strong opportunities detected right now — check back later.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {opps.map((opp, i) => (
        <div key={i} style={{
          padding: '16px 20px', borderRadius: 14, background: '#111113',
          border: '1px solid rgba(34,197,94,0.15)',
          cursor: 'pointer'
        }}
        onClick={() => router.push('/')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 9, color: '#22C55E', fontFamily: 'var(--font-mono)', letterSpacing: 1, padding: '2px 8px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  #{i + 1} OPPORTUNITY
                </div>
                <div style={{ fontSize: 9, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
                  SCORE {opp.investment_score}/100
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 2 }}>
                {opp.card_name}
              </div>
              <div style={{ fontSize: 11, color: '#555' }}>{opp.game} · {opp.set_name}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: '#22C55E', fontWeight: 700 }}>
                +{opp.estimated_roi}%
              </div>
              <div style={{ fontSize: 10, color: '#555' }}>est. ROI</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'RAW', value: `$${opp.raw_value?.toFixed(0)}` },
              { label: 'PSA 10', value: `$${opp.psa10_value?.toFixed(0)}` },
              { label: 'MULTIPLIER', value: `×${(opp.psa10_value / opp.raw_value).toFixed(1)}` },
            ].map((s, j) => (
              <div key={j} style={{ padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 600 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={11} color="#22C55E" />
            <span style={{ fontSize: 11, color: '#666', fontFamily: 'var(--font-body)', flex: 1 }}>{opp.reason}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(245,183,49,0.08)', border: '1px solid rgba(245,183,49,0.2)' }}>
              <Zap size={10} color="#F5B731" />
              <span style={{ fontSize: 10, color: '#F5B731', fontFamily: 'var(--font-mono)' }}>Scan now</span>
            </div>
          </div>
        </div>
      ))}
      <p style={{ fontSize: 10, color: '#333', textAlign: 'center', fontFamily: 'var(--font-body)', margin: 0 }}>
        Opportunities refreshed every 24h · Based on live TCGPlayer prices
      </p>
    </div>
  )
}
