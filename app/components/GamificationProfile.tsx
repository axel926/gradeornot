'use client'
import { getLevel, getEarnedBadges, getNextBadge, BADGES } from '../lib/gamification'
import type { UserStats } from '../lib/gamification'

interface GamificationProfileProps {
  stats: UserStats
}

export default function GamificationProfile({ stats }: GamificationProfileProps) {
  const level = getLevel(stats.totalScans)
  const earned = getEarnedBadges(stats)
  const next = getNextBadge(stats)
  const progress = ((stats.totalScans / level.nextAt) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Level */}
      <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(245,183,49,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>YOUR LEVEL</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#F5B731', letterSpacing: 2 }}>{level.level}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#F5B731', letterSpacing: 2 }}>{level.title}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>TOTAL SCANS</div>
            <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{stats.totalScans}</div>
          </div>
        </div>
        {level.level < 10 && (
          <>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #D4981A, #F5B731)', borderRadius: 3, transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-body)' }}>
              {stats.totalScans} / {level.nextAt} scans to next level
            </div>
          </>
        )}
      </div>

      {/* Badges earned */}
      <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>
          BADGES — {earned.length}/{BADGES.length}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
          {BADGES.map(badge => {
            const isEarned = earned.find(b => b.id === badge.id)
            return (
              <div key={badge.id} style={{
                padding: '12px 8px', borderRadius: 12, textAlign: 'center',
                background: isEarned ? 'rgba(245,183,49,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isEarned ? 'rgba(245,183,49,0.2)' : 'rgba(255,255,255,0.06)'}`,
                opacity: isEarned ? 1 : 0.4,
                filter: isEarned ? 'none' : 'grayscale(1)'
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{badge.emoji}</div>
                <div style={{ fontSize: 9, color: isEarned ? '#F5B731' : '#555', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>{badge.name.toUpperCase()}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next badge */}
      {next && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28, filter: 'grayscale(1)', opacity: 0.5 }}>{next.emoji}</div>
          <div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 2 }}>NEXT BADGE</div>
            <div style={{ fontSize: 13, color: '#E8E8EC', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{next.name}</div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-body)' }}>{next.description}</div>
          </div>
        </div>
      )}
    </div>
  )
}
