// @vitest-environment jsdom
import { act, createElement, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSquircle } from '../src/squircle';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Box({ radius }: { radius: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useSquircle(ref, 0.6, radius);
  return createElement('div', { ref, style: { borderTopLeftRadius: radius, transform: 'scale(0.5)' } });
}

describe('useSquircle fallback', () => {
  beforeEach(() => {
    // Act like Safari or Firefox (jsdom answers true to every CSS.supports query).
    vi.spyOn(CSS, 'supports').mockReturnValue(false);
    globalThis.ResizeObserver = class {
      observe() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 200 });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 100 });
    // Transformed bounding box is half the size; the clip must ignore it.
    // jsdom caches computed style across inline-style changes; read the inline value instead.
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => (el as HTMLElement).style);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 50 } as DOMRect);
  });
  afterEach(() => vi.restoreAllMocks());

  it('uses the untransformed size and follows radius changes', async () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(createElement(Box, { radius: '10px' })));
    const el = host.firstElementChild as HTMLElement;
    const first = el.style.clipPath;
    expect(first).toContain('L200 ');
    await act(async () => root.render(createElement(Box, { radius: '30px' })));
    expect(el.style.clipPath).not.toBe(first);
    root.unmount();
  });
});
