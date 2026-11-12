// @vitest-environment jsdom
import axe from 'axe-core';
import { act, createElement, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button, SegmentedControl, Switch } from '../src/core/controls';
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
const press = (el: Element, key: string) =>
  act(async () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });

async function noAxeViolations() {
  const result = await axe.run(host, { rules: { 'color-contrast': { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

describe('Button', () => {
  it('is a real button, type=button by default, and haptics are opt-in', async () => {
    const play = vi.spyOn(haptics, 'playHaptic').mockReturnValue(true);
    const onClick = vi.fn();
    await render(createElement(Button, { onClick }, 'Save'));
    const btn = host.querySelector('button')!;
    expect(btn.type).toBe('button');
    await act(async () => btn.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(play).not.toHaveBeenCalled();
    await render(createElement(Button, { haptic: 'impactLight' }, 'Save'));
    await act(async () => host.querySelector('button')!.click());
    expect(play).toHaveBeenCalledWith('impactLight');
    await noAxeViolations();
  });
});

describe('Switch', () => {
  function Demo() {
    const [on, setOn] = useState(false);
    return createElement(Switch, { checked: on, onCheckedChange: setOn, label: 'Notifications', description: 'Daily summary' });
  }

  it('toggles from the switch and from its label, with a selection haptic', async () => {
    const play = vi.spyOn(haptics, 'playHaptic').mockReturnValue(true);
    await render(createElement(Demo));
    const sw = host.querySelector('[role="switch"]')!;
    expect(sw.getAttribute('aria-checked')).toBe('false');
    await act(async () => (sw as HTMLElement).click());
    expect(sw.getAttribute('aria-checked')).toBe('true');
    await act(async () => host.querySelector('label')!.click());
    expect(sw.getAttribute('aria-checked')).toBe('false');
    expect(play).toHaveBeenCalledWith('selectionTick');
    expect(sw.getAttribute('aria-describedby')).toBe(host.querySelector('.aurum-switch-description')!.id);
    await noAxeViolations();
  });
});

describe('SegmentedControl', () => {
  function Demo({ onChange }: { onChange?: (v: string) => void }) {
    const [v, setV] = useState('day');
    return createElement(SegmentedControl<string>, {
      'aria-label': 'Range',
      value: v,
      onValueChange: (next) => {
        setV(next);
        onChange?.(next);
      },
      segments: [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week', disabled: true },
        { value: 'month', label: 'Month' },
      ],
    });
  }

  it('is a radio group with one tab stop, and arrows skip disabled segments', async () => {
    vi.spyOn(haptics, 'playHaptic').mockReturnValue(true);
    const onChange = vi.fn();
    await render(createElement(Demo, { onChange }));
    const group = host.querySelector('[role="radiogroup"]')!;
    const radios = [...host.querySelectorAll('[role="radio"]')] as HTMLButtonElement[];
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);
    await press(group, 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith('month');
    expect(radios[2]!.getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(radios[2]);
    await press(group, 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith('day');
    await press(group, 'End');
    expect(onChange).toHaveBeenLastCalledWith('month');
    expect((group as HTMLElement).style.getPropertyValue('--aurum-segment-index')).toBe('2');
    await noAxeViolations();
  });
});
