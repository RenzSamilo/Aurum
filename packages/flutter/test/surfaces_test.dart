import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget host(Widget child) => MaterialApp(theme: aurumTheme(Brightness.light), home: Scaffold(body: ListView(padding: const EdgeInsets.all(16), children: [child])));

void main() {
  setUp(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (_) async => null);
  });

  testWidgets('list rows: pressable rows are buttons with chevrons, control rows are not', (tester) async {
    final handle = tester.ensureSemantics();
    var pressed = 0;
    var wifi = true;
    await tester.pumpWidget(host(StatefulBuilder(
      builder: (context, set) => AurumListSection(header: 'Account', footer: 'Changes sync everywhere.', children: [
        AurumListRow(title: 'Language', value: 'English', leading: Icons.language, onPressed: () => pressed++),
        AurumListRow(title: 'Wi-Fi only', trailing: AurumSwitch(value: wifi, semanticLabel: 'Wi-Fi only', onChanged: (v) => set(() => wifi = v))),
        const AurumListRow(title: 'Version', value: '1.0'),
      ]),
    )));
    await tester.tap(find.text('Language'));
    expect(pressed, 1);
    expect(tester.getSemantics(find.text('Language')), isSemantics(isButton: true, hasTapAction: true));
    expect(find.text('Account'), findsOneWidget);
    await tester.tap(find.byType(AurumSwitch));
    await tester.pumpAndSettle();
    expect(wifi, isFalse);
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    await expectLater(tester, meetsGuideline(textContrastGuideline));
    handle.dispose();
  });

  testWidgets('pressable card is one button; static card is not', (tester) async {
    var taps = 0;
    await tester.pumpWidget(host(Column(children: [
      const AurumCard(child: Text('Static')),
      AurumCard(onPressed: () => taps++, child: const Text('Open report')),
    ])));
    await tester.tap(find.text('Open report'));
    await tester.pumpAndSettle();
    expect(taps, 1);
    expect(tester.getSemantics(find.text('Open report')), isSemantics(isButton: true, hasTapAction: true));
    expect(tester.getSemantics(find.text('Static')), isSemantics(isButton: false));
  });

  group('showAurumSheet', () {
    Future<void> open(WidgetTester tester, {bool dismissible = true}) async {
      await tester.pumpWidget(MaterialApp(
        theme: aurumTheme(Brightness.light),
        home: Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: AurumButton(
                label: 'Open',
                onPressed: () => showAurumSheet<void>(
                  context: context,
                  title: 'Filters',
                  dismissible: dismissible,
                  builder: (_) => const SizedBox(height: 200, child: Text('Body')),
                ),
              ),
            ),
          ),
        ),
      ));
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      expect(find.text('Body'), findsOneWidget);
    }

    testWidgets('closes with the close button', (tester) async {
      await open(tester);
      expect(tester.getSemantics(find.bySemanticsLabel('Close')), isSemantics(isButton: true, hasTapAction: true));
      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pumpAndSettle();
      expect(find.text('Body'), findsNothing);
    });

    testWidgets('closes on a downward drag, springs back on a short one', (tester) async {
      await open(tester);
      await tester.drag(find.text('Filters'), const Offset(0, 20));
      await tester.pumpAndSettle();
      expect(find.text('Body'), findsOneWidget);
      await tester.fling(find.text('Filters'), const Offset(0, 300), 1500);
      await tester.pumpAndSettle();
      expect(find.text('Body'), findsNothing);
    });

    testWidgets('closes on the scrim, unless not dismissible', (tester) async {
      await open(tester);
      await tester.tapAt(const Offset(10, 10));
      await tester.pumpAndSettle();
      expect(find.text('Body'), findsNothing);

      await open(tester, dismissible: false);
      await tester.tapAt(const Offset(10, 10));
      await tester.drag(find.text('Filters'), const Offset(0, 400));
      await tester.pumpAndSettle();
      expect(find.text('Body'), findsOneWidget);
    });

    testWidgets('sits above the software keyboard', (tester) async {
      await open(tester);
      final before = tester.getBottomLeft(find.text('Body')).dy;
      tester.view.viewInsets = const FakeViewPadding(bottom: 300 * 3);
      addTearDown(tester.view.resetViewInsets);
      await tester.pumpAndSettle();
      final after = tester.getBottomLeft(find.text('Body')).dy;
      expect(before - after, closeTo(300, 40));
      expect(after, lessThan(tester.view.physicalSize.height / tester.view.devicePixelRatio - 300));
    });
  });
}
