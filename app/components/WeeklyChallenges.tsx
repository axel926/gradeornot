'use client'
import { useEffect, useState } from 'react'
import { getWeeklyChallenges, getDaysUntilReset } from '../lib/challenges'
import { supabase } from '../lib/supabase'
import { Clock } from 'lucide-react'

export default function WeeklyChallenges() {
  const challenges = getWeeklyChallenges()
  const daysLeft = getDaysUntilReset()
  const [progress, setProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Début de la semaine actuelle (lundi)
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    // Compter les scans de cette semaine
    const { count: scanCount } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monday.toISOString())

    // Compter les cartes portfolio
    const { count: portfolioCount } = await supabase
      .from('portfolio')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Compter les cartes gradées
    const { count: gradedCount } = await supabase
      .from('portfolio')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['graded', 'sold'])

    setProgress({
      scan5: scanCount || 0,
      scan10: scanCount || 0,
      scan3: scanCount || 0,
      portfolio3: portfolioCount || 0,
      grade1: gradedCount || 0,
    })
  }

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

          {/* Progress bar connectée aux vraies données */}
          {(() => {
            const current = Math.min(progress[challenge.id] || 0, challenge.target)
            const pct = Math.round((current / challenge.target) * 100)
            const done = current >= challenge.target
            return (
              <>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: done ? '#22C55E' : challenge.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-body)' }}>
                    {done ? '✅' : '🎁'} {challenge.reward}
                  </span>
                  <span style={{ fontSize: 11, color: done ? '#22C55E' : challenge.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {current} / {challenge.target} {challenge.unit}
                  </span>
                </div>
              </>
            )
          })()}
        </div>
      ))}
    </div>
  )
}
