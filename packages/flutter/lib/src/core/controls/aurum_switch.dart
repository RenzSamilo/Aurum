import 'package:flutter/material.dart';

import '../../foundations/aurum_haptics.dart';
import '../../foundations/aurum_springs.dart';
import '../../theme/aurum_theme.dart';
import '../../tokens/aurum_tokens.g.dart';

/// An on/off switch for settings that apply immediately. Tap it or drag the
/// thumb. With a [label], the whole row is the tap target and screen readers
/// read it as one control.
class AurumSwitch extends StatefulWidget {
  const AurumSwitch({super.key, required this.value, required this.onChanged, this.label, this.description, this.semanticLabel});

  final bool value;

  /// Null disables the switch.
  final ValueChanged<bool>? onChanged;
  final String? label;
  final String? description;

  /// For a switch without a visible [label].
  final String? semanticLabel;

  static const double width = 52;
  static const double height = 32;
  static const double _pad = 2;
  static const double _thumb = height - 2 * _pad;
  static const double _travel = width - _thumb - 2 * _pad;

  @override
  State<AurumSwitch> createState() => _AurumSwitchState();
}

class _AurumSwitchState extends State<AurumSwitch> with SingleTickerProviderStateMixin {
  late final AnimationController _pos = AnimationController.unbounded(vsync: this, value: widget.value ? 1 : 0);
  bool _pressed = false;
  bool _focused = false;
  bool _dragging = false;

  bool get _enabled => widget.onChanged != null;

  @override
  void didUpdateWidget(AurumSwitch old) {
    super.didUpdateWidget(old);
    if (old.value != widget.value && !_dragging) _animateTo(widget.value);
  }

  void _animateTo(bool on, {double velocity = 0}) {
    final target = on ? 1.0 : 0.0;
    if (!AurumMotion.control.shouldAnimate(context)) {
      _pos.value = target;
    } else {
      _pos.animateWith(AurumMotion.control.simulation(_pos.value, target, velocity: velocity));
    }
  }

  void _commit(bool next, {double velocity = 0}) {
    if (next != widget.value) {
      AurumHaptics.play(AurumHaptic.selectionTick);
      widget.onChanged!(next);
    }
    _animateTo(next, velocity: velocity);
  }

  @override
  void dispose() {
    _pos.dispose();
    super.dispose();
  }

  Widget _track(AurumColors c) {
    return AnimatedBuilder(
      animation: _pos,
      builder: (context, _) {
        final t = _pos.value.clamp(0.0, 1.0);
        final stretch = _pressed ? 6.0 : 0.0;
        final x = AurumSwitch._pad + _pos.value * (AurumSwitch._travel - stretch);
        return Container(
          width: AurumSwitch.width,
          height: AurumSwitch.height,
          decoration: ShapeDecoration(
            color: Color.lerp(c.borderControl, c.accent, t),
            shape: StadiumBorder(
              side: _focused ? BorderSide(color: c.focus, width: AurumSize.focusWidth, strokeAlign: BorderSide.strokeAlignOutside) : BorderSide.none,
            ),
          ),
          child: Stack(children: [
            Positioned(
              left: x,
              top: AurumSwitch._pad,
              child: AnimatedContainer(
                duration: AurumMotion.press,
                curve: AurumMotion.easeStandard,
                width: AurumSwitch._thumb + stretch,
                height: AurumSwitch._thumb,
                decoration: const ShapeDecoration(
                  color: Color(0xFFFFFFFF),
                  shape: StadiumBorder(),
                  shadows: [BoxShadow(color: Color(0x29000000), blurRadius: 6, offset: Offset(0, 2))],
                ),
              ),
            ),
          ]),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final control = GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: _enabled ? (_) => setState(() => _pressed = true) : null,
      onTapCancel: _enabled ? () => setState(() => _pressed = false) : null,
      onTapUp: _enabled ? (_) => setState(() => _pressed = false) : null,
      onTap: _enabled ? () => _commit(!widget.value) : null,
      onHorizontalDragStart: _enabled
          ? (_) => setState(() {
                _dragging = true;
                _pressed = true;
                _pos.stop();
              })
          : null,
      onHorizontalDragUpdate: _enabled
          ? (d) {
              final dir = Directionality.of(context) == TextDirection.rtl ? -1 : 1;
              _pos.value = (_pos.value + dir * d.delta.dx / AurumSwitch._travel).clamp(-0.1, 1.1);
            }
          : null,
      onHorizontalDragEnd: _enabled
          ? (d) {
              setState(() {
                _dragging = false;
                _pressed = false;
              });
              final dir = Directionality.of(context) == TextDirection.rtl ? -1 : 1;
              final v = dir * d.velocity.pixelsPerSecond.dx / AurumSwitch._travel;
              final next = v.abs() > 3 ? v > 0 : _pos.value > 0.5;
              _commit(next, velocity: v);
            }
          : null,
      // 48 tall hit area around the 32 track.
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Directionality.of(context) == TextDirection.rtl ? Transform.flip(flipX: true, child: _track(c)) : _track(c),
      ),
    );

    final focusable = FocusableActionDetector(
      enabled: _enabled,
      mouseCursor: _enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onShowFocusHighlight: (v) => setState(() => _focused = v),
      actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => _commit(!widget.value))},
      child: control,
    );

    final semantics = Semantics(
      container: true,
      toggled: widget.value,
      enabled: _enabled,
      label: widget.label ?? widget.semanticLabel,
      hint: widget.description,
      onTap: _enabled ? () => _commit(!widget.value) : null,
      excludeSemantics: true,
      child: focusable,
    );

    if (widget.label == null) return semantics;

    return MergeSemantics(
      child: Opacity(
        opacity: _enabled ? 1 : 0.4,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _enabled ? () => _commit(!widget.value) : null,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: AurumSize.target),
            child: Row(children: [
              Expanded(
                child: ExcludeSemantics(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(widget.label!, style: context.aurumText(AurumType.body)),
                      if (widget.description != null)
                        Text(widget.description!, style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: AurumSpace.s16),
              semantics,
            ]),
          ),
        ),
      ),
    );
  }
}
