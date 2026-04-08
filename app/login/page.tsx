'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Zap, Mail, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSent(true); setLoading(false) }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)' }}>
          <ArrowLeft size={16} /> Back
        </button>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#0A0A0B" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 2, color: '#E8E8EC' }}>GRADEORNOT</span>
          </div>

          {!sent ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 3, color: '#E8E8EC', margin: '0 0 8px' }}>SIGN IN</h1>
              <p style={{ fontSize: 14, color: '#666', margin: '0 0 32px', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                5 free scans to start. No credit card required.
              </p>

              {/* Google button */}
              <button onClick={handleGoogle} disabled={googleLoading} style={{
                width: '100%', padding: '14px', borderRadius: 12, marginBottom: 16,
                background: '#fff', border: 'none',
                color: '#111', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: googleLoading ? 0.7 : 1
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
                </svg>
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>or use magic link</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Mail size={16} color="#555" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#E8E8EC', fontSize: 15, fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </div>

              <button onClick={handleLogin} disabled={loading || !email.trim()} style={{
                width: '100%', padding: '15px', borderRadius: 12,
                background: email.trim() ? 'linear-gradient(135deg, #F5B731, #D4981A)' : 'rgba(255,255,255,0.06)',
                border: 'none', color: email.trim() ? '#0A0A0B' : '#555',
                fontSize: 15, fontWeight: 700, cursor: email.trim() ? 'pointer' : 'default',
                fontFamily: 'var(--font-body)'
              }}>
                {loading ? 'Sending...' : 'Send magic link'}
              </button>

              {error && (
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 13, color: '#FC8181' }}>
                  {error}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Mail size={28} color="#22C55E" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: '#E8E8EC', margin: '0 0 12px' }}>CHECK YOUR EMAIL</h2>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, fontFamily: 'var(--font-body)', marginBottom: 32 }}>
                Magic link sent to <span style={{ color: '#F5B731' }}>{email}</span>.<br />
                Click it to sign in instantly.
              </p>
              <button onClick={() => setSent(false)} style={{
                padding: '12px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--font-body)'
              }}>
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
