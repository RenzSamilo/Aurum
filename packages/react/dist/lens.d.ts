/** True in Chromium-based browsers, the only ones that draw SVG filters in backdrop-filter. */
export declare function supportsGlassLens(): boolean;
/**
 * The displacement map for a w x h rounded rectangle with corner radius r: red is the
 * horizontal shift and green the vertical, 128 meaning none. Returns RGBA bytes.
 */
export declare function lensMap(width: number, height: number, radius: number, bezel: number): Uint8ClampedArray;
export interface GlassLensProps {
    /** Width of the bending band along the edge, in px. */
    bezel?: number;
    /** How far, in px, the backdrop shifts at the very edge. */
    strength?: number;
}
/**
 * Put inside a Glass to bend its backdrop near the edge (Chromium only). It sets
 * `--aurum-glass-lens` on the parent, which aurum.css adds to the backdrop-filter.
 */
export declare function GlassLens({ bezel, strength }: GlassLensProps): import("react").JSX.Element | null;
