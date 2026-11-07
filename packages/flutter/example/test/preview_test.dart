import 'package:aurum_example/main.dart';
import 'package:aurum_example/screens/assistant.dart';
import 'package:aurum_example/screens/money.dart';
import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('preview renders and switches to dark', (tester) async {
    await tester.pumpWidget(const AurumPreviewApp());
    expect(find.text('Aurum'), findsOneWidget);
    expect(find.text('Sample screens'), findsOneWidget);
    await tester.tap(find.text('Dark'));
    await tester.pumpAndSettle();
    expect(Theme.of(tester.element(find.text('Aurum'))).brightness, Brightness.dark);
  });

  testWidgets('preview opens a sample screen', (tester) async {
    await tester.pumpWidget(const AurumPreviewApp());
    await tester.tap(find.text('Assistant: plans'));
    await tester.pumpAndSettle();
    expect(find.text('Sage+ plans'), findsOneWidget);
  });

  final screens = <String, Widget Function()>{
    'assistant home': () => const AssistantHome(),
    'assistant chat': () => const AssistantChat(),
    'assistant plans': () => const AssistantPlans(),
    'money home': () => const MoneyApp(),
    'money add': () => const MoneyAdd(),
    'money profile': () => const MoneyApp(initialTab: 4),
  };
  for (final size in [const Size(360, 740), const Size(800, 1280)]) {
    for (final b in Brightness.values) {
      for (final e in screens.entries) {
        testWidgets('${e.key} lays out at ${size.width.toInt()} wide, ${b.name}', (tester) async {
          tester.view.physicalSize = size * 2;
          tester.view.devicePixelRatio = 2;
          addTearDown(tester.view.reset);
          await tester.pumpWidget(MaterialApp(theme: aurumTheme(b), home: e.value()));
          await tester.pumpAndSettle();
          expect(tester.takeException(), isNull);
        });
      }
    }
  }
}
