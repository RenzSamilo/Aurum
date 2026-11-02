// Haptics on the web, by meaning.
//
// Call `playHaptic('selectionTick')` from a user gesture (click, change, pointerup).
// - Android Chrome: navigator.vibrate with the token's pattern.
// - iOS Safari 18+: toggling a hidden switch control produces a system tick.
//   Only intents with an iosWeb value use it.
// - Elsewhere: nothing happens, silently.
//
// Haptics are off when the user turned them off (setHapticsEnabled(false)) or
// prefers reduced motion. Never make a haptic the only signal for anything.

import { type HapticIntent, haptic as tokens } from './tokens/tokens';

let enabled = true;
const lastFired = new Map<HapticIntent, number>();
let iosSwitch: HTMLLabelElement | null = null;

/** Turn every Aurum haptic on or off, for an in-app setting. */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function hapticsEnabled(): boolean {
  return enabled;
}

function reducedMotion(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'normal') return false;
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function iosTick(times: number): void {
  if (typeof document === 'undefined') return;
  if (!iosSwitch) {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    iosSwitch = label;
  }
  for (let i = 0; i < times; i++) {
    if (i === 0) iosSwitch.click();
    else setTimeout(() => iosSwitch?.click(), i * 120);
  }
}

/**
 * Plays the haptic for an intent. Returns true if a haptic was requested from
 * the platform (the device may still have it off).
 */
export function playHaptic(intent: HapticIntent): boolean {
  if (!enabled || reducedMotion()) return false;
  const spec: { web: readonly number[]; iosWeb: string; throttleMs?: number } = tokens[intent];
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const throttle = spec.throttleMs ?? 0;
  const last = lastFired.get(intent);
  if (throttle > 0 && last !== undefined && now - last < throttle) return false;
  lastFired.set(intent, now);

  if (isIOS()) {
    const times = spec.iosWeb === 'haptic' ? 1 : spec.iosWeb === 'confirm' ? 2 : spec.iosWeb === 'error' ? 3 : 0;
    if (times === 0) return false;
    iosTick(times);
    return true;
  }
  if (spec.web.length > 0 && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    return navigator.vibrate([...spec.web]);
  }
  return false;
}
