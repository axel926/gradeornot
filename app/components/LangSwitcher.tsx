'use client'
import { useState, useEffect } from 'react'
import { getLang, setLang, type Lang } from '../lib/i18n'

export default function LangSwitcher() {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(getLang())
  }, [])

  const toggle = () => {
    const next: Lang = lang === 'en' ? 'fr' : 'en'
    setLang(next)
    setLangState(next)
    window.location.reload()
  }

  return (
    <button onClick={toggle} style={{
      padding: '5px 10px', borderRadius: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#666', fontSize: 12, cursor: 'pointer',
      fontFamily: 'var(--font-mono)', letterSpacing: 1
    }}>
      {lang === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
    </button>
  )
}
