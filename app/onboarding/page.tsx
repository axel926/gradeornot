'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, TrendingUp, Camera, ArrowRight, BarChart2 } from 'lucide-react'

const STEPS = [
  {
    id: 1,
    badge: 'STEP 1 OF 3',
    title: 'SCAN ANY\nTCG CARD',
    sub: 'Point your camera at a card. Our AI identifies it instantly — name, set, edition, condition.',
    visual: 'scan',
    cta: 'Show me how →',
  },
  {
    id: 2,
    badge: 'STEP 2 OF 3',
    title: 'GET THE\nREAL ROI',
    sub: 'Live market prices. Real grading costs. Probability-weighted profit — not estimates, not guesses.',
    visual: 'roi',
    cta: 'And then? →',
  },
  {
    id: 3,
    badge: 'STEP 3 OF 3',
    title: 'GRADE IT\nOR SKIP IT',
    sub: 'A clear verdict based on 5 criteria. You know exactly whether grading will make you money.',
    visual: 'verdict',
    cta: 'Scan my first card free',
  },
]

function ScanVisual() {
  return (
    <div style={{ position: 'relative', width: 220, height: 300, margin: '0 auto' }}>
      <style>{`@keyframes scan-line { 0% { top: 10%; } 100% { top: 90%; } }`}</style>
      {/* Card */}
      <div style={{ width: '100%', height: '100%', borderRadius: 16, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '2px solid rgba(245,183,49,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <Camera size={48} color="rgba(245,183,49,0.3)" />
        {/* Scan line */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #F5B731, transparent)', animation: 'scan-line 2s ease-in-out infinite alternate', boxShadow: '0 0 8px rgba(245,183,49,0.8)' }} />
        {/* Corner markers */}
        {[{ top: 8, left: 8 }, { top: 8, right: 8 }, { bottom: 8, left: 8 }, { bottom: 8, right: 8 }].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', width: 20, height: 20, ...pos, borderColor: '#F5B731', borderStyle: 'solid', borderWidth: i === 0 ? '2px 0 0 2px' : i === 1 ? '2px 2px 0 0' : i === 2 ? '0 0 2px 2px' : '0 2px 2px 0' }} />
        ))}
      </div>
      {/* Badge */}
      <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', padding: '6px 16px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 11, color: '#22C55E', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>AI IDENTIFYING...</span>
      </div>
    </div>
  )
}

function ROIVisual() {
  return (
    <div style={{ width: 280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { label: 'RAW VALUE', value: '$85', color: '#888' },
        { label: 'PSA 10 VALUE', value: '$340', color: '#F5B731' },
        { label: 'GRADING COST', value: '-$90', color: '#EF4444' },
        { label: 'NET PROFIT', value: '+$165', color: '#22C55E', big: true },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: item.big ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.big ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
          <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{item.label}</span>
          <span style={{ fontSize: item.big ? 20 : 16, fontFamily: 'var(--font-mono)', color: item.color, fontWeight: 700 }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function VerdictVisual() {
  return (
    <div style={{ width: 280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '24px', borderRadius: 16, background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 2, marginBottom: 8 }}>VERDICT</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#22C55E', letterSpacing: 4, marginBottom: 6 }}>SEND IT</div>
        <div style={{ fontSize: 13, color: '#22C55E' }}>+$165 expected profit</div>
      </div>
      {['ROI ≥ 30% ✓', 'Net profit > $20 ✓', 'Est. grade ≥ PSA 8 ✓'].map((rule, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}>
          <span style={{ fontSize: 13, color: '#22C55E', fontFamily: 'var(--font-body)' }}>{rule}</span>
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const current = STEPS[step]

  const handleDemo = () => {
    // On charge un résultat fictif pour montrer l'app en action
    const demoResult = {
      analysis: {
        cardName: 'Charizard',
        game: 'Pokemon',
        setName: 'Base Set',
        setNumber: '4/102',
        year: '1999',
        rarity: 'Holo Rare',
        language: 'English',
        version: 'Unlimited',
        condition: { overall: 'Near Mint', centering: 'Good', surfaces: 'Clean', corners: 'Sharp', edges: 'Clean' },
        criteriaScores: { centering: 8.5, surfaces: 9.0, corners: 8.5, edges: 9.0 },
        estimatedPSAGrade: 8.5,
        gradeConfidence: 78,
        estimatedRawValue: 180,
        estimatedGradedValue: { PSA10: 850, PSA9: 420, PSA8: 280 },
        gradingRecommendation: 'GRADE',
        recommendationReason: '3/5 criteria met. Expected ROI of 42% exceeds the 30% minimum — strong upside with PSA 9+ probability.',
        keyIssues: ['Slight left border wider than right (estimated 62/38 centering)'],
        realPriceFound: true,
        priceSource: 'TCGPlayer',
        realPriceData: { low: 92.59, mid: 159.99, market: 151.20, high: 209.81 },
        cardImage: null,
        gradeProbabilities: { psa10: 8, psa9: 35, psa8: 38, psa7: 19 },
        decisionRules: [
          { id: 'roi', label: 'ROI ≥ 30%', passed: true, value: '42%', weight: 30, detail: 'Expected ROI of 42% exceeds the 30% minimum threshold' },
          { id: 'profit', label: 'Net profit > $20', passed: true, value: '$68', weight: 25, detail: 'Expected net profit of $68 after all fees' },
          { id: 'grade', label: 'Est. grade ≥ PSA 7.5', passed: true, value: 'PSA 8.5', weight: 20, detail: 'Estimated grade of 8.5 is sufficient for grading to add value' },
          { id: 'probability', label: 'PSA 9+ probability ≥ 25%', passed: true, value: '43%', weight: 15, detail: '43% chance of PSA 9 or better — solid upside potential' },
          { id: 'value', label: 'Raw value ≥ $15', passed: false, value: '$180', weight: 10, detail: 'Raw value of $180 is sufficient' },
        ],
      },
      gradingAnalysis: {
        PSA: {
          name: 'PSA', url: 'https://www.psacard.com', logo: 'PSA',
          bestTier: { name: 'Regular', turnaround: '60-120 days', cost: 50, shippingTotal: 40, gradedValue: 280, profit: 68, roi: 42, worthIt: true },
          tiers: [{ name: 'Economy', turnaround: '100+ days', cost: 25, shippingTotal: 40, gradedValue: 280, profit: 93, roi: 58, worthIt: true }]
        }
      },
      imagePreview: 'https://images.pokemontcg.io/base1/4_hires.png'
    }
    localStorage.setItem('gradeornot_onboarded', 'true')
    sessionStorage.setItem('gradeornot_result', JSON.stringify(demoResult))
    router.push('/results')
  }

  const handleCTA = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem('gradeornot_onboarded', 'true')
      router.push('/')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '48px 24px 40px' }}>
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .step-content { animation: fade-up 0.4s ease; }
      `}</style>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? '#F5B731' : i < step ? 'rgba(245,183,49,0.4)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }} />
        ))}
      </div>

      {/* Content */}
      <div className="step-content" key={step} style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
        <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 2, marginBottom: 32 }}>{current.badge}</div>

        {/* Visual */}
        <div style={{ marginBottom: 40, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {step === 0 && <ScanVisual />}
          {step === 1 && <ROIVisual />}
          {step === 2 && <VerdictVisual />}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: 3, lineHeight: 1, color: '#E8E8EC', marginBottom: 16, whiteSpace: 'pre-line' }}>
          {current.title}
        </h1>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, fontFamily: 'var(--font-body)', marginBottom: 40 }}>
          {current.sub}
        </p>
      </div>

      {/* CTA */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <button onClick={handleCTA} style={{
          width: '100%', padding: '18px', borderRadius: 14,
          background: 'linear-gradient(135deg, #F5B731, #D4981A)',
          border: 'none', color: '#0A0A0B', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font-body)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          {step === STEPS.length - 1 ? <><Zap size={18} /> {current.cta}</> : <>{current.cta} <ArrowRight size={16} /></>}
        </button>
        {step === STEPS.length - 1 && (
          <button onClick={handleDemo} style={{ width: '100%', padding: '12px', marginTop: 10, background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#666', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            See a demo analysis first
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button onClick={() => { localStorage.setItem('gradeornot_onboarded', 'true'); router.push('/') }} style={{ width: '100%', padding: '12px', marginTop: 10, background: 'none', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Skip intro
          </button>
        )}
      </div>
    </div>
  )
}
