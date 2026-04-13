'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { ArrowLeft, TrendingUp, Trophy, Zap } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  username: string
  total_scans: number
  best_roi: number
  total_profit: number
  badges_count: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'roi' | 'profit' | 'scans'>('roi')
  const router = useRouter()

  useEffect(() => {
    fetchLeaderboard()
  }, [tab])

  const fetchLeaderboard = async () => {
    setLoading(true)
    const orderCol = tab === 'roi' ? 'best_roi' : tab === 'profit' ? 'total_profit' : 'total_scans'
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order(orderCol, { ascending: false })
      .limit(20)
    if (data) setEntries(data)
    setLoading(false)
  }

  const getMedal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0A0A0B', zIndex: 50 }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          <ArrowLeft size={14} /> Home
        </button>
        <div style={{ height: 14, width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555', letterSpacing: 1 }}>LEADERBOARD</span>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <Trophy size={24} color="#F5B731" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 4, color: '#E8E8EC', margin: 0 }}>TOP GRADERS</h1>
          </div>
          <p style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)' }}>The best TCG investors on GradeOrNot</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {[
            { id: 'roi', label: 'Best ROI' },
            { id: 'profit', label: 'Most Profit' },
            { id: 'scans', label: 'Most Scans' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 12,
              background: tab === t.id ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === t.id ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: tab === t.id ? '#F5B731' : '#555', fontFamily: 'var(--font-mono)'
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#555', fontSize: 12, letterSpacing: 1 }}>LOADING...</div>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Trophy size={40} color="#333" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#555', fontFamily: 'var(--font-body)', marginBottom: 20 }}>No entries yet — be the first!</p>
            <button onClick={() => router.push('/')} style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Scan a card now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map((entry, i) => (
              <div key={entry.id} style={{
                padding: '16px 20px', borderRadius: 14,
                background: i < 3 ? 'rgba(245,183,49,0.04)' : '#111113',
                border: `1px solid ${i < 3 ? 'rgba(245,183,49,0.15)' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div style={{ fontSize: i < 3 ? 24 : 16, fontFamily: 'var(--font-mono)', color: '#555', minWidth: 36, textAlign: 'center' }}>
                  {getMedal(i)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{entry.username}</div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>
                    {entry.total_scans} scans · {entry.badges_count} badges
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {tab === 'roi' && (
                    <>
                      <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#22C55E', fontWeight: 700 }}>+{entry.best_roi}%</div>
                      <div style={{ fontSize: 10, color: '#555' }}>best ROI</div>
                    </>
                  )}
                  {tab === 'profit' && (
                    <>
                      <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#F5B731', fontWeight: 700 }}>${entry.total_profit}</div>
                      <div style={{ fontSize: 10, color: '#555' }}>total profit</div>
                    </>
                  )}
                  {tab === 'scans' && (
                    <>
                      <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{entry.total_scans}</div>
                      <div style={{ fontSize: 10, color: '#555' }}>scans</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
