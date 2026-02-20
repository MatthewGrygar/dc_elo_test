import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { PlayerRow } from '../types/player';
import { GlassPanel } from './ui/GlassPanel';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import classNames from 'classnames';

type Props = {
  open: boolean;
  player: PlayerRow | null;
  /** 1-based rank in the global leaderboard (by rating). */
  rank?: number | null;
  onClose: () => void;
};

function formatPct(v: number) {
  if (!Number.isFinite(v)) return '—';
  return `${Math.round(v * 1000) / 10}%`;
}

function getChartColors() {
  if (typeof window === 'undefined') return { accent: '#3b82f6', muted: '#475569' };
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: `rgb(${styles.getPropertyValue('--accent').trim()})`,
    muted: `rgb(${styles.getPropertyValue('--muted').trim()})`,
  };
}

function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-3">
      <p className="text-xs font-semibold text-[rgb(var(--muted))]">{label}</p>
      <div className="mt-1 text-sm font-semibold">{payload[0]?.value}</div>
    </div>
  );
}

/**
 * PlayerModal
 * -----------
 * A lightweight, glassy modal with player details.
 *
 * v0 uses a placeholder chart (derived from the current rating) until we add match history.
 *
 * Design goals:
 * - Strong separation from the calm background (shadow + border + blur)
 * - Works in light/dark
 * - Minimal and readable (acts as living documentation)
 */
export function PlayerModal({ open, player, rank, onClose }: Props) {
  const colors = getChartColors();

  // Simple mount animation (overlay fade + modal scale).
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => setVisible(true));
    return () => {
      window.cancelAnimationFrame(id);
      setVisible(false);
    };
  }, [open]);

  // --- Mobile bottom-sheet drag ---
  // We implement a small, non-invasive swipe-to-close interaction.
  // Desktop keeps the centered modal.
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  function onTouchStart(e: React.TouchEvent) {
    // Only meaningful for mobile (bottom sheet).
    dragStartY.current = e.touches[0]?.clientY ?? null;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragStartY.current) return;
    const y = e.touches[0]?.clientY ?? 0;
    const delta = Math.max(0, y - dragStartY.current);
    setDragY(delta);
  }

  function onTouchEnd() {
    setDragging(false);
    if (dragY > 90) {
      onClose();
      setDragY(0);
      dragStartY.current = null;
      return;
    }
    // Snap back
    setDragY(0);
    dragStartY.current = null;
  }

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const data = useMemo(() => {
    if (!player) return [];
    const base = Math.round(player.rating || 0);
    // Placeholder time series: small wave around rating.
    return Array.from({ length: 12 }, (_, i) => {
      const t = i / 11;
      const wave = Math.sin(t * Math.PI * 2) * 18;
      return {
        label: `T-${11 - i}`,
        rating: Math.round(base + wave + (t - 0.5) * 8),
      };
    });
  }, [player]);

  if (!open || !player) return null;

  return (
    <div className={classNames('fixed inset-0 z-50 modal-enter', visible && 'is-visible')}>
      {/* Backdrop */}
      <button
        type="button"
        className="modal-overlay absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        aria-label="Zavřít detail hráče"
      />

      <div className="relative mx-auto flex h-full items-end justify-center px-3 sm:items-center sm:px-4">
        <div className="w-full max-w-[720px]">
          <GlassPanel
            className={classNames(
              'modal-panel w-full overflow-hidden rounded-t-[24px] rounded-b-none sm:rounded-[24px]',
              'bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(15,15,18,0.75)]',
              'border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.10)]',
              'shadow-[0_25px_70px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.70)]',
            )}
            hover={false}
            style={{ transform: `translateY(${dragY}px)`, transition: dragging ? 'none' : 'transform 220ms ease' }}
          >
            {/* Header strip: same blur layer (inside modal), no opaque background */}
            <div className="px-5 pt-5 sm:px-7 sm:pt-6">
              <div className="-mx-5 -mt-5 px-5 pb-4 pt-5 sm:-mx-7 sm:-mt-6 sm:px-7 sm:pb-5 sm:pt-6 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5">
                {/* Drag handle (mobile) */}
                <div
                  className="mx-auto mb-4 mt-0.5 h-1.5 w-12 rounded-full bg-[rgba(var(--muted),0.35)] sm:hidden"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-[rgb(var(--muted))]">Detail hráče</p>
                    <h3 className="mt-1 text-[26px] font-extrabold tracking-tight sm:text-[28px]">{player.name}</h3>

                    <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
                      <div className="leading-none">
                        <div className="text-xs font-semibold tracking-wider text-[rgb(var(--muted))]">Aktuální ELO</div>
                        <div className="mt-1 text-[32px] font-extrabold tracking-tight text-[rgb(var(--accent))] sm:text-[36px]">
                          {Math.round(player.rating)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge label={`Peak ${Math.round(player.peak)}`} />
                        <Badge label={`Winrate ${formatPct(player.winrate)}`} tone="sub" />
                        {typeof rank === 'number' && rank > 0 ? (
                          rank <= 10 ? <Badge label={`TOP ${rank}`} tone="rank" /> : <Badge label={`#${rank}`} />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={onClose} className="glass-chip ui-hover p-2" aria-label="Zavřít">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[92vh] overflow-y-auto pr-1 sm:max-h-[85vh]">
          <div className="px-5 pb-5 sm:px-7 sm:pb-7">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="WIN" value={player.win} />
              <Stat label="LOSS" value={player.loss} />
              <Stat label="DRAW" value={player.draw} />
              <Stat label="GAMES" value={player.games} />
            </div>

            <div className="mt-4 grid gap-3 border-t border-[rgba(var(--border),var(--border-alpha))] pt-4 sm:grid-cols-3">
              <StatText label="Win streak" value="—" hint="placeholder" />
              <StatText label="Oblíbený commander" value="—" hint="placeholder" />
              <StatText label="Rank" value={typeof rank === 'number' && rank > 0 ? `#${rank}` : '—'} hint={rank ? undefined : 'v1'} />
            </div>

            <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Graf vývoje (placeholder)</p>
              <span className="text-xs text-[rgb(var(--muted))]">v1: napojíme match historii</span>
            </div>
            <div className="glass-panel p-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <filter id="pmGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <XAxis dataKey="label" tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: colors.muted, fontSize: 12 }} tickLine={false} axisLine={false} width={42} />
                    <Tooltip content={<GlassTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke={colors.accent}
                      strokeWidth={2.25}
                      dot={false}
                      filter="url(#pmGlow)"
                      activeDot={{ r: 5 }}
                      isAnimationActive
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-chip px-4 py-3">
      <div className="text-[11px] font-semibold tracking-wider text-[rgb(var(--muted))]">{label}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight text-[rgb(var(--text))]">{value}</div>
    </div>
  );
}

function StatText({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glass-chip px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold tracking-wider text-[rgb(var(--muted))]">{label}</div>
        {hint ? <span className="text-[10px] font-semibold text-[rgb(var(--muted))] opacity-70">{hint}</span> : null}
      </div>
      <div className="mt-1 text-[15px] font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone?: 'sub' | 'rank' }) {
  const toneClass =
    tone === 'rank'
      ? 'border-[rgba(255,255,255,0.18)] dark:border-[rgba(255,255,255,0.18)] bg-black/10 dark:bg-white/10'
      : tone === 'sub'
        ? 'border-[rgba(var(--border),0.14)] bg-[rgba(var(--panel),0.35)]'
        : 'border-[rgba(var(--border),0.14)] bg-[rgba(var(--panel),0.30)]';
  return (
    <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold " + toneClass}>
      {label}
    </span>
  );
}
