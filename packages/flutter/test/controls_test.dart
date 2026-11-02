import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget host(Widget child, {Brightness b = Brightness.light}) =>
    MaterialApp(theme: aurumTheme(b), home: Scaffold(body: Center(child: Padding(padding: const EdgeInsets.all(16), child: child))));

void main() {
  final haptics = <String?>[];
  setUp(() {
    haptics.clear();
    AurumHaptics.reset();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (call) async {
      if (call.method == 'HapticFeedback.vibrate') haptics.add(call.arguments as String?);
      return null;
    });
  });

  group('AurumButton', () {
    testWidgets('taps, keyboard activation, disabled state and opt-in haptic', (tester) async {
      var taps = 0;
      await tester.pumpWidget(host(AurumButton(label: 'Save', onPressed: () => taps++)));
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();
      expect(taps, 1);
      expect(haptics, isEmpty);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(taps, 2);

      await tester.pumpWidget(host(AurumButton(label: 'Save', haptic: AurumHaptic.impactLight, onPressed: () => taps++)));
      await tester.tap(find.text('Save'));
      expect(haptics, ['HapticFeedbackType.lightImpact']);

      await tester.pumpWidget(host(const AurumButton(label: 'Save', onPressed: null)));
      await tester.tap(find.text('Save'), warnIfMissed: false);
      expect(taps, 3);
      expect(tester.getSemantics(find.byType(AurumButton)), isSemantics(isButton: true, isEnabled: false, hasTapAction: false, label: 'Save'));
    });

    testWidgets('meets tap target and labelled-target guidelines', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(host(Wrap(children: [
        AurumButton(label: 'Small', size: AurumButtonSize.sm, onPressed: () {}),
        AurumButton(icon: Icons.settings, semanticLabel: 'Settings', variant: AurumButtonVariant.gray, onPressed: () {}),
        AurumButton(label: 'Large', size: AurumButtonSize.lg, fullWidth: true, onPressed: () {}),
      ])));
      await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
      await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
      await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
      await expectLater(tester, meetsGuideline(textContrastGuideline));
      handle.dispose();
    });
  });

  group('AurumSwitch', () {
    Widget demo() {
      var on = false;
      return StatefulBuilder(
        builder: (context, set) => AurumSwitch(value: on, label: 'Notifications', description: 'A summary each morning', onChanged: (v) => set(() => on = v)),
      );
    }

    testWidgets('toggles from the row, the track and a drag, with a tick each time', (tester) async {
      await tester.pumpWidget(host(SizedBox(width: 320, child: demo())));
      final sem = find.bySemanticsLabel('Notifications');
      expect(tester.getSemantics(sem), isSemantics(isToggled: false, isEnabled: true, hasTapAction: true, label: 'Notifications', hint: 'A summary each morning'));

      await tester.tap(find.text('Notifications'));
      await tester.pumpAndSettle();
      expect(tester.getSemantics(sem), isSemantics(isToggled: true));

      await tester.drag(find.byType(AnimatedContainer), const Offset(-40, 0));
      await tester.pumpAndSettle();
      expect(tester.getSemantics(sem), isSemantics(isToggled: false));
      expect(haptics, ['HapticFeedbackType.selectionClick', 'HapticFeedbackType.selectionClick']);
    });

    testWidgets('meets accessibility guidelines', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(host(SizedBox(width: 320, child: demo())));
      await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
      await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
      handle.dispose();
    });
  });

  group('AurumSegmentedControl', () {
    testWidgets('selects by tap and arrow keys, skipping disabled segments', (tester) async {
      var value = 'day';
      await tester.pumpWidget(host(StatefulBuilder(
        builder: (context, set) => SizedBox(
          width: 300,
          child: AurumSegmentedControl<String>(
            value: value,
            onChanged: (v) => set(() => value = v),
            segments: const [
              AurumSegment(value: 'day', label: 'Day'),
              AurumSegment(value: 'week', label: 'Week', enabled: false),
              AurumSegment(value: 'month', label: 'Month'),
            ],
          ),
        ),
      )));
      expect(tester.getSemantics(find.bySemanticsLabel('Day')), isSemantics(isInMutuallyExclusiveGroup: true, isChecked: true, isButton: true, isEnabled: true, hasTapAction: true, label: 'Day'));

      await tester.tap(find.text('Week'));
      await tester.pumpAndSettle();
      expect(value, 'day');

      await tester.tap(find.text('Month'));
      await tester.pumpAndSettle();
      expect(value, 'month');

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(value, 'day');
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(value, 'month');
      expect(haptics.length, 3);
    });
  });
}
