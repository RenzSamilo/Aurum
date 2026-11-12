import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import { useSquircle } from '../squircle.js';
/**
 * A box with continuous corners in every browser. Set the radius with the
 * `radius` prop (a token name or any CSS length) or with CSS border-radius.
 */
export function Squircle({ as, radius = 'lg', className, style, ...rest }) {
    const Tag = as ?? 'div';
    const ref = useRef(null);
    const value = ['sm', 'md', 'lg', 'xl'].includes(radius) ? `var(--radius-${radius})` : radius;
    useSquircle(ref, undefined, value);
    return (_jsx(Tag, { ref: ref, className: ['aurum-squircle', className].filter(Boolean).join(' '), style: { '--aurum-radius': value, ...style }, ...rest }));
}
export function Glass({ level = 'regular', className, ...rest }) {
    // Generic props cannot be checked through a second polymorphic component; they are the same shape.
    const props = rest;
    return _jsx(Squircle, { ...props, className: ['aurum-glass', className].filter(Boolean).join(' '), "data-level": level });
}
