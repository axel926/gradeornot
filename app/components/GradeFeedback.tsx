'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle, X } from 'lucide-react'

interface GradeFeedbackProps {
  cardId: string
  cardName: string
  game: string
  estimatedGrade: number | null
  estimatedRawValue: number | null
  userId: string
  type: 'graded' | 'sold'
  onClose: () => void
  onSave: () => void
}

export default function GradeFeedback({ cardId, cardName, game, estimatedGrade, estimatedRawValue, userId, type, onClose, onSave }: GradeFeedbackProps) {
  const [actualGrade, setActualGrade] = useState('')
  const [gradingService, setGradingService] = useState('PSA')
  const [salePrice, setSalePrice] = useState('')
  const [gradingCost, setGradingCost] = useState('')
  const [daysToGrade, setDaysToGrade] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const actualGradeNum = parseFloat(actualGrade) || null
      const salePriceNum = parseFloat(salePrice) || null
      const gradingCostNum = parseFloat(gradingCost) || null
      const rawValue = estimatedRawValue || 0
      const totalCost = rawValue + (gradingCostNum || 0)
      const actualROI = salePriceNum && totalCost > 0
        ? Math.round(((salePriceNum - totalCost) / totalCost) * 100 * 10) / 10
        : null

      // Sauvegarder le feedback
      await supabase.from('grade_feedback').insert({
        user_id: userId,
        card_name: cardName,
        game,
        estimated_grade: estimatedGrade,
        actual_grade: actualGradeNum,
        grading_service: gradingService,
        estimated_raw_value: rawValue,
        actual_sale_price: salePriceNum,
        actual_roi: actualROI,
        grading_cost: gradingCostNum,
        days_to_grade: parseInt(daysToGrade) || null,
      })

      // Ajouter dans cards_graded pour améliorer le modèle
      if (actualGradeNum) {
        await supabase.from('cards_graded').insert({
          card_name: cardName,
          game,
          estimated_grade: estimatedGrade,
          actual_grade: actualGradeNum,
          grading_service: gradingService,
          raw_value: rawValue,
          graded_value: salePriceNum,
        })
      }

      // Mettre à jour le portfolio
      const updateData: Record<string, unknown> = {}
      if (type === 'graded' && actualGradeNum) {
        updateData.final_grade = actualGradeNum
        updateData.final_grading_service = gradingService
        updateData.graded_date = new Date().toISOString().split('T')[0]
        updateData.is_graded = true
      }
      if (type === 'sold' && salePriceNum) {
        updateData.sold_price = salePriceNum
        updateData.sold_date = new Date().toISOString().split('T')[0]
        updateData.status = 'sold'
      }
      if (Object.keys(updateData).length > 0) {
        await supabase.from('portfolio').update(updateData).eq('id', cardId)
      }

      setSaved(true)
      setTimeout(() => { onSave(); onClose() }, 1500)
    } catch (err) {
      console.error('Feedback error:', err)
    }
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#111113', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 28, width: '100%', maxWidth: 440 }}>

        {saved ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="#22C55E" style={{ margin: '0 auto 16px', display: 'block' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 2, color: '#22C55E', marginBottom: 8 }}>SAVED!</div>
            <p style={{ fontSize: 13, color: '#666', fontFamily: 'var(--font-body)' }}>Thanks — this helps improve grade predictions for everyone.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: 2, color: '#E8E8EC', marginBottom: 4 }}>
                  {type === 'graded' ? 'GRADE RECEIVED' : 'CARD SOLD'}
                </div>
                <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-body)' }}>{cardName}</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {type === 'graded' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>ACTUAL GRADE</div>
                      <input type="number" step="0.5" min="1" max="10" value={actualGrade} onChange={e => setActualGrade(e.target.value)}
                        placeholder={estimatedGrade?.toString() || '9.5'} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8E8EC', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>SERVICE</div>
                      <select value={gradingService} onChange={e => setGradingService(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8E8EC', fontSize: 13, outline: 'none' }}>
                        <option>PSA</option><option>BGS</option><option>CGC</option>
                      </select>
                    </div>
                  </div>

                  {estimatedGrade && actualGrade && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: parseFloat(actualGrade) >= estimatedGrade ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${parseFloat(actualGrade) >= estimatedGrade ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                      <span style={{ fontSize: 12, color: parseFloat(actualGrade) >= estimatedGrade ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-body)' }}>
                        {parseFloat(actualGrade) >= estimatedGrade
                          ? `✓ Matches or beats estimate (est. ${estimatedGrade})`
                          : `✗ Below estimate (est. ${estimatedGrade}, got ${actualGrade})`}
                      </span>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>DAYS TO RECEIVE</div>
                    <input type="number" value={daysToGrade} onChange={e => setDaysToGrade(e.target.value)}
                      placeholder="e.g. 45" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8E8EC', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                  </div>
                </>
              )}

              <div>
                <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>
                  {type === 'sold' ? 'SALE PRICE ($)' : 'GRADING COST ($)'}
                </div>
                <input type="number" step="0.01" value={type === 'sold' ? salePrice : gradingCost}
                  onChange={e => type === 'sold' ? setSalePrice(e.target.value) : setGradingCost(e.target.value)}
                  placeholder="0.00" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8E8EC', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }} />
              </div>

              {type === 'sold' && salePrice && estimatedRawValue && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245,183,49,0.06)', border: '1px solid rgba(245,183,49,0.2)' }}>
                  <div style={{ fontSize: 11, color: '#F5B731', fontFamily: 'var(--font-mono)' }}>
                    Real ROI: {Math.round(((parseFloat(salePrice) - estimatedRawValue) / estimatedRawValue) * 100)}%
                  </div>
                </div>
              )}

              <button onClick={handleSave} disabled={saving} style={{
                padding: '13px', borderRadius: 10, marginTop: 4,
                background: 'linear-gradient(135deg, #F5B731, #D4981A)',
                border: 'none', color: '#0A0A0B', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-body)'
              }}>
                {saving ? 'Saving...' : 'Save & update portfolio'}
              </button>

              <p style={{ fontSize: 11, color: '#333', textAlign: 'center', margin: 0, fontFamily: 'var(--font-body)' }}>
                Your data helps improve grade predictions for the community
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
