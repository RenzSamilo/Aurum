/**
 * In-app overrides for the system preferences. Each one maps to a data
 * attribute on <html> that tokens.css reads. `undefined` follows the system.
 *
 * The transparency setting matters most: Safari and Firefox ignore
 * prefers-reduced-transparency, so this is the only way to get solid
 * surfaces there.
 */
export interface AurumPreferences {
    theme?: 'light' | 'dark';
    contrast?: 'more' | 'normal';
    transparency?: 'reduced' | 'normal';
    motion?: 'reduced' | 'normal';
}
export declare function setAurumPreferences(prefs: AurumPreferences, root?: HTMLElement): void;
