'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Zap, Trophy } from 'lucide-react'

interface FeedItem {
  id: string
  card_name: string
  game: string
  psa_grade_estimate: number
  raw_value: number
  recommendation: string
  created_at: string
  full_analysis: Record<string, unknown>
  profiles: { username: string; avatar_url: string | null }
}

const VERDICT_CONFIG = {
  GRADE: { label: 'SEND IT', color: '#22C55E', icon: TrendingUp, bg: 'rgba(34,197,94,0.08)' },
  SKIP: { label: 'SKIP IT', color: '#EF4444', icon: TrendingDown, bg: 'rgba(239,68,68,0.08)' },
  MAYBE: { label: 'BORDERLINE', color: '#F5B731', icon: Minus, bg: 'rgba(245,183,49,0.08)' },
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'GRADE' | 'top'>('all')
  const router = useRouter()

  useEffect(() => {
    fetchFeed()
  }, [filter])

  const fetchFeed = async () => {
    setLoading(true)
    let query = supabase
      .from('scans')
      .select('*, profiles(username, avatar_url)')
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (filter === 'GRADE') {
      query = query.eq('recommendation', 'GRADE')
    } else if (filter === 'top') {
      query = query.gte('raw_value', 100)
    }

    const { data } = await query
    if (data) setItems(data as unknown as FeedItem[])
    setLoading(false)
  }

  const handleCardClick = (item: FeedItem) => {
    if (item.full_analysis) {
      sessionStorage.setItem('gradeornot_result', JSON.stringify(item.full_analysis))
      router.push('/results')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 80px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: '#E8E8EC', marginBottom: 8 }}>COMMUNITY FEED</h1>
          <p style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)' }}>See what other TCG investors are analyzing right now.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'all', label: '🌐 All' },
            { id: 'GRADE', label: '✅ Send It' },
            { id: 'top', label: '💎 High Value ($100+)' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as typeof filter)} style={{
              padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12,
              background: filter === f.id ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f.id ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: filter === f.id ? '#F5B731' : '#555', fontFamily: 'var(--font-body)'
            }}>{f.label}</button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 120, borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite' }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Trophy size={40} color="#333" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: '#555', fontFamily: 'var(--font-body)' }}>No scans yet — be the first to analyze a card!</p>
            <button onClick={() => router.push('/')} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Scan now →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => {
              const v = VERDICT_CONFIG[item.recommendation as keyof typeof VERDICT_CONFIG] || VERDICT_CONFIG.MAYBE
              const VIcon = v.icon
              const analysis = item.full_analysis?.analysis as Record<string, unknown>
              const roi = (item.full_analysis?.gradingAnalysis as Record<string, {bestTier: {roi: number}}>)
                ? Object.values(item.full_analysis.gradingAnalysis as Record<string, {bestTier: {roi: number}}>)[0]?.bestTier?.roi
                : null

              return (
                <div key={item.id} onClick={() => handleCardClick(item)} style={{
                  padding: '16px 20px', borderRadius: 14,
                  background: v.bg, border: `1px solid ${v.color}22`,
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Verdict icon */}
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${v.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <VIcon size={18} color={v.color} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* User + time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#0A0A0B', fontWeight: 700, flexShrink: 0 }}>
                          {item.profiles?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>
                          {item.profiles?.username || 'Anonymous'} · {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Card name */}
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.card_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>
                        {item.game} · PSA {item.psa_grade_estimate} est. · Raw ${item.raw_value}
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ padding: '4px 10px', borderRadius: 20, background: `${v.color}15`, border: `1px solid ${v.color}30` }}>
                          <span style={{ fontSize: 11, color: v.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{v.label}</span>
                        </div>
                        {roi !== null && roi !== undefined && (
                          <div style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ fontSize: 11, color: roi >= 0 ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-mono)' }}>
                              {roi >= 0 ? '+' : ''}{roi}% ROI
                            </span>
                          </div>
                        )}
                        <div style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>Tap to see full analysis</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
