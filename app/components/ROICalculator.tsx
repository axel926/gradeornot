'use client'
import { useState, useEffect } from 'react'
import { Calculator, ChevronDown, ChevronUp, MapPin } from 'lucide-react'

interface ROICalculatorProps {
  cardName: string
  rawValue: number
  gradedValues: { PSA10: number; PSA9: number; PSA8: number }
  psaGrade: number
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
}

// Vrais tarifs PSA 2024
const PSA_TIERS = [
  { name: 'Economy', cost: 25, turnaround: '100+ days', minValue: 0, maxValue: 499 },
  { name: 'Regular', cost: 50, turnaround: '60-120 days', minValue: 0, maxValue: 999 },
  { name: 'Express', cost: 150, turnaround: '10 days', minValue: 300 },
  { name: 'Super Express', cost: 500, turnaround: '2 days', minValue: 1000 },
]

const BGS_TIERS = [
  { name: 'Economy', cost: 22, turnaround: '90 days', minValue: 0 },
  { name: 'Regular', cost: 40, turnaround: '45 days', minValue: 0 },
  { name: 'Express', cost: 100, turnaround: '10 days', minValue: 0 },
]

const CGC_TIERS = [
  { name: 'Economy', cost: 12, turnaround: '60-80 days', minValue: 0 },
  { name: 'Regular', cost: 25, turnaround: '30-45 days', minValue: 0 },
  { name: 'Express', cost: 50, turnaround: '10 days', minValue: 0 },
]

// Frais d'envoi estimés par pays
const SHIPPING_COSTS: Record<string, { toGrader: number; fromGrader: number; label: string }> = {
  'FR': { toGrader: 45, fromGrader: 35, label: 'France' },
  'DE': { toGrader: 42, fromGrader: 32, label: 'Germany' },
  'UK': { toGrader: 38, fromGrader: 28, label: 'United Kingdom' },
  'US': { toGrader: 20, fromGrader: 15, label: 'United States' },
  'CA': { toGrader: 25, fromGrader: 20, label: 'Canada' },
  'JP': { toGrader: 55, fromGrader: 45, label: 'Japan' },
  'AU': { toGrader: 60, fromGrader: 50, label: 'Australia' },
  'OTHER': { toGrader: 50, fromGrader: 40, label: 'Other' },
}

const PLATFORM_FEES = {
  ebay: { label: 'eBay', fee: 13.25 },
  tcgplayer: { label: 'TCGPlayer', fee: 10.25 },
  cardmarket: { label: 'Cardmarket', fee: 5 },
}

function CostRow({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <div style={{ fontSize: 12, color: highlight ? '#E8E8EC' : '#888', fontFamily: 'var(--font-body)', fontWeight: highlight ? 600 : 400 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: '#444', fontFamily: 'var(--font-body)' }}>{sub}</div>}
      </div>
      <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: highlight ? '#F5B731' : '#E8E8EC', fontWeight: highlight ? 700 : 600 }}>${value.toFixed(2)}</span>
    </div>
  )
}

