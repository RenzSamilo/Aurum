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
