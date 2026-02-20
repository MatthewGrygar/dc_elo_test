import type { PropsWithChildren } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import classNames from 'classnames';

type Props = PropsWithChildren<
  {
    className?: string;
  /**
   * Adds a subtle lift + stronger shadow on hover.
   * Use for interactive panels (cards, clickable panels, etc.).
   */
    hover?: boolean;
  } & Omit<ComponentPropsWithoutRef<'section'>, 'className'>
>;

/**
 * GlassPanel
 * ----------
 * A reusable "glassmorphism" surface used across the app:
 * - semi-transparent background
 * - backdrop blur
 * - gradient edge highlight + colorful reflections
 *
 * Styling is defined in `src/styles/index.css` under `.glass-panel`.
 * We keep the component tiny so it's easy for future AI/humans to reuse consistently.
 */
export function GlassPanel({ children, className, hover = false, ...rest }: Props) {
  return (
    <section
      className={classNames(
        'glass-panel',
        hover && 'glass-panel-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
