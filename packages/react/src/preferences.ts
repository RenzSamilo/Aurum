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
  transparency?: 'reduced';
  motion?: 'reduced';
}

export function setAurumPreferences(prefs: AurumPreferences, root: HTMLElement = document.documentElement): void {
  const set = (name: string, value: string | undefined) => {
    if (value === undefined) root.removeAttribute(`data-${name}`);
    else root.setAttribute(`data-${name}`, value);
  };
  set('theme', prefs.theme);
  set('contrast', prefs.contrast);
  set('transparency', prefs.transparency);
  set('motion', prefs.motion);
}
