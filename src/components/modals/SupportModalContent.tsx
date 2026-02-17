import { useMemo, useState } from 'react'
import { Copy, ExternalLink } from 'lucide-react'
import { useI18n } from '../../features/i18n/i18n'

function CopyBtn({ value }: { value: string }) {
  const { t } = useI18n()
  const [done, setDone] = useState(false)

  const label = done ? t('support_copied') : t('support_copy')

  return (
    <button
      className={
        done
          ? 'inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200'
          : 'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10'
      }
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        } catch {
          // ignore
        }
      }}
      type="button"
    >
      <Copy className="h-4 w-4" />
      {label}
    </button>
  )
}

export default function SupportModalContent() {
  const { t, lang } = useI18n()
  const defaultMethod = useMemo(() => (lang === 'cs' ? 'bank' : 'paypal'), [lang])
  const [method, setMethod] = useState<'bank' | 'paypal'>(defaultMethod)

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-200">{t('support_hero_title')}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="text-2xl font-semibold tracking-tight">{t('support_hero_brand')}</div>
          <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-semibold text-indigo-200">
            {method === 'bank' ? t('support_method_bank') : t('support_method_paypal')}
          </span>
        </div>
        <div className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">{t('support_hero_tag')}</div>

        <div className="mt-4 flex gap-2">
          <button
            className={
              method === 'bank'
                ? 'rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white'
                : 'rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10'
            }
            onClick={() => setMethod('bank')}
            type="button"
          >
            {t('support_method_bank')}
          </button>
          <button
            className={
              method === 'paypal'
                ? 'rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white'
                : 'rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10'
            }
            onClick={() => setMethod('paypal')}
            type="button"
          >
            {t('support_method_paypal')}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">QR</div>
          <div className="mt-3 flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950 p-4">
            <img
              src={method === 'paypal' ? './assets/images/support/QR2.png' : './assets/images/support/QR.png'}
              alt="QR"
              className="max-h-64 w-auto"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          {method === 'bank' ? (
            <div className="space-y-4">
              <div className="text-sm font-semibold">{t('support_acc_title')}</div>

              <Row label={t('support_acc_name')} value={t('support_acc_name_value')} />
              <Row label={t('support_acc_number')} value={'2640017029 / 3030'} />
              <Row label={t('support_iban')} value={'CZ03 3030 0000 0026 4001 7029'} mono />
              <Row label={t('support_bic')} value={'AIRACZP'} mono />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-semibold">{t('support_paypal_title')}</div>

              <Row label={t('support_paypal_email')} value={'matthew.grygar@seznam.cz'} />
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('support_paypal_me')}</div>
                  <a
                    className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 hover:text-indigo-100"
                    href="https://paypal.me/GrailSeriesELO"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    paypal.me/GrailSeriesELO <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <CopyBtn value={'https://paypal.me/GrailSeriesELO'} />
              </div>
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
            {t('support_thanks')}
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
        <div className={mono ? 'mt-1 font-mono text-sm text-slate-100' : 'mt-1 text-sm font-semibold text-slate-100'}>
          {value}
        </div>
      </div>
      <CopyBtn value={value} />
    </div>
  )
}
