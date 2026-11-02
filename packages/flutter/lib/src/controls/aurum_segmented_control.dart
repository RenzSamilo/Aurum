import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../foundations/aurum_haptics.dart';
import '../foundations/aurum_springs.dart';
import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// One option in an [AurumSegmentedControl].
@immutable
class AurumSegment<T> {
  const AurumSegment({required this.value, this.label, this.icon, this.semanticLabel, this.enabled = true})
      : assert(label != null || icon != null),
        assert(label != null || semanticLabel != null, 'Icon-only segments need a semanticLabel.');

  final T value;
  final String? label;
  final IconData? icon;
  final String? semanticLabel;
  final bool enabled;
}

/// Two to five mutually exclusive options side by side, such as views of the
/// same content. The selection slides on the control spring. Arrow keys move
/// it, like a native radio group.
class AurumSegmentedControl<T> extends StatefulWidget {
  const AurumSegmentedControl({
    super.key,
    required this.segments,
    required this.value,
    required this.onChanged,
    this.small = false,
  }) : assert(segments.length >= 2 && segments.length <= 5, 'Use 2 to 5 segments.');

  final List<AurumSegment<T>> segments;
  final T value;

  /// Null disables the control.
  final ValueChanged<T>? onChanged;

  /// 28 tall instead of 36.
  final bool small;

  @override
  State<AurumSegmentedControl<T>> createState() => _AurumSegmentedControlState<T>();
}

class _AurumSegmentedControlState<T> extends State<AurumSegmentedControl<T>> with SingleTickerProviderStateMixin {
  late final AnimationController _pos = AnimationController.unbounded(vsync: this, value: _index.toDouble());
  int? _pressed;
  bool _focused = false;

  int get _index => widget.segments.indexWhere((s) => s.value == widget.value).clamp(0, widget.segments.length - 1);

  @override
  void didUpdateWidget(AurumSegmentedControl<T> old) {
    super.didUpdateWidget(old);
    final target = _index.toDouble();
    if (_pos.value == target) return;
    if (!AurumMotion.control.shouldAnimate(context)) {
      _pos.value = target;
    } else {
      _pos.animateWith(AurumMotion.control.simulation(_pos.value, target, velocity: _pos.velocity));
    }
  }

  @override
  void dispose() {
    _pos.dispose();
    super.dispose();
  }

  void _select(int i) {
    final s = widget.segments[i];
    if (widget.onChanged == null || !s.enabled || s.value == widget.value) return;
    AurumHaptics.play(AurumHaptic.selectionTick);
    widget.onChanged!(s.value);
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final enabled = [for (var i = 0; i < widget.segments.length; i++) if (widget.segments[i].enabled) i];
    if (enabled.isEmpty) return KeyEventResult.ignored;
    final at = enabled.indexOf(_index);
    int? next;
    final k = e.logicalKey;
    if (k == LogicalKeyboardKey.home) next = enabled.first;
    if (k == LogicalKeyboardKey.end) next = enabled.last;
    final step = k == LogicalKeyboardKey.arrowRight || k == LogicalKeyboardKey.arrowDown
        ? 1
        : k == LogicalKeyboardKey.arrowLeft || k == LogicalKeyboardKey.arrowUp
            ? -1
            : 0;
    if (step != 0) {
      final dir = (k == LogicalKeyboardKey.arrowLeft || k == LogicalKeyboardKey.arrowRight) && rtl ? -step : step;
      next = enabled[(at + dir + enabled.length) % enabled.length];
    }
    if (next == null) return KeyEventResult.ignored;
    _select(next);
    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final r = context.aurumRadii.sm;
    final n = widget.segments.length;
    final height = widget.small ? 28.0 : 36.0;
    const pad = 2.0;
    final dark = Theme.of(context).brightness == Brightness.dark;
    final thumbColor = dark ? c.borderDecorative : c.surfaceElevated;
    final enabled = widget.onChanged != null;

    // The track stays compact; the tap targets extend above and below it to 48.
    final trackHeight = height + 2 * pad;
    final hitHeight = trackHeight < AurumSize.target ? AurumSize.target : trackHeight;

    return Focus(
      canRequestFocus: enabled,
      onKeyEvent: _onKey,
      onFocusChange: (v) => setState(() => _focused = v),
      child: Opacity(
        opacity: enabled ? 1 : 0.4,
        child: SizedBox(
          height: hitHeight,
          child: Stack(alignment: Alignment.center, children: [
            Positioned.fill(
              child: Center(
                child: Container(
                  height: trackHeight,
                  padding: const EdgeInsets.all(pad),
                  decoration: ShapeDecoration(
                    color: c.surfaceInset,
                    shape: RoundedSuperellipseBorder(
                      borderRadius: BorderRadius.circular(r),
                      side: _focused ? BorderSide(color: c.focus, width: AurumSize.focusWidth, strokeAlign: BorderSide.strokeAlignOutside) : BorderSide.none,
                    ),
                  ),
                  child: LayoutBuilder(builder: (context, box) {
                    final w = box.maxWidth / n;
                    return Stack(children: [
                      AnimatedBuilder(
                        animation: _pos,
                        builder: (context, _) => PositionedDirectional(
                          start: _pos.value * w,
                          top: 0,
                          bottom: 0,
                          width: w,
                          child: DecoratedBox(
                            decoration: ShapeDecoration(
                              color: thumbColor,
                              shape: RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(r - pad)),
                              shadows: const [BoxShadow(color: Color(0x14000000), blurRadius: 6, offset: Offset(0, 2))],
                            ),
                          ),
                        ),
                      ),
                    ]);
                  }),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: pad),
              child: Row(children: [
                for (var i = 0; i < n; i++) Expanded(child: _segment(context, i, hitHeight)),
              ]),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _segment(BuildContext context, int i, double height) {
    final c = context.aurum;
    final s = widget.segments[i];
    final selected = i == _index;
    final active = widget.onChanged != null && s.enabled;
    var style = context.aurumText(AurumType.subhead, color: s.enabled ? c.textPrimary : c.textTertiary);
    if (selected) {
      style = style.copyWith(fontWeight: FontWeight.w600, fontVariations: [const FontVariation('wght', 600), FontVariation('opsz', style.fontSize!)]);
    }
    return Semantics(
      container: true,
      inMutuallyExclusiveGroup: true,
      checked: selected,
      button: true,
      enabled: active,
      label: s.semanticLabel ?? s.label,
      excludeSemantics: true,
      onTap: active ? () => _select(i) : null,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: active ? (_) => setState(() => _pressed = i) : null,
        onTapUp: active ? (_) => setState(() => _pressed = null) : null,
        onTapCancel: active ? () => setState(() => _pressed = null) : null,
        onTap: active ? () => _select(i) : null,
        child: MouseRegion(
          cursor: active ? SystemMouseCursors.click : SystemMouseCursors.basic,
          child: AnimatedScale(
            scale: _pressed == i && AurumMotion.control.shouldAnimate(context) ? AurumMotion.pressScaleControl : 1,
            duration: AurumMotion.press,
            curve: AurumMotion.easeStandard,
            child: SizedBox(
              height: height,
              child: Center(
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  if (s.icon != null) Icon(s.icon, size: style.fontSize! * 1.2, color: style.color),
                  if (s.icon != null && s.label != null) const SizedBox(width: AurumSpace.s4),
                  if (s.label != null) Flexible(child: Text(s.label!, style: style, maxLines: 1, overflow: TextOverflow.ellipsis)),
                ]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
