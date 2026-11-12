// @vitest-environment jsdom
import axe from 'axe-core';
import { act, createElement as h, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackButton, TabBar, type TabBarItem, TopBar } from '../src/core/navigation';
import * as haptics from '../src/haptics';

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
  vi.restoreAllMocks();
});
const render = (el: React.ReactElement) => act(async () => root.render(el));

async function noAxeViolations() {
  const result = await axe.run(host, { rules: { 'color-contrast': { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

const icon = (name: string) => h('svg', { 'data-icon': name, viewBox: '0 0 24 24' });
const tabs: TabBarItem[] = [
  { label: 'Home', icon: icon('home'), selectedIcon: icon('home-fill') },
  { label: 'Search', icon: icon('search') },
  { label: 'Profile', icon: icon('profile') },
];

describe('TabBar', () => {
  it('is a named nav landmark; the selected tab is aria-current and shows its selected icon', async () => {
    const play = vi.spyOn(haptics, 'playHaptic').mockReturnValue(true);
    function Demo() {
      const [i, setI] = useState(0);
      return h(TabBar, { tabs, selectedIndex: i, onSelectedChange: setI, 'aria-label': 'Main' });
    }
    await render(h(Demo));
    const nav = host.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Main');
    expect(nav.classList.contains('aurum-glass')).toBe(true);
    const buttons = [...host.querySelectorAll('button')];
    expect(buttons.map((b) => b.textContent)).toEqual(['Home', 'Search', 'Profile']);
    expect(buttons[0]!.getAttribute('aria-current')).toBe('page');
    expect(host.querySelector('[data-icon="home-fill"]')).not.toBeNull();

    await act(async () => buttons[2]!.click());
    expect(buttons[2]!.getAttribute('aria-current')).toBe('page');
    expect(buttons[0]!.hasAttribute('aria-current')).toBe(false);
    expect(host.querySelector('[data-icon="home"]')).not.toBeNull();
    expect(play).toHaveBeenCalledWith('selectionTick');

    // Re-selecting the current tab still reports it (scroll to top), without a haptic.
    play.mockClear();
    await act(async () => buttons[2]!.click());
    expect(play).not.toHaveBeenCalled();
    await noAxeViolations();
  });

  it('renders links when tabs have href', async () => {
    const onSelectedChange = vi.fn();
    await render(
      h(TabBar, {
        tabs: tabs.map((t, i) => ({ ...t, href: `#tab-${i}` })),
        selectedIndex: 1,
        onSelectedChange,
      }),
    );
    const links = [...host.querySelectorAll('a')];
    expect(links).toHaveLength(3);
    expect(links[1]!.getAttribute('aria-current')).toBe('page');
    await act(async () => links[0]!.click());
    expect(onSelectedChange).toHaveBeenCalledWith(0);
    await noAxeViolations();
  });
});

describe('TopBar and BackButton', () => {
  it('makes a text title the h1 and keeps the three slots', async () => {
    await render(h(TopBar, { leading: h(BackButton, { onClick: () => {} }), title: 'Settings', trailing: h('button', { type: 'button' }, 'Done') }));
    expect(host.querySelector('h1')!.textContent).toBe('Settings');
    expect(host.querySelector('.aurum-top-bar-leading button')!.getAttribute('aria-label')).toBe('Back');
    expect(host.querySelector('.aurum-top-bar-trailing')!.textContent).toBe('Done');
    await noAxeViolations();
  });

  it('goes back in history by default, or calls onClick', async () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    await render(h(BackButton));
    await act(async () => host.querySelector('button')!.click());
    expect(back).toHaveBeenCalledOnce();

    const onClick = vi.fn();
    await render(h(BackButton, { onClick, 'aria-label': 'Back to inbox' }));
    const btn = host.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('Back to inbox');
    await act(async () => btn.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(back).toHaveBeenCalledOnce();
  });
});
