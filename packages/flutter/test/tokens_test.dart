import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

double _ratio(Color a, Color b) {
  final la = a.computeLuminance(), lb = b.computeLuminance();
  return (la > lb ? la + 0.05 : lb + 0.05) / (la > lb ? lb + 0.05 : la + 0.05);
}

void main() {
  const modes = [(Brightness.light, false), (Brightness.dark, false), (Brightness.light, true), (Brightness.dark, true)];

  test('springs keep SwiftUI-compatible duration and bounce', () {
    final from = SpringDescription.withDurationAndBounce(
      duration: Duration(microseconds: (AurumMotion.control.duration * 1e6).round()),
      bounce: AurumMotion.control.bounce,
    );
    final ours = AurumMotion.control.description;
    expect(from.stiffness, closeTo(ours.stiffness, 0.5));
    expect(from.damping, closeTo(ours.damping, 0.1));
  });

  test('nested radius subtracts the padding and never goes negative', () {
    expect(AurumRadii.inner(aurumBrand.radii.lg, 12), 12);
    expect(AurumRadii.inner(aurumBrand.radii.sm, 16), 0);
  });

  test('brand picks the right colour set per mode, and dark is darker', () {
    expect(aurumBrand.colors(Brightness.light, highContrast: true), aurumBrand.contrastLight);
    expect(aurumBrand.colors(Brightness.dark).surfaceCanvas.computeLuminance(),
        lessThan(aurumBrand.colors(Brightness.light).surfaceCanvas.computeLuminance()));
  });

  test('default brand meets contrast rules in every mode', () {
    for (final (b, hc) in modes) {
      final c = aurumBrand.colors(b, highContrast: hc);
      for (final s in [c.surfaceCanvas, c.surfaceCard, c.surfaceInset, c.surfaceElevated]) {
        expect(_ratio(c.textPrimary, s), greaterThanOrEqualTo(4.5));
        expect(_ratio(c.textSecondary, s), greaterThanOrEqualTo(4.5));
        expect(_ratio(c.accent, s), greaterThanOrEqualTo(3));
      }
      expect(_ratio(c.onAccent, c.accent), greaterThanOrEqualTo(4.5));
    }
  });

  testWidgets('theme registers colours, radii and typeface from the brand', (tester) async {
    final custom = AurumBrand(
      name: 'Test',
      light: aurumBrand.light,
      // Light colours in dark mode, so the test can tell this brand was used.
      dark: aurumBrand.light,
      contrastLight: aurumBrand.contrastLight,
      contrastDark: aurumBrand.contrastDark,
      radii: const AurumRadii(sm: 4, md: 6, lg: 8, xl: 10),
      typeface: const AurumTypeface(family: 'Inter', package: 'aurum_ui'),
    );
    late AurumColors colors;
    late AurumRadii radii;
    late TextStyle body;
    await tester.pumpWidget(MaterialApp(
      theme: aurumTheme(Brightness.light),
      darkTheme: aurumTheme(Brightness.dark, brand: custom),
      themeMode: ThemeMode.dark,
      home: Builder(builder: (context) {
        colors = context.aurum;
        radii = context.aurumRadii;
        body = context.aurumText(AurumType.body);
        return const SizedBox();
      }),
    ));
    expect(colors, aurumBrand.light);
    expect(radii.lg, 8);
    expect(body.fontFamily, 'packages/aurum_ui/Inter');
    expect(body.color, aurumBrand.light.textPrimary);
  });
}
