import { describe, expect, it } from 'vitest';
import { squirclePath } from '../src/squircle';

/** Walks the path's relative commands and returns every point it passes through. */
function points(d: string): [number, number][] {
  const out: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([MLcaHVZ])([^MLcaHVZ]*)/g)) {
    const v = args!.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (cmd === 'M' || cmd === 'L') [x, y] = [v[0]!, v[1]!];
    if (cmd === 'c') [x, y] = [x + v[4]!, y + v[5]!];
    if (cmd === 'a') [x, y] = [x + v[5]!, y + v[6]!];
    if (cmd === 'H') x = v[0]!;
    if (cmd === 'V') y = v[0]!;
    out.push([x, y]);
  }
  return out;
}

describe('squirclePath', () => {
  it('ends on the top edge (Z draws the rest) and stays inside the box', () => {
    for (const [w, h, r] of [[200, 120, 24], [48, 48, 24], [300, 40, 32], [10, 400, 12]] as const) {
      const pts = points(squirclePath(w, h, r));
      const [sx, sy] = pts[0]!;
      const [ex, ey] = pts.at(-2)!; // last point before Z
      expect(ey).toBeCloseTo(sy, 1);
      expect(ex).toBeLessThanOrEqual(sx);
      for (const [x, y] of pts) {
        expect(x).toBeGreaterThanOrEqual(-0.01);
        expect(y).toBeGreaterThanOrEqual(-0.01);
        expect(x).toBeLessThanOrEqual(w + 0.01);
        expect(y).toBeLessThanOrEqual(h + 0.01);
      }
    }
  });

  it('reaches each edge exactly where a corner ends', () => {
    const pts = points(squirclePath(200, 100, 20, 0.6));
    // After the top-right corner the path is on the right edge.
    expect(pts[3]![0]).toBeCloseTo(200, 2);
    expect(pts[4]).toEqual([200, 100 - 32]);
  });

  it('falls back to a rectangle with no radius', () => {
    expect(squirclePath(10, 20, 0)).toBe('M0 0H10V20H0Z');
  });

  it('reduces smoothing instead of overflowing a small box', () => {
    const d = squirclePath(40, 40, 20, 1);
    expect(d).not.toContain('NaN');
    for (const [x, y] of points(d)) {
      expect(x).toBeLessThanOrEqual(40.01);
      expect(y).toBeLessThanOrEqual(40.01);
    }
  });
});
