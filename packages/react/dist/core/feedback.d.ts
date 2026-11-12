import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
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
export declare function ProgressRing({ value, size, stroke, color, trackColor, children, className, style, ...rest }: ProgressRingProps): import("react").JSX.Element;
