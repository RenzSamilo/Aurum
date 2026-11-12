import { type ReactNode, type Ref, useCallback, useEffect, useId, useRef, useState } from 'react';
import { playHaptic } from '../haptics';
import { useTypeahead } from '../vendor/astryx/useTypeahead';

export interface MenuItem {
  /** Visible text. Typing its first letters jumps to it. */
  label: string;
  /** Icon before the label. Decorative: the label is what screen readers read. */
  icon?: ReactNode;
  onSelect: () => void;
  /** Uses the danger colour. Say what will be lost in the label. */
  destructive?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  /** Content of the button that opens the menu, e.g. an icon or "Sort". */
  trigger: ReactNode;
  /** Name for the menu button when the trigger is icon-only. */
  'aria-label'?: string;
  items: readonly MenuItem[];
  /** Which edge of the button the menu lines up with. */
  align?: 'start' | 'end';
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A button that opens a short list of actions.
 *
 * Keyboard: Enter, Space or Arrow Down opens it on the first item, Arrow Up on the
 * last. Arrows move, Home and End jump, letters jump to the next matching item
 * (type-to-select borrowed from Astryx), Enter or Space picks, Escape closes and
 * puts focus back on the button, Tab closes.
 */
export function Menu({ trigger, 'aria-label': ariaLabel, items, align = 'start', className, ref }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'open' | 'closing'>('open');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const focusOnOpen = useRef<'first' | 'last'>('first');
  const menuId = useId();

  const enabled = useCallback(() => items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0), [items]);
  const itemEls = () => [...(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
  const focusItem = useCallback((i: number) => itemEls()[i]?.focus(), []);
  const currentIndex = () => itemEls().findIndex((el) => el === document.activeElement);

  const typeahead = useTypeahead({
    getItemLabels: () => items.map((it) => it.label),
    onMatch: focusItem,
    getCurrentIndex: currentIndex,
    isDisabled: (i) => !!items[i]?.disabled,
  });

  const close = useCallback(
    (returnFocus = true) => {
      typeahead.reset();
      setState('closing');
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [typeahead],
  );

  useEffect(() => {
    if (!open) return;
    setState('open');
    const list = enabled();
    if (list.length) focusItem(focusOnOpen.current === 'first' ? list[0]! : list[list.length - 1]!);
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, enabled, focusItem, close]);

  const openAt = (where: 'first' | 'last') => {
    focusOnOpen.current = where;
    setOpen(true);
  };

  const pick = (item: MenuItem) => {
    if (item.disabled) return;
    playHaptic('selectionTick');
    close();
    item.onSelect();
  };

  const move = (delta: number | 'home' | 'end') => {
    const list = enabled();
    if (!list.length) return;
    const pos = list.indexOf(currentIndex());
    const next =
      delta === 'home' ? 0 : delta === 'end' ? list.length - 1 : (pos + delta + list.length) % list.length;
    focusItem(list[next]!);
  };

  return (
    <div
      ref={(el) => {
        rootRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={['aurum-menu', className].filter(Boolean).join(' ')}
    >
      <button
        ref={triggerRef}
        type="button"
        className="aurum-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openAt('first'))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            openAt(e.key === 'ArrowDown' ? 'first' : 'last');
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <ul
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          className="aurum-menu-list aurum-squircle"
          data-align={align}
          data-state={state}
          onKeyDown={(e) => {
            if (typeahead.onKeyDown(e)) {
              e.preventDefault();
              return;
            }
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                move(1);
                break;
              case 'ArrowUp':
                e.preventDefault();
                move(-1);
                break;
              case 'Home':
                e.preventDefault();
                move('home');
                break;
              case 'End':
                e.preventDefault();
                move('end');
                break;
              case 'Escape':
                e.preventDefault();
                close();
                break;
              case 'Tab':
                close(false);
                break;
            }
          }}
        >
          {items.map((item) => (
            <li
              key={item.label}
              role="menuitem"
              tabIndex={-1}
              aria-disabled={item.disabled || undefined}
              data-destructive={item.destructive || undefined}
              className="aurum-menu-item"
              onClick={() => pick(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pick(item);
                }
              }}
            >
              {item.icon && (
                <span className="aurum-menu-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="aurum-menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
