// Lens glass: the backdrop bends near the edge of a glass shape, like light through a thick
// pane, instead of only blurring.
//
// It is an SVG displacement filter used in `backdrop-filter`. Only Chromium (Chrome, Edge and
// Android browsers) draws SVG filters there. Safari and Firefox would drop the whole
// backdrop-filter, blur included, so on them <GlassLens> renders nothing and the glass stays
// as it was. Every browser on iPhone is Safari underneath, so iPhones keep plain glass.
//
// The filter's map is drawn once per size on a canvas: each pixel says how far, and which way,
// to shift what is behind it. Pixels inside the bezel (the band along the edge) are shifted
// toward the centre, most at the very edge, so content appears to curve around the rim.

import { useId, useLayoutEffect, useRef, useState } from 'react';

/** True in Chromium-based browsers, the only ones that draw SVG filters in backdrop-filter. */
export function supportsGlassLens(): boolean {
  if (typeof navigator === 'undefined') return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
  return !!brands?.some((b) => b.brand === 'Chromium');
}

/**
 * The displacement map for a w x h rounded rectangle with corner radius r: red is the
 * horizontal shift and green the vertical, 128 meaning none. Returns RGBA bytes.
 */
export function lensMap(width: number, height: number, radius: number, bezel: number): Uint8ClampedArray {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const r = Math.min(radius, w / 2, h / 2);
  const data = new Uint8ClampedArray(w * h * 4);
  const hx = w / 2 - r;
  const hy = h / 2 - r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Signed distance to the rounded rectangle's edge, and the outward direction at that point.
      const px = x + 0.5 - w / 2;
      const py = y + 0.5 - h / 2;
      const qx = Math.abs(px) - hx;
      const qy = Math.abs(py) - hy;
      let nx: number;
      let ny: number;
      let inside: number;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        nx = qx / len;
        ny = qy / len;
        inside = r - len;
      } else if (qx > qy) {
        nx = 1;
        ny = 0;
        inside = r - qx;
      } else {
        nx = 0;
        ny = 1;
        inside = r - qy;
      }
      // Strongest at the edge, easing to nothing at the inner side of the bezel.
      const t = bezel > 0 ? Math.max(0, 1 - inside / bezel) : 0;
      const m = t * t;
      const sx = Math.sign(px) * nx * m;
      const sy = Math.sign(py) * ny * m;
      const i = (y * w + x) * 4;
      // Sample from further in: content near the rim appears pulled outward and curved.
      data[i] = Math.round(128 - sx * 127);
      data[i + 1] = Math.round(128 - sy * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  return data;
}

function mapUrl(width: number, height: number, radius: number, bezel: number): string | null {
  if (typeof document === 'undefined') return null;
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.putImageData(new ImageData(lensMap(w, h, radius, bezel), w, h), 0, 0);
  return canvas.toDataURL();
}

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
export function GlassLens({ bezel = 20, strength = 12 }: GlassLensProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = `aurum-lens-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);
  const supported = supportsGlassLens();

  useLayoutEffect(() => {
    const host = ref.current?.parentElement;
    if (!supported || !host || typeof ResizeObserver === 'undefined') return;
    let last = '';
    const draw = () => {
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      const radius = parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0;
      const key = `${w}x${h}x${radius}`;
      if (key === last || !w || !h) return;
      last = key;
      const url = mapUrl(w, h, radius, bezel);
      if (url) setMap({ url, w, h });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(host);
    draw();
    return () => observer.disconnect();
  }, [supported, bezel]);

  // Point the backdrop at the filter only once it exists: a missing filter would switch the blur off too.
  const ready = map !== null;
  useLayoutEffect(() => {
    const host = ref.current?.parentElement;
    if (!ready || !host) return;
    host.style.setProperty('--aurum-glass-lens', `url(#${id})`);
    host.setAttribute('data-lens', '');
    return () => {
      host.style.removeProperty('--aurum-glass-lens');
      host.removeAttribute('data-lens');
    };
  }, [ready, id]);

  if (!supported) return null;
  return (
    <svg ref={ref} className="aurum-glass-lens" aria-hidden="true" focusable="false" width="0" height="0">
      {map && (
        <filter id={id} x="0" y="0" width={map.w} height={map.h} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage href={map.url} x="0" y="0" width={map.w} height={map.h} result="map" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={strength * 2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      )}
    </svg>
  );
}
