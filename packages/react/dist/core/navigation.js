import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import { Glass } from './components.js';
import { Button } from './controls.js';
import { playHaptic } from '../haptics.js';
const cx = (...parts) => parts.filter(Boolean).join(' ');
/**
 * Bottom navigation between 2 to 5 top-level screens, on a glass material.
 * It sticks to the bottom of its scroll container and pads for the home
 * indicator. The selected tab is marked aria-current="page".
 */
export function TabBar({ tabs, selectedIndex, onSelectedChange, className, 'aria-label': ariaLabel = 'Tabs', ...rest }) {
    return (_jsx(Glass, { as: "nav", level: "thick", radius: "0", className: cx('aurum-tab-bar', className), "aria-label": ariaLabel, ...rest, children: _jsx("ul", { className: "aurum-tab-bar-list", role: "list", children: tabs.map((tab, i) => {
                const selected = i === selectedIndex;
                const content = (_jsxs(_Fragment, { children: [_jsx("span", { className: "aurum-tab-icon", "aria-hidden": "true", children: selected ? (tab.selectedIcon ?? tab.icon) : tab.icon }), _jsx("span", { className: "aurum-tab-label", children: tab.label })] }));
                const props = {
                    className: 'aurum-tab',
                    'aria-current': selected ? 'page' : undefined,
                    onClick: () => {
                        if (!selected)
                            playHaptic('selectionTick');
                        onSelectedChange(i);
                    },
                };
                return (_jsx("li", { children: tab.href ? (_jsx("a", { href: tab.href, ...props, children: content })) : (_jsx("button", { type: "button", ...props, children: content })) }, tab.label));
            }) }) }));
}
/**
 * The bar at the top of a screen: an optional leading control, a centred
 * title and optional trailing controls. The title stays centred even when the
 * sides differ in width.
 */
export function TopBar({ leading, title, trailing, className, ...rest }) {
    return (_jsxs("header", { className: cx('aurum-top-bar', className), ...rest, children: [_jsx("div", { className: "aurum-top-bar-leading", children: leading }), typeof title === 'string' ? _jsx("h1", { className: "aurum-top-bar-title aurum-type-headline", children: title }) : _jsx("div", { className: "aurum-top-bar-title", children: title }), _jsx("div", { className: "aurum-top-bar-trailing", children: trailing })] }));
}
/** A round back button. Goes back in history unless you pass onClick. The caret flips in right-to-left layouts. */
export function BackButton({ onClick, className, 'aria-label': ariaLabel = 'Back', ...rest }) {
    return (_jsx(Button, { variant: "gray", capsule: true, "aria-label": ariaLabel, className: cx('aurum-back-button', className), icon: _jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { d: "M15 4.5 7.5 12l7.5 7.5", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }), onClick: (e) => {
            if (onClick)
                onClick(e);
            else
                window.history.back();
        }, ...rest }));
}
