'use client'
import { Package, TrendingUp, Clock, Zap, AlertCircle } from 'lucide-react'
import { buildBatchStrategy, CardForBatch } from '../lib/batch-strategy'

interface BatchStrategyProps {
  cards: CardForBatch[]
}

export default function BatchStrategy({ cards }: BatchStrategyProps) {
  const strategy = buildBatchStrategy(cards)

  if (cards.length === 0) return (
    <div style={{ padding: '24px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
      <Package size={32} color="#333" style={{ margin: '0 auto 12px', display: 'block' }} />
      <p style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)' }}>Add cards to your portfolio to get batch strategy recommendations</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        {[
          { label: 'TOTAL CARDS', value: strategy.totalCards.toString(), color: '#E8E8EC' },
          { label: 'TOTAL COST', value: `$${strategy.totalCost.toFixed(0)}`, color: '#E8E8EC' },
          { label: 'EXPECTED PROFIT', value: `${strategy.totalExpectedProfit >= 0 ? '+' : ''}$${strategy.totalExpectedProfit}`, color: strategy.totalExpectedProfit >= 0 ? '#22C55E' : '#EF4444' },
          { label: 'BATCH SAVINGS', value: `$${strategy.savings}`, color: '#F5B731' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {strategy.recommendations.map((rec, i) => (
        <div key={i} style={{ borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,183,49,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} color="#F5B731" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: '#E8E8EC' }}>{rec.service}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{rec.tier} · {rec.cards.length} card{rec.cards.length > 1 ? 's' : ''}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: rec.totalExpectedProfit >= 0 ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
                {rec.totalExpectedProfit >= 0 ? '+' : ''}${rec.totalExpectedProfit}
              </div>
              <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>{rec.totalROI >= 0 ? '+' : ''}{rec.totalROI}% ROI</div>
            </div>
          </div>

          <div style={{ padding: '14px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 14 }}>
              {[
                { icon: <Package size={11} />, label: 'Grading fee', value: `$${rec.cost}/card` },
                { icon: <Clock size={11} />, label: 'Turnaround', value: rec.turnaround },
                { icon: <TrendingUp size={11} />, label: 'Total cost', value: `$${rec.totalCost.toFixed(0)}` },
                { icon: <Zap size={11} />, label: 'Expected value', value: `$${rec.totalExpectedValue}` },
              ].map((s, j) => (
                <div key={j} style={{ padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#555', marginBottom: 4 }}>{s.icon}<span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>{s.label.toUpperCase()}</span></div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 600 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Cards list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {rec.cards.map((card, j) => (
                <div key={j} style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#888' }}>
                  {card.cardName}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: '#555', margin: 0, fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>{rec.reason}</p>
          </div>
        </div>
      ))}

      {/* Advice */}
      {strategy.advice.length > 0 && (
        <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(245,183,49,0.04)', border: '1px solid rgba(245,183,49,0.12)' }}>
          <div style={{ fontSize: 10, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 10 }}>STRATEGY TIPS</div>
          {strategy.advice.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < strategy.advice.length - 1 ? 8 : 0 }}>
              <AlertCircle size={12} color="#F5B731" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: '#888', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
