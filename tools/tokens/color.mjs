// Colour maths shared by the token build. No dependencies.

/** Parses oklch() or rgb() into [r, g, b, a], sRGB 0..1, gamut-clipped. */
export function toSrgb(value) {
  const rgb = value.match(/^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/);
  if (rgb) return [rgb[1] / 255, rgb[2] / 255, rgb[3] / 255, rgb[4] === undefined ? 1 : +rgb[4]];
  const m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/);
  if (!m) throw new Error(`Unsupported colour: ${value}`);
  const [L, C, H] = [+m[1], +m[2], (+m[3] * Math.PI) / 180];
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  return [...lin.map((x) => Math.min(1, Math.max(0, gamma(x)))), m[4] === undefined ? 1 : +m[4]];
}

/** Dart Color literal. */
export function dartColor(value) {
  const [r, g, b, a] = toSrgb(value);
  const hex = [a, r, g, b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  return `Color(0x${hex.toUpperCase()})`;
}

/** Adds an alpha to an oklch() string. */
export const withAlpha = (oklch, alpha) => oklch.replace(/\)$/, ` / ${alpha})`);

/** oklch() string from numbers, trimmed to 3 decimals. */
export const oklch = (l, c, h) => `oklch(${+l.toFixed(3)} ${+c.toFixed(3)} ${+h.toFixed(1)})`;

/** WCAG 2 contrast ratio between two opaque colours. */
export function contrast(a, b) {
  const lum = (v) => {
    const [r, g, bl] = toSrgb(v).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
