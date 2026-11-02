import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';

import '../foundations/aurum_haptics.dart';
import '../foundations/aurum_springs.dart';
import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// Shows a modal sheet that rises from the bottom on the surface spring.
/// Drag the top area down to close; a fast flick closes it from anywhere in
/// the drag. Returns the value passed to `Navigator.pop`.
///
/// With [dismissible] false, the sheet ignores the scrim, drags and the back
/// gesture, so unsaved work is not lost; give it its own buttons to close.
Future<T?> showAurumSheet<T>({
  required BuildContext context,
  required String title,
  required WidgetBuilder builder,
  bool dismissible = true,
  bool hideTitle = false,
  String? closeLabel = 'Close',
}) {
  AurumHaptics.play(AurumHaptic.impactLight);
  return Navigator.of(context).push(_AurumSheetRoute<T>(
    title: title,
    builder: builder,
    dismissible: dismissible,
    hideTitle: hideTitle,
    closeLabel: closeLabel,
    barrierColor: context.aurum.scrim,
    reduceMotion: !AurumMotion.surface.shouldAnimate(context),
  ));
}

/// A [Curve] that follows a spring from 0 to 1 over its settle time.
class _SpringCurve extends Curve {
  _SpringCurve(AurumSpring spring) : _sim = spring.simulation(0, 1) {
    var t = 0.0;
    while (!_sim.isDone(t) && t < 3) {
      t += 1 / 120;
    }
    settle = t;
  }

  final SpringSimulation _sim;
  late final double settle;

  @override
  double transformInternal(double t) => _sim.x(t * settle);
}

class _AurumSheetRoute<T> extends PopupRoute<T> {
  _AurumSheetRoute({
    required this.title,
    required this.builder,
    required this.dismissible,
    required this.hideTitle,
    required this.closeLabel,
    required this.barrierColor,
    required this.reduceMotion,
  });

  final String title;
  final WidgetBuilder builder;
  final bool dismissible;
  final bool hideTitle;
  final String? closeLabel;
  final bool reduceMotion;

  @override
  final Color barrierColor;

  static final _curve = _SpringCurve(AurumMotion.surface);

  @override
  bool get barrierDismissible => dismissible;

  @override
  String get barrierLabel => 'Dismiss';

  @override
  Duration get transitionDuration =>
      reduceMotion ? AurumMotion.reducedFade : Duration(milliseconds: (_curve.settle * 1000).round());

  @override
  Duration get reverseTransitionDuration => reduceMotion ? AurumMotion.reducedFade : AurumMotion.transition;

  @override
  bool get popGestureEnabled => dismissible;

  @override
  RoutePopDisposition get popDisposition => dismissible ? RoutePopDisposition.pop : RoutePopDisposition.doNotPop;

  @override
  Widget buildPage(BuildContext context, Animation<double> animation, Animation<double> secondaryAnimation) {
    return _AurumSheet(route: this);
  }

  @override
  Widget buildTransitions(BuildContext context, Animation<double> animation, Animation<double> secondaryAnimation, Widget child) {
    if (reduceMotion) return FadeTransition(opacity: animation, child: child);
    final curved = CurvedAnimation(parent: animation, curve: _curve, reverseCurve: AurumMotion.easeStandard);
    return AnimatedBuilder(
      animation: curved,
      child: child,
      builder: (context, child) => FractionalTranslation(translation: Offset(0, 1 - curved.value), child: child),
    );
  }
}

class _AurumSheet extends StatefulWidget {
  const _AurumSheet({required this.route});
  final _AurumSheetRoute<dynamic> route;

  @override
  State<_AurumSheet> createState() => _AurumSheetState();
}

class _AurumSheetState extends State<_AurumSheet> {
  final _key = GlobalKey();
  double _drag = 0;

  double get _height => (_key.currentContext?.size?.height ?? 400).clamp(1, double.infinity);

