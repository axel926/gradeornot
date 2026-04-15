'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { TrendingUp, TrendingDown, Package, ArrowRight } from 'lucide-react'

interface PortfolioWidgetProps {
  user: { id: string } | null
  profile: { scan_credits: number; total_scans: number; username: string } | null
}

interface PortfolioStats {
  totalCards: number
  totalValue: number
  totalPnL: number
  rawCards: number
}

export default function PortfolioWidget({ user, profile }: PortfolioWidgetProps) {
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    fetchStats(user.id)
  }, [user])

  const fetchStats = async (userId: string) => {
    const { data: cards } = await supabase
      .from('portfolio')
      .select('purchase_price, current_value, grading_cost, status, quantity')
      .eq('user_id', userId)

    if (!cards || cards.length === 0) return

    const totalCards = cards.reduce((a, c) => a + c.quantity, 0)
    const invested = cards.reduce((a, c) => a + ((c.purchase_price || 0) * c.quantity) + (c.grading_cost || 0), 0)
    const totalValue = cards.filter(c => c.status !== 'sold').reduce((a, c) => a + ((c.current_value || c.purchase_price || 0) * c.quantity), 0)
    const totalPnL = totalValue - invested
    const rawCards = cards.filter(c => c.status === 'raw').length

    setStats({ totalCards, totalValue: Math.round(totalValue), totalPnL: Math.round(totalPnL), rawCards })
  }

  // Non connecté
  if (!user) {
    return (
      <div style={{ padding: '20px 24px', borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Track your collection</div>
          <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>Sign in to see your portfolio P&L, grading pipeline and opportunities</div>
        </div>
        <button onClick={() => router.push('/login')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, flexShrink: 0 }}>
          Sign in <ArrowRight size={13} />
        </button>
      </div>
    )
  }

  // Connecté mais portfolio vide
  if (!stats || stats.totalCards === 0) {
    return (
      <div style={{ padding: '20px 24px', borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Package size={20} color="#555" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Your portfolio is empty</div>
            <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>Add cards to track your P&L</div>
          </div>
        </div>
        <button onClick={() => router.push('/portfolio')} style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(245,183,49,0.08)', border: '1px solid rgba(245,183,49,0.2)', color: '#F5B731', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
          Add cards →
        </button>
      </div>
    )
  }

  const pnlPositive = stats.totalPnL >= 0

  return (
    <div onClick={() => router.push('/portfolio')} style={{ padding: '16px 20px', borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>YOUR PORTFOLIO</div>
        <span style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-body)' }}>Tap to view →</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'CARDS', value: stats.totalCards.toString(), color: '#E8E8EC' },
          { label: 'VALUE', value: `$${stats.totalValue}`, color: '#F5B731' },
          { label: 'P&L', value: `${pnlPositive ? '+' : ''}$${stats.totalPnL}`, color: pnlPositive ? '#22C55E' : '#EF4444' },
          { label: 'RAW', value: stats.rawCards.toString(), color: '#888' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
