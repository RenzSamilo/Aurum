// @vitest-environment jsdom
import { act, createElement, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { autoSquircle, useSquircle } from '../src/squircle';

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

describe('autoSquircle', () => {
  beforeEach(() => {
    vi.spyOn(CSS, 'supports').mockReturnValue(false);
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 200 });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 100 });
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => (el as HTMLElement).style);
  });
  afterEach(() => vi.restoreAllMocks());

  const tile = () => {
    const el = document.createElement('div');
    el.className = 'aurum-squircle';
    el.style.borderTopLeftRadius = '24px';
    return el;
  };
  const flush = () => new Promise((r) => setTimeout(r, 0));

  it('clips existing and newly added .aurum-squircle elements, and stops cleanly', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const first = tile();
    host.appendChild(first);
    const stop = autoSquircle(host);
    expect(first.style.clipPath).toContain('path(');

    const later = tile();
    host.appendChild(later);
    await flush();
    expect(later.style.clipPath).toContain('path(');

    const plain = document.createElement('div');
    host.appendChild(plain);
    plain.className = 'aurum-squircle';
    plain.style.borderTopLeftRadius = '12px';
    await flush();
    expect(plain.style.clipPath).toContain('path(');

    stop();
    expect(first.style.clipPath).toBe('');
    expect(later.style.clipPath).toBe('');
    host.remove();
  });

  it('leaves elements to useSquircle when it already manages them, and does nothing where corners are native', async () => {
    const host = document.createElement('div');
    const managed = tile();
    managed.setAttribute('data-squircle-hook', '');
    host.appendChild(managed);
    const stop = autoSquircle(host);
    expect(managed.style.clipPath).toBe('');
    stop();

    vi.mocked(CSS.supports).mockReturnValue(true);
    const native = tile();
    host.appendChild(native);
    autoSquircle(host)();
    expect(native.style.clipPath).toBe('');
  });
});
