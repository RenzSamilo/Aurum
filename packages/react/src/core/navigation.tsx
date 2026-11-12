import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
import { Glass } from './components';
import { Button, type ButtonProps } from './controls';
import { playHaptic } from '../haptics';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

// ---------------------------------------------------------------------------
// Tab bar

/** One destination in a TabBar. */
export interface TabBarItem {
  label: string;
  icon: ReactNode;
  /** Shown when selected, usually the filled version of icon. */
  selectedIcon?: ReactNode;
  /** Makes the tab a link, for apps with URL routing. onSelectedChange still fires. */
  href?: string;
}

export interface TabBarProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  /** 2 to 5 top-level destinations. */
  tabs: readonly TabBarItem[];
  selectedIndex: number;
  onSelectedChange: (index: number) => void;
  /** Names the navigation landmark. */
  'aria-label'?: string;
  ref?: Ref<HTMLElement>;
}

/**
 * Bottom navigation between 2 to 5 top-level screens, on a glass material.
 * It sticks to the bottom of its scroll container and pads for the home
 * indicator. The selected tab is marked aria-current="page".
 */
export function TabBar({
  tabs,
  selectedIndex,
  onSelectedChange,
  className,
  'aria-label': ariaLabel = 'Tabs',
  ...rest
}: TabBarProps) {
  return (
    <Glass as="nav" level="thick" radius="0" className={cx('aurum-tab-bar', className)} aria-label={ariaLabel} {...rest}>
      <ul className="aurum-tab-bar-list" role="list">
        {tabs.map((tab, i) => {
          const selected = i === selectedIndex;
          const content = (
            <>
              <span className="aurum-tab-icon" aria-hidden="true">
                {selected ? (tab.selectedIcon ?? tab.icon) : tab.icon}
              </span>
              <span className="aurum-tab-label">{tab.label}</span>
            </>
          );
          const props = {
            className: 'aurum-tab',
            'aria-current': selected ? ('page' as const) : undefined,
            onClick: () => {
              if (!selected) playHaptic('selectionTick');
              onSelectedChange(i);
            },
          };
          return (
            <li key={tab.label}>
              {tab.href ? (
                <a href={tab.href} {...props}>
                  {content}
                </a>
              ) : (
                <button type="button" {...props}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Glass>
  );
}

// ---------------------------------------------------------------------------
// Top bar

export interface TopBarProps extends Omit<ComponentPropsWithoutRef<'header'>, 'title'> {
  /** Usually a BackButton. */
  leading?: ReactNode;
  /** Text becomes the page's h1; pass an element for a custom title, such as a picker. */
  title?: ReactNode;
  /** Up to two controls at the end, such as icon buttons or a Menu. */
  trailing?: ReactNode;
  ref?: Ref<HTMLElement>;
}

/**
 * The bar at the top of a screen: an optional leading control, a centred
 * title and optional trailing controls. The title stays centred even when the
 * sides differ in width.
 */
export function TopBar({ leading, title, trailing, className, ...rest }: TopBarProps) {
  return (
    <header className={cx('aurum-top-bar', className)} {...rest}>
      <div className="aurum-top-bar-leading">{leading}</div>
      {typeof title === 'string' ? <h1 className="aurum-top-bar-title aurum-type-headline">{title}</h1> : <div className="aurum-top-bar-title">{title}</div>}
      <div className="aurum-top-bar-trailing">{trailing}</div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Back button

export interface BackButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'variant' | 'capsule' | 'size'> {
  /** Defaults to "Back". */
  'aria-label'?: string;
}

/** A round back button. Goes back in history unless you pass onClick. The caret flips in right-to-left layouts. */
export function BackButton({ onClick, className, 'aria-label': ariaLabel = 'Back', ...rest }: BackButtonProps) {
  return (
    <Button
      variant="gray"
      capsule
      aria-label={ariaLabel}
      className={cx('aurum-back-button', className)}
      icon={
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 4.5 7.5 12l7.5 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      onClick={(e) => {
        if (onClick) onClick(e);
        else window.history.back();
      }}
      {...rest}
    />
  );
}
