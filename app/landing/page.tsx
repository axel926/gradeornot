'use client'
import { useRouter } from 'next/navigation'
import { Zap, TrendingUp, Shield, BarChart2, Camera, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', color: '#E8E8EC' }}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(245,183,49,0.3); }
        .feature-card:hover { border-color: rgba(245,183,49,0.2) !important; transform: translateY(-2px); }
        .hero-cta, .feature-card { transition: all 0.2s ease; }
      `}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(10,10,11,0.95)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#0A0A0B" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 2 }}>GRADEORNOT</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => router.push('/login')} style={{ padding: '9px 20px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign in</button>
          <button onClick={() => router.push('/')} className="hero-cta" style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #F5B731, #D4981A)', border: 'none', color: '#0A0A0B', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Try free →</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(245,183,49,0.08)', border: '1px solid rgba(245,183,49,0.2)', marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'glow 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>REAL ROI · REAL DATA · NO GUESSWORK</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 10vw, 96px)', letterSpacing: 4, lineHeight: 0.95, marginBottom: 28 }}>
          <span style={{ background: 'linear-gradient(160deg, #FFFFFF 40%, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SHOULD YOU</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #FFD580, #F5B731, #D4981A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>GRADE IT?</span>
        </h1>
        <p style={{ fontSize: 18, color: '#888', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
          Scan your TCG card. Get the real grading cost, estimated PSA grade, live market prices, and a clear verdict — in seconds.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <button onClick={() => router.push('/')} className="hero-cta" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 14, background: 'linear-gradient(135deg, #F5B731, #D4981A)', border: 'none', color: '#0A0A0B', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <Camera size={18} /> Scan a card free
          </button>
          <button onClick={() => router.push('/login')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#E8E8EC', fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Create account <ArrowRight size={16} />
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#444', fontFamily: 'var(--font-body)' }}>5 free scans · No credit card required</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto 80px', padding: '0 40px' }}>
        <div style={{ borderRadius: 20, border: '1px solid rgba(245,183,49,0.2)', background: 'linear-gradient(180deg, #111113, #0A0A0B)', padding: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 auto', width: 100, height: 140, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 4s ease-in-out infinite' }}>
              <Camera size={28} color="#F5B731" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 10, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 2, marginBottom: 6 }}>POKEMON · HOLO RARE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, marginBottom: 12 }}>CHARIZARD</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'EST. PSA', value: '9.5', color: '#22C55E' },
                  { label: 'RAW VALUE', value: '$180', color: '#E8E8EC' },
                  { label: 'PSA 10', value: '$850', color: '#F5B731' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#555', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px 24px', borderRadius: 14, background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.25)', textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 9, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>VERDICT</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#22C55E', letterSpacing: 3 }}>SEND IT</div>
              <div style={{ fontSize: 11, color: '#22C55E', marginTop: 4 }}>+$312 profit</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto 80px', padding: '0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 3, marginBottom: 12 }}>BUILT FOR TCG INVESTORS</div>
          <p style={{ fontSize: 15, color: '#666', fontFamily: 'var(--font-body)' }}>Not for casual collectors. For people who treat grading like a business.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { icon: <Camera size={20} color="#F5B731" />, title: 'AI Card Scanner', desc: 'Claude Vision identifies your card, estimates grade, and detects issues — centering, surfaces, corners, edges.' },
            { icon: <TrendingUp size={20} color="#22C55E" />, title: 'Real Market Prices', desc: 'Live data from TCGPlayer, Scryfall, PriceCharting and eBay sold listings. No estimates — real sold prices.' },
            { icon: <BarChart2 size={20} color="#F5B731" />, title: 'ROI Calculator', desc: 'Input your costs. Get the exact break-even price, net profit per grade, and probability-weighted expected ROI.' },
            { icon: <Shield size={20} color="#22C55E" />, title: 'PSA · BGS · CGC', desc: 'Real pricing for all major graders. Economy to Super Express. All fees, all tiers, all turnarounds.' },
            { icon: <Zap size={20} color="#F5B731" />, title: 'Grade/Skip Verdict', desc: 'A clear SEND IT or SKIP IT decision based on 5 weighted criteria. No more guessing.' },
            { icon: <ArrowRight size={20} color="#22C55E" />, title: 'Portfolio Tracker', desc: 'Track every card — RAW, SENT, GRADED, SOLD. See your total P&L and optimize your next batch.' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{ padding: '24px', borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,183,49,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', marginBottom: 8, fontFamily: 'var(--font-body)' }}>{f.title}</div>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, margin: 0, fontFamily: 'var(--font-body)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto 80px', padding: '0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 3, marginBottom: 12 }}>SIMPLE PRICING</div>
          <p style={{ fontSize: 15, color: '#666', fontFamily: 'var(--font-body)' }}>Start free. Pay only when you need more scans.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { name: 'FREE', price: '$0', scans: '5 scans', features: ['Full analysis', 'ROI Calculator', 'Market prices', 'PDF export'], highlight: false },
            { name: 'STARTER', price: '€4.99', scans: '10 scans', features: ['Everything in Free', 'Portfolio tracker', 'Price alerts', 'Batch strategy'], highlight: false },
            { name: 'PRO', price: '€9.99', scans: '25 scans', features: ['Everything in Starter', 'Priority analysis', 'Scan history', 'CSV export'], highlight: true },
            { name: 'VAULT', price: '€19.99', scans: '60 scans', features: ['Everything in Pro', 'Best value', 'Bulk submissions', 'Early access'], highlight: false },
          ].map((p, i) => (
            <div key={i} style={{ padding: '24px', borderRadius: 16, background: p.highlight ? 'rgba(245,183,49,0.06)' : '#111113', border: `1px solid ${p.highlight ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.07)'}`, position: 'relative' }}>
              {p.highlight && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 20, background: '#F5B731', color: '#0A0A0B', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 1 }}>POPULAR</div>}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', color: p.highlight ? '#F5B731' : '#E8E8EC', fontWeight: 700, marginBottom: 4 }}>{p.price}</div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 20, fontFamily: 'var(--font-mono)' }}>{p.scans}</div>
              {p.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Check size={12} color="#22C55E" />
                  <span style={{ fontSize: 12, color: '#888', fontFamily: 'var(--font-body)' }}>{f}</span>
                </div>
              ))}
              <button onClick={() => router.push(i === 0 ? '/' : '/dashboard')} style={{ marginTop: 20, width: '100%', padding: '11px', borderRadius: 10, background: p.highlight ? 'linear-gradient(135deg, #F5B731, #D4981A)' : 'rgba(255,255,255,0.06)', border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)', color: p.highlight ? '#0A0A0B' : '#888', fontSize: 13, fontWeight: p.highlight ? 700 : 400, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {i === 0 ? 'Start free' : 'Get started'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto 80px', padding: '0 40px', textAlign: 'center' }}>
        <div style={{ padding: '48px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(245,183,49,0.08), rgba(245,183,49,0.03))', border: '1px solid rgba(245,183,49,0.2)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 3, marginBottom: 12 }}>READY TO INVEST SMARTER?</div>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 28, fontFamily: 'var(--font-body)' }}>Join TCG investors who stopped guessing and started grading with data.</p>
          <button onClick={() => router.push('/')} className="hero-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 14, background: 'linear-gradient(135deg, #F5B731, #D4981A)', border: 'none', color: '#0A0A0B', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <Zap size={18} /> Scan your first card free
          </button>
          <p style={{ fontSize: 11, color: '#333', marginTop: 14, fontFamily: 'var(--font-body)' }}>No account required · 5 free scans · Results in seconds</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={12} color="#0A0A0B" />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#555' }}>GRADEORNOT</span>
        </div>
        <p style={{ fontSize: 11, color: '#333', fontFamily: 'var(--font-body)', margin: 0 }}>Grade probabilities are statistical estimates. GradeOrNot provides decision support only.</p>
      </div>
    </div>
  )
}
