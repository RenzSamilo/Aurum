import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useLayoutEffect,
  useRef,
} from 'react';
import { useSquircle } from '../squircle';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

export interface TextFieldProps
  extends Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'size' | 'value' | 'defaultValue' | 'children' | 'aria-label'> {
  /** What the field is for. Screen readers read it; the placeholder is only a hint. */
  label: string;
  /** Controlled text. Leave it out (or use defaultValue) to let the field keep its own. */
  value?: string;
  defaultValue?: string;
  /** An icon or control at the start, e.g. a search glass. */
  leading?: ReactNode;
  /** An action at the end, e.g. a send button. */
  trailing?: ReactNode;
  onValueChange?: (value: string) => void;
  /** Enter in a one-line field; Cmd/Ctrl+Enter in a multi-line one. */
  onValueSubmit?: (value: string) => void;
  /** More than 1 makes a text area that grows up to this many lines. */
  maxLines?: number;
  /** Fully rounded ends, e.g. for a chat composer or search field. */
  capsule?: boolean;
  ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
}

/**
 * A single or multi-line text input on an inset fill with continuous corners.
 * Put an action, such as a send button, in `trailing`.
 */
export function TextField({
  label,
  value,
  defaultValue,
  leading,
  trailing,
  onValueChange,
  onValueSubmit,
  maxLines = 1,
  capsule = false,
  disabled,
  className,
  style,
  ref,
  onKeyDown,
  ...rest
}: TextFieldProps) {
  const box = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement | null>(null);
  useSquircle(box, undefined, capsule ? 'var(--radius-pill)' : 'var(--radius-md)');
  const multiline = maxLines > 1;

  // Grow the text area with its content, up to maxLines: after renders (controlled value)
  // and on every input (uncontrolled fields don't re-render while typing).
  const grow = () => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };
  useLayoutEffect(grow);

  const handleKey = (e: KeyboardEvent<HTMLInputElement & HTMLTextAreaElement>) => {
    onKeyDown?.(e as KeyboardEvent<HTMLInputElement>);
    if (e.defaultPrevented || e.key !== 'Enter' || e.nativeEvent.isComposing || !onValueSubmit) return;
    if (multiline && !(e.metaKey || e.ctrlKey)) return;
    e.preventDefault();
    onValueSubmit(e.currentTarget.value);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (multiline) grow();
    onValueChange?.(e.target.value);
  };

  const shared = {
    'aria-label': label,
    className: 'aurum-text-field-input',
    value,
    defaultValue,
    disabled,
    onChange: handleChange,
    onKeyDown: handleKey,
  };

  return (
    <div
      ref={box}
      className={cx('aurum-text-field', 'aurum-squircle', className)}
      data-capsule={capsule || undefined}
      data-multiline={multiline || undefined}
      data-disabled={disabled || undefined}
      data-leading={leading ? true : undefined}
      data-trailing={trailing ? true : undefined}
      style={{ '--aurum-text-field-lines': maxLines, ...style }}
    >
      {leading && <span className="aurum-text-field-leading">{leading}</span>}
      {multiline ? (
        <textarea
          {...(rest as ComponentPropsWithoutRef<'textarea'>)}
          {...shared}
          rows={1}
          ref={(el) => {
            area.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
        />
      ) : (
        <input type="text" {...rest} {...shared} ref={ref as Ref<HTMLInputElement>} />
      )}
      {trailing && <span className="aurum-text-field-trailing">{trailing}</span>}
    </div>
  );
}
