import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:phosphor_glyphs/phosphor_glyphs.dart';

Widget _app(Widget child, {TextDirection dir = TextDirection.ltr}) => MaterialApp(
  theme: aurumTheme(Brightness.light),
  home: Directionality(
    textDirection: dir,
    child: Scaffold(body: child),
  ),
);

void main() {
  test('avatar initials use the first and last words', () {
    expect(AurumAvatar.initialsOf('Renz Samilo'), 'RS');
    expect(AurumAvatar.initialsOf('  ada  '), 'A');
    expect(AurumAvatar.initialsOf('Mary Ann de la Cruz'), 'MC');
    expect(AurumAvatar.initialsOf(''), '');
  });

  testWidgets('avatar is one image named after the person', (tester) async {
    await tester.pumpWidget(_app(const Center(child: AurumAvatar(name: 'Renz Samilo'))));
    expect(find.text('RS'), findsOneWidget);
    expect(tester.getSemantics(find.byType(AurumAvatar)), isSemantics(label: 'Renz Samilo', isImage: true));
  });

  testWidgets('badge styles render their label', (tester) async {
    await tester.pumpWidget(
      _app(
        const Column(
          children: [
            AurumBadge(label: 'New', style: AurumBadgeStyle.solid, tone: AurumBadgeTone.danger),
            AurumBadge(label: 'Pro', tone: AurumBadgeTone.secondary),
            AurumBadge(label: 'Free', style: AurumBadgeStyle.outline),
          ],
        ),
      ),
    );
    expect(find.text('New'), findsOneWidget);
    expect(find.text('Pro'), findsOneWidget);
    expect(find.text('Free'), findsOneWidget);
  });

  testWidgets('tab bar selects with a tap, exposes selection and meets tap targets', (tester) async {
    final handle = tester.ensureSemantics();
    var selected = 0;
    await tester.pumpWidget(
      _app(
        StatefulBuilder(
          builder: (context, setState) => Align(
            alignment: Alignment.bottomCenter,
            child: AurumTabBar(
              selectedIndex: selected,
              onSelected: (i) => setState(() => selected = i),
              tabs: const [
                AurumTab(icon: Icons.home_outlined, label: 'Home'),
                AurumTab(icon: Icons.map_outlined, label: 'Map'),
                AurumTab(icon: Icons.person_outline, label: 'Profile'),
              ],
            ),
          ),
        ),
      ),
    );
    expect(
      tester.getSemantics(find.bySemanticsLabel('Home')),
      isSemantics(isButton: true, isSelected: true, hasTapAction: true),
    );
    await tester.tap(find.text('Map'));
    await tester.pump();
    expect(selected, 1);
    expect(tester.getSemantics(find.bySemanticsLabel('Map')), isSemantics(isButton: true, isSelected: true));
    // Keyboard focus is visible, separate from selection.
    FocusManager.instance.highlightStrategy = FocusHighlightStrategy.alwaysTraditional;
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    final rings = tester
        .widgetList<DecoratedBox>(find.descendant(of: find.byType(AurumTabBar), matching: find.byType(DecoratedBox)))
        .map((b) => b.decoration)
        .whereType<ShapeDecoration>()
        .map((d) => d.shape)
        .whereType<RoundedSuperellipseBorder>()
        .where((shape) => shape.side.width == AurumSize.focusWidth);
    expect(rings, hasLength(1));
    FocusManager.instance.highlightStrategy = FocusHighlightStrategy.automatic;
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });

  testWidgets('top bar centres its title; back button pops and mirrors in RTL', (tester) async {
    final key = GlobalKey<NavigatorState>();
    await tester.pumpWidget(
      MaterialApp(
        navigatorKey: key,
        theme: aurumTheme(Brightness.light),
        home: const Scaffold(body: Text('Root')),
      ),
    );
    key.currentState!.push(
      MaterialPageRoute<void>(
        builder: (_) => const Scaffold(
          body: AurumTopBar(leading: AurumBackButton(), titleText: 'Add money'),
        ),
      ),
    );
    await tester.pumpAndSettle();
    final title = tester.getCenter(find.text('Add money')).dx;
    expect(title, closeTo(tester.view.physicalSize.width / tester.view.devicePixelRatio / 2, 1));
    expect(tester.getSemantics(find.text('Add money')), isSemantics(isHeader: true));
    await tester.tap(find.bySemanticsLabel('Back'));
    await tester.pumpAndSettle();
    expect(find.text('Root'), findsOneWidget);

    await tester.pumpWidget(_app(const AurumTopBar(leading: AurumBackButton()), dir: TextDirection.rtl));
    final icon = tester.widget<Icon>(find.descendant(of: find.byType(AurumBackButton), matching: find.byType(Icon)));
    expect(icon.icon, PhosphorIconsRegular.caretRight);
    expect(tester.getCenter(find.byType(AurumBackButton)).dx, greaterThan(400));
  });

  testWidgets('text field is labelled, shows the placeholder, and submits', (tester) async {
    String? sent;
    await tester.pumpWidget(
      _app(
        Center(
          child: AurumTextField(label: 'Message', placeholder: 'Ask anything', onSubmitted: (v) => sent = v),
        ),
      ),
    );
    expect(find.text('Ask anything'), findsOneWidget);
    expect(find.bySemanticsLabel(RegExp('Message')), findsWidgets);
    await tester.enterText(find.byType(TextField), 'hello');
    await tester.testTextInput.receiveAction(TextInputAction.done);
    expect(sent, 'hello');
  });
}
