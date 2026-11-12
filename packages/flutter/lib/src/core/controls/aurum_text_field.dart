import 'package:flutter/material.dart';

import '../../theme/aurum_theme.dart';
import '../../tokens/aurum_tokens.g.dart';

/// A single or multi-line text input on an inset fill with continuous
/// corners. [label] is read by screen readers; [placeholder] is shown while
/// the field is empty. Put an action, such as a send button, in [trailing].
class AurumTextField extends StatefulWidget {
  const AurumTextField({
    super.key,
    required this.label,
    this.controller,
    this.placeholder,
    this.leading,
    this.trailing,
    this.onChanged,
    this.onSubmitted,
    this.maxLines = 1,
    this.textInputAction,
    this.keyboardType,
    this.capsule = false,
    this.enabled = true,
  });

  final String label;
  final TextEditingController? controller;
  final String? placeholder;
  final Widget? leading;
  final Widget? trailing;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  /// More than 1 lets the field grow up to this many lines.
  final int maxLines;
  final TextInputAction? textInputAction;
  final TextInputType? keyboardType;

  /// Fully rounded ends, e.g. for a chat composer or search field.
  final bool capsule;
  final bool enabled;

  @override
  State<AurumTextField> createState() => _AurumTextFieldState();
}

class _AurumTextFieldState extends State<AurumTextField> {
  final _focus = FocusNode();
  bool _focused = false;

  @override
  void initState() {
    super.initState();
    _focus.addListener(() => setState(() => _focused = _focus.hasFocus));
  }

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final radius = widget.capsule ? 999.0 : context.aurumRadii.md;
    final body = context.aurumText(AurumType.body);
    return Opacity(
      opacity: widget.enabled ? 1 : 0.4,
      child: Container(
        constraints: const BoxConstraints(minHeight: AurumSize.target + AurumSpace.s8),
        padding: EdgeInsetsDirectional.only(
          start: widget.leading == null ? AurumSpace.s16 : AurumSpace.s8,
          end: widget.trailing == null ? AurumSpace.s16 : AurumSpace.s4,
        ),
        decoration: ShapeDecoration(
          color: c.surfaceInset,
          shape: RoundedSuperellipseBorder(
            borderRadius: BorderRadius.circular(radius),
            side: _focused
                ? BorderSide(color: c.focus, width: AurumSize.focusWidth)
                : BorderSide(color: c.borderDecorative),
          ),
        ),
        child: Row(
          children: [
            if (widget.leading != null) ...[widget.leading!, const SizedBox(width: AurumSpace.s4)],
            Expanded(
              // The placeholder is a hint, not a label; give screen readers the real one.
              child: Semantics(
                label: widget.label,
                child: TextField(
                  controller: widget.controller,
                  focusNode: _focus,
                  enabled: widget.enabled,
                  onChanged: widget.onChanged,
                  onSubmitted: widget.onSubmitted,
                  minLines: 1,
                  maxLines: widget.maxLines,
                  textInputAction: widget.textInputAction,
                  keyboardType: widget.keyboardType,
                  style: body,
                  cursorColor: c.accent,
                  decoration: InputDecoration(
                    isCollapsed: true,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: AurumSpace.s12),
                    hintText: widget.placeholder,
                    hintStyle: body.copyWith(color: c.textTertiary),
                  ),
                ),
              ),
            ),
            if (widget.trailing != null) ...[const SizedBox(width: AurumSpace.s4), widget.trailing!],
          ],
        ),
      ),
    );
  }
}
