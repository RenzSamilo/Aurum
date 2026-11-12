import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState, } from 'react';
import { Squircle } from './components.js';
import { playHaptic } from '../haptics.js';
import { gesture } from '../tokens/tokens.js';
const cx = (...parts) => parts.filter(Boolean).join(' ');
/**
 * A grouped surface with continuous corners. The shadow sits on a wrapper and
 * uses drop-shadow, so it follows the corner shape even where the corners are
 * clipped by the polyfill.
 */
export function Card({ onPress, padding = 'lg', elevation = 'lifted', className, children, ...rest }) {
    const interactive = Boolean(onPress);
    // One element, button or div; the polymorphic props are the same shape either way.
    const props = {
        as: interactive ? 'button' : 'div',
        type: interactive ? 'button' : undefined,
        radius: 'lg',
        className: cx('aurum-card', className),
        'data-padding': padding,
        'data-interactive': interactive || undefined,
        onClick: onPress,
        ...rest,
    };
    return (_jsx("div", { className: "aurum-card-shadow", "data-elevation": elevation, children: _jsx(Squircle, { ...props, children: children }) }));
}
/** An inset, grouped list of rows: settings, details, menus. */
export function ListSection({ header, footer, className, children, ...rest }) {
    const id = useId();
    return (_jsxs("section", { className: cx('aurum-list-section', className), "aria-labelledby": header ? `${id}-h` : undefined, ...rest, children: [header && (_jsx("h3", { id: `${id}-h`, className: "aurum-list-header aurum-type-footnote", children: header })), _jsx(Squircle, { as: "ul", radius: "md", className: "aurum-list", role: "list", children: children }), footer && _jsx("p", { className: "aurum-list-footer aurum-type-footnote", children: footer })] }));
}
/** One row in a ListSection. Pressable rows highlight and spring on press. */
export function ListRow({ title, subtitle, leading, value, trailing, href, onPress, chevron, destructive, className }) {
    const interactive = Boolean(href || onPress) && !trailing;
    const showChevron = interactive && (chevron ?? true);
    const body = (_jsxs(_Fragment, { children: [leading && (_jsx("span", { className: "aurum-row-leading", "aria-hidden": "true", children: leading })), _jsxs("span", { className: "aurum-row-text", children: [_jsx("span", { className: "aurum-type-body aurum-row-title", children: title }), subtitle && _jsx("span", { className: "aurum-type-footnote aurum-row-subtitle", children: subtitle })] }), value !== undefined && _jsx("span", { className: "aurum-type-body aurum-row-value", children: value }), trailing, showChevron && (_jsx("svg", { className: "aurum-row-chevron", viewBox: "0 0 8 14", "aria-hidden": "true", children: _jsx("path", { d: "M1.5 1.5 6.5 7l-5 5.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }))] }));
    const rowClass = cx('aurum-row', className);
    return (_jsx("li", { className: "aurum-row-item", "data-has-leading": leading ? '' : undefined, "data-destructive": destructive || undefined, children: href && !trailing ? (_jsx("a", { className: rowClass, href: href, onClick: onPress, children: body })) : interactive ? (_jsx("button", { type: "button", className: rowClass, onClick: onPress, children: body })) : (_jsx("div", { className: rowClass, children: body })) }));
}
const CLOSE_VELOCITY = 0.5; // px per ms
const CLOSE_FRACTION = 0.3; // of the sheet's height
/**
 * A modal sheet that rises from the bottom. Built on <dialog>, so focus is
 * trapped and Escape closes it. Drag the grabber or the title area down to
 * close; a fast flick closes from anywhere in the drag.
 */
export function Sheet({ open, onOpenChange, title, hideTitle, children, dismissible = true, closeLabel = 'Close', className, ref }) {
    const dialog = useRef(null);
    const panel = useRef(null);
    const titleId = useId();
    const [closing, setClosing] = useState(false);
    const drag = useRef(null);
    useEffect(() => {
        const d = dialog.current;
        if (!d)
            return;
        if (open) {
            // Reopening during the exit transition cancels the pending close.
            setClosing(false);
            if (panel.current)
                panel.current.style.transform = '';
            if (!d.open) {
                d.showModal();
                playHaptic('impactLight');
            }
        }
        else if (!open && d.open) {
            setClosing(true);
        }
    }, [open]);
    // Close for real once the exit transition ends (or right away with no motion).
    useEffect(() => {
        if (!closing)
            return;
        const p = panel.current;
        const finish = () => {
            dialog.current?.close();
            setClosing(false);
            if (p)
                p.style.transform = '';
        };
        const ms = parseFloat(getComputedStyle(p ?? document.documentElement).transitionDuration) * 1000;
        if (!p || !ms)
            return finish();
        const t = setTimeout(finish, ms + 50);
        p.addEventListener('transitionend', finish, { once: true });
        return () => {
            clearTimeout(t);
            p.removeEventListener('transitionend', finish);
        };
    }, [closing]);
    const requestClose = () => onOpenChange(false);
    const onPointerDown = (e) => {
        if (!dismissible || e.button !== 0)
            return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
        panel.current?.setAttribute('data-dragging', '');
    };
    const onPointerMove = (e) => {
        const d = drag.current;
        const p = panel.current;
        if (!d || !p)
            return;
        const dy = e.clientY - d.startY;
        const dt = Math.max(1, e.timeStamp - d.lastT);
        d.v = (e.clientY - d.lastY) / dt;
        d.lastY = e.clientY;
        d.lastT = e.timeStamp;
        // Follow the finger down; resist upward pulls.
        const limit = gesture.rubberBandLimit;
        const offset = dy >= 0 ? dy : -limit * (1 - 1 / ((-dy * 0.55) / limit + 1));
        p.style.transform = `translateY(${offset}px)`;
    };
    const onPointerUp = () => {
        const d = drag.current;
        const p = panel.current;
        drag.current = null;
        if (!d || !p)
            return;
        p.removeAttribute('data-dragging');
        const dy = d.lastY - d.startY;
        if (dy > p.offsetHeight * CLOSE_FRACTION || d.v > CLOSE_VELOCITY) {
            requestClose();
        }
        else {
            p.style.transform = '';
        }
    };
    return (_jsx("dialog", { ref: (el) => {
            dialog.current = el;
            if (typeof ref === 'function')
                ref(el);
            else if (ref)
                ref.current = el;
        }, className: cx('aurum-sheet-dialog', className), "aria-labelledby": titleId, "data-state": closing ? 'closing' : open ? 'open' : 'closed', onCancel: (e) => {
            e.preventDefault();
            if (dismissible)
                requestClose();
        }, onClick: (e) => {
            // A click on the backdrop lands on the dialog element itself.
            if (dismissible && e.target === dialog.current)
                requestClose();
        }, children: _jsxs("div", { ref: panel, className: "aurum-sheet aurum-squircle", children: [_jsxs("div", { className: "aurum-sheet-handle", onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: onPointerUp, onPointerCancel: onPointerUp, children: [dismissible && _jsx("span", { className: "aurum-sheet-grabber", "aria-hidden": "true" }), _jsx("h2", { id: titleId, className: cx('aurum-type-headline', 'aurum-sheet-title', hideTitle && 'aurum-visually-hidden'), children: title }), closeLabel !== null && (_jsx("button", { type: "button", className: "aurum-sheet-close", "aria-label": closeLabel, onPointerDown: (e) => e.stopPropagation(), onClick: requestClose, children: _jsx("svg", { viewBox: "0 0 12 12", "aria-hidden": "true", children: _jsx("path", { d: "m2 2 8 8M10 2l-8 8", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }) }) }))] }), _jsx("div", { className: "aurum-sheet-body", children: children })] }) }));
}
