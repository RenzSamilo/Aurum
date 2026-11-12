import {
  type ComponentPropsWithoutRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Squircle } from './components';
import { playHaptic } from '../haptics';
import { gesture, type MaterialLevel } from '../tokens/tokens';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

// ---------------------------------------------------------------------------
// Card

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /** Makes the whole card one button. Put no other buttons inside it. */
  onPress?: () => void;
  /** Accessible name for a pressable card, if its text is not enough. */
  'aria-label'?: string;
  padding?: 'none' | 'md' | 'lg';
  /** Lifted cards cast a soft shadow; flat cards use a hairline border only. */
  elevation?: 'flat' | 'lifted';
  /**
   * Makes the card glass at this level, for cards over imagery or a coloured backdrop.
   * Glass cards cast no shadow on the web: a shadow filter would stop the blur.
   */
  material?: MaterialLevel;
}

/**
 * A grouped surface with continuous corners. The shadow sits on a wrapper and
 * uses drop-shadow, so it follows the corner shape even where the corners are
 * clipped by the polyfill.
 */
export function Card({ onPress, padding = 'lg', elevation = 'lifted', material, className, children, ...rest }: CardProps) {
  const interactive = Boolean(onPress);
  // One element, button or div; the polymorphic props are the same shape either way.
  const props = {
    as: interactive ? 'button' : 'div',
    type: interactive ? 'button' : undefined,
    radius: 'lg',
    className: cx('aurum-card', material && 'aurum-glass', className),
    'data-level': material,
    'data-padding': padding,
    'data-interactive': interactive || undefined,
    onClick: onPress,
    ...rest,
  } as ComponentPropsWithoutRef<typeof Squircle>;
  return (
    <div className="aurum-card-shadow" data-elevation={material ? 'flat' : elevation}>
      <Squircle {...props}>
        {children}
      </Squircle>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List

export interface ListSectionProps extends ComponentPropsWithoutRef<'section'> {
  header?: ReactNode;
  footer?: ReactNode;
}

/** An inset, grouped list of rows: settings, details, menus. */
export function ListSection({ header, footer, className, children, ...rest }: ListSectionProps) {
  const id = useId();
  return (
    <section className={cx('aurum-list-section', className)} aria-labelledby={header ? `${id}-h` : undefined} {...rest}>
      {header && (
        <h3 id={`${id}-h`} className="aurum-list-header aurum-type-footnote">
          {header}
        </h3>
      )}
      <Squircle as="ul" radius="md" className="aurum-list" role="list">
        {children}
      </Squircle>
      {footer && <p className="aurum-list-footer aurum-type-footnote">{footer}</p>}
    </section>
  );
}

export interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Icon or avatar at the start. Separators start after it. */
  leading?: ReactNode;
  /** Secondary value at the end, such as the current choice. */
  value?: ReactNode;
  /** A control at the end (Switch, Button). Rows with one are not pressable. */
  trailing?: ReactNode;
  /** Shows a chevron and makes the row a link. */
  href?: string;
  /** Shows a chevron and makes the row a button. */
  onPress?: () => void;
  /** Hides the chevron on a pressable row, e.g. for an action like "Sign out". */
  chevron?: boolean;
  destructive?: boolean;
  className?: string;
}

/** One row in a ListSection. Pressable rows highlight and spring on press. */
export function ListRow({ title, subtitle, leading, value, trailing, href, onPress, chevron, destructive, className }: ListRowProps) {
  const interactive = Boolean(href || onPress) && !trailing;
  const showChevron = interactive && (chevron ?? true);
  const body = (
    <>
      {leading && (
        <span className="aurum-row-leading" aria-hidden="true">
          {leading}
        </span>
      )}
      <span className="aurum-row-text">
        <span className="aurum-type-body aurum-row-title">{title}</span>
        {subtitle && <span className="aurum-type-footnote aurum-row-subtitle">{subtitle}</span>}
      </span>
      {value !== undefined && <span className="aurum-type-body aurum-row-value">{value}</span>}
      {trailing}
      {showChevron && (
        <svg className="aurum-row-chevron" viewBox="0 0 8 14" aria-hidden="true">
          <path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
  const rowClass = cx('aurum-row', className);
  return (
    <li className="aurum-row-item" data-has-leading={leading ? '' : undefined} data-destructive={destructive || undefined}>
      {href && !trailing ? (
        <a className={rowClass} href={href} onClick={onPress}>
          {body}
        </a>
      ) : interactive ? (
        <button type="button" className={rowClass} onClick={onPress}>
          {body}
        </button>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Sheet

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown at the top and used as the dialog's accessible name. */
  title: ReactNode;
  /** Hide the visible title but keep it for screen readers. */
  hideTitle?: boolean;
  children: ReactNode;
  /** Swipe down, tap outside or press Escape to close. Turn off for unsaved work. */
  dismissible?: boolean;
  /** Label of the close button in the header. null hides it (give the sheet its own way out). */
  closeLabel?: string | null;
  className?: string;
  ref?: Ref<HTMLDialogElement>;
}

const CLOSE_VELOCITY = 0.5; // px per ms
const CLOSE_FRACTION = 0.3; // of the sheet's height

/**
 * A modal sheet that rises from the bottom. Built on <dialog>, so focus is
 * trapped and Escape closes it. Drag the grabber or the title area down to
 * close; a fast flick closes from anywhere in the drag.
 */
export function Sheet({ open, onOpenChange, title, hideTitle, children, dismissible = true, closeLabel = 'Close', className, ref }: SheetProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [closing, setClosing] = useState(false);
  const drag = useRef<{ startY: number; lastY: number; lastT: number; v: number } | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open) {
      // Reopening during the exit transition cancels the pending close.
      setClosing(false);
      if (panel.current) panel.current.style.transform = '';
      if (!d.open) {
        d.showModal();
        playHaptic('impactLight');
      }
    } else if (!open && d.open) {
      setClosing(true);
    }
  }, [open]);

  // Close for real once the exit transition ends (or right away with no motion).
  useEffect(() => {
    if (!closing) return;
    const p = panel.current;
    const finish = () => {
      dialog.current?.close();
      setClosing(false);
      if (p) p.style.transform = '';
    };
    const ms = parseFloat(getComputedStyle(p ?? document.documentElement).transitionDuration) * 1000;
    if (!p || !ms) return finish();
    const t = setTimeout(finish, ms + 50);
    p.addEventListener('transitionend', finish, { once: true });
    return () => {
      clearTimeout(t);
      p.removeEventListener('transitionend', finish);
    };
  }, [closing]);

  const requestClose = () => onOpenChange(false);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!dismissible || e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
    panel.current?.setAttribute('data-dragging', '');
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    const p = panel.current;
    if (!d || !p) return;
    const dy = e.clientY - d.startY;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.v = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    // Follow the finger down; resist upward pulls.
    const limit = gesture.rubberBandLimit;
    const offset = dy >= 0 ? dy : -limit * (1 - 1 / ((-dy * 0.55) / limit + 1));
    p.style.transform = `translateY(${offset}px)`;
  };
  const onPointerUp = () => {
    const d = drag.current;
    const p = panel.current;
    drag.current = null;
    if (!d || !p) return;
    p.removeAttribute('data-dragging');
    const dy = d.lastY - d.startY;
    if (dy > p.offsetHeight * CLOSE_FRACTION || d.v > CLOSE_VELOCITY) {
      requestClose();
    } else {
      p.style.transform = '';
    }
  };

  return (
    <dialog
      ref={(el) => {
        dialog.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as { current: HTMLDialogElement | null }).current = el;
      }}
      className={cx('aurum-sheet-dialog', className)}
      aria-labelledby={titleId}
      data-state={closing ? 'closing' : open ? 'open' : 'closed'}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) requestClose();
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (dismissible && e.target === dialog.current) requestClose();
      }}
    >
      <div ref={panel} className="aurum-sheet aurum-squircle">
        <div
          className="aurum-sheet-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {dismissible && <span className="aurum-sheet-grabber" aria-hidden="true" />}
          <h2 id={titleId} className={cx('aurum-type-headline', 'aurum-sheet-title', hideTitle && 'aurum-visually-hidden')}>
            {title}
          </h2>
          {closeLabel !== null && (
            <button
              type="button"
              className="aurum-sheet-close"
              aria-label={closeLabel}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={requestClose}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="m2 2 8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="aurum-sheet-body">{children}</div>
      </div>
    </dialog>
  );
}
