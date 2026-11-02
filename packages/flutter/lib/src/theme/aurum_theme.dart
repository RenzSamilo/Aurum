import 'package:flutter/material.dart';

import '../tokens/aurum_tokens.g.dart';

/// Picks the Aurum colour set for a brightness and contrast setting.
AurumColors aurumColorsFor(Brightness brightness, {bool highContrast = false}) {
  return switch ((brightness, highContrast)) {
    (Brightness.light, false) => AurumColors.light,
    (Brightness.dark, false) => AurumColors.dark,
    (Brightness.light, true) => AurumColors.contrastLight,
    (Brightness.dark, true) => AurumColors.contrastDark,
  };
}

/// A ThemeData with Aurum colours, Inter type and the [AurumColors] extension.
///
/// Read tokens in widgets with `context.aurum`.
ThemeData aurumTheme(Brightness brightness, {bool highContrast = false}) {
  final colors = aurumColorsFor(brightness, highContrast: highContrast);
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
  TextStyle role(AurumTextRole r) => r.style(color: colors.textPrimary);
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: colors.surfaceCanvas,
    fontFamily: AurumFonts.ui,
    package: AurumFonts.package,
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
    extensions: [colors],
  );
}

extension AurumContext on BuildContext {
  /// The active Aurum colours. Falls back to light if no Aurum theme is set.
  AurumColors get aurum => Theme.of(this).extension<AurumColors>() ?? AurumColors.light;
}
