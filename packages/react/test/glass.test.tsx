// @vitest-environment jsdom
import axe from 'axe-core';
import { act, createElement as h } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Glass } from '../src/core/components';
import { Button, SegmentedControl } from '../src/core/controls';
import { Card } from '../src/core/surfaces';

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

describe('web glass', () => {
  it('Glass takes a tint and can turn its rim off', async () => {
    await render(h(Glass, { tint: 'var(--color-accent)', rim: false }, 'Hi'));
    const g = host.querySelector<HTMLElement>('.aurum-glass')!;
    expect(g.dataset.level).toBe('regular');
    expect(g.dataset.rim).toBe('off');
    expect(g.hasAttribute('data-tinted')).toBe(true);
    expect(g.style.getPropertyValue('--aurum-glass-tint-color')).toBe('var(--color-accent)');
    await render(h(Glass, null, 'Hi'));
    expect(host.querySelector('.aurum-glass')!.hasAttribute('data-rim')).toBe(false);
  });

  it('Button has a clear-glass variant that is still a real button', async () => {
    await render(h(Button, { variant: 'glass' }, 'Play'));
    const b = host.querySelector('button')!;
    expect(b.classList.contains('aurum-glass')).toBe(true);
    expect(b.dataset.level).toBe('clear');
    expect(b.dataset.variant).toBe('glass');
    await noAxeViolations();
  });

  it('Card takes a material level and drops its shadow filter', async () => {
    await render(h(Card, { material: 'thin' }, 'Over a photo'));
    const card = host.querySelector<HTMLElement>('.aurum-card')!;
    expect(card.classList.contains('aurum-glass')).toBe(true);
    expect(card.dataset.level).toBe('thin');
    expect(host.querySelector<HTMLElement>('.aurum-card-shadow')!.dataset.elevation).toBe('flat');
    await noAxeViolations();
  });

  it('SegmentedControl has a glass track', async () => {
    await render(
      h(SegmentedControl, {
        'aria-label': 'Speed',
        glass: true,
        value: '1x',
        onValueChange: () => {},
        segments: [
          { value: '1x', label: '1x' },
          { value: '2x', label: '2x' },
        ],
      }),
    );
    const track = host.querySelector<HTMLElement>('[role="radiogroup"]')!;
    expect(track.classList.contains('aurum-glass')).toBe(true);
    expect(track.dataset.glass).toBe('true');
    expect(track.dataset.level).toBe('clear');
    await noAxeViolations();
  });
});
