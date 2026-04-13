'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Zap, TrendingUp, TrendingDown, Minus, Package } from 'lucide-react'

interface CardResult {
  id: string
  fileName: string
  status: 'pending' | 'analyzing' | 'done' | 'error'
  cardName?: string
  game?: string
  psaGrade?: number
  rawValue?: number
  verdict?: 'GRADE' | 'SKIP' | 'MAYBE'
  roi?: number
  netProfit?: number
  error?: string
  _fullResult?: Record<string, unknown>
}

export default function BatchPage() {
  const [cards, setCards] = useState<CardResult[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const router = useRouter()

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const newCards: CardResult[] = Array.from(files).slice(0, 10).map(file => ({
      id: Math.random().toString(36).slice(2),
      fileName: file.name,
      status: 'pending',
      _file: file,
    } as CardResult & { _file: File }))
    setCards(prev => [...prev, ...newCards])
  }, [])

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id))
  }

  const analyzeAll = async () => {
    if (analyzing || cards.length === 0) return
    setAnalyzing(true)

    for (const card of cards) {
      if (card.status !== 'pending') continue

      setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'analyzing' } : c))

      try {
        const file = (card as CardResult & { _file: File })._file
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1])
          }
          reader.readAsDataURL(file)
        })

        const mimeType = file.type || 'image/jpeg'

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType })
        })

        if (!res.ok) throw new Error('Analysis failed')
        const data = await res.json()
        const analysis = data.analysis

        const fullResult = { ...data, imagePreview: URL.createObjectURL(file) }
        setCards(prev => prev.map(c => c.id === card.id ? {
          ...c,
          status: 'done',
          cardName: analysis.cardName,
          game: analysis.game,
          psaGrade: analysis.estimatedPSAGrade,
          rawValue: analysis.estimatedRawValue,
          verdict: analysis.gradingRecommendation,
          roi: data.gradingAnalysis ? (Object.values(data.gradingAnalysis)[0] as {bestTier: {roi: number; profit: number}})?.bestTier?.roi : 0,
          netProfit: data.gradingAnalysis ? (Object.values(data.gradingAnalysis)[0] as {bestTier: {roi: number; profit: number}})?.bestTier?.profit : 0,
          _fullResult: fullResult,
        } : c))
      } catch {
        setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'error', error: 'Analysis failed' } : c))
      }
    }

    setAnalyzing(false)
  }

  const pendingCount = cards.filter(c => c.status === 'pending').length
  const doneCount = cards.filter(c => c.status === 'done').length
  const gradeCount = cards.filter(c => c.verdict === 'GRADE').length
  const skipCount = cards.filter(c => c.verdict === 'SKIP').length

  const VERDICT_CONFIG = {
    GRADE: { label: 'SEND IT', color: '#22C55E', icon: TrendingUp },
    SKIP: { label: 'SKIP IT', color: '#EF4444', icon: TrendingDown },
    MAYBE: { label: 'BORDERLINE', color: '#F5B731', icon: Minus },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0A0A0B', zIndex: 50 }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
          <ArrowLeft size={14} /> Home
        </button>
        <div style={{ height: 14, width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555', letterSpacing: 1 }}>BATCH SCAN</span>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 3, color: '#E8E8EC', marginBottom: 8 }}>BATCH SCAN</h1>
          <p style={{ fontSize: 14, color: '#666', fontFamily: 'var(--font-body)' }}>Upload up to 10 cards at once — analyze them all in one go.</p>
        </div>

        {/* Stats si résultats */}
        {doneCount > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'ANALYZED', value: doneCount, color: '#E8E8EC' },
              { label: 'SEND IT', value: gradeCount, color: '#22C55E' },
              { label: 'SKIP IT', value: skipCount, color: '#EF4444' },
              { label: 'BORDERLINE', value: doneCount - gradeCount - skipCount, color: '#F5B731' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 12, background: '#111113', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        <div
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          onDragOver={e => e.preventDefault()}
          style={{ borderRadius: 16, border: '2px dashed rgba(245,183,49,0.2)', background: 'rgba(245,183,49,0.02)', padding: '32px', textAlign: 'center', marginBottom: 20, cursor: 'pointer' }}
          onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.multiple = true; input.accept = 'image/*'; input.onchange = e => handleFiles((e.target as HTMLInputElement).files); input.click() }}
        >
          <Upload size={28} color="#F5B731" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
          <div style={{ fontSize: 14, color: '#888', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Drop card photos here or click to browse</div>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--font-mono)' }}>Up to 10 cards · JPG, PNG, WEBP</div>
        </div>

        {/* Cards list */}
        {cards.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {cards.map(card => {
                const v = card.verdict ? VERDICT_CONFIG[card.verdict] : null
                const VIcon = v?.icon

                return (
                  <div key={card.id} style={{
                    padding: '16px 20px', borderRadius: 14, background: '#111113',
                    border: `1px solid ${card.status === 'done' && v ? `rgba(${v.color === '#22C55E' ? '34,197,94' : v.color === '#EF4444' ? '239,68,68' : '245,183,49'},0.2)` : 'rgba(255,255,255,0.06)'}`,
                    display: 'flex', alignItems: 'center', gap: 16
                  }}>

                    {/* Status indicator */}
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: card.status === 'analyzing' ? 'rgba(245,183,49,0.1)' : card.status === 'done' && v ? `rgba(${v.color === '#22C55E' ? '34,197,94' : v.color === '#EF4444' ? '239,68,68' : '245,183,49'},0.1)` : 'rgba(255,255,255,0.04)' }}>
                      {card.status === 'pending' && <Package size={16} color="#555" />}
                      {card.status === 'analyzing' && (
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#F5B731', animation: 'spin 1s linear infinite' }} />
                      )}
                      {card.status === 'done' && v && VIcon && <VIcon size={16} color={v.color} />}
                      {card.status === 'error' && <X size={16} color="#EF4444" />}
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {card.status === 'pending' && (
                        <div style={{ fontSize: 13, color: '#666', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.fileName}</div>
                      )}
                      {card.status === 'analyzing' && (
                        <div style={{ fontSize: 13, color: '#F5B731', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>ANALYZING...</div>
                      )}
                      {card.status === 'done' && (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8EC', marginBottom: 2, fontFamily: 'var(--font-body)' }}>{card.cardName}</div>
                          <div style={{ fontSize: 11, color: '#555' }}>{card.game} · PSA {card.psaGrade} est. · Raw ${card.rawValue}</div>
                        </>
                      )}
                      {card.status === 'error' && (
                        <div style={{ fontSize: 13, color: '#EF4444', fontFamily: 'var(--font-body)' }}>Analysis failed — try again</div>
                      )}
                    </div>

                    {card.status === 'done' && v && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: v.color, fontWeight: 700, marginBottom: 2 }}>{v.label}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>{card.roi ? `${card.roi >= 0 ? '+' : ''}${card.roi}% ROI` : ''}</div>
                      </div>
                    )}

                    {card.status === 'pending' && (
                      <button onClick={() => removeCard(card.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {pendingCount > 0 && (
              <button onClick={analyzeAll} disabled={analyzing} style={{
                width: '100%', padding: '16px', borderRadius: 14,
                background: analyzing ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #F5B731, #D4981A)',
                border: 'none', color: analyzing ? '#555' : '#0A0A0B',
                fontSize: 15, fontWeight: 700, cursor: analyzing ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <Zap size={16} />
                {analyzing ? 'Analyzing...' : `Analyze ${pendingCount} card${pendingCount > 1 ? 's' : ''}`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
