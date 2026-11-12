import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useRef, } from 'react';
import { playHaptic } from '../haptics.js';
const cx = (...parts) => parts.filter(Boolean).join(' ');
/**
 * A button. Presses scale down slightly with the control spring; with reduced
 * motion they only change colour.
 */
export function Button({ variant = 'filled', size = 'md', capsule = false, destructive = false, icon, fullWidth = false, haptic = false, className, type = 'button', onClick, children, ...rest }) {
    return (_jsxs("button", { type: type, className: cx('aurum-button', 'aurum-squircle', className), "data-variant": variant, "data-size": size, "data-capsule": capsule || undefined, "data-destructive": destructive || undefined, "data-full-width": fullWidth || undefined, "data-icon-only": (icon && !children) || undefined, onClick: (e) => {
            if (haptic)
                playHaptic(haptic);
            onClick?.(e);
        }, ...rest, children: [icon && (_jsx("span", { className: "aurum-button-icon", "aria-hidden": "true", children: icon })), children] }));
}
/**
 * An on/off switch for settings that apply immediately. Use a checkbox in
 * forms that are submitted later.
 */
export function Switch({ checked, onCheckedChange, label, description, className, disabled, id, ...rest }) {
    const autoId = useId();
    const switchId = id ?? autoId;
    const descId = `${switchId}-desc`;
    const control = (_jsx("button", { type: "button", role: "switch", id: switchId, "aria-checked": checked, "aria-describedby": description ? descId : undefined, disabled: disabled, className: cx('aurum-switch', !label && className), onClick: () => {
            playHaptic('selectionTick');
            onCheckedChange(!checked);
        }, ...rest, children: _jsx("span", { className: "aurum-switch-thumb" }) }));
    if (!label)
        return control;
    return (_jsxs("div", { className: cx('aurum-switch-row', className), "data-disabled": disabled || undefined, children: [_jsxs("span", { className: "aurum-switch-text", children: [_jsx("label", { htmlFor: switchId, className: "aurum-type-body", children: label }), description && (_jsx("span", { id: descId, className: "aurum-type-footnote aurum-switch-description", children: description }))] }), control] }));
}
/**
 * Two to five mutually exclusive options shown side by side, such as views of
 * the same content. Arrow keys move the selection, like native radio groups.
 */
export function SegmentedControl({ segments, value, onValueChange, size = 'md', className, style, ...rest }) {
    const refs = useRef([]);
    const index = Math.max(0, segments.findIndex((s) => s.value === value));
    const select = (i) => {
        const segment = segments[i];
        if (!segment || segment.disabled || segment.value === value)
            return;
        playHaptic('selectionTick');
        onValueChange(segment.value);
    };
    const onKeyDown = (e) => {
        const enabled = segments.flatMap((s, i) => (s.disabled ? [] : [i]));
        if (enabled.length === 0)
            return;
        const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
        const forward = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
        let next;
        if (e.key === 'Home')
            next = enabled[0];
        else if (e.key === 'End')
            next = enabled.at(-1);
        else if (forward !== undefined) {
            const at = enabled.indexOf(index);
            next = enabled[(at + forward + enabled.length) % enabled.length];
        }
        if (next === undefined)
            return;
        e.preventDefault();
        select(next);
        refs.current[next]?.focus();
    };
    return (_jsxs("div", { role: "radiogroup", className: cx('aurum-segmented', 'aurum-squircle', className), "data-size": size, style: { '--aurum-segments': segments.length, '--aurum-segment-index': index, ...style }, onKeyDown: onKeyDown, ...rest, children: [_jsx("span", { className: "aurum-segmented-thumb aurum-squircle", "aria-hidden": "true" }), segments.map((s, i) => (_jsx("button", { ref: (el) => {
                    refs.current[i] = el;
                }, type: "button", role: "radio", "aria-checked": i === index, "aria-label": s.ariaLabel, tabIndex: i === index ? 0 : -1, disabled: s.disabled, className: "aurum-segment", onClick: () => select(i), children: _jsx("span", { className: "aurum-segment-label", children: s.label }) }, s.value)))] }));
}
