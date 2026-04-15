'use client'
import { Zap, TrendingUp, Shield, BarChart2, Camera, Package } from 'lucide-react'

// Cette page génère des visuels pour l'App Store
// On peut prendre des screenshots de chaque section

const SCREENSHOTS = [
  {
    id: 'hero',
    title: 'Scan & Get Your Verdict',
    subtitle: 'Point. Scan. Know in seconds.',
    content: (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, letterSpacing: 4, lineHeight: 0.95, marginBottom: 24 }}>
          <span style={{ background: 'linear-gradient(160deg, #FFFFFF 40%, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>GRADE</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #FFD580, #F5B731, #D4981A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>OR NOT.</span>
        </div>
        <div style={{ padding: '20px', borderRadius: 20, border: '2px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: '#22C55E', letterSpacing: 4 }}>SEND IT</div>
          <div style={{ fontSize: 16, color: '#22C55E', marginTop: 4 }}>+$312 expected profit · +42% ROI</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[{ label: 'NET PROFIT', value: '+$312' }, { label: 'ROI', value: '+42%' }, { label: 'BREAK-EVEN', value: '$213' }].map((s, i) => (
            <div key={i} style={{ padding: '14px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: i === 0 ? '#22C55E' : i === 1 ? '#F5B731' : '#888', fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'roi',
    title: 'Real ROI Calculator',
    subtitle: 'Every cost included. No surprises.',
    content: (
      <div style={{ padding: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: '#E8E8EC', marginBottom: 20 }}>ROI CALCULATOR</div>
        {[
          { label: 'Purchase price', value: '$180' },
          { label: 'PSA grading fee', value: '$50' },
          { label: 'Shipping', value: '$40' },
          { label: 'eBay fees (13.25%)', value: '-$37' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#888', fontFamily: 'var(--font-body)' }}>{item.label}</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#E8E8EC' }}>{item.value}</span>
          </div>
        ))}
        <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#22C55E', fontFamily: 'var(--font-body)', fontWeight: 600 }}>NET PROFIT</span>
          <span style={{ fontSize: 28, fontFamily: 'var(--font-mono)', color: '#22C55E', fontWeight: 700 }}>+$312</span>
        </div>
      </div>
    )
  },
  {
    id: 'portfolio',
    title: 'Track Your Collection',
    subtitle: 'RAW → SENT → GRADED → SOLD',
    content: (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'INVESTED', value: '$1,240' },
            { label: 'VALUE', value: '$1,890' },
            { label: 'P&L', value: '+$650' },
            { label: 'ROI', value: '+52%' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '12px 8px', borderRadius: 10, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: '#444', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: i === 2 || i === 3 ? '#22C55E' : '#E8E8EC', fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
        {[
          { name: 'Charizard Base Set', status: 'GRADED', grade: 'PSA 9', value: '$420', pnl: '+$240' },
          { name: 'Blastoise Base Set', status: 'SENT', grade: null, value: '$180', pnl: null },
          { name: 'Mewtwo Base Set', status: 'RAW', grade: null, value: '$95', pnl: '+$15' },
        ].map((card, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
            <div style={{ padding: '3px 8px', borderRadius: 20, background: card.status === 'GRADED' ? 'rgba(34,197,94,0.1)' : card.status === 'SENT' ? 'rgba(245,183,49,0.1)' : 'rgba(136,136,136,0.1)', border: `1px solid ${card.status === 'GRADED' ? 'rgba(34,197,94,0.2)' : card.status === 'SENT' ? 'rgba(245,183,49,0.2)' : 'rgba(136,136,136,0.2)'}`, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: card.status === 'GRADED' ? '#22C55E' : card.status === 'SENT' ? '#F5B731' : '#888', fontFamily: 'var(--font-mono)' }}>{card.status}</span>
            </div>
            <span style={{ flex: 1, fontSize: 13, color: '#E8E8EC', fontFamily: 'var(--font-body)' }}>{card.name}</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#F5B731' }}>{card.value}</span>
            {card.pnl && <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#22C55E' }}>{card.pnl}</span>}
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'opportunities',
    title: 'Auto-Detected Opportunities',
    subtitle: 'The market scanned. For you.',
    content: (
      <div style={{ padding: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 3, color: '#E8E8EC', marginBottom: 20 }}>🔥 TOP OPPORTUNITIES</div>
        {[
          { name: 'Charizard Base Set', roi: '+187%', raw: '$180', psa10: '$850', score: 92 },
          { name: 'Umbreon VMAX', roi: '+94%', raw: '$85', psa10: '$340', score: 78 },
          { name: 'Rayquaza VMAX', roi: '+67%', raw: '$65', psa10: '$220', score: 71 },
        ].map((opp, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: 14, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 9, color: '#22C55E', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>#{i+1} OPPORTUNITY · SCORE {opp.score}/100</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)' }}>{opp.name}</div>
              </div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: '#22C55E', fontWeight: 700 }}>{opp.roi}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>RAW</div>
                <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: '#E8E8EC' }}>{opp.raw}</div>
              </div>
              <div style={{ padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>PSA 10</div>
                <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: '#F5B731' }}>{opp.psa10}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  },
]

export default function ScreenshotsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 3, color: '#E8E8EC', marginBottom: 8, textAlign: 'center' }}>APP STORE SCREENSHOTS</h1>
      <p style={{ fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 40, fontFamily: 'var(--font-body)' }}>Take screenshots of each card below for App Store submission</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, maxWidth: 1400, margin: '0 auto' }}>
        {SCREENSHOTS.map(screenshot => (
          <div key={screenshot.id}>
            <div style={{ marginBottom: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)' }}>{screenshot.title}</div>
              <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>{screenshot.subtitle}</div>
            </div>
            {/* Format iPhone 6.5" = 390x844 */}
            <div style={{ width: 390, margin: '0 auto', background: '#0A0A0B', borderRadius: 40, border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
              {/* Status bar */}
              <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#E8E8EC', fontWeight: 600 }}>9:41</span>
                <div style={{ width: 120, height: 30, background: '#0A0A0B', borderRadius: 20, border: '2px solid rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 16, height: 10, borderRadius: 2, border: '1.5px solid #E8E8EC', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 1, background: '#E8E8EC', borderRadius: 1 }} />
                  </div>
                </div>
              </div>
              {/* Nav */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #F5B731, #D4981A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={14} color="#0A0A0B" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 2, color: '#E8E8EC' }}>GRADEORNOT</span>
              </div>
              {/* Content */}
              <div style={{ minHeight: 600 }}>
                {screenshot.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
