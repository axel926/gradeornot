import { en } from './en'
import { fr } from './fr'

export type Lang = 'en' | 'fr'

export const translations = { en, fr }

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
