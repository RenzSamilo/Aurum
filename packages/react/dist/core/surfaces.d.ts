import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
import { type MaterialLevel } from '../tokens/tokens.js';
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
export declare function Card({ onPress, padding, elevation, material, className, children, ...rest }: CardProps): import("react").JSX.Element;
export interface ListSectionProps extends ComponentPropsWithoutRef<'section'> {
    header?: ReactNode;
    footer?: ReactNode;
}
/** An inset, grouped list of rows: settings, details, menus. */
export declare function ListSection({ header, footer, className, children, ...rest }: ListSectionProps): import("react").JSX.Element;
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
export declare function ListRow({ title, subtitle, leading, value, trailing, href, onPress, chevron, destructive, className }: ListRowProps): import("react").JSX.Element;
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
/**
 * A modal sheet that rises from the bottom. Built on <dialog>, so focus is
 * trapped and Escape closes it. Drag the grabber or the title area down to
 * close; a fast flick closes from anywhere in the drag.
 */
export declare function Sheet({ open, onOpenChange, title, hideTitle, children, dismissible, closeLabel, className, ref }: SheetProps): import("react").JSX.Element;
