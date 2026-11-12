import 'package:flutter/widgets.dart';

import '../../foundations/aurum_springs.dart';
import '../../tokens/aurum_tokens.g.dart';

/// Scales its child down while pressed and springs back on release, keeping
/// the release velocity. With animations turned off it does not scale.
///
/// Building block for Aurum controls; it does not handle taps itself.
class AurumPressScale extends StatefulWidget {
  const AurumPressScale({super.key, required this.pressed, this.scale = AurumMotion.pressScaleControl, required this.child});

  final bool pressed;
  final double scale;
  final Widget child;

  @override
  State<AurumPressScale> createState() => _AurumPressScaleState();
}

class _AurumPressScaleState extends State<AurumPressScale> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController.unbounded(vsync: this, value: 1);

  @override
  void didUpdateWidget(AurumPressScale old) {
    super.didUpdateWidget(old);
    if (old.pressed == widget.pressed) return;
    final target = widget.pressed ? widget.scale : 1.0;
    if (!AurumMotion.control.shouldAnimate(context)) {
      _c.value = 1;
      return;
    }
    _c.animateWith(AurumMotion.control.simulation(_c.value, target, velocity: _c.velocity));
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ScaleTransition(scale: _c, child: widget.child);
}
