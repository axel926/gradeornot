'use client'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>

      <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, animation: 'float 3s ease-in-out infinite' }}>
        <Zap size={36} color="#0A0A0B" />
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, letterSpacing: 4, color: 'rgba(255,255,255,0.06)', lineHeight: 1, marginBottom: 16 }}>404</div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: '#E8E8EC', marginBottom: 12 }}>PAGE NOT FOUND</h1>
      <p style={{ fontSize: 14, color: '#555', fontFamily: 'var(--font-body)', marginBottom: 32, maxWidth: 320, lineHeight: 1.6 }}>
        This card doesn't exist in our database. Maybe it was misidentified?
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => router.push('/')} style={{ padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #F5B731, #D4981A)', border: 'none', color: '#0A0A0B', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Scan a card
        </button>
        <button onClick={() => router.back()} style={{ padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Go back
        </button>
      </div>
    </div>
  )
}