export default function ROICalculator({ cardName, rawValue, gradedValues, psaGrade, gradeProbabilities }: ROICalculatorProps) {
  const [expanded, setExpanded] = useState(true)
  const [selectedService, setSelectedService] = useState<'PSA' | 'BGS' | 'CGC'>('PSA')
  const [selectedTierIndex, setSelectedTierIndex] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState('FR')
  const [selectedPlatform, setSelectedPlatform] = useState<'ebay' | 'tcgplayer' | 'cardmarket'>('ebay')
  const [purchasePrice, setPurchasePrice] = useState(rawValue)

  useEffect(() => { setPurchasePrice(rawValue) }, [rawValue])

  const tiers = selectedService === 'PSA' ? PSA_TIERS : selectedService === 'BGS' ? BGS_TIERS : CGC_TIERS
  const tier = tiers[selectedTierIndex] || tiers[0]
  const shipping = SHIPPING_COSTS[selectedCountry]
  const platform = PLATFORM_FEES[selectedPlatform]

  // Vrais coûts
  const gradingFee = tier.cost
  const shippingTo = shipping.toGrader
  const shippingFrom = shipping.fromGrader
  const insurance = Math.round(purchasePrice * 0.015 * 100) / 100
  const totalCost = purchasePrice + gradingFee + shippingTo + shippingFrom + insurance

  // Valeur attendue pondérée
  const expectedValue =
    (gradedValues.PSA10 * gradeProbabilities.psa10 / 100) +
    (gradedValues.PSA9 * gradeProbabilities.psa9 / 100) +
    (gradedValues.PSA8 * gradeProbabilities.psa8 / 100) +
    (rawValue * 0.85 * gradeProbabilities.psa7 / 100)

  const netProceeds = (v: number) => Math.round(v * (1 - platform.fee / 100) * 100) / 100
  const netExpected = netProceeds(expectedValue)
  const netProfit = Math.round((netExpected - totalCost) * 100) / 100
  const roi = totalCost > 0 ? Math.round((netProfit / totalCost) * 100 * 10) / 10 : 0
  const breakEven = Math.round(totalCost / (1 - platform.fee / 100) * 100) / 100

  const profitColor = netProfit >= 0 ? '#22C55E' : '#EF4444'

  const gradeResults = [
    { grade: 'PSA 10', value: gradedValues.PSA10, prob: gradeProbabilities.psa10 },
    { grade: 'PSA 9', value: gradedValues.PSA9, prob: gradeProbabilities.psa9 },
    { grade: 'PSA 8', value: gradedValues.PSA8, prob: gradeProbabilities.psa8 },
    { grade: 'PSA 7-', value: Math.round(rawValue * 0.85), prob: gradeProbabilities.psa7 },
  ].map(g => ({
    ...g,
    net: netProceeds(g.value),
    profit: Math.round((netProceeds(g.value) - totalCost) * 100) / 100,
    roi: Math.round(((netProceeds(g.value) - totalCost) / totalCost) * 100),
  }))

  return (
    <div style={{ borderRadius: 16, border: '1px solid rgba(245,183,49,0.2)', background: '#111113', overflow: 'hidden' }}>

      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,183,49,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={18} color="#F5B731" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: 2, color: '#E8E8EC' }}>ROI CALCULATOR</div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-body)' }}>Real costs · Real profit</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontFamily: 'var(--font-mono)', color: profitColor, fontWeight: 700 }}>{netProfit >= 0 ? '+' : ''}${netProfit}</div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>{roi}% ROI</div>
          </div>
          {expanded ? <ChevronUp size={16} color="#555" /> : <ChevronDown size={16} color="#555" />}
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, padding: '16px 24px 0' }}>
            {[
              { label: 'TOTAL COST', value: `$${totalCost.toFixed(0)}`, color: '#E8E8EC' },
              { label: 'EXPECTED VALUE', value: `$${expectedValue.toFixed(0)}`, color: '#F5B731' },
              { label: 'NET PROFIT', value: `${netProfit >= 0 ? '+' : ''}$${netProfit}`, color: profitColor },
              { label: 'BREAK-EVEN', value: `$${breakEven.toFixed(0)}`, color: '#888' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

            {/* Left — Configuration */}
            <div style={{ padding: '20px 24px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 16 }}>CONFIGURE</div>

              {/* Purchase price */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#888', fontFamily: 'var(--font-body)', marginBottom: 6 }}>Purchase price</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: 13, color: '#555' }}>$</span>
                  <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    style={{ background: 'none', border: 'none', color: '#E8E8EC', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none', width: '100%' }} />
                </div>
              </div>

              {/* Grading service */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#888', fontFamily: 'var(--font-body)', marginBottom: 8 }}>Grading service</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {(['PSA', 'BGS', 'CGC'] as const).map(s => (
                    <button key={s} onClick={() => { setSelectedService(s); setSelectedTierIndex(0) }} style={{
                      flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer',
                      background: selectedService === s ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedService === s ? 'rgba(245,183,49,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: selectedService === s ? '#F5B731' : '#666',
                      fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700
                    }}>{s}</button>
                  ))}
                </div>
                {/* Tiers réels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {tiers.map((t, i) => (
                    <button key={i} onClick={() => setSelectedTierIndex(i)} style={{
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      background: selectedTierIndex === i ? 'rgba(245,183,49,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedTierIndex === i ? 'rgba(245,183,49,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ fontSize: 12, color: selectedTierIndex === i ? '#E8E8EC' : '#666', fontFamily: 'var(--font-body)' }}>{t.name} · {t.turnaround}</span>
                      <span style={{ fontSize: 13, color: selectedTierIndex === i ? '#F5B731' : '#555', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${t.cost}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pays / Shipping */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <MapPin size={11} color="#555" />
                  <span style={{ fontSize: 11, color: '#888', fontFamily: 'var(--font-body)' }}>Your country</span>
                </div>
                <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#E8E8EC', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none'
                }}>
                  {Object.entries(SHIPPING_COSTS).map(([code, { label }]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Selling platform */}
              <div>
                <div style={{ fontSize: 11, color: '#888', fontFamily: 'var(--font-body)', marginBottom: 8 }}>Selling platform</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Object.entries(PLATFORM_FEES).map(([id, { label, fee }]) => (
                    <button key={id} onClick={() => setSelectedPlatform(id as typeof selectedPlatform)} style={{
                      flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer',
                      background: selectedPlatform === id ? 'rgba(245,183,49,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${selectedPlatform === id ? 'rgba(245,183,49,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: selectedPlatform === id ? '#F5B731' : '#666',
                      fontSize: 10, fontFamily: 'var(--font-body)'
                    }}>
                      {label}<br />
                      <span style={{ fontSize: 9, opacity: 0.7 }}>{fee}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Cost breakdown + Results */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>COST BREAKDOWN</div>

              <CostRow label="Purchase price" value={purchasePrice} />
              <CostRow label={`${selectedService} ${tier.name}`} value={gradingFee} sub={tier.turnaround} />
              <CostRow label="Shipping to grader" value={shippingTo} sub={`From ${SHIPPING_COSTS[selectedCountry].label}`} />
              <CostRow label="Shipping from grader" value={shippingFrom} />
              <CostRow label="Insurance (1.5%)" value={insurance} />
              <CostRow label="TOTAL INVESTED" value={totalCost} highlight />

              <div style={{ marginTop: 16, fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>PROFIT BY GRADE</div>

              {gradeResults.map((g, i) => {
                const positive = g.profit >= 0
                const color = positive ? '#22C55E' : '#EF4444'
                return (
                  <div key={i} style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{g.grade}</span>
                        <span style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }}>{g.prob}%</span>
                      </div>
                      <span style={{ fontSize: 15, fontFamily: 'var(--font-mono)', color, fontWeight: 700 }}>{positive ? '+' : ''}${g.profit}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#444', fontFamily: 'var(--font-body)' }}>
                      Sale ${g.value} → net ${g.net} · {g.roi >= 0 ? '+' : ''}{g.roi}% ROI
                    </div>
                    <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <div style={{ width: `${g.prob}%`, height: '100%', background: color, borderRadius: 2, opacity: 0.6 }} />
                    </div>
                  </div>
                )
              })}

              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginTop: 4 }}>
                <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>BREAK-EVEN PRICE</div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#888', fontWeight: 700 }}>${breakEven.toFixed(0)}</div>
                <div style={{ fontSize: 10, color: '#333', fontFamily: 'var(--font-body)', marginTop: 2 }}>Min. sale price after {platform.fee}% {platform.label} fee</div>
              </div>

              <p style={{ fontSize: 10, color: '#333', marginTop: 12, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
                Grade probabilities are statistical estimates. GradeOrNot provides decision support only.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
