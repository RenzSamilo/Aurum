// Turns a brand file (tokens/brand/*.json) into primitive tokens.
//
// A brand only chooses hues, tint strength, fonts and corner roundness. Lightness
// steps stay fixed, so contrast stays predictable, and validate() checks it anyway.

import { readFile } from 'node:fs/promises';
import { oklch } from './color.mjs';

const DEFAULTS = {
  accent: { hue: 175, chroma: 0.09, lightnessLight: 0.48, lightnessDark: 0.79 },
  neutral: { hue: 225, warmHue: 90, chroma: 1 },
  danger: { hue: 25 },
  warning: { hue: 75 },
  font: { ui: 'Inter', mono: 'Geist Mono' },
  radius: { scale: 1 },
};

/** Neutral steps: [name, lightness, base chroma]. Lightness is fixed; chroma scales. */
const WARM = [['99', 0.99, 0.005], ['98', 0.98, 0.006], ['96', 0.96, 0.006], ['88', 0.88, 0.008]];
const COOL = [
  ['15', 0.15, 0.015], ['16', 0.16, 0.008], ['20', 0.2, 0.01], ['22', 0.22, 0.015], ['24', 0.24, 0.012],
  ['28', 0.28, 0.012], ['32', 0.32, 0.012], ['36', 0.36, 0.02], ['40', 0.4, 0.015], ['44', 0.44, 0.02],
  ['50', 0.5, 0.015], ['60', 0.6, 0.015], ['70', 0.7, 0.014], ['72', 0.72, 0.015], ['78', 0.78, 0.014],
  ['80', 0.8, 0.014], ['86', 0.86, 0.014],
];
const RADII = { sm: 12, md: 18, lg: 24, xl: 32 };

export async function loadBrand(path) {
  const raw = JSON.parse(await readFile(path, 'utf8'));
  if (typeof raw.name !== 'string' || !/^[A-Za-z][A-Za-z0-9 ]*$/.test(raw.name)) {
    throw new Error(`${path}: "name" must start with a letter and use only letters, digits and spaces.`);
  }
  const brand = { name: raw.name };
  for (const [key, defaults] of Object.entries(DEFAULTS)) brand[key] = { ...defaults, ...(raw[key] ?? {}) };
  return brand;
}

/** DTCG tokens for colour, radius and font, ready to merge into Style Dictionary. */
export function brandTokens(brand) {
  const { accent, neutral, danger, warning, font, radius } = brand;
  const value = ($value) => ({ $value });
  const steps = (list, hue) => Object.fromEntries(list.map(([n, l, c]) => [n, value(oklch(l, c * neutral.chroma, hue))]));
  return {
    color: {
      $type: 'color',
      white: value('oklch(1 0 0)'),
      warm: steps(WARM, neutral.warmHue),
      cool: steps(COOL, neutral.hue),
      'brand-accent': {
        light: value(oklch(accent.lightnessLight, accent.chroma, accent.hue)),
        dark: value(oklch(accent.lightnessDark, accent.chroma, accent.hue)),
      },
      'brand-danger': { light: value(oklch(0.48, 0.17, danger.hue)), dark: value(oklch(0.78, 0.12, danger.hue)) },
      'brand-warning': { light: value(oklch(0.5, 0.1, warning.hue)), dark: value(oklch(0.82, 0.1, warning.hue + 10)) },
    },
    radius: {
      $type: 'dimension',
      $description: 'Corner radii, scaled by the brand. Rendered as continuous (squircle) corners where supported.',
      ...Object.fromEntries(Object.entries(RADII).map(([k, r]) => [k, value(`${Math.round(r * radius.scale)}px`)])),
      pill: value('999px'),
    },
    font: {
      family: { $type: 'fontFamily', ui: value(font.ui), mono: value(font.mono) },
    },
  };
}
