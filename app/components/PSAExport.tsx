'use client'
import { useState } from 'react'
import { Download, FileText, Package } from 'lucide-react'
import { generatePSASubmission, exportToCSV, downloadCSV } from '../lib/psa-export'
import type { PSASubmissionCard } from '../lib/psa-export'

interface PSAExportProps {
  cards: {
    card_name: string
    game: string
    set_name: string | null
    current_value: number | null
    purchase_price: number | null
    quantity: number
    status: string
  }[]
}

export default function PSAExport({ cards }: PSAExportProps) {
  const [showPreview, setShowPreview] = useState(false)

  // On ne prend que les cartes RAW — pas encore envoyées
  const rawCards = cards.filter(c => c.status === 'raw')

  if (rawCards.length === 0) return null

  // Convertir nos cartes en format PSA
  const psaCards: PSASubmissionCard[] = rawCards.map(c => ({
    cardName: c.card_name,
    game: c.game || 'Pokemon',
    setName: c.set_name || '',
    setNumber: '',
    year: '',
    language: 'English',
    version: 'Unlimited',
    estimatedValue: c.current_value || c.purchase_price || 0,
    gradingTier: 'Economy',
    quantity: c.quantity,
  }))

  const submission = generatePSASubmission(psaCards)

  const handleExport = () => {
    const csv = exportToCSV(submission)
    downloadCSV(csv, `PSA_Submission_${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div style={{ borderRadius: 16, background: '#111113', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: showPreview ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,183,49,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#F5B731" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 2, color: '#E8E8EC' }}>PSA SUBMISSION</div>
              <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-body)' }}>{rawCards.length} raw cards ready to submit</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowPreview(!showPreview)} style={{
              padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#888',
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}>
              {showPreview ? 'Hide' : 'Preview'}
            </button>
            <button onClick={handleExport} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.3)',
              color: '#F5B731', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div style={{ padding: '20px 24px' }}>

          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'TOTAL CARDS', value: submission.totalCards.toString() },
              { label: 'DECLARED VALUE', value: `$${submission.totalDeclaredValue.toFixed(0)}` },
              { label: 'RECOMMENDED TIER', value: submission.recommendedService },
              { label: 'EST. COST', value: `$${submission.estimatedCost}` },
              { label: 'TURNAROUND', value: submission.estimatedTurnaround },
            ].map((s, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#E8E8EC', fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Cards list */}
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 10 }}>CARDS IN SUBMISSION</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {submission.cards.map((card, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Package size={13} color="#555" />
                  <span style={{ fontSize: 13, color: '#E8E8EC', fontFamily: 'var(--font-body)' }}>{card.cardName}</span>
                  {card.quantity > 1 && <span style={{ fontSize: 11, color: '#555' }}>×{card.quantity}</span>}
                </div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#F5B731' }}>${card.estimatedValue}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: '#333', marginTop: 16, fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
            Export this CSV and upload it to <strong style={{ color: '#555' }}>collectors.psacard.com</strong> when creating your submission order.
          </p>
        </div>
      )}
    </div>
  )
}
