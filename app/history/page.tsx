'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Scan {
  id: string
  card_name: string
  game: string
  psa_grade_estimate: number
  raw_value: number
  recommendation: string
  created_at: string
  full_analysis: Record<string, unknown>
}

const VERDICT_CONFIG = {
  GRADE: { label: 'SEND IT', color: '#22C55E', icon: TrendingUp },
  SKIP: { label: 'SKIP IT', color: '#EF4444', icon: TrendingDown },
  MAYBE: { label: 'BORDERLINE', color: '#F5B731', icon: Minus },
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [filtered, setFiltered] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'GRADE' | 'SKIP' | 'MAYBE'>('all')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchScans(data.user.id)
    })
  }, [router])

  useEffect(() => {
    let result = scans
    if (search) result = result.filter(s => s.card_name.toLowerCase().includes(search.toLowerCase()))
    if (filter !== 'all') result = result.filter(s => s.recommendation === filter)
    setFiltered(result)
  }, [search, filter, scans])

  const fetchScans = async (userId: string) => {
    const { data } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) { setScans(data); setFiltered(data) }
    setLoading(false)
  }

  const handleScanClick = (scan: Scan) => {
    if (scan.full_analysis) {
      sessionStorage.setItem('gradeornot_result', JSON.stringify(scan.full_analysis))
      router.push('/results')
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: '#F5B731', fontSize: 13, letterSpacing: 1 }}>LOADING...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0A0A0B', zIndex: 50 }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          <ArrowLeft size={14} /> Home
        </button>
        <div style={{ height: 14, width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555', letterSpacing: 1 }}>SCAN HISTORY</span>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search size={14} color="#555" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search cards..." style={{ background: 'none', border: 'none', color: '#E8E8EC', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', width: '100%' }} />
          </div>
          {(['all', 'GRADE', 'SKIP', 'MAYBE'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 11,
              background: filter === f ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: filter === f ? '#F5B731' : '#555', fontFamily: 'var(--font-mono)'
            }}>
              {f === 'all' ? `ALL (${scans.length})` : f === 'GRADE' ? `✓ SEND (${scans.filter(s => s.recommendation === 'GRADE').length})` : f === 'SKIP' ? `✗ SKIP (${scans.filter(s => s.recommendation === 'SKIP').length})` : `~ MAYBE (${scans.filter(s => s.recommendation === 'MAYBE').length})`}
            </button>
          ))}
        </div>

        {/* Scans list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#555', fontFamily: 'var(--font-body)' }}>
              {scans.length === 0 ? 'No scans yet — scan your first card!' : 'No results for this search.'}
            </p>
            {scans.length === 0 && (
              <button onClick={() => router.push('/')} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Scan a card →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(scan => {
              const v = VERDICT_CONFIG[scan.recommendation as keyof typeof VERDICT_CONFIG] || VERDICT_CONFIG.MAYBE
              const VIcon = v.icon
              return (
                <div key={scan.id} onClick={() => handleScanClick(scan)} style={{
                  padding: '16px 20px', borderRadius: 14, background: '#111113',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: scan.full_analysis ? 'pointer' : 'default'
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${v.color === '#22C55E' ? '34,197,94' : v.color === '#EF4444' ? '239,68,68' : '245,183,49'},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <VIcon size={16} color={v.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.card_name}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{scan.game} · PSA {scan.psa_grade_estimate} est. · ${scan.raw_value}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: v.color, fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: 2 }}>{v.label}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>{new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
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
