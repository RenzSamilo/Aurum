import 'package:aurum_example/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('preview renders and switches to dark', (tester) async {
    await tester.pumpWidget(const AurumPreviewApp());
    expect(find.text('Aurum'), findsOneWidget);
    expect(find.text('Controls'), findsOneWidget);
    await tester.tap(find.text('Dark'));
    await tester.pumpAndSettle();
    expect(Theme.of(tester.element(find.text('Controls'))).brightness, Brightness.dark);
  });
}
