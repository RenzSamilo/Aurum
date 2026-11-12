export function setAurumPreferences(prefs, root = document.documentElement) {
    const set = (name, value) => {
        if (value === undefined)
            root.removeAttribute(`data-${name}`);
        else
            root.setAttribute(`data-${name}`, value);
    };
    set('theme', prefs.theme);
    set('contrast', prefs.contrast);
    set('transparency', prefs.transparency);
    set('motion', prefs.motion);
}
