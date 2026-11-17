import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { playHaptic } from '../haptics.js';
import { useTypeahead } from '../vendor/astryx/useTypeahead.js';
/**
 * A button that opens a short list of actions.
 *
 * Keyboard: Enter, Space or Arrow Down opens it on the first item, Arrow Up on the
 * last. Arrows move, Home and End jump, letters jump to the next matching item
 * (type-to-select borrowed from Astryx), Enter or Space picks, Escape closes and
 * puts focus back on the button, Tab closes.
 */
export function Menu({ trigger, 'aria-label': ariaLabel, items, align = 'start', className, ref }) {
    const [open, setOpen] = useState(false);
    const [state, setState] = useState('open');
    const triggerRef = useRef(null);
    const listRef = useRef(null);
    const rootRef = useRef(null);
    const focusOnOpen = useRef('first');
    const menuId = useId();
    const enabled = useCallback(() => items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0), [items]);
    const itemEls = () => [...(listRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];
    const focusItem = useCallback((i) => itemEls()[i]?.focus(), []);
    const currentIndex = () => itemEls().findIndex((el) => el === document.activeElement);
    const typeahead = useTypeahead({
        getItemLabels: () => items.map((it) => it.label),
        onMatch: focusItem,
        getCurrentIndex: currentIndex,
        isDisabled: (i) => !!items[i]?.disabled,
    });
    const resetTypeahead = typeahead.reset;
    const close = useCallback((returnFocus = true) => {
        resetTypeahead();
        setState('closing');
        setOpen(false);
        if (returnFocus)
            triggerRef.current?.focus();
    }, [resetTypeahead]);
    // Focus lands on the first or last item once, when the menu opens. Read the latest items
    // through a ref so a parent re-render (new items array) doesn't pull focus back.
    const enabledRef = useRef(enabled);
    enabledRef.current = enabled;
    useEffect(() => {
        if (!open)
            return;
        setState('open');
        const list = enabledRef.current();
        if (list.length)
            focusItem(focusOnOpen.current === 'first' ? list[0] : list[list.length - 1]);
    }, [open, focusItem]);
    useEffect(() => {
        if (!open)
            return;
        const onPointerDown = (e) => {
            if (!rootRef.current?.contains(e.target))
                close(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open, close]);
    const openAt = (where) => {
        focusOnOpen.current = where;
        setOpen(true);
    };
    const pick = (item) => {
        if (item.disabled)
            return;
        playHaptic('selectionTick');
        close();
        item.onSelect();
    };
    const move = (delta) => {
        const list = enabled();
        if (!list.length)
            return;
        const pos = list.indexOf(currentIndex());
        const next = delta === 'home' ? 0 : delta === 'end' ? list.length - 1 : (pos + delta + list.length) % list.length;
        focusItem(list[next]);
    };
    return (_jsxs("div", { ref: (el) => {
            rootRef.current = el;
            if (typeof ref === 'function')
                ref(el);
            else if (ref)
                ref.current = el;
        }, className: ['aurum-menu', className].filter(Boolean).join(' '), children: [_jsx("button", { ref: triggerRef, type: "button", className: "aurum-menu-trigger", "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? menuId : undefined, "aria-label": ariaLabel, onClick: () => (open ? close() : openAt('first')), onKeyDown: (e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        openAt(e.key === 'ArrowDown' ? 'first' : 'last');
                    }
                }, children: trigger }), open && (_jsx("ul", { ref: listRef, id: menuId, role: "menu", "aria-label": ariaLabel, className: "aurum-menu-list aurum-squircle", "data-align": align, "data-state": state, onKeyDown: (e) => {
                    if (typeahead.onKeyDown(e)) {
                        e.preventDefault();
                        return;
                    }
                    switch (e.key) {
                        case 'ArrowDown':
                            e.preventDefault();
                            move(1);
                            break;
                        case 'ArrowUp':
                            e.preventDefault();
                            move(-1);
                            break;
                        case 'Home':
                            e.preventDefault();
                            move('home');
                            break;
                        case 'End':
                            e.preventDefault();
                            move('end');
                            break;
                        case 'Escape':
                            e.preventDefault();
                            close();
                            break;
                        case 'Tab':
                            close(false);
                            break;
                    }
                }, children: items.map((item) => (_jsxs("li", { role: "menuitem", tabIndex: -1, "aria-disabled": item.disabled || undefined, "data-destructive": item.destructive || undefined, className: "aurum-menu-item", onClick: () => pick(item), onKeyDown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            pick(item);
                        }
                    }, children: [item.icon && (_jsx("span", { className: "aurum-menu-icon", "aria-hidden": "true", children: item.icon })), _jsx("span", { className: "aurum-menu-label", children: item.label })] }, item.label))) }))] }));
}
