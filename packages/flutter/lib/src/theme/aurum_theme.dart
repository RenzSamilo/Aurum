import 'package:flutter/material.dart';

import '../tokens/aurum_brand.g.dart';
import '../tokens/aurum_tokens.g.dart';
import 'aurum_brand.dart';

/// A ThemeData built from an Aurum [brand]: colours for [brightness] and
/// contrast, the brand typeface, and the [AurumColors], [AurumRadii] and
/// [AurumTypeface] extensions.
///
/// Read them in widgets with `context.aurum`, `context.aurumRadii` and
/// `context.aurumText(role)`.
ThemeData aurumTheme(Brightness brightness, {bool highContrast = false, AurumBrand brand = aurumBrand}) {
  final colors = brand.colors(brightness, highContrast: highContrast);
  final face = brand.typeface;
  final scheme = ColorScheme.fromSeed(
    seedColor: colors.accent,
    brightness: brightness,
  ).copyWith(
    primary: colors.accent,
    onPrimary: colors.onAccent,
    surface: colors.surfaceCanvas,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.borderControl,
    outlineVariant: colors.borderDecorative,
    error: colors.danger,
  );
  TextStyle role(AurumTextRole r) => face.style(r, color: colors.textPrimary);
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: colors.surfaceCanvas,
    fontFamily: face.family,
    package: face.package,
    textTheme: TextTheme(
      displayLarge: role(AurumType.display),
      headlineLarge: role(AurumType.page),
      headlineMedium: role(AurumType.section),
      titleLarge: role(AurumType.card),
      titleMedium: role(AurumType.headline),
      bodyLarge: role(AurumType.body),
      bodyMedium: role(AurumType.callout),
      labelLarge: role(AurumType.subhead),
      bodySmall: role(AurumType.footnote),
      labelMedium: role(AurumType.caption),
      labelSmall: role(AurumType.micro),
    ),
    extensions: [colors, brand.radii, face],
  );
}

extension AurumContext on BuildContext {
  /// The active Aurum colours. Falls back to the default brand's light set.
  AurumColors get aurum => Theme.of(this).extension<AurumColors>() ?? aurumBrand.light;

  /// The active brand's corner radii.
  AurumRadii get aurumRadii => Theme.of(this).extension<AurumRadii>() ?? aurumBrand.radii;

  /// The active brand's typeface.
  AurumTypeface get aurumTypeface => Theme.of(this).extension<AurumTypeface>() ?? aurumBrand.typeface;

  /// [role] in the brand typeface. [color] defaults to primary text.
  TextStyle aurumText(AurumTextRole role, {Color? color, bool tabularFigures = false}) =>
      aurumTypeface.style(role, color: color ?? aurum.textPrimary, tabularFigures: tabularFigures);
}
