// @vitest-environment jsdom
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Glass } from '../src/core/components';
import { lensMap, supportsGlassLens } from '../src/lens';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const px = (map: Uint8ClampedArray, w: number, x: number, y: number) => [map[(y * w + x) * 4], map[(y * w + x) * 4 + 1]];

describe('lensMap', () => {
  it('leaves the middle alone and shifts the rim toward the centre', () => {
    const w = 200;
    const h = 60;
    const map = lensMap(w, h, 30, 20);
    expect(px(map, w, 100, 30)).toEqual([128, 128]);
    // feDisplacementMap samples at x + scale * (R - 0.5): the left rim samples to its right, toward the centre.
    const [rLeft] = px(map, w, 1, 30);
    const [rRight] = px(map, w, 198, 30);
    expect(rLeft).toBeGreaterThan(128);
    expect(rRight).toBeLessThan(128);
    const [, gTop] = px(map, w, 100, 0);
    const [, gBottom] = px(map, w, 100, 59);
    expect(gTop).toBeGreaterThan(128);
    expect(gBottom).toBeLessThan(128);
  });
});

describe('Glass lens', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders nothing outside Chromium, so Safari keeps its blur', async () => {
    expect(supportsGlassLens()).toBe(false);
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(h(Glass, { lens: true }, 'Hi')));
    expect(host.querySelector('svg')).toBeNull();
    expect(host.querySelector('.aurum-glass')!.hasAttribute('data-lens')).toBe(false);
    root.unmount();
  });

  it('adds a hidden filter in Chromium', async () => {
    vi.stubGlobal('navigator', { ...navigator, userAgentData: { brands: [{ brand: 'Chromium' }] } });
    expect(supportsGlassLens()).toBe(true);
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(h(Glass, { lens: true }, 'Hi')));
    const svg = host.querySelector('svg.aurum-glass-lens')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    root.unmount();
  });
});
