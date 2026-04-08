'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Zap, Save, Edit2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  scan_credits: number
  total_scans: number
  preferred_games: string[]
  currency: string
  investor_level: string
  bio: string | null
}

const GAMES = ['Pokemon', 'Magic: The Gathering', 'One Piece', 'Yu-Gi-Oh', 'Lorcana']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD']
const INVESTOR_LEVELS = [
  { id: 'casual', label: 'Casual Collector', desc: 'I collect for fun' },
  { id: 'investor', label: 'TCG Investor', desc: 'I buy to sell' },
  { id: 'pro', label: 'Pro Trader', desc: 'This is my business' },
]

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Profile>>({})
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      fetchProfile(data.user.id)
    })
  }, [router])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      setForm(data)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      bio: form.bio,
      preferred_games: form.preferred_games,
      currency: form.currency,
      investor_level: form.investor_level,
    }).eq('id', user.id)

    if (!error) {
      setProfile({ ...profile, ...form })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const toggleGame = (game: string) => {
    const current = form.preferred_games || []
    const updated = current.includes(game)
      ? current.filter(g => g !== game)
      : [...current, game]
    setForm({ ...form, preferred_games: updated })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: '#F5B731', fontSize: 13, letterSpacing: 1 }}>LOADING...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>
            <ArrowLeft size={16} /> Home
          </button>
          <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#555', letterSpacing: 1 }}>PROFILE</span>
        </div>
        {saved && (
          <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 12, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>
            SAVED ✓
          </div>
        )}
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px 80px' }}>
        {/* Avatar + username */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #F5B731, #D4981A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontFamily: 'var(--font-display)'
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', borderRadius: 20, objectFit: 'cover' }} />
              : (profile?.username?.[0] || '?')}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, color: '#E8E8EC', marginBottom: 4 }}>
              {profile?.username}
            </div>
            <div style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)' }}>{profile?.email}</div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10,
            background: editing ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${editing ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: editing ? '#F5B731' : '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>
            <Edit2 size={13} /> {editing ? 'Cancel' : 'Edit profile'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'SCANS LEFT', value: profile?.scan_credits || 0, color: '#F5B731' },
            { label: 'TOTAL SCANS', value: profile?.total_scans || 0, color: '#E8E8EC' },
            { label: 'LEVEL', value: INVESTOR_LEVELS.find(l => l.id === profile?.investor_level)?.label.split(' ')[0] || 'Casual', color: '#E8E8EC' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Display name */}
          <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 12 }}>DISPLAY NAME</div>
            <input
              type="text"
              value={form.full_name || ''}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              disabled={!editing}
              placeholder="Your real name (optional)"
              style={{
                width: '100%', background: editing ? 'rgba(255,255,255,0.06)' : 'none',
                border: editing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                borderRadius: 8, padding: editing ? '10px 14px' : '0',
                color: '#E8E8EC', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none'
              }}
            />
          </div>

          {/* Bio */}
          <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 12 }}>BIO</div>
            <textarea
              value={form.bio || ''}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              disabled={!editing}
              placeholder="Tell us about your collection..."
              rows={3}
              style={{
                width: '100%', background: editing ? 'rgba(255,255,255,0.06)' : 'none',
                border: editing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                borderRadius: 8, padding: editing ? '10px 14px' : '0',
                color: '#E8E8EC', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Preferred games */}
          <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>PREFERRED GAMES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {GAMES.map(game => {
                const selected = (form.preferred_games || []).includes(game)
                return (
                  <button key={game} onClick={() => editing && toggleGame(game)} style={{
                    padding: '8px 16px', borderRadius: 20, cursor: editing ? 'pointer' : 'default',
                    background: selected ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selected ? 'rgba(245,183,49,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: selected ? '#F5B731' : '#666', fontSize: 13, fontFamily: 'var(--font-body)'
                  }}>
                    {game}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Currency */}
          <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>PREFERRED CURRENCY</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {CURRENCIES.map(cur => {
                const selected = form.currency === cur
                return (
                  <button key={cur} onClick={() => editing && setForm({ ...form, currency: cur })} style={{
                    padding: '8px 16px', borderRadius: 10, cursor: editing ? 'pointer' : 'default',
                    background: selected ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selected ? 'rgba(245,183,49,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: selected ? '#F5B731' : '#666', fontSize: 13, fontFamily: 'var(--font-mono)'
                  }}>
                    {cur}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Investor level */}
          <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>INVESTOR LEVEL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {INVESTOR_LEVELS.map(level => {
                const selected = form.investor_level === level.id
                return (
                  <button key={level.id} onClick={() => editing && setForm({ ...form, investor_level: level.id })} style={{
                    padding: '14px 16px', borderRadius: 12, cursor: editing ? 'pointer' : 'default', textAlign: 'left',
                    background: selected ? 'rgba(245,183,49,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selected ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    <div style={{ fontSize: 14, color: selected ? '#F5B731' : '#E8E8EC', fontWeight: 500, fontFamily: 'var(--font-body)', marginBottom: 2 }}>{level.label}</div>
                    <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>{level.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {editing && (
            <button onClick={handleSave} disabled={saving} style={{
              padding: '16px', borderRadius: 12,
              background: 'linear-gradient(135deg, #F5B731, #D4981A)',
              border: 'none', color: '#0A0A0B', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
