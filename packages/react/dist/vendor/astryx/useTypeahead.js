// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file useTypeahead.ts
 * @input Uses React useCallback/useEffect/useRef, shared type-to-select
 *   matching (utils/typeaheadMatch)
 * @output Exports useTypeahead hook for first-character (type-to-focus) search
 * @position Core hook; adds APG typeahead to menus, listboxes, and other
 *   collections. Composes with useListFocus/useGridFocus (or any collection)
 *   via a caller-supplied getItemLabels + onMatch.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */
import { useCallback, useEffect, useRef } from 'react';
import { findTypeaheadMatch, nextTypeaheadBuffer } from './typeaheadMatch.js';
/**
 * Whether a key event represents a single printable character (a type-to-focus
 * candidate) rather than a control/navigation key or a shortcut chord.
 */
function isPrintableCharacter(e) {
    return (e.key.length === 1 &&
        // Alt alone is not excluded: Option+letter on macOS composes a printable
        // character (Option+a → "å"), and dropping those makes accented labels
        // untypeable. Real chords still carry ctrl or meta — including AltGr,
        // which sets ctrlKey on Windows and Linux.
        !e.ctrlKey &&
        !e.metaKey &&
        // A key that is part of an input method's composition is the IME's, not
        // a jump. React's synthetic event surfaces `isComposing` too.
        !isComposingKey(e) &&
        // A lone space is used for activation in menus, not typeahead-from-empty.
        e.key !== ' ');
}
function isComposingKey(e) {
    if (e.isComposing === true) {
        return true;
    }
    const native = e.nativeEvent;
    return native?.isComposing === true;
}
/**
 * First-character ("type-ahead") search for a collection.
 *
 * Buffers printable keystrokes (resetting after `resetMs` of inactivity),
 * matches items whose label starts with the buffer (ignoring case, accents,
 * stroked letters and Turkish dotted/dotless i, the same in every locale:
 * `architecture:internationalization` INV17), and cycles from the
 * current index — so pressing "s" repeatedly walks through the "s" items
 * instead of sticking on the first. Space is reserved for activation and is
 * only treated as typeahead while a buffer is already active.
 *
 * Additive and collection-agnostic: it does not move focus itself; the caller
 * wires `onMatch` to its own focus/selection (e.g. `useListFocus.focusItem`).
 *
 * @example
 * ```
 * const {listRef, handleKeyDown, focusItem, getItems} = useListFocus(...);
 * const typeahead = useTypeahead({
 *   getItemLabels: () => getItems().map(el => el.textContent),
 *   onMatch: focusItem,
 *   getCurrentIndex: () => getItems().findIndex(el => el === document.activeElement),
 * });
 * const onKeyDown = (e) => { if (!typeahead.onKeyDown(e)) handleKeyDown(e); };
 * ```
 */
export function useTypeahead(options) {
    const { getItemLabels, onMatch, getCurrentIndex, resetMs = 750, isDisabled, } = options;
    const bufferRef = useRef('');
    const timeoutRef = useRef(undefined);
    const reset = useCallback(() => {
        bufferRef.current = '';
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);
    // A collection that unmounts, or that an `<Activity>` boundary hides,
    // mid-typing leaves no reset timer running and comes back with an empty
    // buffer, as the reset would have left it.
    useEffect(() => reset, [reset]);
    const scheduleReset = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            bufferRef.current = '';
            timeoutRef.current = undefined;
        }, resetMs);
    }, [resetMs]);
    const onKeyDown = useCallback((e) => {
        // A bare Space with no active buffer is not typeahead (menus activate on
        // Space); once the user is mid-typing, Space extends the query. Chorded
        // with ctrl or meta it is neither — that is an OS or IME shortcut, and
        // consuming it would append a raw space that poisons the whole buffer.
        const isSpaceMidType = e.key === ' ' &&
            !e.ctrlKey &&
            !e.metaKey &&
            !isComposingKey(e) &&
            bufferRef.current.length > 0;
        if (!isPrintableCharacter(e) && !isSpaceMidType) {
            return false;
        }
        // A lone combining mark typed first is not a letter to jump to; after
        // a letter it is part of that letter. A repeat of the same letter
        // cycles rather than filtering deeper (APG behavior).
        const nextBuffer = nextTypeaheadBuffer(bufferRef.current, e.key);
        if (nextBuffer == null) {
            return false;
        }
        const labels = getItemLabels();
        if (labels.length === 0) {
            return false;
        }
        bufferRef.current = nextBuffer;
        scheduleReset();
        const current = getCurrentIndex?.() ?? -1;
        const count = labels.length;
        const hasCurrent = current >= 0;
        const start = hasCurrent ? current : 0;
        // A single-character search starts AFTER the current item, so pressing a
        // letter walks to the next item beginning with it instead of re-matching
        // the one already selected (native <select> and APG getIndexByLetter).
        // Once the buffer is longer it is refining a match, so the current item
        // stays in range. With nothing current there is nothing to advance past.
        const offset = hasCurrent && nextBuffer.length === 1 ? 1 : 0;
        const order = [];
        for (let i = 0; i < count; i++) {
            const index = (start + offset + i + count) % count;
            if (!isDisabled?.(index)) {
                order.push(index);
            }
        }
        const match = findTypeaheadMatch(order, i => labels[i], nextBuffer);
        if (match >= 0) {
            onMatch(match);
        }
        return true;
    }, [getItemLabels, onMatch, getCurrentIndex, scheduleReset, isDisabled]);
    return { onKeyDown, reset };
}
