'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Zap, Menu, X, User, LogOut } from 'lucide-react'
import LangSwitcher from './LangSwitcher'
import { supabase } from '../lib/supabase'

const NAV_LINKS = [
  { href: '/', label: 'Scan' },
  { href: '/batch', label: 'Batch' },
  { href: '/feed', label: 'Feed' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/history', label: 'History' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

export default function TopNav() {
  const [user, setUser] = useState<null | { email: string }>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email || '' })
        supabase.from('profiles').select('scan_credits').eq('id', data.user.id).single()
          .then(({ data: profile }) => { if (profile) setCredits(profile.scan_credits) })
      }
    })
  }, [pathname])

  // Cacher la nav sur certaines pages — après les hooks
  const hiddenOn = ['/onboarding', '/login']
  if (hiddenOn.some(p => pathname.startsWith(p))) return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, background: 'rgba(10,10,11,0.97)',
        backdropFilter: 'blur(20px)', zIndex: 50
      }}>
        {/* Logo */}
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="#0A0A0B" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: '#E8E8EC' }}>GRADEORNOT</span>
        </button>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav-links">
          <style>{`
            .desktop-nav-links { display: none; }
            @media (min-width: 900px) { .desktop-nav-links { display: flex !important; } }
          `}</style>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12,
              color: pathname === link.href ? '#F5B731' : '#666',
              background: pathname === link.href ? 'rgba(245,183,49,0.08)' : 'transparent',
              textDecoration: 'none', fontFamily: 'var(--font-body)',
              border: pathname === link.href ? '1px solid rgba(245,183,49,0.15)' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}>{link.label}</a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Credits */}
          {credits !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: credits > 2 ? 'rgba(245,183,49,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${credits > 2 ? 'rgba(245,183,49,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <Zap size={10} color={credits > 2 ? '#F5B731' : '#EF4444'} />
              <span style={{ fontSize: 11, color: credits > 2 ? '#F5B731' : '#EF4444', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{credits}</span>
            </div>
          )}

          <LangSwitcher />
          {/* Auth button */}
          {user ? (
            <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#666', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <LogOut size={12} /> Sign out
            </button>
          ) : (
            <button onClick={() => router.push('/login')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
              <User size={12} /> Sign in
            </button>
          )}

          {/* Hamburger mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 6 }} className="hamburger-btn">
            <style>{`.hamburger-btn { display: flex !important; } @media (min-width: 900px) { .hamburger-btn { display: none !important; } }`}</style>
            {menuOpen ? <X size={18} color="#F5B731" /> : <Menu size={18} color="#888" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '8px 0', position: 'sticky', top: 57, zIndex: 49 }}>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '12px 20px',
              color: pathname === link.href ? '#F5B731' : '#E8E8EC',
              background: pathname === link.href ? 'rgba(245,183,49,0.06)' : 'transparent',
              textDecoration: 'none', fontSize: 14, fontFamily: 'var(--font-body)',
              borderBottom: '1px solid rgba(255,255,255,0.04)'
            }}>{link.label}</a>
          ))}
        </div>
      )}
    </>
  )
}
