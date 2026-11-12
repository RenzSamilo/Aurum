// Renders the example app's sample screens to PNGs for the README.
// Not part of `flutter test` (which only runs test/). Run from packages/flutter/example:
//
//   flutter test screenshots --update-goldens
//
// Output: docs/assets/screens/flutter-<screen>-<light|dark>.png at the repo root.
// Fonts and icons are loaded from the packages, so text renders as it does on a device.

import 'package:aurum_example/screens/assistant.dart';
import 'package:aurum_example/screens/course.dart';
import 'package:aurum_example/screens/money.dart';
import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Future<void> _loadFont(String family, List<String> assets) async {
  final loader = FontLoader(family);
  for (final a in assets) {
    loader.addFont(rootBundle.load(a));
  }
  await loader.load();
}

void main() {
  setUpAll(() async {
    await _loadFont('packages/aurum_ui/Inter', ['packages/aurum_ui/fonts/InterVariable.ttf']);
    await _loadFont('packages/aurum_ui/Fraunces', ['packages/aurum_ui/fonts/FrauncesVariable.ttf']);
    for (final w in ['Regular', 'Bold', 'Fill', 'Light', 'Thin', 'Duotone']) {
      await _loadFont('packages/phosphor_glyphs/Phosphor-$w', ['packages/phosphor_glyphs/fonts/Phosphor-$w.ttf']);
    }
  });

  final screens = <String, Widget Function()>{
    'assistant': () => const AssistantHome(),
    'money': () => const MoneyApp(),
    'course': () => const CourseHome(),
  };
  for (final b in Brightness.values) {
    for (final e in screens.entries) {
      testWidgets('${e.key} ${b.name}', (tester) async {
        tester.view.physicalSize = const Size(390, 844) * 2;
        tester.view.devicePixelRatio = 2;
        addTearDown(tester.view.reset);
        await tester.pumpWidget(
          MaterialApp(debugShowCheckedModeBanner: false, theme: aurumTheme(b), home: e.value()),
        );
        await tester.pumpAndSettle();
        await expectLater(
          find.byType(MaterialApp),
          matchesGoldenFile('../../../../docs/assets/screens/flutter-${e.key}-${b.name}.png'),
        );
      });
    }
  }
}
