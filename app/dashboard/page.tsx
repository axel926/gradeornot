'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Zap, ArrowLeft, TrendingUp, TrendingDown, Package, Clock, CheckCircle, DollarSign } from 'lucide-react'
import MarketIndex from '../components/MarketIndex'
import Opportunities from '../components/Opportunities'
import WeeklyChallenges from '../components/WeeklyChallenges'
import { subscribeToNotifications } from '../lib/notifications'
import type { User } from '@supabase/supabase-js'

interface Profile {
  scan_credits: number
  total_scans: number
  username: string
  email: string
}

interface PortfolioStats {
  totalInvested: number
  currentValue: number
  realizedPnL: number
  unrealizedPnL: number
  totalPnL: number
  roiPercent: number
  cardsByStatus: { raw: number; sent: number; graded: number; sold: number }
  potential: number
  streak: number
}

const CREDIT_PACKS = [
  { name: 'STARTER', price: '€4.99', credits: 10, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER, tag: null },
  { name: 'PRO', price: '€9.99', credits: 25, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO, tag: 'POPULAR' },
  { name: 'VAULT', price: '€19.99', credits: 60, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VAULT, tag: 'BEST VALUE' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => subscribeToNotifications(), 3000)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchProfile(data.user.id)
      fetchPortfolioStats(data.user.id)
    })
  }, [router])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles')
      .select('scan_credits, total_scans, username, email')
      .eq('id', userId).single()
    if (data) setProfile(data)
    setLoading(false)
  }

  const fetchPortfolioStats = async (userId: string) => {
    const { data: cards } = await supabase.from('portfolio')
      .select('*').eq('user_id', userId)

    if (!cards) return

    // Calculs P&L
    const invested = cards.reduce((a, c) => a + ((c.purchase_price || 0) * c.quantity) + (c.grading_cost || 0), 0)
    const currentValue = cards.filter(c => c.status !== 'sold').reduce((a, c) => a + ((c.current_value || c.purchase_price || 0) * c.quantity), 0)
    const realizedPnL = cards.filter(c => c.status === 'sold').reduce((a, c) => a + (((c.sold_price || 0) - (c.purchase_price || 0)) * c.quantity - (c.grading_cost || 0)), 0)
    const unrealizedPnL = currentValue - cards.filter(c => c.status !== 'sold').reduce((a, c) => a + ((c.purchase_price || 0) * c.quantity) + (c.grading_cost || 0), 0)
    const totalPnL = realizedPnL + unrealizedPnL
    const roiPercent = invested > 0 ? Math.round((totalPnL / invested) * 100 * 10) / 10 : 0

    // Status breakdown
    const cardsByStatus = {
      raw: cards.filter(c => c.status === 'raw').length,
      sent: cards.filter(c => c.status === 'sent').length,
      graded: cards.filter(c => c.status === 'graded').length,
      sold: cards.filter(c => c.status === 'sold').length,
    }

    // Potentiel grading
    const potential = cards.filter(c => c.status === 'raw').reduce((a, c) => {
      const raw = c.current_value || c.purchase_price || 0
      const profit = raw * 4.5 * 0.8725 - raw - 90
      return a + Math.max(0, profit)
    }, 0)

    // Streak
    const { data: scans } = await supabase.from('scans').select('created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(30)

    let streak = 0
    if (scans && scans.length > 0) {
      const scanDays = [...new Set(scans.map(s => new Date(s.created_at).toDateString()))]
      let checkDate = new Date()
      for (const day of scanDays) {
        if (new Date(day).toDateString() === checkDate.toDateString()) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else break
      }
    }

    setStats({ totalInvested: Math.round(invested), currentValue: Math.round(currentValue), realizedPnL: Math.round(realizedPnL), unrealizedPnL: Math.round(unrealizedPnL), totalPnL: Math.round(totalPnL), roiPercent, cardsByStatus, potential: Math.round(potential), streak })
  }

  const handlePurchase = async (priceId: string | undefined) => {
    if (!priceId || !user) return
    setPurchasing(priceId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id })
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch { setPurchasing(null) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: '#F5B731', fontSize: 13, letterSpacing: 1 }}>LOADING...</div>
    </div>
  )

  const pnlPositive = (stats?.totalPnL || 0) >= 0

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: '#E8E8EC', marginBottom: 4 }}>
            {profile?.username || 'TRAINER'}
          </h1>
          <p style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)' }}>
            {profile?.total_scans || 0} total scans · {stats?.streak ? `🔥 ${stats.streak} day streak` : 'Start your streak today'}
          </p>
        </div>

        {/* Market Index */}
        <div style={{ marginBottom: 20 }}>
          <MarketIndex />
        </div>

        {/* Potentiel en attente */}
        {stats && stats.potential > 0 && (
          <div style={{ marginBottom: 20, padding: '20px 24px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(245,183,49,0.08), rgba(245,183,49,0.03))', border: '1px solid rgba(245,183,49,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>GRADING POTENTIAL IN YOUR PORTFOLIO</div>
                <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', color: '#F5B731', fontWeight: 700 }}>+${stats.potential.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{stats.cardsByStatus.raw} raw card{stats.cardsByStatus.raw > 1 ? 's' : ''} waiting</div>
              </div>
              <button onClick={() => router.push('/portfolio')} style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                View portfolio →
              </button>
            </div>
          </div>
        )}

        {/* P&L Dashboard */}
        {stats && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 3, color: '#E8E8EC', marginBottom: 12 }}>INVESTOR DASHBOARD</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'TOTAL INVESTED', value: `$${stats.totalInvested}`, color: '#E8E8EC', icon: DollarSign },
                { label: 'CURRENT VALUE', value: `$${stats.currentValue}`, color: '#F5B731', icon: Package },
                { label: 'UNREALIZED P&L', value: `${stats.unrealizedPnL >= 0 ? '+' : ''}$${stats.unrealizedPnL}`, color: stats.unrealizedPnL >= 0 ? '#22C55E' : '#EF4444', icon: TrendingUp },
                { label: 'REALIZED P&L', value: `${stats.realizedPnL >= 0 ? '+' : ''}$${stats.realizedPnL}`, color: stats.realizedPnL >= 0 ? '#22C55E' : '#EF4444', icon: CheckCircle },
                { label: 'TOTAL ROI', value: `${stats.roiPercent >= 0 ? '+' : ''}${stats.roiPercent}%`, color: pnlPositive ? '#22C55E' : '#EF4444', icon: TrendingUp },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Status pipeline */}
            <div style={{ padding: '16px 20px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 14 }}>CARD PIPELINE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {[
                  { label: 'RAW', count: stats.cardsByStatus.raw, color: '#888' },
                  { label: 'SENT', count: stats.cardsByStatus.sent, color: '#F5B731' },
                  { label: 'GRADED', count: stats.cardsByStatus.graded, color: '#22C55E' },
                  { label: 'SOLD', count: stats.cardsByStatus.sold, color: '#555' },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                    <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700, marginBottom: 4 }}>{s.count}</div>
                    <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{s.label}</div>
                    {i < 3 && <div style={{ position: 'absolute', right: 0, top: '30%', color: '#333', fontSize: 16 }}>→</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scans */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 3, color: '#E8E8EC', marginBottom: 12 }}>SCAN CREDITS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {CREDIT_PACKS.map((pack, i) => (
              <div key={i} style={{ padding: '20px', borderRadius: 14, background: pack.tag === 'POPULAR' ? 'rgba(245,183,49,0.06)' : '#111113', border: `1px solid ${pack.tag === 'POPULAR' ? 'rgba(245,183,49,0.25)' : 'rgba(255,255,255,0.07)'}`, position: 'relative' }}>
                {pack.tag && <div style={{ position: 'absolute', top: -10, left: 16, padding: '2px 10px', borderRadius: 20, background: '#F5B731', color: '#0A0A0B', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 1 }}>{pack.tag}</div>}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 2, color: '#E8E8EC', marginBottom: 4 }}>{pack.name}</div>
                <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', color: '#F5B731', fontWeight: 700, marginBottom: 4 }}>{pack.price}</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>{pack.credits} scans</div>
                <button onClick={() => handlePurchase(pack.priceId)} disabled={!!purchasing} style={{
                  width: '100%', padding: '10px', borderRadius: 8,
                  background: pack.tag === 'POPULAR' ? 'linear-gradient(135deg, #F5B731, #D4981A)' : 'rgba(255,255,255,0.06)',
                  border: pack.tag === 'POPULAR' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: pack.tag === 'POPULAR' ? '#0A0A0B' : '#888',
                  fontSize: 13, fontWeight: pack.tag === 'POPULAR' ? 700 : 400,
                  cursor: purchasing ? 'default' : 'pointer', fontFamily: 'var(--font-body)'
                }}>
                  {purchasing === pack.priceId ? 'Loading...' : 'Get started'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 3, color: '#E8E8EC', marginBottom: 12 }}>🔥 TOP OPPORTUNITIES</div>
          <Opportunities />
        </div>

        {/* Weekly Challenges */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 3, color: '#E8E8EC', marginBottom: 12 }}>🎮 WEEKLY CHALLENGES</div>
          <WeeklyChallenges />
        </div>

        {/* Quick actions */}
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 3, color: '#E8E8EC', marginBottom: 12 }}>QUICK ACTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'Scan a card', icon: '⚡', href: '/' },
            { label: 'Batch scan', icon: '📦', href: '/batch' },
            { label: 'Portfolio', icon: '💼', href: '/portfolio' },
            { label: 'Leaderboard', icon: '🏆', href: '/leaderboard' },
          ].map((a, i) => (
            <button key={i} onClick={() => router.push(a.href)} style={{
              padding: '16px', borderRadius: 12, background: '#111113',
              border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <span style={{ fontSize: 13, color: '#888', fontFamily: 'var(--font-body)' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
