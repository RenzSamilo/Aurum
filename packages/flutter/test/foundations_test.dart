import 'package:aurum_ui/aurum_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AurumHaptics', () {
    final calls = <String?>[];
    var now = Duration.zero;

    setUp(() {
      calls.clear();
      AurumHaptics.reset();
      AurumHaptics.enabled = true;
      AurumHaptics.clock = () => now;
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (call) async {
        if (call.method == 'HapticFeedback.vibrate') calls.add(call.arguments as String?);
        return null;
      });
    });

    test('maps intents to platform haptics', () async {
      await AurumHaptics.play(AurumHaptic.selectionTick);
      await AurumHaptics.play(AurumHaptic.impactMedium);
      await AurumHaptics.play(AurumHaptic.resultError);
      expect(calls, ['HapticFeedbackType.selectionClick', 'HapticFeedbackType.mediumImpact', 'HapticFeedbackType.errorNotification']);
    });

    test('throttles frequent ticks and honours the in-app switch', () async {
      now = const Duration(seconds: 1);
      expect(await AurumHaptics.play(AurumHaptic.selectionFrequent), isTrue);
      now += const Duration(milliseconds: 20);
      expect(await AurumHaptics.play(AurumHaptic.selectionFrequent), isFalse);
      now += const Duration(milliseconds: 60);
      expect(await AurumHaptics.play(AurumHaptic.selectionFrequent), isTrue);
      AurumHaptics.enabled = false;
      expect(await AurumHaptics.play(AurumHaptic.impactLight), isFalse);
      expect(calls, hasLength(2));
    });
  });

  group('AurumGlass', () {
    Widget host({bool? solid, bool highContrast = false, AurumBrand brand = aurumBrand}) => MediaQuery(
          data: MediaQueryData(highContrast: highContrast),
          child: MaterialApp(
            theme: aurumTheme(Brightness.light, brand: brand),
            home: Center(child: AurumGlass(solid: solid, child: const Text('Glass'))),
          ),
        );

    testWidgets('blurs by default', (tester) async {
      await tester.pumpWidget(host());
      expect(find.byType(BackdropFilter), findsOneWidget);
    });

    testWidgets('turns solid with more contrast or when asked', (tester) async {
      await tester.pumpWidget(host(highContrast: true));
      expect(find.byType(BackdropFilter), findsNothing);
      await tester.pumpWidget(host(solid: true));
      expect(find.byType(BackdropFilter), findsNothing);
    });

    testWidgets('an opaque brand turns every glass solid, unless a widget asks otherwise', (tester) async {
      final opaque = AurumBrand(
        name: 'Opaque',
        light: aurumBrand.light,
        dark: aurumBrand.dark,
        contrastLight: aurumBrand.contrastLight,
        contrastDark: aurumBrand.contrastDark,
        radii: aurumBrand.radii,
        typeface: aurumBrand.typeface,
        surfaces: const AurumSurfaces(material: AurumSurfaceMaterial.opaque),
      );
      expect(aurumBrand.surfaces.opaque, isFalse);
      await tester.pumpWidget(host(brand: opaque));
      expect(find.byType(BackdropFilter), findsNothing);
      await tester.pumpWidget(host(brand: opaque, solid: false));
      expect(find.byType(BackdropFilter), findsOneWidget);
    });
  });

  group('springs', () {
    test('simulation settles at the target and keeps velocity', () {
      final sim = AurumMotion.control.simulation(0, 1, velocity: 4);
      expect(sim.dx(0), closeTo(4, 1e-9));
      expect(sim.x(2), closeTo(1, 1e-3));
    });

    test('rubber band resists more the further it is pulled', () {
      final a = aurumRubberBand(40), b = aurumRubberBand(400);
      expect(a, lessThan(40));
      expect(b, lessThan(AurumMotion.rubberBandLimit));
      expect(b - a, lessThan(400 - 40));
      expect(aurumRubberBand(-40), -a);
    });
  });
}
