'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Trophy, TrendingUp, Package, Zap } from 'lucide-react'
import { getLevel, getEarnedBadges, BADGES } from '../../lib/gamification'
import type { UserStats } from '../../lib/gamification'

interface PublicProfile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  total_scans: number
  investor_level: string | null
  preferred_games: string[]
  badges: string[]
}

interface PublicPortfolioStats {
  totalCards: number
  gradedCards: number
  bestROI: number
  totalProfit: number
}

export default function PublicProfilePage() {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [stats, setStats] = useState<PublicPortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()
  const params = useParams()
  const username = params.username as string

  useEffect(() => {
    if (!username) return
    fetchPublicProfile()
  }, [username])

  const fetchPublicProfile = async () => {
    // Chercher le profil par username
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, total_scans, investor_level, preferred_games, badges')
      .eq('username', decodeURIComponent(username))
      .single()

    if (!profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)

    // Stats portfolio publiques
    const { data: cards } = await supabase
      .from('portfolio')
      .select('status, psa_grade, sold_price, purchase_price, grading_cost')
      .eq('user_id', profileData.id)

    if (cards) {
      const totalCards = cards.length
      const gradedCards = cards.filter(c => c.status === 'graded' || c.status === 'sold').length
      const soldCards = cards.filter(c => c.status === 'sold')
      const bestROI = soldCards.length > 0
        ? Math.max(...soldCards.map(c => {
            const cost = (c.purchase_price || 0) + (c.grading_cost || 0)
            return cost > 0 ? Math.round(((c.sold_price || 0) - cost) / cost * 100) : 0
          }))
        : 0
      const totalProfit = soldCards.reduce((a, c) => a + ((c.sold_price || 0) - (c.purchase_price || 0) - (c.grading_cost || 0)), 0)

      setStats({ totalCards, gradedCards, bestROI, totalProfit: Math.round(totalProfit) })
    }

    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: '#F5B731', fontSize: 13, letterSpacing: 1 }}>LOADING...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 4, color: '#333' }}>404</div>
      <p style={{ color: '#555', fontFamily: 'var(--font-body)' }}>This trainer doesn't exist.</p>
      <button onClick={() => router.push('/')} style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        Go home
      </button>
    </div>
  )

  if (!profile) return null

  const userStats: UserStats = {
    totalScans: profile.total_scans || 0,
    totalROI: stats?.bestROI || 0,
    avgROI: 0,
    psA10Predictions: 0,
    correctGradePredictions: 0,
    portfolioCards: stats?.totalCards || 0,
    streak: 0,
    totalProfit: stats?.totalProfit || 0,
  }

  const level = getLevel(profile.total_scans || 0)
  const earnedBadges = getEarnedBadges(userStats)

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0A0A0B', zIndex: 50 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ height: 14, width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555', letterSpacing: 1 }}>PUBLIC PROFILE</span>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Hero profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '28px', borderRadius: 20, background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '3px solid rgba(245,183,49,0.3)' }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#0A0A0B' }}>{profile.username?.[0]?.toUpperCase()}</span>
            }
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 2, color: '#E8E8EC', margin: 0 }}>{profile.username}</h1>
              <div style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.2)' }}>
                <span style={{ fontSize: 10, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>LVL {level.level} · {level.title}</span>
              </div>
            </div>
            {profile.bio && <p style={{ fontSize: 13, color: '#666', fontFamily: 'var(--font-body)', margin: '0 0 10px' }}>{profile.bio}</p>}
            {profile.preferred_games && profile.preferred_games.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {profile.preferred_games.map((g, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#666', fontFamily: 'var(--font-mono)' }}>{g}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'TOTAL SCANS', value: profile.total_scans || 0, color: '#E8E8EC', icon: Zap },
            { label: 'CARDS', value: stats?.totalCards || 0, color: '#E8E8EC', icon: Package },
            { label: 'GRADED', value: stats?.gradedCards || 0, color: '#F5B731', icon: Trophy },
            { label: 'BEST ROI', value: `+${stats?.bestROI || 0}%`, color: '#22C55E', icon: TrendingUp },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div style={{ padding: '20px', borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>BADGES — {earnedBadges.length}/{BADGES.length}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {earnedBadges.map(badge => (
                <div key={badge.id} style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(245,183,49,0.08)', border: '1px solid rgba(245,183,49,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{badge.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#F5B731', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{badge.name}</div>
                    <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-body)' }}>{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total profit */}
        {stats && stats.totalProfit > 0 && (
          <div style={{ padding: '24px', borderRadius: 16, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#22C55E', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>TOTAL REALIZED PROFIT</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#22C55E', letterSpacing: 3 }}>+${stats.totalProfit}</div>
            <p style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)', marginTop: 8, marginBottom: 0 }}>From {stats.gradedCards} graded cards sold</p>
          </div>
        )}
      </div>
    </div>
  )
}
