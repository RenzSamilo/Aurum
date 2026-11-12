// @vitest-environment jsdom
import axe from 'axe-core';
import { act, createElement as h } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProgressRing } from '../src/core/feedback';
import { Avatar, Badge, initialsOf } from '../src/core/identity';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
const render = (el: React.ReactElement) => act(async () => root.render(el));

async function noAxeViolations() {
  const result = await axe.run(host, { rules: { 'color-contrast': { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

describe('ProgressRing', () => {
  it('is a labelled progressbar with a percentage, clamped to 0..1', async () => {
    await render(h(ProgressRing, { value: 0.5, 'aria-label': "Today's sets" }, '3/6'));
    const bar = host.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-label')).toBe("Today's sets");
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
    expect(bar.getAttribute('aria-valuetext')).toBe('50%');
    expect(host.querySelector('.aurum-progress-ring-content')!.getAttribute('aria-hidden')).toBe('true');
    await noAxeViolations();

    await render(h(ProgressRing, { value: 1.7, 'aria-label': 'Done' }));
    expect(host.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('100');
    await render(h(ProgressRing, { value: -1, 'aria-label': 'None' }));
    expect(host.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('0');
    expect(host.querySelector('.aurum-progress-ring-value')).toBeNull();
  });

  it('takes token colours and its size as CSS variables', async () => {
    await render(h(ProgressRing, { value: 0.25, size: 64, stroke: 6, color: 'var(--color-success)', 'aria-label': 'Ring' }));
    const bar = host.querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(bar.style.getPropertyValue('--aurum-ring-size')).toBe('64px');
    expect(bar.style.getPropertyValue('--aurum-ring-color')).toBe('var(--color-success)');
  });
});

describe('Avatar', () => {
  it('reads the name and shows up to two initials', async () => {
    expect(initialsOf('  ada  lovelace byron ')).toBe('AB');
    expect(initialsOf('Renz')).toBe('R');
    expect(initialsOf('')).toBe('');
    await render(h(Avatar, { name: 'Ada Lovelace' }));
    const img = host.querySelector('[role="img"]')!;
    expect(img.getAttribute('aria-label')).toBe('Ada Lovelace');
    expect(img.textContent).toBe('AL');
    await noAxeViolations();
  });

  it('shows the picture, and falls back to initials if it fails', async () => {
    await render(h(Avatar, { name: 'Ada Lovelace', src: 'https://example.invalid/a.png', size: 64, ring: true }));
    const pic = host.querySelector('img')!;
    expect(pic.getAttribute('alt')).toBe('');
    expect(host.querySelector('.aurum-avatar')!.getAttribute('data-ring')).toBe('thick');
    await act(async () => {
      pic.dispatchEvent(new Event('error'));
    });
    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent).toBe('AL');
  });
});

describe('Badge', () => {
  it('is plain text with tone and appearance', async () => {
    await render(h(Badge, { tone: 'danger', appearance: 'solid' }, 'New'));
    const badge = host.querySelector('.aurum-badge')!;
    expect(badge.textContent).toBe('New');
    expect(badge.getAttribute('data-tone')).toBe('danger');
    expect(badge.getAttribute('data-appearance')).toBe('solid');
    await noAxeViolations();
  });
});
