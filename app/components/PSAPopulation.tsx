'use client'
import { Users, TrendingUp } from 'lucide-react'

interface PSAPopulationProps {
  population: {
    total: number
    byGrade: Record<string, number>
    source: string
  } | null
  cardName: string
}

export default function PSAPopulation({ population, cardName }: PSAPopulationProps) {
  if (!population || population.total === 0) return null

  const grades = [10, 9, 8, 7, 6].map(g => ({
    grade: g,
    count: population.byGrade[`grade${g}`] || 0,
    pct: population.total > 0 ? Math.round((population.byGrade[`grade${g}`] || 0) / population.total * 100) : 0
  }))

  const psa10Rate = grades[0].pct
  const difficulty = psa10Rate >= 15 ? { label: 'EASY', color: '#22C55E' }
    : psa10Rate >= 8 ? { label: 'MODERATE', color: '#F5B731' }
    : psa10Rate >= 3 ? { label: 'HARD', color: '#F97316' }
    : { label: 'VERY HARD', color: '#EF4444' }

  return (
    <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} color="#F5B731" />
          <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>PSA POPULATION</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>{population.total.toLocaleString()} graded</span>
          <div style={{ padding: '3px 8px', borderRadius: 20, background: `rgba(${difficulty.color === '#22C55E' ? '34,197,94' : difficulty.color === '#F5B731' ? '245,183,49' : difficulty.color === '#F97316' ? '249,115,22' : '239,68,68'},0.1)`, border: `1px solid rgba(${difficulty.color === '#22C55E' ? '34,197,94' : difficulty.color === '#F5B731' ? '245,183,49' : difficulty.color === '#F97316' ? '249,115,22' : '239,68,68'},0.2)` }}>
            <span style={{ fontSize: 10, color: difficulty.color, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>PSA 10 {difficulty.label}</span>
          </div>
        </div>
      </div>

      {/* Barres par grade */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {grades.map(g => (
          <div key={g.grade}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: g.grade === 10 ? '#22C55E' : g.grade === 9 ? '#F5B731' : '#888', fontWeight: g.grade >= 9 ? 700 : 400 }}>PSA {g.grade}</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>{g.count.toLocaleString()}</span>
                <span style={{ fontSize: 11, color: g.grade >= 9 ? (g.grade === 10 ? '#22C55E' : '#F5B731') : '#444', fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: 32, textAlign: 'right' }}>{g.pct}%</span>
              </div>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: g.grade === 10 ? '#22C55E' : g.grade === 9 ? '#F5B731' : 'rgba(255,255,255,0.15)',
                width: `${g.pct}%`,
                transition: 'width 1s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 10, color: '#333', marginTop: 14, marginBottom: 0, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
        Based on {population.total.toLocaleString()} real PSA submissions · Source: PSA Population Report · Past data does not guarantee future grades
      </p>
    </div>
  )
}
