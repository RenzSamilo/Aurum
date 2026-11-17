// Continuous ("squircle") corners.
//
// Chromium 139+ draws them natively with `corner-shape: superellipse()`, which
// aurum.css applies to `.aurum-squircle`, tuned to match this path. Other browsers get an SVG clip-path
// built here: a circular arc in the middle of each corner, eased into the
// straight edges with two cubic curves. `smoothing` (0 to 1) is how far the
// ease reaches along the edge; 0 is a plain rounded rectangle.

import { type RefObject, useLayoutEffect } from 'react';
import { shapeSmoothing } from './tokens/tokens';

/** Marks an element whose corners useSquircle already handles, so autoSquircle leaves it alone. */
const HOOK_FLAG = 'data-squircle-hook';

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
export function useSquircle(
  ref: RefObject<HTMLElement | null>,
  smoothing = shapeSmoothing,
  /** Anything that changes the radius without changing the size, such as a radius prop. */
  radiusKey?: unknown,
): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || supportsNativeSquircle() || typeof ResizeObserver === 'undefined') return;
    const apply = () => {
      // Layout size, before transforms: path() coordinates are local to the element,
      // so a scaled or rotated box must not shrink its own clip.
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      // The radius as authored: aurum.css only stretches it when the browser is native.
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      el.style.clipPath = `path("${squirclePath(width, height, radius, smoothing)}")`;
    };
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    el.setAttribute(HOOK_FLAG, '');
    apply();
    return () => {
      observer.disconnect();
      el.removeAttribute(HOOK_FLAG);
      el.style.clipPath = '';
    };
  }, [ref, smoothing, radiusKey]);
}

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
export function autoSquircle(root: ParentNode = document, smoothing = shapeSmoothing): () => void {
  if (supportsNativeSquircle() || typeof ResizeObserver === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {};
  }
  const tracked = new Set<HTMLElement>();
  const clip = (el: HTMLElement) => {
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    el.style.clipPath = `path("${squirclePath(el.offsetWidth, el.offsetHeight, radius, smoothing)}")`;
  };
  const sizes = new ResizeObserver((entries) => {
    for (const entry of entries) clip(entry.target as HTMLElement);
  });
  const track = (el: HTMLElement) => {
    if (tracked.has(el) || el.hasAttribute(HOOK_FLAG)) return;
    tracked.add(el);
    sizes.observe(el);
    clip(el);
  };
  const scan = (node: ParentNode) => {
    if (node instanceof HTMLElement && node.classList.contains('aurum-squircle')) track(node);
    node.querySelectorAll<HTMLElement>('.aurum-squircle').forEach(track);
  };
  const changes = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') {
        const el = record.target as HTMLElement;
        if (!el.classList.contains('aurum-squircle')) {
          if (tracked.has(el)) release(el);
        } else if (tracked.has(el)) {
          // A class change can swap --aurum-radius without resizing, so ResizeObserver stays quiet.
          clip(el);
        } else track(el);
        continue;
      }
      record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) scan(node);
      });
    }
    // Forget elements that left the document.
    for (const el of tracked) if (!el.isConnected) release(el);
  });
  const release = (el: HTMLElement) => {
    tracked.delete(el);
    sizes.unobserve(el);
    el.style.clipPath = '';
  };
  scan(root);
  changes.observe(root instanceof Document ? root.documentElement : (root as Node), {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => {
    changes.disconnect();
    sizes.disconnect();
    for (const el of [...tracked]) release(el);
  };
}
