'use client'
import GamificationProfile from '../components/GamificationProfile'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Camera, Check, X, Zap, TrendingUp } from 'lucide-react'
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
  { id: 'casual', label: 'Casual Collector', emoji: '🎴', desc: 'I collect for fun' },
  { id: 'investor', label: 'TCG Investor', emoji: '📈', desc: 'I buy to sell' },
  { id: 'pro', label: 'Pro Trader', emoji: '💎', desc: 'This is my business' },
]

function EditableField({ label, value, onSave, multiline = false }: {
  label: string
  value: string
  onSave: (val: string) => void
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleSave = () => {
    onSave(draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(value)
    setEditing(false)
  }

  return (
    <div style={{ padding: '16px 20px', borderRadius: 12, background: '#111113', border: `1px solid ${editing ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.06)'}`, cursor: editing ? 'default' : 'pointer', transition: 'border-color 0.2s' }}
      onClick={() => !editing && setEditing(true)}>
      <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      {editing ? (
        <div>
          {multiline ? (
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} autoFocus
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#E8E8EC', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', resize: 'none' }} />
          ) : (
            <input value={draft} onChange={e => setDraft(e.target.value)} autoFocus
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#E8E8EC', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }} />
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <Check size={12} /> Save
            </button>
            <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 15, color: value ? '#E8E8EC' : '#444', fontFamily: 'var(--font-body)' }}>
          {value || `Click to add ${label.toLowerCase()}`}
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
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
    if (data) setProfile(data)
    setLoading(false)
  }

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateField = async (field: string, value: unknown) => {
    if (!user || !profile) return
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', user.id)
    if (!error) {
      setProfile({ ...profile, [field]: value })
      showSaved()
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateField('avatar_url', publicUrl)
    } catch (err) {
      console.error('Avatar upload error:', err)
    }
    setUploadingAvatar(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: '#F5B731', fontSize: 13, letterSpacing: 1 }}>LOADING...</div>
    </div>
  )

  if (!profile) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>
            <ArrowLeft size={16} /> Home
          </button>
          <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#555', letterSpacing: 1 }}>MY PROFILE</span>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 12, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>
            <Check size={12} /> SAVED
          </div>
        )}
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            <div style={{
              width: 88, height: 88, borderRadius: 22,
              background: profile.avatar_url ? 'transparent' : 'linear-gradient(135deg, #F5B731, #D4981A)',
              border: '2px solid rgba(245,183,49,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative'
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#0A0A0B' }}>
                  {profile.username?.[0] || '?'}
                </span>
              )}
              {uploadingAvatar && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#F5B731', animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: -4, right: -4,
              width: 28, height: 28, borderRadius: '50%',
              background: '#F5B731', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #0A0A0B'
            }}>
              <Camera size={13} color="#0A0A0B" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: 2, color: '#E8E8EC', marginBottom: 4 }}>
              {profile.username}
            </div>
            <div style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-body)', marginBottom: 8 }}>{profile.email}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(245,183,49,0.08)', border: '1px solid rgba(245,183,49,0.2)', fontSize: 11, color: '#F5B731', fontFamily: 'var(--font-mono)' }}>
                {profile.scan_credits} scans left
              </div>
              <div style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: '#666', fontFamily: 'var(--font-mono)' }}>
                {profile.total_scans} total scans
              </div>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <EditableField label="DISPLAY NAME" value={profile.full_name || ''} onSave={val => updateField('full_name', val)} />
          <EditableField label="BIO" value={profile.bio || ''} onSave={val => updateField('bio', val)} multiline />
        </div>

        {/* Preferred games */}
        <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>PREFERRED GAMES</div>
          <div style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-body)', marginBottom: 16 }}>
            Influences what we show you first in results
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {GAMES.map(game => {
              const selected = (profile.preferred_games || []).includes(game)
              return (
                <button key={game} onClick={() => {
                  const current = profile.preferred_games || []
                  const updated = current.includes(game) ? current.filter(g => g !== game) : [...current, game]
                  updateField('preferred_games', updated)
                }} style={{
                  padding: '10px 18px', borderRadius: 20, cursor: 'pointer',
                  background: selected ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? 'rgba(245,183,49,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: selected ? '#F5B731' : '#666', fontSize: 13, fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s'
                }}>
                  {selected ? '✓ ' : ''}{game}
                </button>
              )
            })}
          </div>
        </div>

        {/* Currency */}
        <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>PREFERRED CURRENCY</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CURRENCIES.map(cur => {
              const selected = profile.currency === cur
              return (
                <button key={cur} onClick={() => updateField('currency', cur)} style={{
                  padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                  background: selected ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selected ? 'rgba(245,183,49,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: selected ? '#F5B731' : '#666', fontSize: 13, fontFamily: 'var(--font-mono)',
                  transition: 'all 0.15s'
                }}>
                  {cur}
                </button>
              )
            })}
          </div>
        </div>

        {/* Investor level */}
        <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>INVESTOR LEVEL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {INVESTOR_LEVELS.map(level => {
              const selected = profile.investor_level === level.id
              return (
                <button key={level.id} onClick={() => updateField('investor_level', level.id)} style={{
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: selected ? 'rgba(245,183,49,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14
                }}>
                  <span style={{ fontSize: 24 }}>{level.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, color: selected ? '#F5B731' : '#E8E8EC', fontWeight: 500, fontFamily: 'var(--font-body)', marginBottom: 2 }}>{level.label}</div>
                    <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>{level.desc}</div>
                  </div>
                  {selected && <Check size={16} color="#F5B731" style={{ marginLeft: 'auto' }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '20px', borderRadius: 14, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>MY STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Scans remaining', value: profile.scan_credits, icon: <Zap size={14} color="#F5B731" /> },
              { label: 'Total scans done', value: profile.total_scans, icon: <TrendingUp size={14} color="#888" /> },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
                {s.icon}
                <div>
                  <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-body)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamification */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 3, color: '#E8E8EC', marginBottom: 16 }}>PROGRESS</div>
          <GamificationProfile stats={{
            totalScans: profile?.total_scans || 0,
            totalROI: 0,
            avgROI: 0,
            psA10Predictions: 0,
            correctGradePredictions: 0,
            portfolioCards: 0,
            streak: 0,
            totalProfit: 0,
          }} />
        </div>
      </div>
    </div>
  )
}
