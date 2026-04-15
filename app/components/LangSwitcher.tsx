'use client'
import { useState, useEffect } from 'react'
import { getLang, setLang, getCurrency, setCurrency, CURRENCIES, type Lang, type Currency } from '../lib/i18n'

export default function LangSwitcher() {
  const [lang, setLangState] = useState<Lang>('en')
  const [currency, setCurrencyState] = useState<Currency>('USD')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLangState(getLang())
    setCurrencyState(getCurrency())
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'en' ? 'fr' : 'en'
    const nextCurrency: Currency = next === 'fr' ? 'EUR' : 'USD'
    setLang(next)
    setCurrency(nextCurrency)
    setLangState(next)
    setCurrencyState(nextCurrency)
    window.location.reload()
  }

  const handleCurrency = (curr: Currency) => {
    setCurrency(curr)
    setCurrencyState(curr)
    setOpen(false)
    window.location.reload()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
      {/* Lang toggle */}
      <button onClick={toggleLang} style={{
        padding: '5px 10px', borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#666', fontSize: 11, cursor: 'pointer',
        fontFamily: 'var(--font-mono)', letterSpacing: 1
      }}>
        {lang === 'en' ? '🇫🇷' : '🇬🇧'}
      </button>

      {/* Currency picker */}
      <button onClick={() => setOpen(!open)} style={{
        padding: '5px 10px', borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#666', fontSize: 11, cursor: 'pointer',
        fontFamily: 'var(--font-mono)', letterSpacing: 1
      }}>
        {CURRENCIES[currency].symbol} {currency}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4,
          background: '#111113', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, overflow: 'hidden', zIndex: 200, minWidth: 140
        }}>
          {(Object.entries(CURRENCIES) as [Currency, typeof CURRENCIES[Currency]][]).map(([code, config]) => (
            <button key={code} onClick={() => handleCurrency(code)} style={{
              width: '100%', padding: '10px 14px', background: currency === code ? 'rgba(245,183,49,0.08)' : 'none',
              border: 'none', color: currency === code ? '#F5B731' : '#888',
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)',
              textAlign: 'left', display: 'flex', justifyContent: 'space-between'
            }}>
              <span>{config.symbol} {code}</span>
              <span style={{ fontSize: 10, color: '#444' }}>{config.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
