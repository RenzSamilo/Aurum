import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
import { type ButtonProps } from './controls.js';
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
export declare function TabBar({ tabs, selectedIndex, onSelectedChange, className, 'aria-label': ariaLabel, ...rest }: TabBarProps): import("react").JSX.Element;
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
export declare function TopBar({ leading, title, trailing, className, ...rest }: TopBarProps): import("react").JSX.Element;
export interface BackButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'variant' | 'capsule' | 'size'> {
    /** Defaults to "Back". */
    'aria-label'?: string;
}
/** A round back button. Goes back in history unless you pass onClick. The caret flips in right-to-left layouts. */
export declare function BackButton({ onClick, className, 'aria-label': ariaLabel, ...rest }: BackButtonProps): import("react").JSX.Element;
