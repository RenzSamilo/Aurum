import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
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
    expect(AurumRadius.inner(AurumRadius.lg, 12), 12);
    expect(AurumRadius.inner(AurumRadius.sm, 16), 0);
  });

  test('every mode is registered and dark is darker than light', () {
    expect(aurumColorsFor(Brightness.dark).surfaceCanvas.computeLuminance(),
        lessThan(aurumColorsFor(Brightness.light).surfaceCanvas.computeLuminance()));
    expect(aurumColorsFor(Brightness.light, highContrast: true), AurumColors.contrastLight);
  });

  test('primary text meets 4.5:1 on every surface in every mode', () {
    double ratio(Color a, Color b) {
      final la = a.computeLuminance(), lb = b.computeLuminance();
      return (la > lb ? la + 0.05 : lb + 0.05) / (la > lb ? lb + 0.05 : la + 0.05);
    }

    for (final c in [AurumColors.light, AurumColors.dark, AurumColors.contrastLight, AurumColors.contrastDark]) {
      for (final s in [c.surfaceCanvas, c.surfaceCard, c.surfaceInset, c.surfaceElevated]) {
        expect(ratio(c.textPrimary, s), greaterThan(4.5));
        expect(ratio(c.textSecondary, s), greaterThan(4.5));
      }
    }
  });

  testWidgets('theme exposes the colour extension', (tester) async {
    late AurumColors seen;
    await tester.pumpWidget(MaterialApp(
      theme: aurumTheme(Brightness.dark),
      home: Builder(builder: (context) {
        seen = context.aurum;
        return const SizedBox();
      }),
    ));
    expect(seen, AurumColors.dark);
  });
}
