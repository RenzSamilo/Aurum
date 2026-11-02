// @vitest-environment jsdom
import axe from 'axe-core';
import { act, createElement as h, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Switch } from '../src/controls';
import * as haptics from '../src/haptics';
import { Card, ListRow, ListSection, Sheet } from '../src/surfaces';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  vi.spyOn(haptics, 'playHaptic').mockReturnValue(true);
  // jsdom lacks the modal dialog API.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
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

describe('ListSection and ListRow', () => {
  it('renders the right element per row type and stays accessible', async () => {
    const onPress = vi.fn();
    await render(
      h(
        ListSection,
        { header: 'Account', footer: 'Changes sync to every device.' },
        h(ListRow, { title: 'Profile', href: '#profile' }),
        h(ListRow, { title: 'Language', value: 'English', onPress }),
        h(ListRow, { title: 'Wi-Fi only', trailing: h(Switch, { checked: true, onCheckedChange: () => {}, 'aria-label': 'Wi-Fi only' }) }),
        h(ListRow, { title: 'Version', value: '1.0' }),
        h(ListRow, { title: 'Sign out', onPress, destructive: true, chevron: false }),
      ),
    );
    const rows = [...host.querySelectorAll('.aurum-row')];
    expect(rows.map((r) => r.tagName)).toEqual(['A', 'BUTTON', 'DIV', 'DIV', 'BUTTON']);
    expect(host.querySelectorAll('.aurum-row-chevron')).toHaveLength(2);
    expect(host.querySelector('section')!.getAttribute('aria-labelledby')).toBe(host.querySelector('h3')!.id);
    await act(async () => (rows[1] as HTMLElement).click());
    expect(onPress).toHaveBeenCalledOnce();
    await noAxeViolations();
  });
});

describe('Card', () => {
  it('is a button only when pressable', async () => {
    const onPress = vi.fn();
    await render(h('div', null, h(Card, null, 'Static'), h(Card, { onPress }, 'Open report')));
    const cards = [...host.querySelectorAll('.aurum-card')];
    expect(cards.map((c) => c.tagName)).toEqual(['DIV', 'BUTTON']);
    await act(async () => (cards[1] as HTMLElement).click());
    expect(onPress).toHaveBeenCalledOnce();
    await noAxeViolations();
  });
});

describe('Sheet', () => {
  function Demo({ dismissible = true }: { dismissible?: boolean }) {
    const [open, setOpen] = useState(false);
    return h(
      'div',
      null,
      h('button', { type: 'button', onClick: () => setOpen(true) }, 'Open'),
      h(Sheet, { open, onOpenChange: setOpen, title: 'Filters', dismissible }, h('p', null, 'Body')),
    );
  }

  it('opens as a labelled modal dialog and closes on Escape and the close button', async () => {
    await render(h(Demo));
    const dialog = host.querySelector('dialog')!;
    expect(dialog.open).toBe(false);
    await act(async () => host.querySelector('button')!.click());
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe(host.querySelector('.aurum-sheet-title')!.id);
    expect(haptics.playHaptic).toHaveBeenCalledWith('impactLight');

    await act(async () => {
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    // No transition in jsdom, so it closes straight away.
    expect(dialog.open).toBe(false);

    await act(async () => host.querySelector('button')!.click());
    expect(dialog.open).toBe(true);
    await act(async () => (host.querySelector('[aria-label="Close"]') as HTMLElement).click());
    expect(dialog.open).toBe(false);
  });

  it('ignores Escape and the backdrop when not dismissible', async () => {
    await render(h(Demo, { dismissible: false }));
    await act(async () => host.querySelector('button')!.click());
    const dialog = host.querySelector('dialog')!;
    const cancel = new Event('cancel', { cancelable: true });
    await act(async () => {
      dialog.dispatchEvent(cancel);
      dialog.click();
    });
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog.dataset.state).toBe('open');
    expect(host.querySelector('.aurum-sheet-grabber')).toBeNull();
  });
});
