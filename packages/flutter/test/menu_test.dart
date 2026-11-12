import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget host(Widget child) => MaterialApp(
  theme: aurumTheme(Brightness.light),
  home: Scaffold(body: Center(child: child)),
);

void main() {
  setUp(() {
    AurumHaptics.reset();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
      SystemChannels.platform,
      (call) async => null,
    );
  });

  testWidgets('opens, picks an item, skips disabled items, and closes', (tester) async {
    final picked = <String>[];
    await tester.pumpWidget(
      host(
        AurumMenu(
          trigger: const Text('More'),
          items: [
            AurumMenuItem(label: 'Rename', onSelected: () => picked.add('Rename')),
            AurumMenuItem(label: 'Archive', onSelected: () => picked.add('Archive'), enabled: false),
            AurumMenuItem(
              label: 'Delete',
              onSelected: () => picked.add('Delete'),
              destructive: true,
              icon: Icons.delete_outline,
            ),
          ],
        ),
      ),
    );
    expect(find.text('Rename'), findsNothing);

    await tester.tap(find.text('More'));
    await tester.pumpAndSettle();
    expect(find.text('Rename'), findsOneWidget);

    await tester.tap(find.text('Archive'));
    await tester.pumpAndSettle();
    expect(picked, isEmpty);

    await tester.tap(find.text('Delete'));
    await tester.pumpAndSettle();
    expect(picked, ['Delete']);
    expect(find.text('Rename'), findsNothing);
  });

  testWidgets('keyboard: opens with Enter, moves with arrows, closes with Escape', (tester) async {
    final picked = <String>[];
    await tester.pumpWidget(
      host(
        AurumMenu(
          trigger: const Icon(Icons.more_horiz),
          semanticLabel: 'More actions',
          items: [
            AurumMenuItem(label: 'Rename', onSelected: () => picked.add('Rename')),
            AurumMenuItem(label: 'Duplicate', onSelected: () => picked.add('Duplicate')),
          ],
        ),
      ),
    );
    expect(find.bySemanticsLabel('More actions'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(find.text('Rename'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('Rename'), findsNothing);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(picked, ['Duplicate']);
  });

  testWidgets('meets tap target and labelling guidelines', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(
      host(
        AurumMenu(
          trigger: const Icon(Icons.more_horiz),
          semanticLabel: 'More actions',
          items: [AurumMenuItem(label: 'Rename', onSelected: () {})],
        ),
      ),
    );
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    await tester.tap(find.byType(AurumMenu));
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
}
