// Continuous ("squircle") corners.
//
// Chromium 139+ draws them natively with `corner-shape: superellipse()`, which
// aurum.css applies to `.aurum-squircle`, tuned to match this path. Other browsers get an SVG clip-path
// built here: a circular arc in the middle of each corner, eased into the
// straight edges with two cubic curves. `smoothing` (0 to 1) is how far the
// ease reaches along the edge; 0 is a plain rounded rectangle.

import { type RefObject, useLayoutEffect } from 'react';
import { shapeSmoothing } from './tokens/tokens';

const rad = (deg: number) => (deg * Math.PI) / 180;
const n = (v: number) => +v.toFixed(3);

interface Corner {
  a: number;
  b: number;
  c: number;
  d: number;
  p: number;
  arc: number;
  r: number;
}

function corner(radius: number, smoothing: number, budget: number): Corner {
  const r = Math.min(radius, budget);
  // How far the curve starts along the edge. Smoothing shrinks when there is no room.
  const p = Math.min((1 + smoothing) * r, budget);
  const s = r > 0 ? Math.min(smoothing, p / r - 1) : 0;
  const arcDeg = 90 * (1 - s);
  const arc = Math.sin(rad(arcDeg / 2)) * r * Math.SQRT2;
  const alpha = (90 - arcDeg) / 2;
  const p3ToP4 = r * Math.tan(rad(alpha / 2));
  const beta = 45 * s;
  const c = p3ToP4 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - arc - c - d) / 3;
  return { a: 2 * b, b, c, d, p, arc, r };
}

/**
 * SVG path data for a w x h rectangle with continuous corners. The path starts
 * at the top edge and runs clockwise.
 */
export function squirclePath(width: number, height: number, radius: number, smoothing = shapeSmoothing): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  if (radius <= 0 || w === 0 || h === 0) return `M0 0H${n(w)}V${n(h)}H0Z`;
  const { a, b, c, d, p, arc, r } = corner(radius, smoothing, Math.min(w, h) / 2);
  const ab = a + b;
  const abc = a + b + c;
  const bc = b + c;
  return [
    `M${n(w - p)} 0`,
    `c${n(a)} 0 ${n(ab)} 0 ${n(abc)} ${n(d)}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(arc)}`,
    `c${n(d)} ${n(c)} ${n(d)} ${n(bc)} ${n(d)} ${n(abc)}`,
    `L${n(w)} ${n(h - p)}`,
    `c0 ${n(a)} 0 ${n(ab)} ${n(-d)} ${n(abc)}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(arc)}`,
    `c${n(-c)} ${n(d)} ${n(-bc)} ${n(d)} ${n(-abc)} ${n(d)}`,
    `L${n(p)} ${n(h)}`,
    `c${n(-a)} 0 ${n(-ab)} 0 ${n(-abc)} ${n(-d)}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(-arc)} ${n(-arc)}`,
    `c${n(-d)} ${n(-c)} ${n(-d)} ${n(-bc)} ${n(-d)} ${n(-abc)}`,
    `L0 ${n(p)}`,
    `c0 ${n(-a)} 0 ${n(-ab)} ${n(d)} ${n(-abc)}`,
    `a${n(r)} ${n(r)} 0 0 1 ${n(arc)} ${n(-arc)}`,
    `c${n(c)} ${n(-d)} ${n(bc)} ${n(-d)} ${n(abc)} ${n(-d)}`,
    'Z',
  ].join('');
}

/** True when the browser draws continuous corners itself. */
export function supportsNativeSquircle(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('corner-shape', 'superellipse(2)');
}

/**
 * Gives an element continuous corners in every browser. The radius comes from
 * the element's own CSS border-radius, so styles stay the source of truth.
 *
 * Where corner-shape is missing, the element is clipped with a path that tracks
 * its size. Clipping hides outer box-shadows, so put shadows on a wrapper.
 */
export function useSquircle(ref: RefObject<HTMLElement | null>, smoothing = shapeSmoothing): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || supportsNativeSquircle() || typeof ResizeObserver === 'undefined') return;
    const apply = () => {
      const { width, height } = el.getBoundingClientRect();
      // The radius as authored: aurum.css only stretches it when the browser is native.
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      el.style.clipPath = `path("${squirclePath(width, height, radius, smoothing)}")`;
    };
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    apply();
    return () => {
      observer.disconnect();
      el.style.clipPath = '';
    };
  }, [ref, smoothing]);
}
