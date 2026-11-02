import 'package:aurum_example/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('preview renders and switches to dark', (tester) async {
    await tester.pumpWidget(const AurumPreviewApp());
    expect(find.text('Aurum'), findsOneWidget);
    await tester.tap(find.text('Dark'));
    await tester.pumpAndSettle();
    expect(find.text('Colour'), findsOneWidget);
  });
}
