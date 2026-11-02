import 'package:flutter/physics.dart';
import 'package:flutter/widgets.dart';

import '../tokens/aurum_tokens.g.dart';

extension AurumSpringMotion on AurumSpring {
  /// A simulation from [from] to [to] that keeps the gesture's [velocity].
  /// Drive an AnimationController with `controller.animateWith(...)`.
  SpringSimulation simulation(double from, double to, {double velocity = 0}) =>
      SpringSimulation(description, from, to, velocity);

  /// This spring, or an instant change when the user turned off animations.
  /// Use it to decide between `animateWith` and setting the value directly.
  bool shouldAnimate(BuildContext context) => !(MediaQuery.maybeDisableAnimationsOf(context) ?? false);
}

/// Rubber-band resistance past an edge: the further the drag, the less the
/// content follows, approaching [AurumMotion.rubberBandLimit].
double aurumRubberBand(double overscroll, {double limit = AurumMotion.rubberBandLimit}) {
  final sign = overscroll.sign;
  final x = overscroll.abs();
  return sign * limit * (1 - 1 / (x * 0.55 / limit + 1));
}
