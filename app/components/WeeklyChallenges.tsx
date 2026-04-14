'use client'
import { getWeeklyChallenges, getDaysUntilReset } from '../lib/challenges'
import { Clock } from 'lucide-react'

export default function WeeklyChallenges() {
  const challenges = getWeeklyChallenges()
  const daysLeft = getDaysUntilReset()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>THIS WEEK</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Clock size={10} color="#555" />
          <span style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)' }}>Resets in {daysLeft}d</span>
        </div>
      </div>

      {challenges.map((challenge, i) => (
        <div key={challenge.id} style={{
          padding: '16px 18px', borderRadius: 14, background: '#111113',
          border: `1px solid ${challenge.color}22`,
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Difficulty badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '2px 8px', borderRadius: 20,
            background: challenge.difficulty === 'EASY' ? 'rgba(34,197,94,0.1)' : challenge.difficulty === 'MEDIUM' ? 'rgba(245,183,49,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${challenge.difficulty === 'EASY' ? 'rgba(34,197,94,0.2)' : challenge.difficulty === 'MEDIUM' ? 'rgba(245,183,49,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            <span style={{
              fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: 1,
              color: challenge.difficulty === 'EASY' ? '#22C55E' : challenge.difficulty === 'MEDIUM' ? '#F5B731' : '#EF4444'
            }}>{challenge.difficulty}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>{challenge.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{challenge.title}</div>
              <div style={{ fontSize: 12, color: '#666', fontFamily: 'var(--font-body)' }}>{challenge.description}</div>
            </div>
          </div>

          {/* Progress bar — vide pour l'instant, à connecter avec les vraies données */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ width: '0%', height: '100%', background: challenge.color, borderRadius: 2 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-body)' }}>🎁 {challenge.reward}</span>
            <span style={{ fontSize: 11, color: challenge.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              0 / {challenge.target} {challenge.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
