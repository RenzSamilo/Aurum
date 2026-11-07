import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/aurum_theme.dart';

/// Progress as a ring that fills clockwise from the top, with an optional
/// [child] in the middle, e.g. "3/6". Screen readers read [semanticLabel] and
/// the percentage.
class AurumProgressRing extends StatelessWidget {
  const AurumProgressRing({
    super.key,
    required this.value,
    this.size = 36,
    this.stroke = 3,
    this.color,
    this.trackColor,
    this.child,
    this.semanticLabel,
  });

  /// From 0 to 1.
  final double value;
  final double size;
  final double stroke;

  /// Defaults to the accent.
  final Color? color;

  /// Defaults to a faint primary-text tint.
  final Color? trackColor;
  final Widget? child;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final v = value.clamp(0.0, 1.0);
    return Semantics(
      label: semanticLabel,
      value: '${(v * 100).round()}%',
      child: SizedBox.square(
        dimension: size,
        child: CustomPaint(
          painter: _RingPainter(
            value: v,
            stroke: stroke,
            color: color ?? c.accent,
            track: trackColor ?? c.textPrimary.withValues(alpha: 0.12),
          ),
          child: child == null ? null : Center(child: ExcludeSemantics(child: child!)),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  const _RingPainter({required this.value, required this.stroke, required this.color, required this.track});

  final double value;
  final double stroke;
  final Color color;
  final Color track;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = (Offset.zero & size).deflate(stroke / 2);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(rect, 0, math.pi * 2, false, paint..color = track);
    if (value > 0) canvas.drawArc(rect, -math.pi / 2, math.pi * 2 * value, false, paint..color = color);
  }

  @override
  bool shouldRepaint(_RingPainter old) =>
      old.value != value || old.stroke != stroke || old.color != color || old.track != track;
}
