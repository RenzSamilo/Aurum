/**
 * Fold text for type-to-select: no case, no combining marks, the six stroked
 * letters and ı as their base letter. Locale-independent by design.
 */
export declare function foldForTypeahead(text: string): string;
/**
 * The type-to-select buffer after one more key, shared by every path so they
 * buffer the same way. Returns null when the key is not a letter to jump to: a
 * lone combining mark typed first. Pressing the same letter again (as folded)
 * cycles, so the buffer stays that one letter instead of growing.
 */
export declare function nextTypeaheadBuffer(buffer: string, key: string): string | null;
/**
 * Whether `label` starts with `typed` under the fold. `exact` additionally
 * requires the unfolded letters to match (Turkish case pairing).
 */
export declare function typeaheadPrefixMatch(label: string, typed: string, exact?: boolean): boolean;
/**
 * Find the next item whose label matches the typed letters, visiting indexes
 * in `order`. When the typed letters carry a diacritic, a stroked letter, ı or
 * İ, an exact match anywhere in the order wins over a folded one.
 */
export declare function findTypeaheadMatch(order: ReadonlyArray<number>, getLabel: (index: number) => string | null | undefined, typed: string): number;
