import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';

import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// Material thickness, thinnest (most see-through) first.
enum AurumMaterialLevel {
  /// For small controls floating over imagery or video. Mostly see-through,
  /// with a strong saturation lift, so the colour behind glows through.
  clear(AurumMaterial.blurClear, AurumMaterial.saturationClear),
  ultralight(AurumMaterial.blurUltralight, AurumMaterial.saturationUltralight),
  thin(AurumMaterial.blurThin, AurumMaterial.saturationThin),
  regular(AurumMaterial.blurRegular, AurumMaterial.saturationRegular),
  thick(AurumMaterial.blurThick, AurumMaterial.saturationThick);

  const AurumMaterialLevel(this.blur, this.saturation);

  final double blur;
  final double saturation;

  /// This level's tint alpha in [c].
  double alphaIn(AurumColors c) => switch (this) {
    clear => c.materialAlphaClear,
    ultralight => c.materialAlphaUltralight,
    thin => c.materialAlphaThin,
    regular => c.materialAlphaRegular,
    thick => c.materialAlphaThick,
  };
}

/// A translucent material with continuous corners. It blurs what is behind it
/// and turns solid when [solid] is true. By default it is solid when the brand
/// asks for opaque surfaces (`surfaces.material` in the brand file) or the user
/// asked for more contrast, since Flutter does not expose iOS's Reduce
/// Transparency setting; pass your app's own setting to [solid].
///
/// The edge catches light: a specular rim, brightest at the top-left, and a
/// soft sheen across the top half. Turn both off with [rim].
///
/// Use it for bars, sheets and floating controls, not for content.
class AurumGlass extends StatelessWidget {
  const AurumGlass({
    super.key,
    this.level = AurumMaterialLevel.regular,
    this.radius,
    this.solid,
    this.padding,
    this.tint,
    this.rim = true,
    this.lifted = false,
    required this.child,
  });

  final AurumMaterialLevel level;

  /// Corner radius. Defaults to the brand's `lg` radius. For a capsule or a
  /// circle, pass half the height.
  final double? radius;
  final bool? solid;
  final EdgeInsetsGeometry? padding;

  /// Mixed into the glass, e.g. the accent for a selected or primary control.
  final Color? tint;

  /// Specular rim and top sheen. Off gives a flat hairline border.
  final bool rim;

  /// A soft shadow under the glass, for controls that float over content.
  final bool lifted;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final r = BorderRadius.circular(radius ?? context.aurumRadii.lg);
    final isSolid = solid ?? (context.aurumSurfaces.opaque || (MediaQuery.maybeHighContrastOf(context) ?? false));
    final shape = RoundedSuperellipseBorder(borderRadius: r);

    var fill = isSolid ? c.surfaceElevated : c.materialTintBase.withValues(alpha: level.alphaIn(c));
    if (tint != null) fill = Color.alphaBlend(tint!.withValues(alpha: isSolid ? 0.16 : 0.32), fill);

    Widget body = DecoratedBox(
      decoration: ShapeDecoration(
        shape: shape.copyWith(side: isSolid || !rim ? BorderSide(color: c.borderDecorative) : BorderSide.none),
        color: fill,
      ),
      position: DecorationPosition.background,
      child: padding == null ? child : Padding(padding: padding!, child: child),
    );
    if (!isSolid && rim) {
      body = CustomPaint(
        foregroundPainter: _RimPainter(shape: shape, dark: dark),
        child: body,
      );
    }
    if (!isSolid) {
      body = ClipRSuperellipse(
        borderRadius: r,
        child: BackdropFilter(
          filter: ImageFilter.compose(
            outer: ImageFilter.blur(sigmaX: level.blur, sigmaY: level.blur),
            inner: ColorFilter.matrix(_saturation(level.saturation)),
          ),
          child: body,
        ),
      );
    }
    if (lifted) {
      body = DecoratedBox(
        decoration: ShapeDecoration(shape: shape, shadows: dark ? _liftDark : _liftLight),
        child: body,
      );
    }
    return body;
  }

  static const _liftLight = [BoxShadow(color: Color(0x1A2A1030), blurRadius: 24, offset: Offset(0, 8))];
  static const _liftDark = [BoxShadow(color: Color(0x40000000), blurRadius: 24, offset: Offset(0, 8))];
}

/// The light-catching edge: a hairline that is bright at the top-left and
/// bottom-right and fades along the sides, plus a sheen over the top half.
class _RimPainter extends CustomPainter {
  const _RimPainter({required this.shape, required this.dark});

  final ShapeBorder shape;
  final bool dark;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final hi = Colors.white.withValues(alpha: dark ? 0.34 : 0.85);
    final lo = Colors.white.withValues(alpha: dark ? 0.06 : 0.22);

    canvas.drawPath(
      shape.getOuterPath(rect),
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.center,
          colors: [
            Colors.white.withValues(alpha: dark ? 0.06 : 0.16),
            Colors.white.withValues(alpha: 0),
          ],
        ).createShader(rect),
    );
    canvas.drawPath(
      shape.getOuterPath(rect.deflate(0.5)),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1
        ..shader = LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            hi,
            lo,
            lo,
            hi.withValues(alpha: hi.a * 0.55),
          ],
          stops: const [0, 0.38, 0.62, 1],
        ).createShader(rect),
    );
  }

  @override
  bool shouldRepaint(_RimPainter old) => old.shape != shape || old.dark != dark;
}

/// A colour matrix that scales saturation by [s] (1 = unchanged).
List<double> _saturation(double s) {
  const r = 0.2126, g = 0.7152, b = 0.0722;
  final i = 1 - s;
  return [
    i * r + s, i * g, i * b, 0, 0, //
    i * r, i * g + s, i * b, 0, 0,
    i * r, i * g, i * b + s, 0, 0,
    0, 0, 0, 1, 0,
  ];
}
