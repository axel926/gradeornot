'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart2, Activity, Database } from 'lucide-react'

interface MarketDataProps {
  cardName: string
  game: string
  setName?: string
}

interface MarketInfo {
  raw: { avg: number | null; median: number | null; min: number | null; max: number | null; count: number }
  grades: { psa7: number | null; psa8: number | null; psa9: number | null; psa10: number | null }
  volume: { days7: number; days30: number }
  trends: { days7: number | null; days30: number | null }
  source: string
  gradeSource: string
  lastUpdated: string
}

interface CardmarketInfo {
  raw: { avg1: number | null; avg7: number | null; avg30: number | null; trendPrice: number | null; lowPrice: number | null }
  source: string
}

function PriceCell({ label, value, highlight = false, isEstimate = false, currency = '$' }: {
  label: string; value: number | null; highlight?: boolean; isEstimate?: boolean; currency?: string
}) {
  return (
    <div style={{
      padding: '14px', borderRadius: 10, textAlign: 'center',
      background: highlight ? 'rgba(245,183,49,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${highlight ? 'rgba(245,183,49,0.2)' : 'rgba(255,255,255,0.06)'}`
    }}>
      <div style={{ fontSize: 10, color: highlight ? '#F5B731' : '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: highlight ? '#F5B731' : '#E8E8EC', fontWeight: 700 }}>
        {value != null ? `${currency}${value.toFixed(2)}` : '—'}
      </div>
      {isEstimate && value != null && (
        <div style={{ fontSize: 9, color: '#444', marginTop: 4, fontFamily: 'var(--font-mono)' }}>est.</div>
      )}
    </div>
  )
}

function TrendBadge({ value, label }: { value: number | null; label: string }) {
  if (value === null) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Minus size={11} color="#555" />
      <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>{label} N/A</span>
    </div>
  )
  const positive = value >= 0
  const color = positive ? '#22C55E' : '#EF4444'
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: `rgba(${positive ? '34,197,94' : '239,68,68'},0.08)`, border: `1px solid rgba(${positive ? '34,197,94' : '239,68,68'},0.2)` }}>
      <Icon size={11} color={color} />
      <span style={{ fontSize: 11, color, fontFamily: 'var(--font-mono)' }}>{positive ? '+' : ''}{value}% {label}</span>
    </div>
  )
}

export default function MarketDataComponent({ cardName, game, setName }: MarketDataProps) {
  const [data, setData] = useState<MarketInfo | null>(null)
  const [cardmarket, setCardmarket] = useState<CardmarketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'usd' | 'eur'>('usd')

  useEffect(() => {
    fetch('/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardName, game, setName })
    })
      .then(r => r.json())
      .then(d => {
        setData(d.data)
        setCardmarket(d.cardmarket)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [cardName, game, setName])

  if (loading) return (
    <div style={{ padding: '24px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#F5B731', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>FETCHING MARKET DATA...</span>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
      <span style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)' }}>No market data available for this card yet.</span>
    </div>
  )

  const isEstimate = data.gradeSource.includes('Estimated')
  const liquidityColor = data.volume.days7 > 10 ? '#22C55E' : data.volume.days7 > 3 ? '#F5B731' : '#EF4444'
  const liquidityLabel = data.volume.days7 > 10 ? 'HIGH' : data.volume.days7 > 3 ? 'MEDIUM' : 'LOW'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header + tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={16} color="#F5B731" />
          <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
            MARKET DATA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {cardmarket && (
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['usd', 'eur'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '6px 14px', background: activeTab === tab ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.03)',
                  border: 'none', color: activeTab === tab ? '#F5B731' : '#666',
                  fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: 1
                }}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <TrendBadge value={data.trends.days7} label="7d" />
            <TrendBadge value={data.trends.days30} label="30d" />
          </div>
        </div>
      </div>

      {/* USD view */}
      {activeTab === 'usd' && (
        <>
          <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>
              RAW CARD PRICES · {data.source}
            </div>
            <div style={{ fontSize: 10, color: '#444', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
              {data.raw.count > 0 ? `${data.raw.count} data points analyzed` : 'Live market data'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <PriceCell label="MIN" value={data.raw.min} />
              <PriceCell label="MEDIAN" value={data.raw.median} highlight />
              <PriceCell label="MAX" value={data.raw.max} />
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>GRADED PRICES — PSA</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20,
                background: isEstimate ? 'rgba(255,255,255,0.04)' : 'rgba(34,197,94,0.08)',
                border: `1px solid ${isEstimate ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.2)'}` }}>
                <Database size={10} color={isEstimate ? '#555' : '#22C55E'} />
                <span style={{ fontSize: 10, color: isEstimate ? '#555' : '#22C55E', fontFamily: 'var(--font-mono)' }}>
                  {data.gradeSource.toUpperCase()}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <PriceCell label="PSA 7" value={data.grades.psa7} isEstimate={isEstimate} />
              <PriceCell label="PSA 8" value={data.grades.psa8} isEstimate={isEstimate} />
              <PriceCell label="PSA 9" value={data.grades.psa9} isEstimate={isEstimate} />
              <PriceCell label="PSA 10" value={data.grades.psa10} highlight isEstimate={isEstimate} />
            </div>
          </div>
        </>
      )}

      {/* EUR view — Cardmarket */}
      {activeTab === 'eur' && cardmarket && (
        <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>
            CARDMARKET PRICES — EUR
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
            <PriceCell label="AVG 1 DAY" value={cardmarket.raw.avg1} currency="€" />
            <PriceCell label="AVG 7 DAYS" value={cardmarket.raw.avg7} currency="€" highlight />
            <PriceCell label="AVG 30 DAYS" value={cardmarket.raw.avg30} currency="€" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <PriceCell label="TREND" value={cardmarket.raw.trendPrice} currency="€" />
            <PriceCell label="LOWEST" value={cardmarket.raw.lowPrice} currency="€" />
          </div>
        </div>
      )}

      {/* Volume + Liquidity — hidden when no data */}
      {(data.volume.days7 > 0 || data.volume.days30 > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: '16px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 12 }}>SALES VOLUME</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{data.volume.days7 || '—'}</div>
              <div style={{ fontSize: 10, color: '#555' }}>last 7 days</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{data.volume.days30 || '—'}</div>
              <div style={{ fontSize: 10, color: '#555' }}>last 30 days</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 12 }}>LIQUIDITY</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={20} color={liquidityColor} />
            <div>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: liquidityColor, fontWeight: 700 }}>{liquidityLabel}</div>
              <div style={{ fontSize: 10, color: '#555' }}>ease of selling</div>
            </div>
          </div>
        </div>
      </div>
      )}

      <div style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-body)', textAlign: 'right' }}>
        Updated {new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
