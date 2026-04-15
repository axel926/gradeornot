import { en } from './en'
import { fr } from './fr'

export type Lang = 'en' | 'fr'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY'

export const translations = { en, fr }

export const CURRENCIES: Record<Currency, { symbol: string; label: string; rate: number }> = {
  USD: { symbol: '$', label: 'US Dollar', rate: 1 },
  EUR: { symbol: '€', label: 'Euro', rate: 0.92 },
  GBP: { symbol: '£', label: 'British Pound', rate: 0.79 },
  JPY: { symbol: '¥', label: 'Japanese Yen', rate: 149 },
}

export function t(lang: Lang, key: string): string {
  const keys = key.split('.')
  let result: unknown = translations[lang]
  for (const k of keys) {
    result = (result as Record<string, unknown>)?.[k]
  }
  return (result as string) || key
}

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem('gradeornot_lang') as Lang
  if (saved && ['en', 'fr'].includes(saved)) return saved
  const browser = navigator.language.slice(0, 2) as Lang
  return ['en', 'fr'].includes(browser) ? browser : 'en'
}

export function setLang(lang: Lang) {
  localStorage.setItem('gradeornot_lang', lang)
}

export function getCurrency(): Currency {
  if (typeof window === 'undefined') return 'USD'
  return (localStorage.getItem('gradeornot_currency') as Currency) || 
    (getLang() === 'fr' ? 'EUR' : 'USD')
}

export function setCurrency(currency: Currency) {
  localStorage.setItem('gradeornot_currency', currency)
}

// Convertit un prix USD vers la devise choisie
export function formatPrice(usdAmount: number, currency?: Currency): string {
  const curr = currency || getCurrency()
  const config = CURRENCIES[curr]
  const converted = Math.round(usdAmount * config.rate * 100) / 100
  if (curr === 'JPY') return `${config.symbol}${Math.round(converted).toLocaleString()}`
  return `${config.symbol}${converted.toFixed(2)}`
}
