import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
const cx = (...parts) => parts.filter(Boolean).join(' ');
// ---------------------------------------------------------------------------
// Avatar
/** Up to two initials: first letters of the first and last words. */
export function initialsOf(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    const first = words[0] ? [...words[0]][0] : '';
    const last = words.length > 1 ? [...(words.at(-1) ?? '')][0] : '';
    return `${first ?? ''}${last ?? ''}`.toUpperCase();
}
/** A round picture of a person or thing. Without a picture, it shows initials on an accent tint. */
export function Avatar({ name, src, size = 40, ring = false, className, style, ...rest }) {
    const [failed, setFailed] = useState(null);
    const showImage = src && failed !== src;
    const role = size >= 64 ? 'section' : size >= 40 ? 'headline' : 'caption';
    return (_jsx("span", { role: "img", "aria-label": name, className: cx('aurum-avatar', className), "data-ring": ring ? (size >= 64 ? 'thick' : 'thin') : undefined, "data-type": role, style: { '--aurum-avatar-size': `${size}px`, ...style }, ...rest, children: showImage ? (_jsx("img", { src: src, alt: "", onError: () => setFailed(src) })) : (_jsx("span", { "aria-hidden": "true", children: initialsOf(name) })) }));
}
/** A small status label, such as "New", "Pro" or "Free". */
export function Badge({ tone = 'accent', appearance = 'soft', className, ...rest }) {
    return _jsx("span", { className: cx('aurum-badge', className), "data-tone": tone, "data-appearance": appearance, ...rest });
}
