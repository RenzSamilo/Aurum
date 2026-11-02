// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playHaptic as haptic, setHapticsEnabled } from '../src/haptics';

describe('haptic', () => {
  let vibrate: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    delete document.documentElement.dataset.motion;
    setHapticsEnabled(true);
  });
  afterEach(() => vi.useRealTimers());

  it('vibrates with the token pattern on Android-like browsers', () => {
    expect(haptic('resultError')).toBe(true);
    expect(vibrate).toHaveBeenCalledWith([20, 40, 20]);
  });

  it('does nothing for intents with no web pattern', () => {
    expect(haptic('impactHeavy')).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('respects the in-app switch and reduced motion', () => {
    setHapticsEnabled(false);
    expect(haptic('selectionTick')).toBe(false);
    setHapticsEnabled(true);
    document.documentElement.dataset.motion = 'reduced';
    expect(haptic('selectionTick')).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('throttles frequent selection ticks', () => {
    vi.useFakeTimers();
    const pattern = vi.spyOn(performance, 'now');
    pattern.mockReturnValue(1000);
    haptic('selectionFrequent');
    pattern.mockReturnValue(1020);
    expect(haptic('selectionFrequent')).toBe(false);
    pattern.mockReturnValue(1100);
    // Web pattern is empty, so it is allowed through the throttle but plays nothing.
    expect(haptic('selectionFrequent')).toBe(false);
    pattern.mockRestore();
  });
});
