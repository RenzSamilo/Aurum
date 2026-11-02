import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';

import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// Material thickness, thinnest (most see-through) first.
enum AurumMaterialLevel {
  ultralight(AurumMaterial.blurUltralight, AurumMaterial.saturationUltralight),
  thin(AurumMaterial.blurThin, AurumMaterial.saturationThin),
  regular(AurumMaterial.blurRegular, AurumMaterial.saturationRegular),
  thick(AurumMaterial.blurThick, AurumMaterial.saturationThick);

  const AurumMaterialLevel(this.blur, this.saturation);

  final double blur;
  final double saturation;
}

/// A translucent material with continuous corners. It blurs what is behind it
/// and turns solid when [solid] is true. By default it is solid when the user
/// asked for more contrast, since Flutter does not expose iOS's Reduce
/// Transparency setting; pass your app's own setting to [solid].
///
/// Use it for bars, sheets and floating controls, not for content.
class AurumGlass extends StatelessWidget {
  const AurumGlass({
    super.key,
    this.level = AurumMaterialLevel.regular,
    this.radius,
    this.solid,
    this.padding,
    required this.child,
  });

  final AurumMaterialLevel level;

  /// Corner radius. Defaults to the brand's `lg` radius.
  final double? radius;
  final bool? solid;
  final EdgeInsetsGeometry? padding;
  final Widget child;

  double _alpha(AurumColors c) => switch (level) {
        AurumMaterialLevel.ultralight => c.materialAlphaUltralight,
        AurumMaterialLevel.thin => c.materialAlphaThin,
        AurumMaterialLevel.regular => c.materialAlphaRegular,
        AurumMaterialLevel.thick => c.materialAlphaThick,
      };

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final r = BorderRadius.circular(radius ?? context.aurumRadii.lg);
    final isSolid = solid ?? MediaQuery.maybeHighContrastOf(context) ?? false;
    final shape = RoundedSuperellipseBorder(borderRadius: r, side: BorderSide(color: c.borderDecorative));
    final body = DecoratedBox(
      decoration: ShapeDecoration(
        shape: shape,
        color: isSolid ? c.surfaceElevated : c.materialTintBase.withValues(alpha: _alpha(c)),
      ),
      child: padding == null ? child : Padding(padding: padding!, child: child),
    );
    if (isSolid) return body;
    return ClipRSuperellipse(
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
