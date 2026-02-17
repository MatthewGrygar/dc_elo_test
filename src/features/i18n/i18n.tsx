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

function detectLangFromPath(pathname: string): Lang | null {
  const parts = pathname.split('/').filter(Boolean)
  const seg0 = parts[0] || ''
  return segmentToLang(seg0)
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
  const fromPath = detectLangFromPath(location.pathname)
  const initialLang: Lang = fromPath || (stored && LANGS.includes(stored) ? stored : detectPreferredLang())

  const [lang, setLangState] = useState<Lang>(initialLang)

  const seg = langToSegment(lang)

  const setLang = (l: Lang) => {
    const safe = LANGS.includes(l) ? l : 'en'
    localStorage.setItem(STORAGE_KEY, safe)
    setLangState(safe)
  }

  // If the user navigates to a different language segment, sync.
  React.useEffect(() => {
    const next = detectLangFromPath(location.pathname)
    if (next && next !== lang) setLangState(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const value = useMemo<I18nCtx>(() => ({
    lang,
    seg,
    t: (key) => {
      const dict = DICT[lang] as unknown as Record<string, string>
      return dict[key] ?? (DICT.en as any)[key] ?? String(key)
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
