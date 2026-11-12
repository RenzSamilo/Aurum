import 'package:flutter/material.dart';

import '../../foundations/aurum_haptics.dart';
import '../../theme/aurum_theme.dart';
import '../../tokens/aurum_tokens.g.dart';

/// One action in an [AurumMenu].
class AurumMenuItem {
  const AurumMenuItem({
    required this.label,
    required this.onSelected,
    this.icon,
    this.destructive = false,
    this.enabled = true,
  });

  final String label;
  final VoidCallback onSelected;

  /// Decorative: screen readers read [label].
  final IconData? icon;

  /// Uses the danger colour. Say what will be lost in the label.
  final bool destructive;
  final bool enabled;
}

/// Which edge of the button the menu lines up with.
enum AurumMenuAlign { start, end }

/// A button that opens a short list of actions.
///
/// Built on Flutter's [MenuAnchor], so arrow keys, Enter, Escape and focus
/// return work like a native menu.
class AurumMenu extends StatelessWidget {
  const AurumMenu({
    super.key,
    required this.trigger,
    required this.items,
    this.semanticLabel,
    this.align = AurumMenuAlign.start,
  });

  /// Content of the button that opens the menu, e.g. an [Icon] or a [Text].
  final Widget trigger;
  final List<AurumMenuItem> items;

  /// Name for the menu button when [trigger] is icon-only.
  final String? semanticLabel;
  final AurumMenuAlign align;

  @override
  Widget build(BuildContext context) {
    final c = context.aurum;
    final radii = context.aurumRadii;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final alignEnd = (align == AurumMenuAlign.end) != rtl;

    return MenuAnchor(
      alignmentOffset: const Offset(0, AurumSpace.s4),
      crossAxisUnconstrained: false,
      style: MenuStyle(
        alignment: alignEnd ? AlignmentDirectional.bottomEnd : AlignmentDirectional.bottomStart,
        backgroundColor: WidgetStatePropertyAll(c.surfaceElevated),
        surfaceTintColor: const WidgetStatePropertyAll(Color(0x00000000)),
        elevation: const WidgetStatePropertyAll(8),
        shadowColor: WidgetStatePropertyAll(AurumShadow.level2.first.color),
        padding: const WidgetStatePropertyAll(EdgeInsets.all(AurumSpace.s4)),
        minimumSize: const WidgetStatePropertyAll(Size(224, 0)),
        shape: WidgetStatePropertyAll(
          RoundedSuperellipseBorder(
            borderRadius: BorderRadius.circular(radii.md),
            side: BorderSide(color: c.borderDecorative),
          ),
        ),
      ),
      menuChildren: [
        for (final item in items)
          MenuItemButton(
            onPressed: item.enabled
                ? () {
                    AurumHaptics.play(AurumHaptic.selectionTick);
                    item.onSelected();
                  }
                : null,
            leadingIcon: item.icon == null ? null : ExcludeSemantics(child: Icon(item.icon, size: AurumSize.iconSm)),
            style: ButtonStyle(
              minimumSize: const WidgetStatePropertyAll(Size(0, AurumSize.target)),
              padding: const WidgetStatePropertyAll(EdgeInsets.symmetric(horizontal: AurumSpace.s12)),
              shape: WidgetStatePropertyAll(RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(radii.sm))),
              foregroundColor: WidgetStateProperty.resolveWith(
                (s) => s.contains(WidgetState.disabled)
                    ? c.textTertiary
                    : item.destructive
                    ? c.danger
                    : c.textPrimary,
              ),
              iconColor: WidgetStateProperty.resolveWith(
                (s) => s.contains(WidgetState.disabled)
                    ? c.textTertiary
                    : item.destructive
                    ? c.danger
                    : c.textPrimary,
              ),
              overlayColor: WidgetStateProperty.resolveWith(
                (s) => s.contains(WidgetState.pressed)
                    ? c.fillPressed
                    : s.contains(WidgetState.hovered) || s.contains(WidgetState.focused)
                    ? c.fillHover
                    : null,
              ),
              textStyle: WidgetStatePropertyAll(context.aurumText(AurumType.body)),
            ),
            child: Text(item.label),
          ),
      ],
      builder: (context, controller, _) => TextButton(
        onPressed: () => controller.isOpen ? controller.close() : controller.open(),
        style:
            TextButton.styleFrom(
              foregroundColor: c.accent,
              minimumSize: const Size(AurumSize.target, AurumSize.target),
              padding: const EdgeInsets.symmetric(horizontal: AurumSpace.s12),
              shape: RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(radii.sm)),
              textStyle: context.aurumText(AurumType.body),
            ).copyWith(
              overlayColor: WidgetStateProperty.resolveWith(
                (s) => s.contains(WidgetState.pressed)
                    ? c.fillPressed
                    : s.contains(WidgetState.hovered)
                    ? c.fillHover
                    : null,
              ),
            ),
        // Merged into the button's own node: its name, and whether the menu is open.
        child: Semantics(
          label: semanticLabel,
          expanded: controller.isOpen,
          child: semanticLabel == null ? trigger : ExcludeSemantics(child: trigger),
        ),
      ),
    );
  }
}
