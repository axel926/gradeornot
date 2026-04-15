'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Zap } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIAssistantProps {
  cardName: string
  game: string
  psaGrade: number
  rawValue: number
  verdict: string
  roi: number
  netProfit: number
  keyIssues: string[]
  gradeProbabilities: { psa10: number; psa9: number; psa8: number; psa7: number }
}

const QUICK_QUESTIONS = [
  'What are the main risks?',
  'Which grader should I use?',
  'Should I wait for a better price?',
  'What grade am I likely to get?',
  'How do I improve my ROI?',
]

export default function AIAssistant({ cardName, game, psaGrade, rawValue, verdict, roi, netProfit, keyIssues, gradeProbabilities }: AIAssistantProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      // Message proactif basé sur le verdict
      const opening = verdict === 'GRADE'
        ? `✅ **${cardName}** looks like a solid grading opportunity (+${roi}% ROI). The main upside is PSA 9/10 value. Want me to explain the risks or compare grading services?`
        : verdict === 'SKIP'
        ? `⚠️ I'd skip grading **${cardName}** for now — the ROI is ${roi}% which doesn't justify the risk. Want to know what would need to change for it to make sense?`
        : `🤔 **${cardName}** is borderline — ${roi}% ROI is marginal. It could go either way. Want me to walk you through the key factors?`

      setMessages([{ role: 'assistant', content: opening }])
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const userLang = typeof window !== 'undefined' ? localStorage.getItem('gradeornot_lang') || 'en' : 'en'
    const context = `
You are a TCG grading investment assistant specializing in PSA, BGS and CGC grading ROI analysis.

Card being analyzed:
- Name: ${cardName} (${game})
- Estimated PSA grade: ${psaGrade}
- Raw market value: $${rawValue}
- Verdict: ${verdict}
- Expected ROI: ${roi}%
- Expected net profit: $${netProfit}
- Key issues detected: ${keyIssues.length > 0 ? keyIssues.join(', ') : 'none'}
- Grade probabilities: PSA 10: ${gradeProbabilities.psa10}%, PSA 9: ${gradeProbabilities.psa9}%, PSA 8: ${gradeProbabilities.psa8}%, PSA 7-: ${gradeProbabilities.psa7}%

Rules:
- ALWAYS respond in ${userLang === 'fr' ? 'French' : 'English'} regardless of the question language
- Be concise and direct — max 80 words
- Only reference data provided above, never invent prices
- Focus on actionable advice for a TCG investor
- If asked about grading services, compare PSA/BGS/CGC costs and turnaround
- If asked about timing, consider that grading takes 30-120 days minimum
`

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F5B731, #D4981A)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(245,183,49,0.4)'
        }}>
          <MessageCircle size={22} color="#0A0A0B" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          width: 340, height: 480, borderRadius: 20,
          background: '#111113', border: '1px solid rgba(245,183,49,0.2)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,183,49,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} color="#F5B731" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8EC', fontFamily: 'var(--font-body)' }}>Grading Assistant</div>
                <div style={{ fontSize: 10, color: '#555', fontFamily: 'var(--font-mono)' }}>{cardName}</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? 'rgba(245,183,49,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(245,183,49,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  fontSize: 13, color: '#E8E8EC', lineHeight: 1.5, fontFamily: 'var(--font-body)'
                }}>
                  {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5B731', animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
                <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  padding: '5px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#888',
                  fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)'
                }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask anything..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E8E8EC', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none' }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() ? 'rgba(245,183,49,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${input.trim() ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.08)'}`, color: input.trim() ? '#F5B731' : '#444', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
