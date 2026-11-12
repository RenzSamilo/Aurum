// Contrast rules every brand must pass, in every mode (WCAG 2.2 AA).
import { contrast } from './color.mjs';

const SURFACES = ['color-surface-canvas', 'color-surface-card', 'color-surface-inset', 'color-surface-elevated'];

const RULES = [
  { fg: ['color-text-primary', 'color-text-secondary', 'color-text-tertiary'], bg: SURFACES, min: 4.5, why: 'body text' },
  // Accent doubles as link and text-button colour, and status colours label text,
  // so all of them meet the text threshold, not just the 3:1 non-text one.
  { fg: ['color-accent', 'color-accent-secondary', 'color-danger', 'color-warning', 'color-success'], bg: SURFACES, min: 4.5, why: 'accent and status text' },
  { fg: ['color-border-control'], bg: SURFACES, min: 3, why: 'control borders (1.4.11)' },
  { fg: ['color-on-accent'], bg: ['color-accent'], min: 4.5, why: 'text on filled buttons' },
];

/** Returns a list of failures; empty means the brand passes. */
export function validateContrast(semanticByMode) {
  const failures = [];
  for (const [mode, values] of Object.entries(semanticByMode)) {
    for (const rule of RULES) {
      for (const fg of rule.fg) {
        for (const bg of rule.bg) {
          const ratio = contrast(values[fg], values[bg]);
          if (ratio < rule.min) {
            failures.push(`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${rule.min}:1 (${rule.why})`);
          }
        }
      }
    }
  }
  return failures;
}

/** For each mode and rule: the lowest ratio and its pair. Used for palette spec cards. */
export function contrastReport(semanticByMode) {
  return Object.fromEntries(
    Object.entries(semanticByMode).map(([mode, values]) => [
      mode,
      RULES.map((rule) => {
        let worst = null;
        for (const fg of rule.fg) {
          for (const bg of rule.bg) {
            const ratio = contrast(values[fg], values[bg]);
            if (!worst || ratio < worst.ratio) worst = { fg, bg, ratio: +ratio.toFixed(2) };
          }
        }
        return { why: rule.why, min: rule.min, ...worst, pass: worst.ratio >= rule.min };
      }),
    ]),
  );
}
