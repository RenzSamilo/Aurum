// @vitest-environment jsdom
import axe from 'axe-core';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu, type MenuItem } from '../src/core/menu';
import * as haptics from '../src/haptics';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  vi.spyOn(haptics, 'playHaptic').mockReturnValue(true);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

const press = (key: string, el: Element = document.activeElement!) =>
  act(async () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });

function setup(extra: Partial<MenuItem>[] = []) {
  const picked: string[] = [];
  const items: MenuItem[] = [
    { label: 'Rename', onSelect: () => picked.push('Rename') },
    { label: 'Duplicate', onSelect: () => picked.push('Duplicate') },
    { label: 'Archive', onSelect: () => picked.push('Archive'), disabled: true },
    { label: 'Delete', onSelect: () => picked.push('Delete'), destructive: true },
    ...extra.map((e) => ({ label: 'x', onSelect: () => {}, ...e })),
  ];
  return { items, picked };
}

async function open(items: MenuItem[]) {
  await act(async () => root.render(createElement(Menu, { trigger: 'More', items })));
  const trigger = host.querySelector('button')!;
  trigger.focus();
  return trigger;
}

const focusedLabel = () => document.activeElement?.textContent;

describe('Menu', () => {
  it('opens on Arrow Down with the first item focused, and wires up ARIA', async () => {
    const { items } = setup();
    const trigger = await open(items);
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await press('ArrowDown', trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('[role="menu"]')!.id).toBe(trigger.getAttribute('aria-controls'));
    expect(focusedLabel()).toBe('Rename');
  });

  it('opens on Arrow Up with the last item focused', async () => {
    const trigger = await open(setup().items);
    await press('ArrowUp', trigger);
    expect(focusedLabel()).toBe('Delete');
  });

  it('moves with arrows, wraps, skips disabled items, and jumps with Home and End', async () => {
    const trigger = await open(setup().items);
    await press('ArrowDown', trigger);
    await press('ArrowDown');
    expect(focusedLabel()).toBe('Duplicate');
    await press('ArrowDown');
    expect(focusedLabel()).toBe('Delete'); // Archive is disabled
    await press('ArrowDown');
    expect(focusedLabel()).toBe('Rename'); // wraps
    await press('End');
    expect(focusedLabel()).toBe('Delete');
    await press('Home');
    expect(focusedLabel()).toBe('Rename');
  });

  it('jumps to an item when you type its first letters (borrowed typeahead)', async () => {
    const trigger = await open(setup().items);
    await press('ArrowDown', trigger);
    await press('d');
    expect(focusedLabel()).toBe('Duplicate');
    await press('d');
    expect(focusedLabel()).toBe('Delete'); // same letter cycles
    await press('a');
    expect(focusedLabel()).not.toBe('Archive'); // disabled items are skipped
  });

  it('picks with Enter, closes, and returns focus to the button', async () => {
    const { items, picked } = setup();
    const trigger = await open(items);
    await press('ArrowDown', trigger);
    await press('ArrowDown');
    await press('Enter');
    expect(picked).toEqual(['Duplicate']);
    expect(host.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Escape without picking, and ignores clicks on disabled items', async () => {
    const { items, picked } = setup();
    const trigger = await open(items);
    await press('ArrowDown', trigger);
    const archive = [...host.querySelectorAll('[role="menuitem"]')].find((el) => el.textContent === 'Archive')!;
    expect(archive.getAttribute('aria-disabled')).toBe('true');
    await act(async () => (archive as HTMLElement).click());
    expect(picked).toEqual([]);
    await press('Escape');
    expect(host.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('has no axe violations while open', async () => {
    const trigger = await open(setup().items);
    await press('ArrowDown', trigger);
    const result = await axe.run(host, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});
