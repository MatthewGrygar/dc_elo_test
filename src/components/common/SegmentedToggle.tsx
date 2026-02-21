import React from 'react';
import clsx from 'clsx';

export type Segment<T extends string> = {
  value: T;
  label: string;
};

export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel
}: {
  value: T;
  options: readonly Segment<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="seg" role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={clsx('seg__btn', opt.value === value && 'is-active')}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
