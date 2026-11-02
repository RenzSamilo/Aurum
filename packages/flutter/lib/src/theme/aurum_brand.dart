import 'dart:math' as math;
import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';

import '../tokens/aurum_tokens.g.dart';

/// Everything that makes one app look like itself: colours for every mode,
/// corner radii and the UI typeface.
///
/// Aurum ships [aurumBrand]. An app makes its own with a brand file and
/// `node tools/tokens/build.mjs --brand my.brand.json --dart lib/my_brand.g.dart`,
/// then passes it to `aurumTheme(brand: myBrand)`. The build refuses a brand
/// that fails contrast, so every generated brand is safe to ship.
@immutable
class AurumBrand {
  const AurumBrand({
    required this.name,
    required this.light,
    required this.dark,
    required this.contrastLight,
    required this.contrastDark,
    required this.radii,
    required this.typeface,
  });

  final String name;
  final AurumColors light;
  final AurumColors dark;
  final AurumColors contrastLight;
  final AurumColors contrastDark;
  final AurumRadii radii;
  final AurumTypeface typeface;

  /// The colour set for a brightness and contrast setting.
  AurumColors colors(Brightness brightness, {bool highContrast = false}) {
    return switch ((brightness, highContrast)) {
      (Brightness.light, false) => light,
      (Brightness.dark, false) => dark,
      (Brightness.light, true) => contrastLight,
      (Brightness.dark, true) => contrastDark,
    };
  }
}

/// Corner radii in logical pixels. Draw them with RoundedSuperellipseBorder
/// (or ClipRSuperellipse) so corners are continuous, not circular.
@immutable
class AurumRadii extends ThemeExtension<AurumRadii> {
  const AurumRadii({required this.sm, required this.md, required this.lg, required this.xl});

  /// Controls: buttons, fields, chips.
  final double sm;

  /// Rows and small cards.
  final double md;

  /// Cards and panels.
  final double lg;

  /// Sheets and large containers.
  final double xl;

  /// Fully round ends (capsules). Same for every brand.
  static const double pill = 999;

  /// Radius for something nested [padding] inside a shape with radius
  /// [outer], so both corners stay concentric. Never below 0.
  static double inner(double outer, double padding) => math.max(0, outer - padding);

  @override
  AurumRadii copyWith({double? sm, double? md, double? lg, double? xl}) =>
      AurumRadii(sm: sm ?? this.sm, md: md ?? this.md, lg: lg ?? this.lg, xl: xl ?? this.xl);

  @override
  AurumRadii lerp(covariant ThemeExtension<AurumRadii>? other, double t) {
    if (other is! AurumRadii) return this;
    return AurumRadii(
      sm: lerpDouble(sm, other.sm, t)!,
      md: lerpDouble(md, other.md, t)!,
      lg: lerpDouble(lg, other.lg, t)!,
      xl: lerpDouble(xl, other.xl, t)!,
    );
  }

  @override
  bool operator ==(Object other) =>
      other is AurumRadii && other.sm == sm && other.md == md && other.lg == lg && other.xl == xl;

  @override
  int get hashCode => Object.hash(sm, md, lg, xl);
}

/// The brand's typefaces. [family] is the UI font and [displayFamily] the font
/// for title roles (display, page, section, card). Both must be variable fonts
/// with a wght axis (and ideally opsz). A package is null for a font bundled in
/// the app itself.
@immutable
class AurumTypeface extends ThemeExtension<AurumTypeface> {
  /// Without a [displayFamily], titles use the UI font and its package.
  const AurumTypeface({
    required this.family,
    this.package,
    String? displayFamily,
    String? displayPackage,
    this.displayWeight,
    this.displayTracking,
  }) : displayFamily = displayFamily ?? family,
       displayPackage = displayFamily == null ? package : displayPackage;

  final String family;
  final String? package;
  final String displayFamily;
  final String? displayPackage;

  /// wght for title roles, replacing the role's own. Null keeps it.
  final double? displayWeight;

  /// Letter spacing in em for title roles. Null keeps the role's own.
  final double? displayTracking;

  /// A [TextStyle] for [role] in this typeface.
  TextStyle style(AurumTextRole role, {Color? color, bool tabularFigures = false}) => role.display
      ? role.style(
          color: color,
          tabularFigures: tabularFigures,
          fontFamily: displayFamily,
          fontPackage: displayPackage,
          weight: displayWeight,
          tracking: displayTracking,
        )
      : role.style(color: color, tabularFigures: tabularFigures, fontFamily: family, fontPackage: package);

  @override
  AurumTypeface copyWith({
    String? family,
    String? package,
    String? displayFamily,
    String? displayPackage,
    double? displayWeight,
    double? displayTracking,
  }) => AurumTypeface(
    family: family ?? this.family,
    package: package ?? this.package,
    displayFamily: displayFamily ?? this.displayFamily,
    displayPackage: displayPackage ?? this.displayPackage,
    displayWeight: displayWeight ?? this.displayWeight,
    displayTracking: displayTracking ?? this.displayTracking,
  );

  @override
  AurumTypeface lerp(covariant ThemeExtension<AurumTypeface>? other, double t) =>
      other is AurumTypeface && t >= 0.5 ? other : this;

  @override
  bool operator ==(Object other) =>
      other is AurumTypeface &&
      other.family == family &&
      other.package == package &&
      other.displayFamily == displayFamily &&
      other.displayPackage == displayPackage &&
      other.displayWeight == displayWeight &&
      other.displayTracking == displayTracking;

  @override
  int get hashCode => Object.hash(family, package, displayFamily, displayPackage, displayWeight, displayTracking);
}
