// @vitest-environment jsdom
import axe from 'axe-core';
import { act, createElement as h, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TextField } from '../src/core/text-field';

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
const key = (el: Element, k: string, init: KeyboardEventInit = {}) =>
  act(async () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
  });
// React tracks input values; set through the native setter so onChange fires.
const type = (el: HTMLInputElement | HTMLTextAreaElement, text: string) =>
  act(async () => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

async function noAxeViolations() {
  const result = await axe.run(host, { rules: { 'color-contrast': { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

describe('TextField', () => {
  it('names the input with its label, not the placeholder, and reports typing', async () => {
    const seen: string[] = [];
    function Demo() {
      const [v, setV] = useState('');
      return h(TextField, { label: 'Email', placeholder: 'you@example.com', value: v, onValueChange: (x: string) => (setV(x), seen.push(x)) });
    }
    await render(h(Demo));
    const input = host.querySelector('input')!;
    expect(input.getAttribute('aria-label')).toBe('Email');
    expect(input.placeholder).toBe('you@example.com');
    await type(input, 'a@b.co');
    expect(seen).toEqual(['a@b.co']);
    expect(input.value).toBe('a@b.co');
    await noAxeViolations();
  });

  it('submits on Enter in one line, and on Cmd/Ctrl+Enter in multi-line', async () => {
    const onValueSubmit = vi.fn();
    await render(h(TextField, { label: 'Search', defaultValue: 'rings', onValueSubmit }));
    await key(host.querySelector('input')!, 'Enter');
    expect(onValueSubmit).toHaveBeenCalledWith('rings');

    onValueSubmit.mockClear();
    await render(h(TextField, { label: 'Message', defaultValue: 'hi', maxLines: 4, onValueSubmit }));
    const area = host.querySelector('textarea')!;
    expect(area).not.toBeNull();
    await key(area, 'Enter');
    expect(onValueSubmit).not.toHaveBeenCalled();
    await key(area, 'Enter', { ctrlKey: true });
    expect(onValueSubmit).toHaveBeenCalledWith('hi');
    await noAxeViolations();
  });

  it('passes input attributes through and can be disabled', async () => {
    await render(
      h(TextField, { label: 'Amount', inputMode: 'decimal', enterKeyHint: 'done', disabled: true, capsule: true, trailing: h('span', null, 'kg') }),
    );
    const input = host.querySelector('input')!;
    expect(input.inputMode).toBe('decimal');
    expect(input.getAttribute('enterkeyhint')).toBe('done');
    expect(input.disabled).toBe(true);
    const box = host.querySelector('.aurum-text-field')!;
    expect(box.hasAttribute('data-capsule')).toBe(true);
    expect(box.hasAttribute('data-disabled')).toBe(true);
    await noAxeViolations();
  });
});
