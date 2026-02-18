import { useI18n } from '../../features/i18n/i18n'

const UPDATES = [
  {
    version: '1.2.0',
    image: './assets/images/update/verze_1.2.0.png',
    title: {
      cs: '🚀 Aktualizace aplikace 1.2.0',
      en: '🚀 App update 1.2.0',
      fr: '🚀 Mise à jour 1.2.0',
    },
    bullets: {
      cs: [
        'Nové záložky: Vedení a Články',
        'Vylepšená sekce Aktuality + slider na titulní stránce',
        'Vícejazyčnost CZ/EN/FR + opravy režimu',
        'Možnost podpořit projekt (QR + PayPal)',
        'Přepínač mezi ELO a DCPR',
      ],
      en: [
        'New tabs: Management and Articles',
        'Improved Updates + homepage slider',
        'CZ/EN/FR localization + theme fixes',
        'Support the project (QR + PayPal)',
        'Toggle between ELO and DCPR',
      ],
      fr: [
        'Nouveaux onglets : Direction et Articles',
        'Actualités améliorées + slider',
        'Localisation CZ/EN/FR + corrections du thème',
        'Soutenir le projet (QR + PayPal)',
        'Bascule ELO / DCPR',
      ],
    },
  },
]

export default function UpdatesModalContent() {
  const { lang } = useI18n()

  return (
    <div className="space-y-4">
      {UPDATES.map((u) => (
        <div key={u.version} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="grid gap-4 p-5 md:grid-cols-[240px_1fr]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-2">
              <img src={u.image} alt={u.title[lang]} className="h-auto w-full rounded-xl" loading="lazy" />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold tracking-tight">{u.title[lang]}</div>
                <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-200">
                  v{u.version}
                </span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                {u.bullets[lang].map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
