// Contrast rules every brand must pass, in every mode (WCAG 2.2 AA).
import { contrast } from './color.mjs';

const SURFACES = ['color-surface-canvas', 'color-surface-card', 'color-surface-inset', 'color-surface-elevated'];

const RULES = [
  { fg: ['color-text-primary', 'color-text-secondary', 'color-text-tertiary'], bg: SURFACES, min: 4.5, why: 'body text' },
  { fg: ['color-danger'], bg: SURFACES, min: 4.5, why: 'error text' },
  { fg: ['color-accent'], bg: SURFACES, min: 3, why: 'accent controls and focus rings (non-text, 1.4.11)' },
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
