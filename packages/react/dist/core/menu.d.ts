import { type ReactNode, type Ref } from 'react';
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
export declare function Menu({ trigger, 'aria-label': ariaLabel, items, align, className, ref }: MenuProps): import("react").JSX.Element;
