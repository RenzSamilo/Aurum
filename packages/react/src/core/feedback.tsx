import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

export interface ProgressRingProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'color'> {
  /** From 0 to 1. */
  value: number;
  /** Diameter in px. */
  size?: number;
  /** Ring width in px. */
  stroke?: number;
  /** Any CSS colour, ideally a token: 'var(--color-success)'. Defaults to the accent. */
  color?: string;
  /** Defaults to a faint primary-text tint. */
  trackColor?: string;
  /** Shown in the middle, e.g. "3/6". Screen readers read the label and percentage instead. */
  children?: ReactNode;
  /** What is progressing, e.g. "Today's sets". */
  'aria-label'?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Progress as a ring that fills clockwise from the top, with optional content in the middle. */
export function ProgressRing({
  value,
  size = 36,
  stroke = 3,
  color,
  trackColor,
  children,
  className,
  style,
  ...rest
}: ProgressRingProps) {
  const v = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const percent = Math.round(v * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}%`}
      className={cx('aurum-progress-ring', className)}
      style={{
        '--aurum-ring-size': `${size}px`,
        '--aurum-ring-color': color,
        '--aurum-ring-track': trackColor,
        ...style,
      }}
      {...rest}
    >
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="aurum-progress-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        {v > 0 && (
          <circle
            className="aurum-progress-ring-value"
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - v)}
          />
        )}
      </svg>
      {children != null && (
        <span className="aurum-progress-ring-content" aria-hidden="true">
          {children}
        </span>
      )}
    </div>
  );
}
