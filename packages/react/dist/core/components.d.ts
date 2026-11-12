import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import type { MaterialLevel } from '../tokens/tokens.js';
type Polymorphic<T extends ElementType, P> = P & {
    as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof P | 'as'>;
/**
 * A box with continuous corners in every browser. Set the radius with the
 * `radius` prop (a token name or any CSS length) or with CSS border-radius.
 */
export declare function Squircle<T extends ElementType = 'div'>({ as, radius, className, style, ...rest }: Polymorphic<T, {
    radius?: 'sm' | 'md' | 'lg' | 'xl' | (string & {});
    children?: ReactNode;
}>): import("react").JSX.Element;
/**
 * A translucent material. It blurs what is behind it and turns solid when the
 * user reduces transparency. Use it for bars, sheets and floating controls,
 * not for content.
 */
/** Glass's own props; any prop of the rendered element (`as`) is also accepted. */
export interface GlassOwnProps {
    level?: MaterialLevel;
    radius?: 'sm' | 'md' | 'lg' | 'xl' | (string & {});
    /** Mixed into the glass, e.g. 'var(--color-accent)' for a selected or primary control. */
    tint?: string;
    /** Light-catching rim and top sheen. Off leaves a flat hairline border. */
    rim?: boolean;
    children?: ReactNode;
}
export declare function Glass<T extends ElementType = 'div'>({ level, tint, rim, className, ...rest }: Polymorphic<T, GlassOwnProps>): import("react").JSX.Element;
export {};
