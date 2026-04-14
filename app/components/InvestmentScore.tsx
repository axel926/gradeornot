'use client'
import { useEffect, useState } from 'react'
import { calculateInvestmentScore } from '../lib/investment-score'
import type { InvestmentScore } from '../lib/investment-score'

interface InvestmentScoreProps {
  roi: number
  netProfit: number
  psaGrade: number
  rawValue: number
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
  volume?: { days7: number; days30: number }
}

export default function InvestmentScoreComponent({ roi, netProfit, psaGrade, rawValue, gradeProbabilities, volume }: InvestmentScoreProps) {
  const [animated, setAnimated] = useState(false)
  const score = calculateInvestmentScore({ roi, netProfit, psaGrade, rawValue, gradeProbabilities, volume })

  useEffect(() => {
    setTimeout(() => setAnimated(true), 200)
  }, [])

  const breakdown = [
    { label: 'ROI', score: score.breakdown.roi, max: 30 },
    { label: 'RISK', score: score.breakdown.risk, max: 25 },
    { label: 'LIQUIDITY', score: score.breakdown.liquidity, max: 20 },
    { label: 'GRADE', score: score.breakdown.grade, max: 15 },
    { label: 'VALUE', score: score.breakdown.value, max: 10 },
  ]

  return (
    <div style={{ padding: '24px', borderRadius: 16, background: '#111113', border: `1px solid ${score.color}22` }}>

      {/* Score principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        {/* Circle score */}
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={score.color} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={animated ? `${2 * Math.PI * 34 * (1 - score.total / 100)}` : `${2 * Math.PI * 34}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: score.color, fontWeight: 700 }}>{score.total}</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>INVESTMENT SCORE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: score.color, letterSpacing: 3, marginBottom: 6 }}>{score.label}</div>
          <p style={{ fontSize: 12, color: '#666', margin: 0, fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{score.advice}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {breakdown.map((b, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{b.label}</span>
              <span style={{ fontSize: 10, color: '#888', fontFamily: 'var(--font-mono)' }}>{b.score}/{b.max}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: b.score / b.max >= 0.7 ? '#22C55E' : b.score / b.max >= 0.4 ? '#F5B731' : '#EF4444',
                width: animated ? `${(b.score / b.max) * 100}%` : '0%',
                transition: `width 0.8s ease ${i * 0.1}s`
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
