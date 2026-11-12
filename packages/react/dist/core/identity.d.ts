import { type ComponentPropsWithoutRef, type Ref } from 'react';
/** Up to two initials: first letters of the first and last words. */
export declare function initialsOf(name: string): string;
export interface AvatarProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
    /** Read by screen readers, and the source of the initials. */
    name: string;
    /** Picture URL. Falls back to initials if it is missing or fails to load. */
    src?: string;
    /** Diameter in px. */
    size?: number;
    /** A ring in the card colour, for avatars that sit on photos or tints. */
    ring?: boolean;
    ref?: Ref<HTMLSpanElement>;
}
/** A round picture of a person or thing. Without a picture, it shows initials on an accent tint. */
export declare function Avatar({ name, src, size, ring, className, style, ...rest }: AvatarProps): import("react").JSX.Element;
export type BadgeTone = 'accent' | 'secondary' | 'neutral' | 'danger';
/** soft: tinted fill. solid: full colour, for the one badge that must pop. outline: hairline border. */
export type BadgeAppearance = 'soft' | 'solid' | 'outline';
export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
    tone?: BadgeTone;
    appearance?: BadgeAppearance;
    ref?: Ref<HTMLSpanElement>;
}
/** A small status label, such as "New", "Pro" or "Free". */
export declare function Badge({ tone, appearance, className, ...rest }: BadgeProps): import("react").JSX.Element;
