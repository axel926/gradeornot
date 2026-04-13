'use client'
import { useState } from 'react'
import { Share2, Download, Copy, Check } from 'lucide-react'

interface ShareCardProps {
  cardName: string
  game: string
  verdict: string
  roi: number
  netProfit: number
  psaGrade: number
  rawValue: number
}

export default function ShareCard({ cardName, game, verdict, roi, netProfit, psaGrade, rawValue }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateImage = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardName, game, verdict, roi, netProfit, psaGrade, rawValue })
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setImgUrl(url)
    } catch {}
    setLoading(false)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://gradeornot.vercel.app\n${cardName} — ${verdict === 'GRADE' ? 'SEND IT' : verdict === 'SKIP' ? 'SKIP IT' : 'BORDERLINE'} | ${roi >= 0 ? '+' : ''}${roi}% ROI | ${netProfit >= 0 ? '+' : ''}$${netProfit} profit\nAnalyzed with GradeOrNot`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadImage = () => {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = `GradeOrNot_${cardName.replace(/\s+/g, '_')}.svg`
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {!imgUrl ? (
        <button onClick={generateImage} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
          borderRadius: 12, background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#888',
          fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)'
        }}>
          <Share2 size={15} />
          {loading ? 'Generating...' : 'Generate share card'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <img src={imgUrl} alt="Share card" style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={downloadImage} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 10, background: 'rgba(245,183,49,0.1)',
              border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731',
              fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}>
              <Download size={14} /> Download
            </button>
            <button onClick={copyLink} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#22C55E' : '#888',
              fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
