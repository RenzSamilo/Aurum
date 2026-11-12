import 'package:flutter/material.dart';

import '../../foundations/aurum_glass.dart';
import '../../foundations/aurum_haptics.dart';
import '../../theme/aurum_theme.dart';
import '../../tokens/aurum_tokens.g.dart';
import 'aurum_pressable.dart';

/// filled: the one main action. tinted / gray: secondary. plain: text only.
/// glass: a clear-glass control that floats over imagery, video or a busy
/// background, e.g. back, bookmark or playback speed. Use it on content, not
/// inside cards.
enum AurumButtonVariant { filled, tinted, gray, plain, glass }

/// sm is 32 tall (48 hit area), md 48, lg 64.
enum AurumButtonSize { sm, md, lg }

/// A button with a spring press and continuous corners.
///
/// Haptics are off by default; pass [haptic] for the few buttons that need one.
class AurumButton extends StatefulWidget {
  const AurumButton({
    super.key,
    required this.onPressed,
    this.label,
    this.icon,
    this.variant = AurumButtonVariant.filled,
    this.size = AurumButtonSize.md,
    this.capsule = false,
    this.destructive = false,
    this.fullWidth = false,
    this.haptic,
    this.semanticLabel,
  }) : assert(label != null || icon != null, 'Give the button a label, an icon, or both.'),
       assert(label != null || semanticLabel != null, 'Icon-only buttons need a semanticLabel.');

  /// Null disables the button.
  final VoidCallback? onPressed;
  final String? label;
  final IconData? icon;
  final AurumButtonVariant variant;
  final AurumButtonSize size;
  final bool capsule;

  /// Uses the danger colour. Say what will be lost in the label.
  final bool destructive;
  final bool fullWidth;
  final AurumHaptic? haptic;

  /// Read by screen readers instead of [label]. Required for icon-only buttons.
  final String? semanticLabel;

  @override
  State<AurumButton> createState() => _AurumButtonState();
}

class _AurumButtonState extends State<AurumButton> {
  bool _pressed = false;
  bool _hovered = false;
  bool _focused = false;

  bool get _enabled => widget.onPressed != null;

  void _activate() {
    if (!_enabled) return;
    if (widget.haptic != null) AurumHaptics.play(widget.haptic!);
    widget.onPressed!();
  }

  void _setPressed(bool v) {
    if (_pressed != v) setState(() => _pressed = v);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final radii = context.aurumRadii;
    final tone = widget.destructive ? c.danger : c.accent;
    final (Color bg, Color fg) = switch (widget.variant) {
      AurumButtonVariant.filled => (tone, c.onAccent),
      AurumButtonVariant.tinted => (tone.withValues(alpha: 0.14), tone),
      AurumButtonVariant.gray => (c.surfaceInset, tone),
      AurumButtonVariant.plain => (const Color(0x00000000), tone),
      AurumButtonVariant.glass => (const Color(0x00000000), widget.destructive ? c.danger : c.textPrimary),
    };
    final glass = widget.variant == AurumButtonVariant.glass;
    final height = switch (widget.size) {
      AurumButtonSize.sm => 32.0,
      AurumButtonSize.md => AurumSize.target,
      AurumButtonSize.lg => AurumSize.targetLarge,
    };
    final radius = widget.capsule ? height / 2 : (widget.size == AurumButtonSize.lg ? radii.md : radii.sm);
    final hPad = switch (widget.size) {
      AurumButtonSize.sm => AurumSpace.s12,
      AurumButtonSize.md => AurumSpace.s16,
      AurumButtonSize.lg => AurumSpace.s24,
    };
    var text = context.aurumText(widget.size == AurumButtonSize.sm ? AurumType.subhead : AurumType.headline, color: fg);
    if (widget.size == AurumButtonSize.sm) {
      text = text.copyWith(
        fontWeight: FontWeight.w600,
        fontVariations: [const FontVariation('wght', 600), FontVariation('opsz', text.fontSize!)],
      );
    }
    final overlay = _pressed ? 0.12 : (_hovered ? 0.06 : 0.0);
    final iconOnly = widget.label == null;

    final content = Row(
      mainAxisSize: widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.icon != null) Icon(widget.icon, size: text.fontSize! * 1.25, color: fg),
        if (widget.icon != null && !iconOnly) const SizedBox(width: AurumSpace.s8),
        if (!iconOnly)
          Flexible(
            child: Text(widget.label!, style: text, maxLines: 1, overflow: TextOverflow.ellipsis),
          ),
      ],
    );

    final shape = RoundedSuperellipseBorder(
      borderRadius: BorderRadius.circular(radius),
      side: _focused
          ? BorderSide(color: c.focus, width: AurumSize.focusWidth, strokeAlign: BorderSide.strokeAlignOutside)
          : BorderSide.none,
    );
    Widget body = Container(
      constraints: BoxConstraints(minHeight: height, minWidth: iconOnly ? height : 0),
      padding: EdgeInsets.symmetric(horizontal: iconOnly ? 0 : hPad),
      decoration: ShapeDecoration(
        shape: shape,
        color: Color.alphaBlend(fg.withValues(alpha: overlay), bg),
      ),
      child: Center(widthFactor: widget.fullWidth ? null : 1, heightFactor: 1, child: content),
    );
    if (glass) {
      // The glass clips its child, so the focus ring goes outside it.
      body = DecoratedBox(
        position: DecorationPosition.foreground,
        decoration: ShapeDecoration(shape: shape),
        child: AurumGlass(level: AurumMaterialLevel.clear, radius: radius, lifted: true, child: body),
      );
    }
    if (widget.size == AurumButtonSize.sm) {
      // Keep a 48 hit area (Android's minimum; iOS asks for 44) around the 32 visual.
      body = Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: body);
    }

    return Semantics(
      container: true,
      button: true,
      enabled: _enabled,
      label: widget.semanticLabel,
      excludeSemantics: widget.semanticLabel != null,
      // Excluding descendants drops the gesture's tap action, so restore it here.
      onTap: _enabled && widget.semanticLabel != null ? _activate : null,
      child: FocusableActionDetector(
        enabled: _enabled,
        mouseCursor: _enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
        onShowHoverHighlight: (v) => setState(() => _hovered = v),
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => _activate())},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: _enabled ? (_) => _setPressed(true) : null,
          onTapUp: _enabled ? (_) => _setPressed(false) : null,
          onTapCancel: _enabled ? () => _setPressed(false) : null,
          onTap: _enabled ? _activate : null,
          child: Opacity(
            opacity: _enabled ? 1 : 0.4,
            child: AurumPressScale(pressed: _pressed, child: body),
          ),
        ),
      ),
    );
  }
}