  void _onDragUpdate(DragUpdateDetails d) {
    setState(() {
      final next = _drag + d.delta.dy;
      _drag = next >= 0 ? next : -aurumRubberBand(-next).abs();
    });
  }

  void _onDragEnd(DragEndDetails d) {
    final v = d.velocity.pixelsPerSecond.dy;
    if (_drag > _height * 0.3 || v > 700) {
      Navigator.of(context).pop();
    } else {
      setState(() => _drag = 0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final route = widget.route;
    final r = Radius.circular(context.aurumRadii.xl);
    final media = MediaQuery.of(context);

    final header = Padding(
      padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s12, AurumSpace.s12, AurumSpace.s8),
      child: SizedBox(
        height: 40,
        child: Stack(alignment: Alignment.center, children: [
          if (route.dismissible)
            Positioned(
              top: -4,
              child: ExcludeSemantics(
                child: Container(
                  width: 36,
                  height: 5,
                  decoration: ShapeDecoration(shape: const StadiumBorder(), color: c.borderControl.withValues(alpha: 0.6)),
                ),
              ),
            ),
          if (!route.hideTitle)
            Semantics(
              header: true,
              child: Text(route.title, style: context.aurumText(AurumType.headline), maxLines: 1, overflow: TextOverflow.ellipsis),
            ),
          if (route.closeLabel != null)
            PositionedDirectional(
              end: 0,
              child: Semantics(
                container: true,
                button: true,
                label: route.closeLabel,
                excludeSemantics: true,
                onTap: () => Navigator.of(context).pop(),
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => Navigator.of(context).pop(),
                  child: SizedBox(
                    width: AurumSize.target,
                    height: AurumSize.target,
                    child: Center(
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: ShapeDecoration(shape: const CircleBorder(), color: c.fillPressed),
                        child: CustomPaint(painter: _CrossPainter(c.textSecondary)),
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ]),
      ),
    );

    final sheet = Container(
      key: _key,
      constraints: BoxConstraints(maxWidth: 640, maxHeight: (media.size.height - media.viewInsets.bottom - media.padding.top - AurumSpace.s16).clamp(0.0, double.infinity)),
      decoration: ShapeDecoration(
        color: c.surfaceCanvas,
        shape: RoundedSuperellipseBorder(borderRadius: BorderRadius.only(topLeft: r, topRight: r)),
        shadows: AurumShadow.modal,
      ),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onVerticalDragUpdate: route.dismissible ? _onDragUpdate : null,
          onVerticalDragEnd: route.dismissible ? _onDragEnd : null,
          child: header,
        ),
        Flexible(
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s8, AurumSpace.s16, AurumSpace.s24 + (media.viewInsets.bottom > 0 ? 0 : media.padding.bottom)),
            child: Builder(builder: route.builder),
          ),
        ),
      ]),
    );

    return Semantics(
      scopesRoute: true,
      namesRoute: true,
      explicitChildNodes: true,
      label: route.title,
      // Lift the sheet above the software keyboard.
      child: AnimatedPadding(
        duration: AurumMotion.press,
        curve: AurumMotion.easeStandard,
        padding: EdgeInsets.only(bottom: media.viewInsets.bottom),
        child: Align(
        alignment: Alignment.bottomCenter,
        child: AnimatedContainer(
          duration: _drag == 0 ? AurumMotion.transition : Duration.zero,
          curve: AurumMotion.easeStandard,
          transform: Matrix4.translationValues(0, _drag, 0),
          child: sheet,
        ),
      ),
      ),
    );
  }
}

class _CrossPainter extends CustomPainter {
  _CrossPainter(this.color);
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    final c = size.center(Offset.zero);
    const h = 5.0;
    canvas.drawLine(c + const Offset(-h, -h), c + const Offset(h, h), p);
    canvas.drawLine(c + const Offset(h, -h), c + const Offset(-h, h), p);
  }

  @override
  bool shouldRepaint(_CrossPainter old) => old.color != color;
}
