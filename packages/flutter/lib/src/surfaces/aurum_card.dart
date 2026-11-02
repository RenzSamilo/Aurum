import 'package:flutter/material.dart';

import '../controls/aurum_pressable.dart';
import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// A grouped surface with continuous corners. With [onPressed] the whole card
/// is one button that scales slightly on press; put no other buttons inside it.
class AurumCard extends StatefulWidget {
  const AurumCard({
    super.key,
    required this.child,
    this.onPressed,
    this.semanticLabel,
    this.padding = const EdgeInsets.all(AurumSpace.s24),
    this.lifted = true,
  });

  final Widget child;
  final VoidCallback? onPressed;

  /// Read instead of the card's text when it is pressable.
  final String? semanticLabel;
  final EdgeInsetsGeometry padding;

  /// Lifted cards cast a soft shadow; flat cards use a hairline border only.
  final bool lifted;

  @override
  State<AurumCard> createState() => _AurumCardState();
}

class _AurumCardState extends State<AurumCard> {
  bool _pressed = false;
  bool _hovered = false;
  bool _focused = false;

  void _set(bool v) {
    if (_pressed != v) setState(() => _pressed = v);
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final r = BorderRadius.circular(context.aurumRadii.lg);
    final interactive = widget.onPressed != null;
    final card = DecoratedBox(
      decoration: ShapeDecoration(
        color: _hovered || _pressed ? Color.alphaBlend(c.textPrimary.withValues(alpha: _pressed ? 0.05 : 0.03), c.surfaceCard) : c.surfaceCard,
        shape: RoundedSuperellipseBorder(
          borderRadius: r,
          side: _focused
              ? BorderSide(color: c.focus, width: AurumSize.focusWidth, strokeAlign: BorderSide.strokeAlignOutside)
              : BorderSide(color: c.borderDecorative),
        ),
        shadows: widget.lifted ? AurumShadow.level1 : null,
      ),
      child: Padding(padding: widget.padding, child: widget.child),
    );
    if (!interactive) return card;

    return Semantics(
      container: true,
      button: true,
      label: widget.semanticLabel,
      excludeSemantics: widget.semanticLabel != null,
      onTap: widget.semanticLabel != null ? widget.onPressed : null,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (v) => setState(() => _hovered = v),
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => widget.onPressed!())},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: (_) => _set(true),
          onTapUp: (_) => _set(false),
          onTapCancel: () => _set(false),
          onTap: widget.onPressed,
          child: AurumPressScale(pressed: _pressed, scale: AurumMotion.pressScaleCard, child: card),
        ),
      ),
    );
  }
}
