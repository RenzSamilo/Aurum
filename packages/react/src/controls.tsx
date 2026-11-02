import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useId,
  useRef,
} from 'react';
import { playHaptic } from './haptics';
import type { HapticIntent } from './tokens/tokens';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

// ---------------------------------------------------------------------------
// Button

export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** filled: the one main action. tinted / gray: secondary. plain: text only. */
  variant?: ButtonVariant;
  /** sm 32px tall (still a 44px hit area), md 48px, lg 64px. */
  size?: ButtonSize;
  /** Capsule ends instead of rounded corners. */
  capsule?: boolean;
  /** Uses the danger colour. Say what will be lost in the label. */
  destructive?: boolean;
  /** Icon before the label. Icon-only buttons need an aria-label. */
  icon?: ReactNode;
  fullWidth?: boolean;
  /** Haptic on press. Off by default: most buttons do not need one. */
  haptic?: HapticIntent | false;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * A button. Presses scale down slightly with the control spring; with reduced
 * motion they only change colour.
 */
export function Button({
  variant = 'filled',
  size = 'md',
  capsule = false,
  destructive = false,
  icon,
  fullWidth = false,
  haptic = false,
  className,
  type = 'button',
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('aurum-button', 'aurum-squircle', className)}
      data-variant={variant}
      data-size={size}
      data-capsule={capsule || undefined}
      data-destructive={destructive || undefined}
      data-full-width={fullWidth || undefined}
      data-icon-only={(icon && !children) || undefined}
      onClick={(e) => {
        if (haptic) playHaptic(haptic);
        onClick?.(e);
      }}
      {...rest}
    >
      {icon && (
        <span className="aurum-button-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Switch

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onChange' | 'role'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Visible label. Clicking it toggles the switch. Without it, pass aria-label. */
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * An on/off switch for settings that apply immediately. Use a checkbox in
 * forms that are submitted later.
 */
export function Switch({ checked, onCheckedChange, label, description, className, disabled, id, ...rest }: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const descId = `${switchId}-desc`;
  const control = (
    <button
      type="button"
      role="switch"
      id={switchId}
      aria-checked={checked}
      aria-describedby={description ? descId : undefined}
      disabled={disabled}
      className={cx('aurum-switch', !label && className)}
      onClick={() => {
        playHaptic('selectionTick');
        onCheckedChange(!checked);
      }}
      {...rest}
    >
      <span className="aurum-switch-thumb" />
    </button>
  );
  if (!label) return control;
  return (
    <div className={cx('aurum-switch-row', className)} data-disabled={disabled || undefined}>
      <span className="aurum-switch-text">
        <label htmlFor={switchId} className="aurum-type-body">
          {label}
        </label>
        {description && (
          <span id={descId} className="aurum-type-footnote aurum-switch-description">
            {description}
          </span>
        )}
      </span>
      {control}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segmented control

export interface Segment<T extends string> {
  value: T;
  label: ReactNode;
  /** Required when label is an icon. */
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  segments: readonly Segment<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Names the group for screen readers. */
  'aria-label': string;
  size?: 'sm' | 'md';
}

/**
 * Two to five mutually exclusive options shown side by side, such as views of
 * the same content. Arrow keys move the selection, like native radio groups.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onValueChange,
  size = 'md',
  className,
  style,
  ...rest
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    segments.findIndex((s) => s.value === value),
  );

  const select = (i: number) => {
    const segment = segments[i];
    if (!segment || segment.disabled || segment.value === value) return;
    playHaptic('selectionTick');
    onValueChange(segment.value);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const enabled = segments.flatMap((s, i) => (s.disabled ? [] : [i]));
    if (enabled.length === 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const forward = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    let next: number | undefined;
    if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled.at(-1);
    else if (forward !== undefined) {
      const at = enabled.indexOf(index);
      next = enabled[(at + forward + enabled.length) % enabled.length];
    }
    if (next === undefined) return;
    e.preventDefault();
    select(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      className={cx('aurum-segmented', 'aurum-squircle', className)}
      data-size={size}
      style={{ '--aurum-segments': segments.length, '--aurum-segment-index': index, ...style }}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <span className="aurum-segmented-thumb aurum-squircle" aria-hidden="true" />
      {segments.map((s, i) => (
        <button
          key={s.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === index}
          aria-label={s.ariaLabel}
          tabIndex={i === index ? 0 : -1}
          disabled={s.disabled}
          className="aurum-segment"
          onClick={() => select(i)}
        >
          <span className="aurum-segment-label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
