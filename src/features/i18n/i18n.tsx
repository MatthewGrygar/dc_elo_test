import React, { createContext, useContext, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DICT, type DictKey, type Lang } from './dict'

const STORAGE_KEY = 'dc_elo_lang'

export const LANGS: Lang[] = ['cs', 'en', 'fr']
export const LANG_SEGMENTS: Record<Lang, 'cz' | 'eng' | 'fr'> = { cs: 'cz', en: 'eng', fr: 'fr' }

export function langToSegment(lang: Lang) {
  return LANG_SEGMENTS[LANGS.includes(lang) ? lang : 'en']
}

export function segmentToLang(seg: string): Lang | null {
  if (seg === 'cz') return 'cs'
  if (seg === 'eng') return 'en'
  if (seg === 'fr') return 'fr'
  return null
}

export function detectPreferredLang(): Lang {
  const nav = (navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language) || ''
  const v = nav.toLowerCase()
  if (v.startsWith('cs') || v.startsWith('sk') || v.startsWith('cz')) return 'cs'
  if (v.startsWith('fr')) return 'fr'
  return 'en'
}


type I18nCtx = {
  lang: Lang
  seg: 'cz' | 'eng' | 'fr'
  t: (key: DictKey) => string
  setLang: (lang: Lang) => void
}

const Ctx = createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const stored = (localStorage.getItem(STORAGE_KEY) as Lang | null) || null
  // We no longer infer language from path segments (we use runtime basename for GH Pages).
  const initialLang: Lang = (stored && LANGS.includes(stored) ? stored : detectPreferredLang())

  const [lang, setLangState] = useState<Lang>(initialLang)

  const seg = langToSegment(lang)

  const setLang = (l: Lang) => {
    const safe = LANGS.includes(l) ? l : 'en'
    localStorage.setItem(STORAGE_KEY, safe)
    setLangState(safe)
  }

  const value = useMemo<I18nCtx>(() => ({
    lang,
    seg,
    t: (key) => {
      const dict = DICT[lang] as unknown as Record<DictKey, string>
      const fallback = DICT.en as unknown as Record<DictKey, string>
      return dict[key] ?? fallback[key] ?? String(key)
    },
    setLang,
  }), [lang, seg])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useI18n must be used within I18nProvider')
  return v
}
