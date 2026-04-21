'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ExternalLink, Clock, Package, Shield, ChevronDown, ChevronUp, Database, BarChart2 } from 'lucide-react'
import GradeAnalysis from '../components/GradeAnalysis'
import MarketDataComponent from '../components/MarketData'
import ExportPDF from '../components/ExportPDF'
import ROICalculator from '../components/ROICalculator'
import DecisionEngine from '../components/DecisionEngine'
import ScenarioSimulator from '../components/ScenarioSimulator'
import AIAssistant from '../components/AIAssistant'
import InvestmentScoreComponent from '../components/InvestmentScore'
import { getTimingRecommendation } from '../lib/timing-engine'
import { calculateFinancialScore } from '../lib/financial-scoring'
import OvervalueAlert from '../components/OvervalueAlert'
import ErrorBoundary from '../components/ErrorBoundary'
import DataSources from '../components/DataSources'
import PSAPopulation from '../components/PSAPopulation'
import ShareCard from '../components/ShareCard'

interface Tier {
  name: string
  turnaround: string
  cost: number
  shippingTotal: number
  gradedValue: number
  profit: number
  roi: number
  worthIt: boolean
}

interface GradingService {
  name: string
  url: string
  logo: string
  tiers: Tier[]
  bestTier: Tier
}

interface Analysis {
  cardName: string
  game: string
  setName: string
  year: string
  rarity: string
  language: string
  version: string
  setNumber: string
  condition: { overall: string; centering: string; surfaces: string; corners: string; edges: string }
  criteriaScores: { centering: number; surfaces: number; corners: number; edges: number }
  estimatedPSAGrade: number
  gradeConfidence: number
  estimatedRawValue: number
  estimatedGradedValue: { PSA10: number; PSA9: number; PSA8: number }
  gradingRecommendation: 'GRADE' | 'SKIP' | 'MAYBE'
  recommendationReason: string
  keyIssues: string[]
  realPriceFound: boolean
  priceSource: string
  realPriceData: { low: number | null; mid: number | null; high: number | null; market: number | null } | null
  cardImage: string | null
  gradeProbabilities?: { psa10: number; psa9: number; psa8: number; psa7: number }
  psaPopulation?: { total: number; byGrade: Record<string, number>; source: string } | null
  decisionScore?: number
  decisionConfidence?: number
  decisionRules?: { id: string; label: string; passed: boolean; value: string; weight: number; detail: string }[]
  cardValidation?: {
    validated: boolean
    needsConfirmation: boolean
    bestMatch: { name: string; setName: string; number: string; year: string; imageUrl: string | null; confidence: number } | null
    alternativeMatches: { name: string; setName: string; number: string; year: string; confidence: number }[]
  }
}

interface ResultData {
  analysis: Analysis
  gradingAnalysis: Record<string, GradingService>
  imagePreview: string
}

const VERDICT = {
  GRADE: { label: 'SEND IT', sub: 'Grading is worth it', color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', icon: TrendingUp, emoji: '🟢' },
  SKIP: { label: 'SKIP IT', sub: 'Not worth grading', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: TrendingDown, emoji: '🔴' },
  MAYBE: { label: 'BORDERLINE', sub: 'Marginal ROI — your call', color: '#F5B731', bg: 'rgba(245,183,49,0.08)', border: 'rgba(245,183,49,0.25)', icon: Minus, emoji: '🟡' },
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '16px 20px', background: open ? 'rgba(255,255,255,0.03)' : '#111113',
        border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: 2, color: open ? '#E8E8EC' : '#666' }}>{title}</span>
        {open ? <ChevronUp size={14} color="#555" /> : <ChevronDown size={14} color="#555" />}
      </button>
      {open && <div style={{ background: '#0D0D0F', padding: '20px' }}>{children}</div>}
    </div>
  )
}

