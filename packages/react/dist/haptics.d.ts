import { type HapticIntent } from './tokens/tokens.js';
/** Turn every Aurum haptic on or off, for an in-app setting. */
export declare function setHapticsEnabled(value: boolean): void;
export declare function hapticsEnabled(): boolean;
/**
 * Plays the haptic for an intent. Returns true if a haptic was requested from
 * the platform (the device may still have it off).
 */
export declare function playHaptic(intent: HapticIntent): boolean;
