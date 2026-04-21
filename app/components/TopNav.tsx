'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Zap, Menu, X, User, LogOut, Settings } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'

const NAV_LINKS = [
  { href: '/', label: 'Scan' },
  { href: '/feed', label: 'Feed' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/history', label: 'History' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/batch', label: 'Batch' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

export default function TopNav() {
  const { user: authUser } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const user = authUser ? { email: authUser.email || '' } : null

  useEffect(() => {
    if (authUser) {
      supabase.from('profiles').select('scan_credits').eq('id', authUser.id).single()
        .then(({ data: profile }) => { if (profile) setCredits(profile.scan_credits) })
    } else {
      setCredits(null)
    }
  }, [authUser])

  const hiddenOn = ['/onboarding', '/login']
  if (hiddenOn.some(p => pathname.startsWith(p))) return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <>
      <div style={{ height: "var(--nav-height)", flexShrink: 0 }} />
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 'max(env(safe-area-inset-top), 14px)', paddingBottom: '10px',
        paddingLeft: '14px', paddingRight: '14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(10,10,11,0.97)',
        backdropFilter: 'blur(20px)', zIndex: 50
      }}>
        {/* Logo */}
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#0A0A0B" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 2, color: '#E8E8EC' }} className="logo-text">GRADEORNOT</span>
        </button>
        <style>{`.logo-text { display: none; } @media (min-width: 400px) { .logo-text { display: inline !important; } }`}</style>

        {/* Desktop links */}
        <div style={{ display: 'none', alignItems: 'center', gap: 4 }} className="desktop-nav-links">
          <style>{`
            .desktop-nav-links { display: none; }
            @media (min-width: 640px) { .desktop-nav-links { display: flex !important; } }
          `}</style>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12,
              color: pathname === link.href ? '#F5B731' : '#666',
              background: pathname === link.href ? 'rgba(245,183,49,0.08)' : 'transparent',
              textDecoration: 'none', fontFamily: 'var(--font-body)',
              border: pathname === link.href ? '1px solid rgba(245,183,49,0.15)' : '1px solid transparent',
            }}>{link.label}</a>
          ))}
        </div>

        {/* Right — crédits + hamburger uniquement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {credits !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: credits > 2 ? 'rgba(245,183,49,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${credits > 2 ? 'rgba(245,183,49,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <Zap size={10} color={credits > 2 ? '#F5B731' : '#EF4444'} />
              <span style={{ fontSize: 11, color: credits > 2 ? '#F5B731' : '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{credits}</span>
            </div>
          )}

          {/* Auth desktop */}
          <div className="desktop-nav-links">
            {user ? (
              <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#666', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                <LogOut size={12} /> Sign out
              </button>
            ) : (
              <button onClick={() => router.push('/login')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                <User size={12} /> Sign in
              </button>
            )}
          </div>

          {/* Hamburger mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }} className="hamburger-btn">
            <style>{`.hamburger-btn { display: flex !important; } @media (min-width: 640px) { .hamburger-btn { display: none !important; } }`}</style>
            {menuOpen ? <X size={20} color="#F5B731" /> : <Menu size={20} color="#888" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — propre et complet */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 'calc(var(--nav-height))', left: 0, right: 0, zIndex: 49,
          background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              color: pathname === link.href ? '#F5B731' : '#E8E8EC',
              background: pathname === link.href ? 'rgba(245,183,49,0.06)' : 'transparent',
              textDecoration: 'none', fontSize: 15, fontFamily: 'var(--font-body)',
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>{link.label}</a>
          ))}
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {user ? (
              <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: '#EF4444', background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                <LogOut size={16} /> Sign out
              </button>
            ) : (
              <button onClick={() => { router.push('/login'); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: '#F5B731', background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                <User size={16} /> Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