function ServiceCard({ service }: { service: GradingService }) {
  const best = service.bestTier
  return (
    <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: '#111113', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: '#E8E8EC' }}>{service.logo}</div>
            <div style={{ fontSize: 11, color: '#555' }}>{service.name}</div>
          </div>
          <a href={service.url} target="_blank" rel="noopener noreferrer" style={{ color: '#F5B731', opacity: 0.6 }}>
            <ExternalLink size={13} />
          </a>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(245,183,49,0.05)', border: '1px solid rgba(245,183,49,0.12)' }}>
          <div style={{ fontSize: 9, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>BEST TIER</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8EC', marginBottom: 2 }}>{best.name}</div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#666' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> {best.turnaround}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Package size={9} /> +${best.shippingTotal}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: best.worthIt ? '#22C55E' : '#F5B731', fontWeight: 700 }}>${best.cost}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'COST', value: `$${best.cost + best.shippingTotal}` },
          { label: 'VALUE', value: `$${best.gradedValue}` },
          { label: 'PROFIT', value: `${best.profit >= 0 ? '+' : ''}$${best.profit}`, color: best.profit > 0 ? '#22C55E' : '#EF4444' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: s.color || '#E8E8EC', fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const [data, setData] = useState<ResultData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem('gradeornot_result')
    if (!stored) { router.push('/'); return }
    setData(JSON.parse(stored))
  }, [router])

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: '#F5B731', fontSize: 13, letterSpacing: 1 }}>LOADING...</div>
    </div>
  )

  const { analysis, gradingAnalysis, imagePreview } = data
  const v = VERDICT[analysis.gradingRecommendation]
  const VIcon = v.icon
  const displayImage = analysis.cardImage || imagePreview

  // Calcul ROI rapide pour le hero
  const bestService = Object.values(gradingAnalysis)[0]
  const best = bestService?.bestTier
  const quickROI = best ? best.roi : 0
  const financialScore = calculateFinancialScore({
    rawValue: analysis.estimatedRawValue,
    psa10Value: analysis.estimatedGradedValue.PSA10,
    roi: quickROI,
    volume7d: 0,
    volume30d: 0,
    trend7d: null,
    trend30d: null,
    gradeProbabilities: analysis.gradeProbabilities || { psa10: 5, psa9: 25, psa8: 30, psa7: 40 },
  })

  const timing = getTimingRecommendation({
    trend7d: null,
    trend30d: null,
    roi: quickROI,
    psaGrade: analysis.estimatedPSAGrade,
    rawValue: analysis.estimatedRawValue,
    volume7d: 0,
  })
  const quickProfit = best ? best.profit : 0
  const breakEven = best ? Math.round((best.cost + best.shippingTotal + analysis.estimatedRawValue) / (1 - 0.1325)) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <style>{`
        .res-grid { display: grid; grid-template-columns: 180px 1fr; gap: 20px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; }
        .svc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
        @media (max-width: 640px) {
          .res-grid { grid-template-columns: 1fr !important; }
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .svc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 20px 80px' }}>

        {/* ═══ HERO VERDICT ═══ */}
        <div style={{
          padding: '32px 28px', borderRadius: 20, marginBottom: 16,
          background: v.bg, border: `2px solid ${v.border}`,
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${v.bg}, transparent)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: `rgba(${v.color === '#22C55E' ? '34,197,94' : v.color === '#EF4444' ? '239,68,68' : '245,183,49'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${v.border}` }}>
              <VIcon size={32} color={v.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 3, marginBottom: 6 }}>VERDICT</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 7vw, 56px)', color: v.color, letterSpacing: 4, lineHeight: 1, marginBottom: 8 }}>{v.label}</div>
              <p style={{ fontSize: 13, color: '#999', margin: 0, lineHeight: 1.6, fontFamily: 'var(--font-body)', maxWidth: 480 }}>{analysis.recommendationReason}</p>
            </div>
          </div>
        </div>

        {/* ═══ DECISION ENGINE ═══ */}
        {analysis.decisionRules && analysis.decisionRules.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Section title="WHY THIS VERDICT" defaultOpen={true}>
              <DecisionEngine
                rules={analysis.decisionRules}
                verdict={analysis.gradingRecommendation}
              />
            </Section>
          </div>
        )}

        {/* ═══ INVESTMENT SCORE ═══ */}
        <div style={{ marginBottom: 16 }}>
          <InvestmentScoreComponent
            roi={quickROI}
            netProfit={quickProfit}
            psaGrade={analysis.estimatedPSAGrade}
            rawValue={analysis.estimatedRawValue}
            gradeProbabilities={analysis.gradeProbabilities || { psa10: 5, psa9: 25, psa8: 30, psa7: 40 }}
          />
        </div>

        {/* ═══ 3 KPIs CLÉS ═══ */}
        <div className="kpi-grid" style={{ marginBottom: 16 }}>
          {[
            { label: 'NET PROFIT', value: `${quickProfit >= 0 ? '+' : ''}$${quickProfit}`, sub: 'after all costs', color: quickProfit >= 0 ? '#22C55E' : '#EF4444' },
            { label: 'ROI', value: `${quickROI >= 0 ? '+' : ''}${quickROI}%`, sub: 'return on investment', color: quickROI >= 0 ? '#F5B731' : '#EF4444' },
            { label: 'BREAK-EVEN', value: `$${breakEven}`, sub: 'min. sale price', color: '#888' },
            { label: 'TIMING', value: timing.label, sub: timing.urgency + ' urgency', color: timing.color },
            { label: 'RISK', value: financialScore.riskLabel, sub: 'grade outcome risk', color: financialScore.riskLabel === 'LOW' ? '#22C55E' : financialScore.riskLabel === 'MEDIUM' ? '#F5B731' : '#EF4444' },
          ].map((k, i) => (
            <div key={i} style={{
              padding: '20px 16px', borderRadius: 14, background: '#111113',
              border: `1px solid ${i === 0 ? (quickProfit >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : 'rgba(255,255,255,0.07)'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 10 }}>{k.label}</div>
              <div style={{ fontSize: 30, fontFamily: 'var(--font-mono)', color: k.color, fontWeight: 700, marginBottom: 6, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: '#444', fontFamily: 'var(--font-body)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ═══ CARD + INFO ═══ */}
        <div className="res-grid" style={{ marginBottom: 16 }}>
          <div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(245,183,49,0.15)', background: '#111113' }}>
              <img src={displayImage} alt={analysis.cardName} style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: 260 }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 2, marginBottom: 4 }}>
                {analysis.game.toUpperCase()} · {analysis.rarity}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: 2, color: '#E8E8EC', margin: '0 0 4px', lineHeight: 1 }}>
                {analysis.cardName}
              </h1>
              <div style={{ fontSize: 12, color: '#555' }}>
                {[analysis.setName, analysis.setNumber, analysis.year, analysis.version, analysis.language].filter(Boolean).join(' · ')}
              </div>
            </div>

            {/* PSA Grade */}
            <div style={{ padding: '14px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 2 }}>EST. PSA GRADE</div>
                  <div style={{ fontSize: 40, fontFamily: 'var(--font-mono)', color: analysis.estimatedPSAGrade >= 9 ? '#22C55E' : '#F5B731', lineHeight: 1, fontWeight: 700 }}>
                    {analysis.estimatedPSAGrade}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>RAW VALUE</div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>${analysis.estimatedRawValue}</div>
                </div>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ width: `${(analysis.estimatedPSAGrade / 10) * 100}%`, height: '100%', background: analysis.estimatedPSAGrade >= 9 ? '#22C55E' : '#F5B731', borderRadius: 2 }} />
              </div>
            </div>

            {/* Graded values */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: 'PSA 10', value: `$${analysis.estimatedGradedValue.PSA10}` },
                { label: 'PSA 9', value: `$${analysis.estimatedGradedValue.PSA9}` },
                { label: 'PSA 8', value: `$${analysis.estimatedGradedValue.PSA8}` },
              ].map((v, i) => (
                <div key={i} style={{ padding: '10px', borderRadius: 10, textAlign: 'center', background: '#111113', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{v.label}</div>
                  <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{v.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SECTIONS EN ACCORDÉON ═══ */}

        <Section title="ROI CALCULATOR" defaultOpen={true}>
          {analysis.criteriaScores && (
            <ROICalculator
              cardName={analysis.cardName}
              rawValue={analysis.estimatedRawValue}
              gradedValues={analysis.estimatedGradedValue}
              psaGrade={analysis.estimatedPSAGrade}
              gradeProbabilities={analysis.gradeProbabilities || {
                psa10: Math.round(analysis.estimatedPSAGrade >= 9.5 ? 35 : analysis.estimatedPSAGrade >= 9 ? 15 : 5),
                psa9: Math.round(analysis.estimatedPSAGrade >= 9 ? 45 : 25),
                psa8: 20,
                psa7: 15,
              }}
            />
          )}
        </Section>

        <Section title="SCENARIO SIMULATION">
          <ScenarioSimulator
            rawValue={analysis.estimatedRawValue}
            gradedValues={analysis.estimatedGradedValue}
            gradeProbabilities={analysis.gradeProbabilities || { psa10: 5, psa9: 25, psa8: 20, psa7: 50 }}
            totalCost={analysis.estimatedRawValue + (best?.cost || 50) + (best?.shippingTotal || 40)}
            sellingFee={13.25}
          />
        </Section>

        <Section title="GRADING SERVICES">
          <div className="svc-grid">
            {Object.values(gradingAnalysis).map(service => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </Section>

        <Section title="VISUAL GRADE ANALYSIS">
          {analysis.criteriaScores && (
            <GradeAnalysis
              criteria={analysis.criteriaScores}
              psaGrade={analysis.estimatedPSAGrade}
              confidence={analysis.gradeConfidence}
              gradeProbabilities={analysis.gradeProbabilities}
              psaPopulation={analysis.psaPopulation}
            />
          )}
          {analysis.keyIssues && analysis.keyIssues.length > 0 && (
            <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ fontSize: 10, color: '#EF4444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>KEY ISSUES DETECTED</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {analysis.keyIssues.map((issue, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', color: '#FC8181' }}>{issue}</span>
                ))}
              </div>
            </div>
          )}
          {analysis.psaPopulation && (
            <div style={{ marginTop: 16 }}>
              <PSAPopulation population={analysis.psaPopulation} cardName={analysis.cardName} />
            </div>
          )}
        </Section>

        {/* Overvalue Alert */}
        {analysis.estimatedRawValue > 0 && (
          <div style={{ marginBottom: 16 }}>
            <OvervalueAlert
              cardName={analysis.cardName}
              game={analysis.game}
              currentPrice={analysis.estimatedRawValue}
            />
          </div>
        )}

        <Section title="MARKET DATA" defaultOpen={true}>
          <DataSources sources={[
            { name: analysis.priceSource || 'TCGPlayer', type: analysis.realPriceFound ? 'live' : 'estimated', detail: 'Raw card prices' },
            { name: 'PSA Pop Report', type: analysis.psaPopulation ? 'live' : 'estimated', detail: 'Grade probabilities' },
            { name: 'Grading fees', type: 'live', detail: 'PSA/BGS/CGC official rates' },
          ]} />
            <MarketDataComponent cardName={analysis.cardName} game={analysis.game} setName={analysis.setName} />
        </Section>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
          <ExportPDF analysis={analysis} gradingAnalysis={gradingAnalysis} imagePreview={imagePreview} />
          <ShareCard
            cardName={analysis.cardName}
            game={analysis.game}
            verdict={analysis.gradingRecommendation}
            roi={quickROI}
            netProfit={quickProfit}
            psaGrade={analysis.estimatedPSAGrade}
            rawValue={analysis.estimatedRawValue}
          />
          <button onClick={() => { sessionStorage.clear(); router.push('/') }} style={{
            padding: '11px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', color: '#666', fontSize: 13,
            cursor: 'pointer', fontFamily: 'var(--font-body)'
          }}>
            Scan another card
          </button>
        </div>

        {/* AI Assistant */}
        <ErrorBoundary>
        <AIAssistant
          cardName={analysis.cardName}
          game={analysis.game}
          psaGrade={analysis.estimatedPSAGrade}
          rawValue={analysis.estimatedRawValue}
          verdict={analysis.gradingRecommendation}
          roi={quickROI}
          netProfit={quickProfit}
          keyIssues={analysis.keyIssues || []}
          gradeProbabilities={analysis.gradeProbabilities || { psa10: 5, psa9: 25, psa8: 30, psa7: 40 }}
        />
        </ErrorBoundary>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#333', marginTop: 24, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
          Grade probabilities are statistical estimates. No tool or grading service can guarantee a specific grade outcome. GradeOrNot provides decision support only. <a href='/legal' style={{color: '#444', textDecoration: 'underline'}}>Terms & Privacy</a>
        </p>
      </div>
    </div>
  )
}
