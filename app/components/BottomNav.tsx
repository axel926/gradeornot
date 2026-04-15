'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Package, BarChart2, Users, Clock } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Scan' },
  { href: '/feed', icon: Users, label: 'Feed' },
  { href: '/portfolio', icon: Package, label: 'Portfolio' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/dashboard', icon: BarChart2, label: 'Dashboard' },
]

export default function BottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  // On n'affiche pas la bottom nav sur certaines pages
  const hiddenOn = ['/onboarding', '/login', '/results', '/batch']
  if (hiddenOn.some(p => pathname.startsWith(p))) return null

  return (
    <>
      {/* Espace pour que le contenu ne soit pas caché derrière la nav */}
      <div style={{ height: 80 }} className="bottom-nav-spacer" />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,11,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 0 env(safe-area-inset-bottom)',
        display: 'none', // Caché sur desktop
      }} className="bottom-nav">
        <style>{`
          @media (max-width: 640px) {
            .bottom-nav { display: flex !important; }
            .bottom-nav-spacer { display: block !important; }
          }
          @media (min-width: 641px) {
            .bottom-nav-spacer { display: none !important; }
          }
        `}</style>

        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const needsLogin = ['/portfolio', '/history', '/dashboard'].includes(item.href)

            return (
              <button
                key={item.href}
                onClick={() => {
                  if (needsLogin && !isLoggedIn) {
                    router.push('/login')
                  } else {
                    router.push(item.href)
                  }
                }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '6px 16px', borderRadius: 12, background: 'none', border: 'none',
                  cursor: 'pointer', flex: 1,
                  opacity: needsLogin && !isLoggedIn ? 0.4 : 1,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isActive ? 'rgba(245,183,49,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  <Icon size={20} color={isActive ? '#F5B731' : '#555'} />
                </div>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
                  color: isActive ? '#F5B731' : '#444',
                  fontWeight: isActive ? 700 : 400
                }}>
                  {item.label.toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
