import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';

import '../tokens/aurum_tokens.g.dart';

/// Plays haptics by meaning, using Flutter's built-in platform haptics (no
/// plugin). Call it from the gesture that caused it:
///
/// ```dart
/// onChanged: (v) { AurumHaptics.play(AurumHaptic.selectionTick); ... }
/// ```
///
/// Never make a haptic the only signal for anything: pair it with a visual change.
abstract final class AurumHaptics {
  /// In-app setting. When false, [play] does nothing.
  static bool enabled = true;

  static final Map<AurumHaptic, Duration> _last = {};

  /// Clock for throttling. Tests can replace it.
  static Duration Function() clock = () => SchedulerBinding.instance.currentSystemFrameTimeStamp;

  /// Plays [intent] unless haptics are off or it fired too recently.
  /// Returns whether a haptic was requested from the platform.
  static Future<bool> play(AurumHaptic intent) async {
    if (!enabled) return false;
    if (intent.throttleMs > 0) {
      final now = clock();
      final last = _last[intent];
      if (last != null && now - last < Duration(milliseconds: intent.throttleMs)) return false;
      _last[intent] = now;
    }
    await switch (intent.type) {
      'selection' => HapticFeedback.selectionClick(),
      'light' || 'soft' => HapticFeedback.lightImpact(),
      'medium' => HapticFeedback.mediumImpact(),
      'heavy' || 'rigid' => HapticFeedback.heavyImpact(),
      'success' => HapticFeedback.successNotification(),
      'warning' => HapticFeedback.warningNotification(),
      'error' => HapticFeedback.errorNotification(),
      _ => Future<void>.value(),
    };
    return true;
  }

  /// Clears throttle state. For tests.
  static void reset() => _last.clear();
}
