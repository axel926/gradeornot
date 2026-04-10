'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScenarioSimulatorProps {
  rawValue: number
  gradedValues: { PSA10: number; PSA9: number; PSA8: number }
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
  totalCost: number
  sellingFee: number
}

export default function ScenarioSimulator({ rawValue, gradedValues, gradeProbabilities, totalCost, sellingFee }: ScenarioSimulatorProps) {
  const net = (value: number) => Math.round(value * (1 - sellingFee / 100))
  const profit = (value: number) => net(value) - totalCost
  const roi = (value: number) => totalCost > 0 ? Math.round(((net(value) - totalCost) / totalCost) * 100) : 0

  const psa7Value = Math.round(rawValue * 0.85)

  const scenarios = [
    {
      label: 'BEST CASE',
      grade: 'PSA 10',
      prob: gradeProbabilities.psa10,
      value: gradedValues.PSA10,
      profit: profit(gradedValues.PSA10),
      roi: roi(gradedValues.PSA10),
      color: '#22C55E',
      icon: TrendingUp,
      desc: 'Gem Mint — everything goes right'
    },
    {
      label: 'LIKELY CASE',
      grade: 'PSA 9',
      prob: gradeProbabilities.psa9,
      value: gradedValues.PSA9,
      profit: profit(gradedValues.PSA9),
      roi: roi(gradedValues.PSA9),
      color: '#F5B731',
      icon: Minus,
      desc: 'Mint — most probable outcome'
    },
    {
      label: 'WORST CASE',
      grade: 'PSA 7 or less',
      prob: gradeProbabilities.psa7,
      value: psa7Value,
      profit: profit(psa7Value),
      roi: roi(psa7Value),
      color: '#EF4444',
      icon: TrendingDown,
      desc: 'Below expectations — sell raw instead'
    },
  ]

  // Valeur attendue pondérée
  const expectedValue =
    (gradedValues.PSA10 * gradeProbabilities.psa10 / 100) +
    (gradedValues.PSA9 * gradeProbabilities.psa9 / 100) +
    (gradedValues.PSA8 * gradeProbabilities.psa8 / 100) +
    (psa7Value * gradeProbabilities.psa7 / 100)

  const expectedProfit = profit(expectedValue)
  const expectedROI = roi(expectedValue)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Expected value summary */}
      <div style={{ padding: '16px 20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>PROBABILITY-WEIGHTED EXPECTED OUTCOME</div>
          <div style={{ fontSize: 12, color: '#666', fontFamily: 'var(--font-body)' }}>Based on grade probability distribution</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', color: expectedProfit >= 0 ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
            {expectedProfit >= 0 ? '+' : ''}${expectedProfit}
          </div>
          <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-mono)' }}>{expectedROI >= 0 ? '+' : ''}{expectedROI}% ROI</div>
        </div>
      </div>

      {/* 3 scenarios */}
      {scenarios.map((s, i) => {
        const Icon = s.icon
        const isPositive = s.profit >= 0
        return (
          <div key={i} style={{
            padding: '16px 20px', borderRadius: 14,
            background: `rgba(${s.color === '#22C55E' ? '34,197,94' : s.color === '#EF4444' ? '239,68,68' : '245,183,49'},0.04)`,
            border: `1px solid rgba(${s.color === '#22C55E' ? '34,197,94' : s.color === '#EF4444' ? '239,68,68' : '245,183,49'},0.15)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${s.color === '#22C55E' ? '34,197,94' : s.color === '#EF4444' ? '239,68,68' : '245,183,49'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: s.color, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 14, color: '#E8E8EC', fontWeight: 600, fontFamily: 'var(--font-body)' }}>{s.grade}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: isPositive ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
                  {isPositive ? '+' : ''}${s.profit}
                </div>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>{s.roi >= 0 ? '+' : ''}{s.roi}% ROI</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[
                { label: 'PROBABILITY', value: `${s.prob}%` },
                { label: 'SALE VALUE', value: `$${s.value}` },
                { label: 'NET PROCEEDS', value: `$${net(s.value)}` },
                { label: 'TOTAL COST', value: `$${totalCost}` },
              ].map((stat, j) => (
                <div key={j} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 0.5, marginBottom: 3 }}>{stat.label}</div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 600 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Probability bar */}
            <div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${s.prob}%`, height: '100%', background: s.color, borderRadius: 2, opacity: 0.7 }} />
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 6, fontFamily: 'var(--font-body)' }}>{s.desc}</div>
            </div>
          </div>
        )
      })}

      <p style={{ fontSize: 10, color: '#333', lineHeight: 1.5, fontFamily: 'var(--font-body)', margin: 0 }}>
        Scenarios based on grade probability estimates. Actual grade outcomes cannot be guaranteed.
      </p>
    </div>
  )
}
