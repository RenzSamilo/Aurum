import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, } from 'react';
import { useSquircle } from '../squircle.js';
const cx = (...parts) => parts.filter(Boolean).join(' ');
/**
 * A single or multi-line text input on an inset fill with continuous corners.
 * Put an action, such as a send button, in `trailing`.
 */
export function TextField({ label, value, defaultValue, leading, trailing, onValueChange, onValueSubmit, maxLines = 1, capsule = false, disabled, className, style, ref, onKeyDown, ...rest }) {
    const box = useRef(null);
    const area = useRef(null);
    useSquircle(box, undefined, capsule ? 'var(--radius-pill)' : 'var(--radius-md)');
    const multiline = maxLines > 1;
    // Grow the text area with its content, up to maxLines: after renders (controlled value)
    // and on every input (uncontrolled fields don't re-render while typing).
    const grow = () => {
        const el = area.current;
        if (!el)
            return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };
    useLayoutEffect(grow);
    const handleKey = (e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented || e.key !== 'Enter' || e.nativeEvent.isComposing || !onValueSubmit)
            return;
        if (multiline && !(e.metaKey || e.ctrlKey))
            return;
        e.preventDefault();
        onValueSubmit(e.currentTarget.value);
    };
    const handleChange = (e) => {
        if (multiline)
            grow();
        onValueChange?.(e.target.value);
    };
    const shared = {
        'aria-label': label,
        className: 'aurum-text-field-input',
        value,
        defaultValue,
        disabled,
        onChange: handleChange,
        onKeyDown: handleKey,
    };
    return (_jsxs("div", { ref: box, className: cx('aurum-text-field', 'aurum-squircle', className), "data-capsule": capsule || undefined, "data-multiline": multiline || undefined, "data-disabled": disabled || undefined, "data-leading": leading ? true : undefined, "data-trailing": trailing ? true : undefined, style: { '--aurum-text-field-lines': maxLines, ...style }, children: [leading && _jsx("span", { className: "aurum-text-field-leading", children: leading }), multiline ? (_jsx("textarea", { ...rest, ...shared, rows: 1, ref: (el) => {
                    area.current = el;
                    if (typeof ref === 'function')
                        ref(el);
                    else if (ref)
                        ref.current = el;
                } })) : (_jsx("input", { type: "text", ...rest, ...shared, ref: ref })), trailing && _jsx("span", { className: "aurum-text-field-trailing", children: trailing })] }));
}
