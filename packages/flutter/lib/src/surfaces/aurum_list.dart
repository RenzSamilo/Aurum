import 'package:flutter/material.dart';

import '../theme/aurum_theme.dart';
import '../tokens/aurum_tokens.g.dart';

/// An inset, grouped list of rows: settings, details, menus. Separators are
/// inset to the row text, like a native grouped list.
class AurumListSection extends StatelessWidget {
  const AurumListSection({super.key, required this.children, this.header, this.footer});

  final List<AurumListRow> children;
  final String? header;
  final String? footer;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final r = BorderRadius.circular(context.aurumRadii.md);
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      rows.add(children[i]);
      if (i < children.length - 1) {
        final inset = AurumSpace.s16 + (children[i].leading != null ? AurumSize.iconLg + AurumSpace.s12 : 0);
        rows.add(Padding(
          padding: EdgeInsetsDirectional.only(start: inset),
          child: Container(height: 1, color: c.borderDecorative),
        ));
      }
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (header != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(AurumSpace.s16, 0, AurumSpace.s16, AurumSpace.s8),
            child: Semantics(
              header: true,
              child: Text(header!, style: context.aurumText(AurumType.footnote, color: c.textSecondary).copyWith(fontWeight: FontWeight.w600, fontVariations: const [FontVariation('wght', 600), FontVariation('opsz', 14)])),
            ),
          ),
        ClipRSuperellipse(
          borderRadius: r,
          child: DecoratedBox(
            decoration: ShapeDecoration(
              color: c.surfaceCard,
              shape: RoundedSuperellipseBorder(borderRadius: r, side: BorderSide(color: c.borderDecorative)),
            ),
            child: Column(mainAxisSize: MainAxisSize.min, children: rows),
          ),
        ),
        if (footer != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(AurumSpace.s16, AurumSpace.s8, AurumSpace.s16, 0),
            child: Text(footer!, style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
          ),
      ],
    );
  }
}

/// One row in an [AurumListSection]. Rows with [onPressed] highlight on press
/// and show a chevron; rows with a [trailing] control are not pressable.
class AurumListRow extends StatefulWidget {
  const AurumListRow({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.value,
    this.trailing,
    this.onPressed,
    this.chevron,
    this.destructive = false,
  });

  final String title;
  final String? subtitle;

  /// Icon at the start, shown in the accent colour.
  final IconData? leading;

  /// Secondary value at the end, such as the current choice.
  final String? value;

  /// A control at the end, such as an AurumSwitch.
  final Widget? trailing;
  final VoidCallback? onPressed;

  /// Defaults to true for pressable rows. Turn off for actions like "Sign out".
  final bool? chevron;
  final bool destructive;

  @override
  State<AurumListRow> createState() => _AurumListRowState();
}

class _AurumListRowState extends State<AurumListRow> {
  bool _pressed = false;
  bool _hovered = false;
  bool _focused = false;

  bool get _interactive => widget.onPressed != null && widget.trailing == null;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final showChevron = _interactive && (widget.chevron ?? true);
    final fill = _pressed ? c.fillPressed : (_hovered ? c.fillHover : const Color(0x00000000));
    final rtl = Directionality.of(context) == TextDirection.rtl;

    final row = Container(
      constraints: const BoxConstraints(minHeight: AurumSize.target),
      padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s16, vertical: AurumSpace.s8),
      decoration: BoxDecoration(
        color: fill,
        border: _focused ? Border.all(color: c.focus, width: AurumSize.focusWidth) : null,
      ),
      child: Row(children: [
        if (widget.leading != null) ...[
          SizedBox(width: AurumSize.iconLg, child: Icon(widget.leading, size: AurumSize.iconMd, color: c.accent)),
          const SizedBox(width: AurumSpace.s12),
        ],
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
            Text(widget.title, style: context.aurumText(AurumType.body, color: widget.destructive ? c.danger : c.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
            if (widget.subtitle != null) Text(widget.subtitle!, style: context.aurumText(AurumType.footnote, color: c.textSecondary)),
          ]),
        ),
        if (widget.value != null) ...[
          const SizedBox(width: AurumSpace.s12),
          Flexible(child: Text(widget.value!, style: context.aurumText(AurumType.body, color: c.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis)),
        ],
        if (widget.trailing != null) ...[const SizedBox(width: AurumSpace.s12), widget.trailing!],
        if (showChevron) ...[
          const SizedBox(width: AurumSpace.s12),
          Transform.flip(
            flipX: rtl,
            child: CustomPaint(size: const Size(8, 14), painter: _ChevronPainter(c.textTertiary)),
          ),
        ],
      ]),
    );

    if (!_interactive) return Semantics(container: true, child: MergeSemantics(child: row));

    return MergeSemantics(
      child: Semantics(
        container: true,
        button: true,
        child: FocusableActionDetector(
          mouseCursor: SystemMouseCursors.click,
          onShowHoverHighlight: (v) => setState(() => _hovered = v),
          onShowFocusHighlight: (v) => setState(() => _focused = v),
          actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => widget.onPressed!())},
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: (_) => setState(() => _pressed = true),
            onTapUp: (_) => setState(() => _pressed = false),
            onTapCancel: () => setState(() => _pressed = false),
            onTap: widget.onPressed,
            child: row,
          ),
        ),
      ),
    );
  }
}

class _ChevronPainter extends CustomPainter {
  _ChevronPainter(this.color);
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(
      Path()
        ..moveTo(1.5, 1.5)
        ..lineTo(size.width - 1.5, size.height / 2)
        ..lineTo(1.5, size.height - 1.5),
      p,
    );
  }

  @override
  bool shouldRepaint(_ChevronPainter old) => old.color != color;
}
