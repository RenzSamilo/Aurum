import { type RefObject } from 'react';
/**
 * SVG path data for a w x h rectangle with continuous corners. The path starts
 * at the top edge and runs clockwise.
 */
export declare function squirclePath(width: number, height: number, radius: number, smoothing?: number): string;
/** True when the browser draws continuous corners itself. */
export declare function supportsNativeSquircle(): boolean;
/**
 * Gives an element continuous corners in every browser. The radius comes from
 * the element's own CSS border-radius, so styles stay the source of truth.
 *
 * Where corner-shape is missing, the element is clipped with a path that tracks
 * its size. Clipping hides outer box-shadows, so put shadows on a wrapper.
 */
export declare function useSquircle(ref: RefObject<HTMLElement | null>, smoothing?: number, 
/** Anything that changes the radius without changing the size, such as a radius prop. */
radiusKey?: unknown): void;
/**
 * Continuous corners for plain app markup. Add `className="aurum-squircle"`
 * to any element and set its radius with `--aurum-radius` (a radius token),
 * then call this once at startup, for example in main.tsx.
 *
 * Chromium draws the shape natively and this does nothing there. Safari and
 * Firefox get the same clip-path fallback as useSquircle, kept up to date as
 * elements appear, resize or leave. Returns a function that stops it.
 *
 * Clipping hides outer box-shadows and borders; use inset shadows or put the
 * shadow on a wrapper, as Card does.
 */
export declare function autoSquircle(root?: ParentNode, smoothing?: number): () => void;
