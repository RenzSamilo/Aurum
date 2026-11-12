import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
const cx = (...parts) => parts.filter(Boolean).join(' ');
/** Progress as a ring that fills clockwise from the top, with optional content in the middle. */
export function ProgressRing({ value, size = 36, stroke = 3, color, trackColor, children, className, style, ...rest }) {
    const v = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const percent = Math.round(v * 100);
    return (_jsxs("div", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent, "aria-valuetext": `${percent}%`, className: cx('aurum-progress-ring', className), style: {
            '--aurum-ring-size': `${size}px`,
            '--aurum-ring-color': color,
            '--aurum-ring-track': trackColor,
            ...style,
        }, ...rest, children: [_jsxs("svg", { viewBox: `0 0 ${size} ${size}`, "aria-hidden": "true", children: [_jsx("circle", { className: "aurum-progress-ring-track", cx: size / 2, cy: size / 2, r: r, strokeWidth: stroke }), v > 0 && (_jsx("circle", { className: "aurum-progress-ring-value", cx: size / 2, cy: size / 2, r: r, strokeWidth: stroke, strokeDasharray: c, strokeDashoffset: c * (1 - v) }))] }), children != null && (_jsx("span", { className: "aurum-progress-ring-content", "aria-hidden": "true", children: children }))] }));
}
